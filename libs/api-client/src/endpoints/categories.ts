/**
 * The Bazaar API v1 - Categories Endpoint
 * ========================================
 * 
 * API functions for category operations.
 * Maps to: apps/backend-api/src/routes/v1/categories.ts
 */

import { get } from '../http/client';
import type {
  ApiSuccessResponse,
  Category,
  CategoryFilters,
  Product,
  PaginatedResponse,
} from '../generated';

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * List all categories.
 * 
 * @param filters - Optional filters
 * @returns List of categories
 */
export function listCategories(filters?: CategoryFilters) {
  return get<ApiSuccessResponse<Category[]>>('/v1/categories', {
    params: filters as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get category tree (hierarchical structure).
 * 
 * @returns Nested category tree
 */
export function getCategoryTree() {
  return get<ApiSuccessResponse<Category[]>>('/v1/categories/tree');
}

/**
 * Get category by ID.
 * 
 * @param categoryId - The category's unique ID
 * @returns Category details
 */
export function getCategoryById(categoryId: string) {
  return get<ApiSuccessResponse<Category>>(`/v1/categories/${categoryId}`);
}

/**
 * Get category by slug.
 * 
 * @param slug - The category's URL-friendly slug
 * @returns Category details
 */
export function getCategoryBySlug(slug: string) {
  return get<ApiSuccessResponse<Category>>(`/v1/categories/slug/${slug}`);
}

/**
 * Get products in a category.
 * 
 * @param categoryId - The category's unique ID
 * @param options - Pagination options
 * @returns Paginated list of products
 */
export function getCategoryProducts(
  categoryId: string,
  options?: { page?: number; limit?: number }
) {
  return get<ApiSuccessResponse<PaginatedResponse<Product>>>(`/v1/categories/${categoryId}/products`, {
    params: options,
  });
}

/**
 * Get subcategories of a category.
 * 
 * @param categoryId - The parent category's unique ID
 * @returns List of subcategories
 */
export function getSubcategories(categoryId: string) {
  return get<ApiSuccessResponse<Category[]>>(`/v1/categories/${categoryId}/subcategories`);
}
