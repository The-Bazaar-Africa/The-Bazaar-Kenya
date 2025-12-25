/**
 * Products Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the products API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  searchProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../endpoints/products';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Products Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'test-token',
    });
  });

  // ==========================================================================
  // getProducts
  // ==========================================================================
  describe('getProducts()', () => {
    it('should call /v1/products without params', async () => {
      const mockData = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };
      mockFetchResponse(mockData);

      const result = await getProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products',
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });

    it('should include filters as query params', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await getProducts({ page: 2, limit: 10, category: 'electronics' });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('category=electronics');
    });

    it('should include price range filters', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await getProducts({ minPrice: 100, maxPrice: 500 });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('minPrice=100');
      expect(calledUrl).toContain('maxPrice=500');
    });
  });

  // ==========================================================================
  // getProductById
  // ==========================================================================
  describe('getProductById()', () => {
    it('should call /v1/products/:id', async () => {
      const mockProduct = {
        success: true,
        data: { id: 'prod-123', name: 'Test Product' },
      };
      mockFetchResponse(mockProduct);

      const result = await getProductById('prod-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products/prod-123',
        expect.any(Object)
      );
      expect(result).toEqual(mockProduct);
    });
  });

  // ==========================================================================
  // getProductBySlug
  // ==========================================================================
  describe('getProductBySlug()', () => {
    it('should call /v1/products/slug/:slug', async () => {
      mockFetchResponse({ success: true, data: { slug: 'test-product' } });

      await getProductBySlug('test-product');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products/slug/test-product',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // searchProducts
  // ==========================================================================
  describe('searchProducts()', () => {
    it('should include search query in params', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await searchProducts('wireless headphones');

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      // URLSearchParams uses + for spaces, which is valid
      expect(calledUrl).toMatch(/search=wireless[+%20]headphones/);
    });

    it('should include pagination options', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await searchProducts('test', { page: 2, limit: 5 });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=5');
    });
  });

  // ==========================================================================
  // getFeaturedProducts
  // ==========================================================================
  describe('getFeaturedProducts()', () => {
    it('should call /v1/products/featured', async () => {
      mockFetchResponse({ success: true, data: [] });

      await getFeaturedProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products/featured',
        expect.any(Object)
      );
    });

    it('should include limit param when provided', async () => {
      mockFetchResponse({ success: true, data: [] });

      await getFeaturedProducts(5);

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('limit=5');
    });
  });

  // ==========================================================================
  // createProduct (Authenticated)
  // ==========================================================================
  describe('createProduct()', () => {
    it('should POST to /v1/products with auth', async () => {
      const productData = {
        name: 'New Product',
        price: 99.99,
        categoryId: 'cat-1',
      };
      mockFetchResponse({ success: true, data: { id: 'new-1', ...productData } });

      await createProduct(productData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(productData),
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // updateProduct (Authenticated)
  // ==========================================================================
  describe('updateProduct()', () => {
    it('should PATCH to /v1/products/:id with auth', async () => {
      const updateData = { name: 'Updated Name', price: 149.99 };
      mockFetchResponse({ success: true, data: { id: 'prod-1', ...updateData } });

      await updateProduct('prod-1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products/prod-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // deleteProduct (Authenticated)
  // ==========================================================================
  describe('deleteProduct()', () => {
    it('should DELETE to /v1/products/:id with auth', async () => {
      mockFetchResponse({ success: true });

      await deleteProduct('prod-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products/prod-1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
