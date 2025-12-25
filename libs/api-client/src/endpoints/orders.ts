/**
 * The Bazaar API v1 - Orders Endpoint
 * ====================================
 * 
 * API functions for order operations.
 * Maps to: apps/backend-api/src/routes/v1/orders.ts
 */

import { get, post, patch } from '../http/client';
import type {
  ApiSuccessResponse,
  Order,
  OrderFilters,
  OrderListResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderTrackingResponse,
} from '../generated';

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Get current user's orders.
 * 
 * @param filters - Optional filters
 * @returns Paginated list of orders
 */
export function getMyOrders(filters?: OrderFilters) {
  return get<ApiSuccessResponse<OrderListResponse>>('/v1/orders', {
    requireAuth: true,
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get order by ID.
 * 
 * @param id - Order ID
 * @returns Order details
 */
export function getOrderById(id: string) {
  return get<ApiSuccessResponse<Order>>(`/v1/orders/${id}`, {
    requireAuth: true,
  });
}

/**
 * Get order by order number.
 * 
 * @param orderNumber - Order number
 * @returns Order details
 */
export function getOrderByNumber(orderNumber: string) {
  return get<ApiSuccessResponse<Order>>(`/v1/orders/number/${orderNumber}`, {
    requireAuth: true,
  });
}

/**
 * Create a new order.
 * 
 * @param data - Order creation data
 * @returns Created order
 */
export function createOrder(data: CreateOrderRequest) {
  return post<ApiSuccessResponse<Order>>('/v1/orders', data, {
    requireAuth: true,
  });
}

/**
 * Cancel an order.
 * 
 * @param id - Order ID
 * @param reason - Cancellation reason
 * @returns Updated order
 */
export function cancelOrder(id: string, reason?: string) {
  return post<ApiSuccessResponse<Order>>(`/v1/orders/${id}/cancel`, { reason }, {
    requireAuth: true,
  });
}

// =============================================================================
// VENDOR/ADMIN ENDPOINTS
// =============================================================================

/**
 * Update order status (vendor/admin only).
 * 
 * @param id - Order ID
 * @param data - Status update data
 * @returns Updated order
 */
export function updateOrderStatus(id: string, data: UpdateOrderStatusRequest) {
  return patch<ApiSuccessResponse<Order>>(`/v1/orders/${id}/status`, data, {
    requireAuth: true,
  });
}

/**
 * Get vendor's orders.
 * 
 * @param vendorId - Vendor ID
 * @param filters - Optional filters
 * @returns Paginated list of orders
 */
export function getVendorOrders(vendorId: string, filters?: OrderFilters) {
  return get<ApiSuccessResponse<OrderListResponse>>(`/v1/vendors/${vendorId}/orders`, {
    requireAuth: true,
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * Track order by order number.
 * 
 * @param orderNumber - Order number
 * @returns Tracking information
 */
export function trackOrder(orderNumber: string) {
  return get<ApiSuccessResponse<OrderTrackingResponse>>(`/v1/orders/track/${orderNumber}`);
}
