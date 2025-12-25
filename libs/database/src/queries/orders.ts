/**
 * Order Queries
 * ==============
 * Type-safe query functions for order operations.
 */

import type { TypedSupabaseClient } from '../client';
import type { Order, OrderItem, InsertTables, UpdateTables } from '../types';

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderFilters {
  userId?: string;
  vendorId?: string;
  status?: Order['status'];
  paymentStatus?: Order['payment_status'];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TB-${timestamp}-${random}`;
}

/**
 * Get a single order by ID with items
 */
export async function getOrderById(
  client: TypedSupabaseClient,
  orderId: string
): Promise<OrderWithItems | null> {
  const { data: order, error } = await client
    .from('api.orders')
    .select('*, items:api.order_items(*)')
    .eq('id', orderId)
    .single();

  if (error || !order) return null;

  return {
    ...order,
    items: (order.items as OrderItem[]) || [],
  };
}

/**
 * Get a single order by order number
 */
export async function getOrderByNumber(
  client: TypedSupabaseClient,
  orderNumber: string
): Promise<OrderWithItems | null> {
  const { data: order, error } = await client
    .from('api.orders')
    .select('*, items:api.order_items(*)')
    .eq('order_number', orderNumber)
    .single();

  if (error || !order) return null;

  return {
    ...order,
    items: (order.items as OrderItem[]) || [],
  };
}

/**
 * Get orders with filters and pagination
 */
export async function getOrders(
  client: TypedSupabaseClient,
  filters: OrderFilters = {}
): Promise<{ orders: OrderWithItems[]; count: number }> {
  const {
    userId,
    vendorId,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
    limit = 20,
    offset = 0,
  } = filters;

  let query = client
    .from('api.orders')
    .select('*, items:api.order_items(*)', { count: 'exact' });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (paymentStatus) {
    query = query.eq('payment_status', paymentStatus);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], count: 0 };
  }

  const orders = (data || []).map((order) => ({
    ...order,
    items: (order.items as OrderItem[]) || [],
  }));

  return { orders, count: count || 0 };
}

/**
 * Get recent orders for a user
 */
export async function getUserRecentOrders(
  client: TypedSupabaseClient,
  userId: string,
  limit = 5
): Promise<OrderWithItems[]> {
  const { data, error } = await client
    .from('api.orders')
    .select('*, items:api.order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }

  return (data || []).map((order) => ({
    ...order,
    items: (order.items as OrderItem[]) || [],
  }));
}

/**
 * Get vendor orders
 */
export async function getVendorOrders(
  client: TypedSupabaseClient,
  vendorId: string,
  filters: Omit<OrderFilters, 'vendorId'> = {}
): Promise<{ orders: OrderWithItems[]; count: number }> {
  return getOrders(client, { ...filters, vendorId });
}

/**
 * Create a new order with items
 */
export async function createOrder(
  client: TypedSupabaseClient,
  order: InsertTables<'orders'>,
  items: Array<Omit<InsertTables<'order_items'>, 'order_id'>>
): Promise<OrderWithItems | null> {
  // Start a transaction by creating the order first
  const { data: newOrder, error: orderError } = await client
    .from('api.orders')
    .insert({
      ...order,
      order_number: order.order_number || generateOrderNumber(),
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error('Error creating order:', orderError);
    return null;
  }

  // Then create the order items
  const { data: orderItems, error: itemsError } = await client
    .from('api.order_items')
    .insert(
      items.map((item) => ({
        ...item,
        order_id: newOrder.id,
      }))
    )
    .select();

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // In a real scenario, you'd want to rollback the order here
    // For now, we'll return the order without items
  }

  return {
    ...newOrder,
    items: orderItems || [],
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  client: TypedSupabaseClient,
  orderId: string,
  status: Order['status']
): Promise<Order | null> {
  const { data, error } = await client
    .from('api.orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data;
}

/**
 * Update order payment status
 */
export async function updateOrderPaymentStatus(
  client: TypedSupabaseClient,
  orderId: string,
  paymentStatus: Order['payment_status'],
  paymentReference?: string
): Promise<Order | null> {
  const updates: UpdateTables<'orders'> = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (paymentReference) {
    updates.payment_reference = paymentReference;
  }

  // If payment is successful, also update order status to confirmed
  if (paymentStatus === 'paid') {
    updates.status = 'confirmed';
  }

  const { data, error } = await client
    .from('api.orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order payment status:', error);
    return null;
  }

  return data;
}

/**
 * Update order tracking number
 */
export async function updateOrderTracking(
  client: TypedSupabaseClient,
  orderId: string,
  trackingNumber: string
): Promise<Order | null> {
  const { data, error } = await client
    .from('api.orders')
    .update({
      tracking_number: trackingNumber,
      status: 'shipped',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order tracking:', error);
    return null;
  }

  return data;
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  client: TypedSupabaseClient,
  orderId: string,
  reason?: string
): Promise<Order | null> {
  const { data, error } = await client
    .from('api.orders')
    .update({
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Order cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling order:', error);
    return null;
  }

  return data;
}

/**
 * Get order statistics for a vendor
 */
export async function getVendorOrderStats(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}> {
  const { data: orders, error } = await client
    .from('api.orders')
    .select('status, payment_status, total_amount')
    .eq('vendor_id', vendorId);

  if (error || !orders) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };
  }

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
    completedOrders: orders.filter((o) => o.status === 'delivered').length,
    totalRevenue: orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };
}
