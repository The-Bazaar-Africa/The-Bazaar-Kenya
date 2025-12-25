/**
 * Admin Products Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the admin products API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminGetProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminBulkProductAction,
  adminToggleProductActive,
} from '../endpoints/admin/products';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Admin Products Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'admin-test-token',
    });
  });

  // ==========================================================================
  // adminGetProducts
  // ==========================================================================
  describe('adminGetProducts()', () => {
    it('should call /v1/admin/products without params', async () => {
      const mockData = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };
      mockFetchResponse(mockData);

      const result = await adminGetProducts();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-test-token',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include filters as query params', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await adminGetProducts({ 
        page: 2, 
        limit: 10, 
        status: 'active',
        vendorId: 'vendor-123',
      });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('status=active');
      expect(calledUrl).toContain('vendorId=vendor-123');
    });

    it('should handle search query', async () => {
      mockFetchResponse({ success: true, data: { products: [], pagination: {} } });

      await adminGetProducts({ search: 'test product' });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('search=test%20product');
    });
  });

  // ==========================================================================
  // adminGetProduct
  // ==========================================================================
  describe('adminGetProduct()', () => {
    it('should call /v1/admin/products/:id', async () => {
      const mockProduct = {
        success: true,
        data: { 
          id: 'prod-123', 
          name: 'Test Product',
          status: 'active',
          vendor: { id: 'vendor-1', name: 'Test Vendor' },
        },
      };
      mockFetchResponse(mockProduct);

      const result = await adminGetProduct('prod-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products/prod-123',
        expect.any(Object)
      );
      expect(result).toEqual(mockProduct);
    });
  });

  // ==========================================================================
  // adminCreateProduct
  // ==========================================================================
  describe('adminCreateProduct()', () => {
    it('should POST to /v1/admin/products', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'Test description',
        price: 99.99,
        vendorId: 'vendor-123',
        categoryId: 'cat-1',
      };
      const mockResponse = {
        success: true,
        data: { id: 'new-prod-1', ...newProduct },
      };
      mockFetchResponse(mockResponse);

      const result = await adminCreateProduct(newProduct);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newProduct),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // adminUpdateProduct
  // ==========================================================================
  describe('adminUpdateProduct()', () => {
    it('should PATCH /v1/admin/products/:id', async () => {
      const updates = {
        name: 'Updated Product Name',
        price: 149.99,
      };
      const mockResponse = {
        success: true,
        data: { id: 'prod-123', ...updates },
      };
      mockFetchResponse(mockResponse);

      const result = await adminUpdateProduct('prod-123', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products/prod-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // adminDeleteProduct
  // ==========================================================================
  describe('adminDeleteProduct()', () => {
    it('should DELETE /v1/admin/products/:id', async () => {
      mockFetchResponse({ success: true });

      await adminDeleteProduct('prod-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products/prod-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // adminBulkProductAction
  // ==========================================================================
  describe('adminBulkProductAction()', () => {
    it('should POST to /v1/admin/products/bulk-action', async () => {
      const bulkAction = {
        productIds: ['prod-1', 'prod-2', 'prod-3'],
        action: 'deactivate' as const,
      };
      const mockResponse = {
        success: true,
        data: { processed: 3, failed: 0 },
      };
      mockFetchResponse(mockResponse);

      const result = await adminBulkProductAction(bulkAction);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products/bulk-action',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(bulkAction),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // adminToggleProductActive
  // ==========================================================================
  describe('adminToggleProductActive()', () => {
    it('should PATCH /v1/admin/products/:id/active', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'prod-123', isActive: true },
      };
      mockFetchResponse(mockResponse);

      const result = await adminToggleProductActive('prod-123', true);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/products/prod-123/active',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ active: true }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should toggle product inactive', async () => {
      mockFetchResponse({ success: true, data: {} });

      await adminToggleProductActive('prod-1', false);
      
      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(body.active).toBe(false);
    });
  });
});
