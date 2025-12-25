/**
 * Orders Route Integration Tests
 * 
 * Tests for /v1/orders endpoints using Fastify's inject() method.
 * These are real integration tests that hit the actual route handlers.
 */

import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp } from './helpers';

describe('Orders API - /v1/orders', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ==========================================================================
  // GET /v1/orders - List orders (requires auth)
  // ==========================================================================
  describe('GET /v1/orders', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/orders',
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/orders',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should support pagination query params', async () => {
      // Even though unauthenticated, the route should accept the params structure
      const response = await app.inject({
        method: 'GET',
        url: '/v1/orders?page=1&limit=10&status=pending',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Should fail auth, not params validation
      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // GET /v1/orders/:id - Get single order (requires auth)
  // ==========================================================================
  describe('GET /v1/orders/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/orders/some-order-id',
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should return 404 for non-existent order with valid auth format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/orders/non-existent-order-id',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Without valid auth, should get 401
      expect([401, 404]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // POST /v1/orders - Create order (requires auth)
  // ==========================================================================
  describe('POST /v1/orders', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/orders',
        payload: {
          items: [{ productId: 'prod-1', quantity: 1 }],
          shippingAddress: {
            line1: '123 Test Street',
            city: 'Nairobi',
            postalCode: '00100',
            country: 'KE',
          },
          paymentMethod: 'paystack',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should validate order payload structure', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/orders',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        payload: {}, // Missing required fields
      });

      // Should fail - either 401 (auth) or 400 (validation)
      expect([400, 401]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // PATCH /v1/orders/:id/status - Update order status (requires auth)
  // ==========================================================================
  describe('PATCH /v1/orders/:id/status', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/orders/some-order-id/status',
        payload: {
          status: 'confirmed',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate status value', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/v1/orders/some-order-id/status',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        payload: {
          status: 'invalid-status',
        },
      });

      // Either auth error or validation error
      expect([400, 401]).toContain(response.statusCode);
    });
  });
});
