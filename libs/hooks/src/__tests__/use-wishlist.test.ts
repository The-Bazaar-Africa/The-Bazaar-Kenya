import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishlist, WishlistProduct } from '../use-wishlist';

describe('useWishlist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockProduct: WishlistProduct = {
    id: 'product-1',
    name: 'Test Product',
    price: 99.99,
    image: 'https://example.com/image.jpg',
    slug: 'test-product',
    category: 'Electronics',
    inStock: true,
  };

  describe('initial state', () => {
    it('should return empty wishlist initially', () => {
      const { result } = renderHook(() => useWishlist());

      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load wishlist from localStorage', () => {
      const storedWishlist = [
        {
          product: mockProduct,
          addedAt: Date.now(),
        },
      ];
      localStorage.setItem('bazaar_wishlist', JSON.stringify(storedWishlist));

      const { result } = renderHook(() => useWishlist());

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.name).toBe('Test Product');
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.id).toBe('product-1');
      expect(result.current.items[0].product.name).toBe('Test Product');
      expect(result.current.itemCount).toBe(1);
    });

    it('should add product with notes', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct, 'Gift for birthday');
      });

      expect(result.current.items[0].notes).toBe('Gift for birthday');
    });

    it('should not add duplicate products', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
        result.current.addToWishlist(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      const stored = localStorage.getItem('bazaar_wishlist');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].product.id).toBe('product-1');
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove product from wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeFromWishlist('product-1');
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('should handle removing non-existent product', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      act(() => {
        result.current.removeFromWishlist('non-existent');
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('clearWishlist', () => {
    it('should remove all products from wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
        result.current.addToWishlist({ ...mockProduct, id: 'product-2', name: 'Product 2' });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearWishlist();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe('isInWishlist', () => {
    it('should return true if product is in wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      expect(result.current.isInWishlist('product-1')).toBe(true);
    });

    it('should return false if product is not in wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      expect(result.current.isInWishlist('product-1')).toBe(false);
    });
  });

  describe('getItem', () => {
    it('should return wishlist item by productId', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct, 'Test note');
      });

      const item = result.current.getItem('product-1');
      expect(item).toBeDefined();
      expect(item?.product.name).toBe('Test Product');
      expect(item?.notes).toBe('Test note');
    });

    it('should return undefined if not found', () => {
      const { result } = renderHook(() => useWishlist());

      const item = result.current.getItem('non-existent');
      expect(item).toBeUndefined();
    });
  });

  describe('toggleWishlist', () => {
    it('should add product if not in wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      let added: boolean;
      act(() => {
        added = result.current.toggleWishlist(mockProduct);
      });

      expect(added!).toBe(true);
      expect(result.current.items).toHaveLength(1);
    });

    it('should remove product if already in wishlist', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct);
      });

      let removed: boolean;
      act(() => {
        removed = result.current.toggleWishlist(mockProduct);
      });

      expect(removed!).toBe(false);
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('updateNotes', () => {
    it('should update notes for a product', () => {
      const { result } = renderHook(() => useWishlist());

      act(() => {
        result.current.addToWishlist(mockProduct, 'Original note');
      });

      act(() => {
        result.current.updateNotes('product-1', 'Updated note');
      });

      const item = result.current.getItem('product-1');
      expect(item?.notes).toBe('Updated note');
    });
  });

  describe('multiple products', () => {
    it('should handle multiple products correctly', () => {
      const { result } = renderHook(() => useWishlist());

      const products: WishlistProduct[] = [
        mockProduct,
        { ...mockProduct, id: 'product-2', name: 'Product 2', price: 149.99 },
        { ...mockProduct, id: 'product-3', name: 'Product 3', price: 199.99 },
      ];

      act(() => {
        products.forEach(p => result.current.addToWishlist(p));
      });

      expect(result.current.items).toHaveLength(3);
      expect(result.current.itemCount).toBe(3);
      expect(result.current.isInWishlist('product-1')).toBe(true);
      expect(result.current.isInWishlist('product-2')).toBe(true);
      expect(result.current.isInWishlist('product-3')).toBe(true);
    });
  });
});
