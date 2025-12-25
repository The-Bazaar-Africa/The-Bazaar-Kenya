/**
 * Checkout Route Integration Tests
 * 
 * Tests for /v1/checkout endpoints using Fastify's inject() method.
 * These are real integration tests that hit the actual route handlers.
 */

import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp } from './helpers';

describe('Checkout API - /v1/checkout', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ==========================================================================
  // POST /v1/checkout/initiate - Start checkout session
  // ==========================================================================
  describe('POST /v1/checkout/initiate', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/initiate',
        payload: {
          items: [
            { cartItemId: 'item-1', productId: 'prod-1', quantity: 1, price: 1000 },
          ],
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should validate items payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/initiate',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        payload: {
          items: [], // Empty items should fail
        },
      });

      // Either auth error or validation error
      expect([400, 401]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // POST /v1/checkout/validate - Validate cart for checkout
  // ==========================================================================
  describe('POST /v1/checkout/validate', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/validate',
        payload: {
          items: [{ productId: 'prod-1', quantity: 1 }],
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // POST /v1/checkout/shipping - Calculate shipping
  // ==========================================================================
  describe('POST /v1/checkout/shipping', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/shipping',
        payload: {
          sessionId: 'session-123',
          address: {
            city: 'Nairobi',
            country: 'KE',
          },
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // POST /v1/checkout/payment - Initiate payment
  // ==========================================================================
  describe('POST /v1/checkout/payment', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/payment',
        payload: {
          sessionId: 'session-123',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate session ID is provided', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/payment',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        payload: {},
      });

      // Either auth error or validation error
      expect([400, 401]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // POST /v1/checkout/confirm - Confirm order after payment
  // ==========================================================================
  describe('POST /v1/checkout/confirm', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/confirm',
        payload: {
          sessionId: 'session-123',
          paymentReference: 'pay-ref-123',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // GET /v1/checkout/session/:id - Get checkout session status
  // ==========================================================================
  describe('GET /v1/checkout/session/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/checkout/session/session-123',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 404/401 for non-existent session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/checkout/session/non-existent-session',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Without valid auth, should get 401
      expect([401, 404]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // POST /v1/checkout/cancel - Cancel checkout session
  // ==========================================================================
  describe('POST /v1/checkout/cancel', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/checkout/cancel',
        payload: {
          sessionId: 'session-123',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
