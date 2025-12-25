import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCart, CartItem, AddToCartInput } from '../use-cart';

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should return empty cart initially', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.uniqueItemCount).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load cart from localStorage', () => {
      const storedCart = {
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            addedAt: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('thebazaar_cart', JSON.stringify(storedCart));

      const { result } = renderHook(() => useCart());

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe('Test Product');
    });
  });

  describe('addToCart', () => {
    it('should add a new item to cart', async () => {
      const { result } = renderHook(() => useCart());

      const newItem: AddToCartInput = {
        productId: 'product-1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      };

      await act(async () => {
        await result.current.addToCart(newItem);
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });
      
      expect(result.current.items[0].productId).toBe('product-1');
      expect(result.current.items[0].name).toBe('Test Product');
      expect(result.current.items[0].price).toBe(99.99);
      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should update quantity when adding existing item', async () => {
      const { result } = renderHook(() => useCart());

      const item: AddToCartInput = {
        productId: 'product-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      };

      await act(async () => {
        await result.current.addToCart(item);
      });

      await act(async () => {
        await result.current.addToCart({ ...item, quantity: 2 });
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(3);
      });
    });

    it('should handle adding with different variants', async () => {
      const { result } = renderHook(() => useCart());

      const item1: AddToCartInput = {
        productId: 'product-1',
        variantId: 'small',
        name: 'Test Product - Small',
        price: 100,
        quantity: 1,
      };

      const item2: AddToCartInput = {
        productId: 'product-1',
        variantId: 'large',
        name: 'Test Product - Large',
        price: 120,
        quantity: 1,
      };

      await act(async () => {
        await result.current.addToCart(item1);
      });
      
      await act(async () => {
        await result.current.addToCart(item2);
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(2);
        expect(result.current.uniqueItemCount).toBe(2);
      });
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.updateQuantity(itemId, 5);
      });

      await waitFor(() => {
        expect(result.current.items[0].quantity).toBe(5);
      });
    });

    it('should remove item when quantity is 0', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.updateQuantity(itemId, 0);
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(0);
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.removeFromCart(itemId);
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(0);
      });
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test 1',
          price: 100,
          quantity: 1,
        });
      });
      
      await act(async () => {
        await result.current.addToCart({
          productId: 'product-2',
          name: 'Test 2',
          price: 200,
          quantity: 2,
        });
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(2);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      await waitFor(() => {
        expect(result.current.items).toHaveLength(0);
        expect(result.current.itemCount).toBe(0);
      });
    });
  });

  describe('isInCart', () => {
    it('should return true if product is in cart', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.isInCart('product-1', null)).toBe(true);
        expect(result.current.isInCart('product-2', null)).toBe(false);
      });
    });

    it('should check variant when provided', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          variantId: 'small',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.isInCart('product-1', 'small')).toBe(true);
        expect(result.current.isInCart('product-1', 'large')).toBe(false);
      });
    });
  });

  describe('calculations', () => {
    it('should calculate itemCount correctly', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test 1',
          price: 100,
          quantity: 2,
        });
      });
      
      await act(async () => {
        await result.current.addToCart({
          productId: 'product-2',
          name: 'Test 2',
          price: 200,
          quantity: 3,
        });
      });

      await waitFor(() => {
        expect(result.current.itemCount).toBe(5); // 2 + 3
        expect(result.current.uniqueItemCount).toBe(2);
      });
    });

    it('should calculate subtotal correctly', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test 1',
          price: 100,
          quantity: 2,
        });
      });
      
      await act(async () => {
        await result.current.addToCart({
          productId: 'product-2',
          name: 'Test 2',
          price: 50,
          quantity: 3,
        });
      });

      // (100 * 2) + (50 * 3) = 200 + 150 = 350
      await waitFor(() => {
        expect(result.current.subtotal).toBe(350);
      });
    });
  });

  describe('getCartItem', () => {
    it('should return cart item by productId', async () => {
      const { result } = renderHook(() => useCart());

      await act(async () => {
        await result.current.addToCart({
          productId: 'product-1',
          name: 'Test',
          price: 100,
          quantity: 1,
        });
      });

      await waitFor(() => {
        const item = result.current.getCartItem('product-1', null);
        expect(item).toBeDefined();
        expect(item?.name).toBe('Test');
      });
    });

    it('should return undefined if not found', () => {
      const { result } = renderHook(() => useCart());

      const item = result.current.getCartItem('non-existent', null);
      expect(item).toBeUndefined();
    });
  });
});
