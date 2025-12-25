/**
 * The Bazaar API v1 - Products Endpoint
 * ======================================
 * 
 * API functions for product operations.
 * Maps to: apps/backend-api/src/routes/v1/products.ts
 */

import { get, post, patch, del } from '../http/client';
import type {
  ApiSuccessResponse,
  Product,
  ProductFilters,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  Category,
} from '../generated';

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * List products with optional filtering and pagination.
 * 
 * @param filters - Optional filters for the product list
 * @returns Paginated list of products
 */
export function getProducts(filters?: ProductFilters) {
  return get<ApiSuccessResponse<ProductListResponse>>('/v1/products', {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get product details by ID.
 * 
 * @param id - The product's unique ID
 * @returns Product details
 */
export function getProductById(id: string) {
  return get<ApiSuccessResponse<Product>>(`/v1/products/${id}`);
}

/**
 * Get product details by slug.
 * 
 * @param slug - The product's URL-friendly slug
 * @returns Product details
 */
export function getProductBySlug(slug: string) {
  return get<ApiSuccessResponse<Product>>(`/v1/products/slug/${slug}`);
}

/**
 * Search products by query string.
 * 
 * @param query - Search query
 * @param options - Additional options
 * @returns Matching products
 */
export function searchProducts(query: string, options?: { page?: number; limit?: number }) {
  return get<ApiSuccessResponse<ProductListResponse>>('/v1/products', {
    params: { ...options, search: query },
  });
}

/**
 * Get featured products.
 * 
 * @param limit - Maximum number of products to return
 * @returns Featured products
 */
export function getFeaturedProducts(limit?: number) {
  return get<ApiSuccessResponse<Product[]>>('/v1/products/featured', {
    params: limit ? { limit } : undefined,
  });
}

/**
 * Get products by vendor.
 * 
 * @param vendorId - Vendor ID
 * @param options - Pagination options
 * @returns Vendor's products
 */
export function getProductsByVendor(vendorId: string, options?: { page?: number; limit?: number }) {
  return get<ApiSuccessResponse<ProductListResponse>>('/v1/products', {
    params: { ...options, vendor: vendorId },
  });
}

/**
 * Get products by category.
 * 
 * @param categoryId - Category ID
 * @param options - Pagination options
 * @returns Category products
 */
export function getProductsByCategory(categoryId: string, options?: { page?: number; limit?: number }) {
  return get<ApiSuccessResponse<ProductListResponse>>('/v1/products', {
    params: { ...options, category: categoryId },
  });
}

// =============================================================================
// VENDOR/ADMIN ENDPOINTS (Authenticated)
// =============================================================================

/**
 * Create a new product.
 * Requires vendor authentication.
 * 
 * @param data - Product creation data
 * @returns Created product
 */
export function createProduct(data: CreateProductRequest) {
  return post<ApiSuccessResponse<Product>>('/v1/products', data, {
    requireAuth: true,
  });
}

/**
 * Update a product.
 * Requires vendor authentication (owner or admin).
 * 
 * @param id - Product ID
 * @param data - Product update data
 * @returns Updated product
 */
export function updateProduct(id: string, data: UpdateProductRequest) {
  return patch<ApiSuccessResponse<Product>>(`/v1/products/${id}`, data, {
    requireAuth: true,
  });
}

/**
 * Delete a product.
 * Requires vendor authentication (owner or admin).
 * 
 * @param id - Product ID
 * @returns Success response
 */
export function deleteProduct(id: string) {
  return del<ApiSuccessResponse<void>>(`/v1/products/${id}`, {
    requireAuth: true,
  });
}

// =============================================================================
// CATEGORY HELPERS (Re-exported for convenience)
// =============================================================================

/**
 * Get all categories.
 * 
 * @returns List of categories
 */
export function getCategories() {
  return get<ApiSuccessResponse<Category[]>>('/v1/categories');
}

/**
 * Get category by slug.
 * 
 * @param slug - Category slug
 * @returns Category details
 */
export function getCategoryBySlug(slug: string) {
  return get<ApiSuccessResponse<Category>>(`/v1/categories/slug/${slug}`);
}
