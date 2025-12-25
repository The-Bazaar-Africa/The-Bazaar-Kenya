/**
 * The Bazaar API v1 - Wishlist Endpoint
 * ======================================
 * 
 * API functions for wishlist operations.
 * Maps to: apps/backend-api/src/routes/v1/wishlist.ts
 */

import { get, post, del } from '../http/client';
import type {
  ApiSuccessResponse,
  WishlistItem,
  WishlistResponse,
  AddToWishlistRequest,
} from '../generated';

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Get current user's wishlist.
 * Requires authentication.
 * 
 * @returns Wishlist items
 */
export function getWishlist() {
  return get<ApiSuccessResponse<WishlistResponse>>('/v1/wishlist', {
    requireAuth: true,
  });
}

/**
 * Add item to wishlist.
 * Requires authentication.
 * 
 * @param productId - Product ID to add
 * @returns Added wishlist item
 */
export function addToWishlist(productId: string) {
  return post<ApiSuccessResponse<WishlistItem>>('/v1/wishlist', { productId } as AddToWishlistRequest, {
    requireAuth: true,
  });
}

/**
 * Remove item from wishlist.
 * Requires authentication.
 * 
 * @param productId - Product ID to remove
 * @returns Success response
 */
export function removeFromWishlist(productId: string) {
  return del<ApiSuccessResponse<void>>(`/v1/wishlist/${productId}`, {
    requireAuth: true,
  });
}

/**
 * Check if product is in wishlist.
 * Requires authentication.
 * 
 * @param productId - Product ID to check
 * @returns Whether product is in wishlist
 */
export function isInWishlist(productId: string) {
  return get<ApiSuccessResponse<{ inWishlist: boolean }>>(`/v1/wishlist/check/${productId}`, {
    requireAuth: true,
  });
}

/**
 * Clear entire wishlist.
 * Requires authentication.
 * 
 * @returns Success response
 */
export function clearWishlist() {
  return del<ApiSuccessResponse<void>>('/v1/wishlist', {
    requireAuth: true,
  });
}

/**
 * Move wishlist item to cart.
 * Requires authentication.
 * 
 * @param productId - Product ID to move
 * @param quantity - Quantity to add to cart
 * @returns Success response
 */
export function moveToCart(productId: string, quantity: number = 1) {
  return post<ApiSuccessResponse<void>>(`/v1/wishlist/${productId}/move-to-cart`, { quantity }, {
    requireAuth: true,
  });
}
