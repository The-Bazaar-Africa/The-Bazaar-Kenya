/**
 * Cart Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the cart API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCart,
  getCartSummary,
  validateCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
} from '../endpoints/cart';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Cart Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'test-token',
    });
  });

  // ==========================================================================
  // getCart
  // ==========================================================================
  describe('getCart()', () => {
    it('should GET /v1/cart with auth', async () => {
      const mockCart = {
        success: true,
        data: {
          id: 'cart-1',
          items: [],
          itemCount: 0,
          subtotal: 0,
          currency: 'KES',
        },
      };
      mockFetchResponse(mockCart);

      const result = await getCart();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockCart);
    });
  });

  // ==========================================================================
  // getCartSummary
  // ==========================================================================
  describe('getCartSummary()', () => {
    it('should GET /v1/cart/summary with auth', async () => {
      mockFetchResponse({
        success: true,
        data: {
          itemCount: 3,
          subtotal: 150.00,
          estimatedTax: 24.00,
          estimatedTotal: 174.00,
        },
      });

      await getCartSummary();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/summary',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // validateCart
  // ==========================================================================
  describe('validateCart()', () => {
    it('should GET /v1/cart/validate with auth', async () => {
      mockFetchResponse({
        success: true,
        data: {
          valid: true,
          items: [],
        },
      });

      await validateCart();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/validate',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // addToCart
  // ==========================================================================
  describe('addToCart()', () => {
    it('should POST to /v1/cart/items with product data', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'cart-1', items: [{ productId: 'prod-1', quantity: 2 }] },
      });

      await addToCart('prod-1', 2);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productId: 'prod-1', quantity: 2 }),
        })
      );
    });

    it('should include variantId when provided', async () => {
      mockFetchResponse({ success: true, data: { id: 'cart-1', items: [] } });

      await addToCart('prod-1', 1, 'variant-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            productId: 'prod-1',
            quantity: 1,
            variantId: 'variant-1',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // updateCartItem
  // ==========================================================================
  describe('updateCartItem()', () => {
    it('should PATCH /v1/cart/items/:id with new quantity', async () => {
      mockFetchResponse({ success: true, data: { id: 'cart-1', items: [] } });

      await updateCartItem('item-1', 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/items/item-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ quantity: 5 }),
        })
      );
    });
  });

  // ==========================================================================
  // removeCartItem
  // ==========================================================================
  describe('removeCartItem()', () => {
    it('should DELETE /v1/cart/items/:id', async () => {
      mockFetchResponse({ success: true, data: { id: 'cart-1', items: [] } });

      await removeCartItem('item-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/items/item-1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // clearCart
  // ==========================================================================
  describe('clearCart()', () => {
    it('should DELETE /v1/cart', async () => {
      mockFetchResponse({ success: true, data: { id: 'cart-1', items: [] } });

      await clearCart();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // mergeCart
  // ==========================================================================
  describe('mergeCart()', () => {
    it('should POST guest cart items to /v1/cart/merge', async () => {
      const guestItems = [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ];
      mockFetchResponse({ success: true, data: { id: 'cart-1', items: [] } });

      await mergeCart(guestItems, 'guest-session-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/cart/merge',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            items: guestItems,
            sessionId: 'guest-session-123',
          }),
        })
      );
    });
  });
});
