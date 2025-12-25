/**
 * The Bazaar API v1 - Admin Products Endpoint
 * ============================================
 * 
 * Admin-specific API functions for product management.
 * Enhanced with bulk operations, advanced filtering, and analytics.
 * 
 * Maps to: apps/backend-api/src/routes/v1/admin/products.ts
 */

import { get, post, patch, del } from '../../http/client';
import type {
  ApiSuccessResponse,
  Product,
  PaginationMeta,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
} from '../../generated';

// =============================================================================
// ADMIN-SPECIFIC TYPES
// =============================================================================

/**
 * Extended admin filters for products
 */
export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  vendor?: string;
  vendorId?: string;
  status?: 'all' | 'active' | 'inactive' | 'outOfStock' | 'lowStock';
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'stockQuantity' | 'sales';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * Admin product list response with additional metadata
 */
export interface AdminProductListResponse {
  products: AdminProduct[];
  pagination: PaginationMeta;
  summary: ProductSummary;
}

/**
 * Extended product type with admin-only fields
 */
export interface AdminProduct extends Product {
  // Admin-specific fields
  totalSales?: number;
  totalRevenue?: number;
  viewCount?: number;
  lastSoldAt?: string;
  vendor: {
    id: string;
    businessName: string;
    slug: string;
    logoUrl?: string | null;
    status: 'pending' | 'active' | 'suspended' | 'banned';
  };
}

/**
 * Summary statistics for admin product listing
 */
export interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalValue: number;
  avgPrice: number;
}

/**
 * Bulk action request
 */
export interface BulkProductActionRequest {
  productIds: string[];
  action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete';
  reason?: string;
}

/**
 * Bulk action response
 */
export interface BulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    productId: string;
    error: string;
  }>;
}

/**
 * Product analytics
 */
export interface ProductAnalytics {
  productId: string;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  revenue: number;
  conversionRate: number;
  avgRating: number;
  reviewCount: number;
  returnRate: number;
  dailyStats: Array<{
    date: string;
    views: number;
    sales: number;
    revenue: number;
  }>;
}

/**
 * Import/Export types
 */
export interface ProductImportRequest {
  products: Array<Omit<CreateProductRequest, 'images'> & {
    images?: string[];
    sku?: string;
    vendorId: string;
  }>;
  options?: {
    updateExisting?: boolean;
    skipInvalid?: boolean;
  };
}

export interface ProductImportResponse {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    row: number;
    sku?: string;
    error: string;
  }>;
}

// =============================================================================
// ADMIN PRODUCT ENDPOINTS
// =============================================================================

/**
 * List all products with admin-level filtering and metadata.
 * 
 * @param filters - Admin product filters
 * @returns Paginated list of products with summary
 */
