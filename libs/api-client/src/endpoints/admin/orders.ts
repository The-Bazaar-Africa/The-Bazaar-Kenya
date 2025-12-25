/**
 * The Bazaar API v1 - Admin Orders Endpoint
 * ==========================================
 * 
 * Admin-specific API functions for order management.
 * Enhanced with bulk operations, advanced filtering, and fulfillment.
 * 
 * Maps to: apps/backend-api/src/routes/v1/admin/orders.ts
 */

import { get, post, patch } from '../../http/client';
import type {
  ApiSuccessResponse,
  Order,
  OrderStatus,
  PaymentStatus,
  PaginationMeta,
  Address,
} from '../../generated';

// =============================================================================
// ADMIN-SPECIFIC TYPES
// =============================================================================

/**
 * Extended admin filters for orders
 */
export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  orderNumber?: string;
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  vendorId?: string;
  buyerId?: string;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: 'orderNumber' | 'createdAt' | 'updatedAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
  hasIssue?: boolean;
  requiresAction?: boolean;
}

/**
 * Admin order list response with additional metadata
 */
export interface AdminOrderListResponse {
  orders: AdminOrder[];
  pagination: PaginationMeta;
  summary: OrderSummary;
}

/**
 * Extended order type with admin-only fields
 */
export interface AdminOrder extends Order {
  // Admin-specific fields
  buyer: {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
    orderCount: number;
    totalSpent: number;
  };
  vendor: {
    id: string;
    businessName: string;
    slug: string;
    email?: string;
  } | null;
  timeline: OrderTimelineEvent[];
  internalNotes?: AdminNote[];
  flags?: OrderFlag[];
  refundInfo?: RefundInfo;
}

/**
 * Order timeline event
 */
export interface OrderTimelineEvent {
  id: string;
  type: 'status_change' | 'payment' | 'note' | 'refund' | 'shipment' | 'customer_action';
  status?: OrderStatus;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
}

/**
 * Admin note on order
 */
export interface AdminNote {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

/**
 * Order flag
 */
export interface OrderFlag {
  type: 'fraud_risk' | 'requires_review' | 'high_value' | 'repeat_customer' | 'first_order' | 'custom';
  label: string;
  severity: 'info' | 'warning' | 'error';
  addedAt: string;
  addedBy?: string;
}

/**
 * Refund information
 */
export interface RefundInfo {
  refundedAmount: number;
  originalAmount: number;
  refundedAt: string;
  reason: string;
  processedBy?: string;
  transactionId?: string;
}

/**
 * Summary statistics for admin order listing
 */
export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  requiresActionCount: number;
}

/**
 * Bulk action request for orders
 */
export interface BulkOrderActionRequest {
  orderIds: string[];
  action: 'confirm' | 'process' | 'ship' | 'deliver' | 'cancel' | 'add_note';
  data?: {
    trackingNumber?: string;
    carrier?: string;
    note?: string;
    reason?: string;
  };
}

/**
 * Bulk action response
 */
export interface BulkOrderActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    orderId: string;
    error: string;
  }>;
}

/**
 * Order status update request (admin)
 */
export interface AdminUpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  note?: string;
  notifyCustomer?: boolean;
}

/**
 * Refund request
 */
export interface RefundOrderRequest {
  amount: number;
  reason: string;
  notifyCustomer?: boolean;
  restockItems?: boolean;
}

/**
 * Add shipping info request
 */
export interface AddShippingInfoRequest {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
  notifyCustomer?: boolean;
}

/**
 * Order analytics
 */
export interface OrderAnalytics {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    businessName: string;
    orderCount: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
    avgValue: number;
  }>;
}

// =============================================================================
// ADMIN ORDER ENDPOINTS
// =============================================================================

/**
 * List all orders with admin-level filtering and metadata.
 * 
 * @param filters - Admin order filters
 * @returns Paginated list of orders with summary
 */
export function adminGetOrders(filters?: AdminOrderFilters) {
  return get<ApiSuccessResponse<AdminOrderListResponse>>('/v1/admin/orders', {
    requireAuth: true,
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get order details with admin-only fields.
 * 
 * @param id - Order ID
 * @returns Order details with admin metadata
 */
export function adminGetOrder(id: string) {
  return get<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}`, {
    requireAuth: true,
  });
}

/**
 * Get order by order number with admin details.
 * 
 * @param orderNumber - Order number
 * @returns Order details with admin metadata
 */
export function adminGetOrderByNumber(orderNumber: string) {
  return get<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/number/${orderNumber}`, {
    requireAuth: true,
  });
}

/**
 * Update order status (admin).
 * 
 * @param id - Order ID
 * @param data - Status update data
 * @returns Updated order
 */
export function adminUpdateOrderStatus(id: string, data: AdminUpdateOrderStatusRequest) {
  return patch<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/status`, data, {
    requireAuth: true,
  });
}

/**
 * Add shipping information to order.
 * 
 * @param id - Order ID
 * @param data - Shipping info
 * @returns Updated order
 */
export function adminAddShippingInfo(id: string, data: AddShippingInfoRequest) {
  return patch<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/shipping`, data, {
    requireAuth: true,
  });
}

