/**
 * The Bazaar API v1 - Vendors Endpoint
 * =====================================
 * 
 * API functions for vendor operations.
 * Maps to: apps/backend-api/src/routes/v1/vendors.ts
 */

import { get, post, patch } from '../http/client';
import type {
  ApiSuccessResponse,
  Vendor,
  VendorFilters,
  VendorListResponse,
  VendorApplicationRequest,
  UpdateVendorProfileRequest,
  VendorAnalytics,
  Product,
  PaginatedResponse,
} from '../generated';

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * List vendors with optional filtering and pagination.
 * 
 * @param filters - Optional filters for the vendor list
 * @returns Paginated list of vendors
 */
export function listVendors(filters?: VendorFilters) {
  return get<ApiSuccessResponse<VendorListResponse>>('/v1/vendors', {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get vendor details by ID.
 * 
 * @param vendorId - The vendor's unique ID
 * @returns Vendor details
 */
export function getVendorById(vendorId: string) {
  return get<ApiSuccessResponse<Vendor>>(`/v1/vendors/${vendorId}`);
}

/**
 * Get vendor details by slug.
 * 
 * @param slug - The vendor's URL-friendly slug
 * @returns Vendor details
 */
export function getVendorBySlug(slug: string) {
  return get<ApiSuccessResponse<Vendor>>(`/v1/vendors/slug/${slug}`);
}

/**
 * Get a vendor's products.
 * 
 * @param vendorId - The vendor's unique ID
 * @param options - Pagination options
 * @returns Paginated list of products
 */
export function getVendorProducts(
  vendorId: string,
  options?: { page?: number; limit?: number }
) {
  return get<ApiSuccessResponse<PaginatedResponse<Product>>>(`/v1/vendors/${vendorId}/products`, {
    params: options,
  });
}

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Apply to become a vendor.
 * Requires authentication.
 * 
 * @param data - Vendor application data
 * @returns Created vendor profile
 */
export function applyToBeVendor(data: VendorApplicationRequest) {
  return post<ApiSuccessResponse<Vendor>>('/v1/vendors/apply', data, {
    requireAuth: true,
  });
}

/**
 * Update vendor profile.
 * Requires vendor authentication.
 * 
 * @param data - Profile update data
 * @returns Updated vendor profile
 */
export function updateVendorProfile(data: UpdateVendorProfileRequest) {
  return patch<ApiSuccessResponse<Vendor>>('/v1/vendors/profile', data, {
    requireAuth: true,
  });
}

/**
 * Get vendor analytics.
 * Requires vendor authentication.
 * 
 * @param options - Date range options
 * @returns Vendor analytics data
 */
export function getVendorAnalytics(options?: { 
  startDate?: string; 
  endDate?: string;
  period?: 'day' | 'week' | 'month';
}) {
  return get<ApiSuccessResponse<VendorAnalytics>>('/v1/vendors/analytics', {
    requireAuth: true,
    params: options,
  });
}

/**
 * Get current vendor's orders.
 * Requires vendor authentication.
 * 
 * @param options - Pagination and filter options
 * @returns Paginated list of orders
 */
export function getVendorOrders(options?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return get<ApiSuccessResponse<unknown>>('/v1/vendors/orders', {
    requireAuth: true,
    params: options,
  });
}
