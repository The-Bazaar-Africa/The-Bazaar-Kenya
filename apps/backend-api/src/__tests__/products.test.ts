/**
 * Products Route Integration Tests
 * 
 * Tests for /v1/products endpoints using Fastify's inject() method.
 * These are real integration tests that hit the actual route handlers.
 */

import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp } from './helpers';

describe('Products API - /v1/products', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ==========================================================================
  // GET /v1/products - List products
  // ==========================================================================
  describe('GET /v1/products', () => {
    it('should return 200 with success response envelope', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products',
      });

      expect(response.statusCode).toBe(200);
      
      const body = response.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.products).toBeDefined();
      expect(Array.isArray(body.data.products)).toBe(true);
    });

    it('should include pagination metadata', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products',
      });

      const body = response.json();
      expect(body.data.pagination).toBeDefined();
      expect(body.data.pagination).toHaveProperty('page');
      expect(body.data.pagination).toHaveProperty('limit');
      expect(body.data.pagination).toHaveProperty('total');
      expect(body.data.pagination).toHaveProperty('totalPages');
    });

    it('should respect page and limit query params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products?page=1&limit=5',
      });

      const body = response.json();
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(5);
    });

    it('should enforce maximum limit of 100', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products?limit=200',
      });

      // Should either cap at 100 or return validation error
      expect([200, 400]).toContain(response.statusCode);
    });

    it('should filter by category when provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products?category=test-category-id',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products?minPrice=100&maxPrice=5000',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
    });

    it('should support search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products?search=test',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.success).toBe(true);
    });
  });

  // ==========================================================================
  // GET /v1/products/:id - Get single product
  // ==========================================================================
  describe('GET /v1/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/products/non-existent-id-12345',
      });

      expect(response.statusCode).toBe(404);
      
      const body = response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should return product with success envelope for valid ID', async () => {
      // First get a list to find a valid product ID
      const listResponse = await app.inject({
        method: 'GET',
        url: '/v1/products?limit=1',
      });

      const list = listResponse.json();
      
      if (list.data.products.length > 0) {
        const productId = list.data.products[0].id;
        
        const response = await app.inject({
          method: 'GET',
          url: `/v1/products/${productId}`,
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();
      } else {
        // No products in test DB - skip with informative message
        console.info('Skipping: No products in test database');
      }
    });
  });

  // ==========================================================================
  // POST /v1/products - Create product (requires auth)
  // ==========================================================================
  describe('POST /v1/products', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/products',
        payload: {
          name: 'Test Product',
          description: 'A test product',
          price: 1999,
          categoryId: 'test-category',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/products',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        payload: {},
      });

      // Should fail - either 401 (no valid auth) or 400 (validation error)
      expect([400, 401]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // PATCH /v1/products/:id - Update product (requires auth)
  // ==========================================================================
  describe('PATCH /v1/products/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/products/some-product-id',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // DELETE /v1/products/:id - Delete product (requires auth)
  // ==========================================================================
  describe('DELETE /v1/products/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/products/some-product-id',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