/**
 * Process a refund for an order.
 * 
 * @param id - Order ID
 * @param data - Refund request
 * @returns Updated order with refund info
 */
export function adminRefundOrder(id: string, data: RefundOrderRequest) {
  return post<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/refund`, data, {
    requireAuth: true,
  });
}

/**
 * Cancel an order (admin override).
 * 
 * @param id - Order ID
 * @param reason - Cancellation reason
 * @param notifyCustomer - Whether to notify customer
 * @returns Updated order
 */
export function adminCancelOrder(id: string, reason: string, notifyCustomer = true) {
  return post<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/cancel`, 
    { reason, notifyCustomer }, 
    { requireAuth: true }
  );
}

/**
 * Add internal note to order.
 * 
 * @param id - Order ID
 * @param content - Note content
 * @param isPrivate - Whether note is private (admin-only)
 * @returns Updated order
 */
export function adminAddOrderNote(id: string, content: string, isPrivate = true) {
  return post<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/notes`, 
    { content, isPrivate }, 
    { requireAuth: true }
  );
}

/**
 * Update shipping address for order.
 * 
 * @param id - Order ID
 * @param address - New shipping address
 * @returns Updated order
 */
export function adminUpdateOrderAddress(id: string, address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) {
  return patch<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/address`, 
    { shippingAddress: address }, 
    { requireAuth: true }
  );
}

/**
 * Perform bulk action on multiple orders.
 * 
 * @param request - Bulk action request
 * @returns Bulk action response
 */
export function adminBulkOrderAction(request: BulkOrderActionRequest) {
  return post<ApiSuccessResponse<BulkOrderActionResponse>>('/v1/admin/orders/bulk', request, {
    requireAuth: true,
  });
}

/**
 * Get order analytics for admin dashboard.
 * 
 * @param period - Analytics period
 * @param vendorId - Optional vendor filter
 * @returns Order analytics
 */
export function adminGetOrderAnalytics(
  period: '7d' | '30d' | '90d' | '1y' = '30d',
  vendorId?: string
) {
  return get<ApiSuccessResponse<OrderAnalytics>>('/v1/admin/orders/analytics', {
    requireAuth: true,
    params: { period, vendorId },
  });
}

/**
 * Get orders requiring action.
 * 
 * @param limit - Maximum number to return
 * @returns Orders needing attention
 */
export function adminGetOrdersRequiringAction(limit = 20) {
  return get<ApiSuccessResponse<AdminOrder[]>>('/v1/admin/orders/requiring-action', {
    requireAuth: true,
    params: { limit },
  });
}

/**
 * Add flag to order.
 * 
 * @param id - Order ID
 * @param flag - Flag to add
 * @returns Updated order
 */
export function adminAddOrderFlag(id: string, flag: Omit<OrderFlag, 'addedAt' | 'addedBy'>) {
  return post<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/flags`, flag, {
    requireAuth: true,
  });
}

/**
 * Remove flag from order.
 * 
 * @param id - Order ID
 * @param flagType - Flag type to remove
 * @returns Updated order
 */
export function adminRemoveOrderFlag(id: string, flagType: OrderFlag['type']) {
  return patch<ApiSuccessResponse<AdminOrder>>(`/v1/admin/orders/${id}/flags/${flagType}/remove`, {}, {
    requireAuth: true,
  });
}

/**
 * Export orders to CSV/JSON.
 * 
 * @param filters - Filters to apply to export
 * @param format - Export format
 * @returns Export URL or data
 */
export function adminExportOrders(
  filters?: AdminOrderFilters,
  format: 'csv' | 'json' = 'csv'
) {
  return get<ApiSuccessResponse<{ url: string; expiresAt: string }>>('/v1/admin/orders/export', {
    requireAuth: true,
    params: { ...filters, format } as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get order status workflow/state machine.
 * 
 * @returns Valid status transitions
 */
export function adminGetOrderStatusWorkflow() {
  return get<ApiSuccessResponse<{
    statuses: OrderStatus[];
    transitions: Record<OrderStatus, OrderStatus[]>;
  }>>('/v1/admin/orders/workflow', {
    requireAuth: true,
  });
}