export function adminGetProducts(filters?: AdminProductFilters) {
  return get<ApiSuccessResponse<AdminProductListResponse>>('/v1/admin/products', {
    requireAuth: true,
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get product details with admin-only fields.
 * 
 * @param id - Product ID
 * @returns Product details with admin metadata
 */
export function adminGetProduct(id: string) {
  return get<ApiSuccessResponse<AdminProduct>>(`/v1/admin/products/${id}`, {
    requireAuth: true,
  });
}

/**
 * Create a new product (admin can assign to any vendor).
 * 
 * @param data - Product creation data
 * @param vendorId - Vendor to assign product to
 * @returns Created product
 */
export function adminCreateProduct(data: CreateProductRequest & { vendorId: string }) {
  return post<ApiSuccessResponse<AdminProduct>>('/v1/admin/products', data, {
    requireAuth: true,
  });
}

/**
 * Update any product (admin override).
 * 
 * @param id - Product ID
 * @param data - Product update data
 * @returns Updated product
 */
export function adminUpdateProduct(id: string, data: UpdateProductRequest) {
  return patch<ApiSuccessResponse<AdminProduct>>(`/v1/admin/products/${id}`, data, {
    requireAuth: true,
  });
}

/**
 * Delete any product (admin override).
 * 
 * @param id - Product ID
 * @param hardDelete - Permanently delete (default: soft delete)
 * @returns Success response
 */
export function adminDeleteProduct(id: string, hardDelete = false) {
  return del<ApiSuccessResponse<void>>(`/v1/admin/products/${id}`, {
    requireAuth: true,
    params: hardDelete ? { hard: true } : undefined,
  });
}

/**
 * Perform bulk action on multiple products.
 * 
 * @param request - Bulk action request
 * @returns Bulk action response
 */
export function adminBulkProductAction(request: BulkProductActionRequest) {
  return post<ApiSuccessResponse<BulkActionResponse>>('/v1/admin/products/bulk', request, {
    requireAuth: true,
  });
}

/**
 * Toggle product featured status.
 * 
 * @param id - Product ID
 * @param featured - Whether to feature the product
 * @returns Updated product
 */
export function adminToggleProductFeatured(id: string, featured: boolean) {
  return patch<ApiSuccessResponse<AdminProduct>>(`/v1/admin/products/${id}/featured`, { featured }, {
    requireAuth: true,
  });
}

/**
 * Toggle product active status.
 * 
 * @param id - Product ID
 * @param active - Whether to activate the product
 * @returns Updated product
 */
export function adminToggleProductActive(id: string, active: boolean) {
  return patch<ApiSuccessResponse<AdminProduct>>(`/v1/admin/products/${id}/status`, { isActive: active }, {
    requireAuth: true,
  });
}

/**
 * Get product analytics.
 * 
 * @param id - Product ID
 * @param period - Analytics period (7d, 30d, 90d, 1y)
 * @returns Product analytics
 */
export function adminGetProductAnalytics(id: string, period: '7d' | '30d' | '90d' | '1y' = '30d') {
  return get<ApiSuccessResponse<ProductAnalytics>>(`/v1/admin/products/${id}/analytics`, {
    requireAuth: true,
    params: { period },
  });
}

/**
 * Import products from CSV/JSON.
 * 
 * @param data - Import data
 * @returns Import results
 */
export function adminImportProducts(data: ProductImportRequest) {
  return post<ApiSuccessResponse<ProductImportResponse>>('/v1/admin/products/import', data, {
    requireAuth: true,
  });
}

/**
 * Export products to CSV/JSON.
 * 
 * @param filters - Filters to apply to export
 * @param format - Export format
 * @returns Export URL or data
 */
export function adminExportProducts(
  filters?: AdminProductFilters,
  format: 'csv' | 'json' = 'csv'
) {
  return get<ApiSuccessResponse<{ url: string; expiresAt: string }>>('/v1/admin/products/export', {
    requireAuth: true,
    params: { ...filters, format } as Record<string, string | number | boolean | undefined>,
  });
}

// =============================================================================
// CATEGORY MANAGEMENT (Admin)
// =============================================================================

/**
 * Admin create category.
 * 
 * @param data - Category creation data
 * @returns Created category
 */
export function adminCreateCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  sortOrder?: number;
}) {
  return post<ApiSuccessResponse<Category>>('/v1/admin/categories', data, {
    requireAuth: true,
  });
}

/**
 * Admin update category.
 * 
 * @param id - Category ID
 * @param data - Category update data
 * @returns Updated category
 */
export function adminUpdateCategory(id: string, data: {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return patch<ApiSuccessResponse<Category>>(`/v1/admin/categories/${id}`, data, {
    requireAuth: true,
  });
}

/**
 * Admin delete category.
 * 
 * @param id - Category ID
 * @param reassignTo - Category to reassign products to
 * @returns Success response
 */
export function adminDeleteCategory(id: string, reassignTo?: string) {
  return del<ApiSuccessResponse<void>>(`/v1/admin/categories/${id}`, {
    requireAuth: true,
    params: reassignTo ? { reassignTo } : undefined,
  });
}

/**
 * Reorder categories.
 * 
 * @param categoryOrders - Array of category IDs in order
 * @returns Success response
 */
export function adminReorderCategories(categoryOrders: Array<{ id: string; sortOrder: number }>) {
  return patch<ApiSuccessResponse<void>>('/v1/admin/categories/reorder', { categories: categoryOrders }, {
    requireAuth: true,
  });
}
