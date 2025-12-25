/**
 * The Bazaar API v1 - Cart Endpoint
 * ==================================
 * 
 * API functions for shopping cart operations.
 * Maps to: apps/backend-api/src/routes/v1/cart.ts
 */

import { get, post, patch, del } from '../http/client';
import type {
  ApiSuccessResponse,
  Cart,
  CartSummary,
  AddToCartRequest,
  UpdateCartItemRequest,
  MergeCartRequest,
  CartValidationResult,
} from '../generated';

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Get current user's cart.
 * 
 * @returns Cart with items
 */
export function getCart() {
  return get<ApiSuccessResponse<Cart>>('/v1/cart', {
    requireAuth: true,
  });
}

/**
 * Get cart summary with totals and validation.
 * 
 * @returns Cart summary
 */
export function getCartSummary() {
  return get<ApiSuccessResponse<CartSummary>>('/v1/cart/summary', {
    requireAuth: true,
  });
}

/**
 * Validate cart items (stock, availability).
 * 
 * @returns Validation result
 */
export function validateCart() {
  return get<ApiSuccessResponse<CartValidationResult>>('/v1/cart/validate', {
    requireAuth: true,
  });
}

/**
 * Add item to cart.
 * 
 * @param productId - Product ID
 * @param quantity - Quantity to add
 * @param variantId - Optional variant ID
 * @returns Updated cart
 */
export function addToCart(productId: string, quantity: number, variantId?: string) {
  return post<ApiSuccessResponse<Cart>>('/v1/cart/items', {
    productId,
    quantity,
    variantId,
  } as AddToCartRequest, {
    requireAuth: true,
  });
}

/**
 * Update cart item quantity.
 * 
 * @param itemId - Cart item ID
 * @param quantity - New quantity
 * @returns Updated cart
 */
export function updateCartItem(itemId: string, quantity: number) {
  return patch<ApiSuccessResponse<Cart>>(`/v1/cart/items/${itemId}`, {
    quantity,
  } as UpdateCartItemRequest, {
    requireAuth: true,
  });
}

/**
 * Remove item from cart.
 * 
 * @param itemId - Cart item ID
 * @returns Updated cart
 */
export function removeCartItem(itemId: string) {
  return del<ApiSuccessResponse<Cart>>(`/v1/cart/items/${itemId}`, {
    requireAuth: true,
  });
}

/**
 * Clear entire cart.
 * 
 * @returns Empty cart
 */
export function clearCart() {
  return del<ApiSuccessResponse<Cart>>('/v1/cart', {
    requireAuth: true,
  });
}

/**
 * Merge guest cart after login.
 * 
 * @param items - Guest cart items
 * @param sessionId - Optional session ID
 * @returns Merged cart
 */
export function mergeCart(items: MergeCartRequest['items'], sessionId?: string) {
  return post<ApiSuccessResponse<Cart>>('/v1/cart/merge', {
    items,
    sessionId,
  } as MergeCartRequest, {
    requireAuth: true,
  });
}
