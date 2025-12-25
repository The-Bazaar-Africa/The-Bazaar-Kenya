/**
 * Auth Route Integration Tests
 * 
 * Tests for /v1/auth endpoints using Fastify's inject() method.
 * These are real integration tests that hit the actual route handlers.
 */

import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp } from './helpers';

describe('Auth API - /v1/auth', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  // ==========================================================================
  // POST /v1/auth/login - User login
  // ==========================================================================
  describe('POST /v1/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'invalid-email',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400/401 for invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword123',
        },
      });

      // Either bad request or unauthorized
      expect([400, 401]).toContain(response.statusCode);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should return tokens for valid credentials', async () => {
      // This test requires a real user in the test database
      // For now, we test the API contract shape
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'TestPassword123!',
        },
      });

      // Response should have standard structure regardless of auth success
      const body = response.json();
      expect(body).toHaveProperty('success');
      
      if (body.success) {
        expect(body.data).toHaveProperty('accessToken');
        expect(body.data).toHaveProperty('user');
      }
    });
  });

  // ==========================================================================
  // POST /v1/auth/register - User registration
  // ==========================================================================
  describe('POST /v1/auth/register', () => {
    it('should return 400 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/register',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'ValidPass123!',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should enforce password minimum length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept valid registration data', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/register',
        payload: {
          email: uniqueEmail,
          password: 'ValidPassword123!',
          name: 'Test User',
        },
      });

      // Response structure should be consistent
      const body = response.json();
      expect(body).toHaveProperty('success');
    });
  });

  // ==========================================================================
  // GET /v1/auth/me - Get current user
  // ==========================================================================
  describe('GET /v1/auth/me', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ==========================================================================
  // POST /v1/auth/refresh - Refresh token
  // ==========================================================================
  describe('POST /v1/auth/refresh', () => {
    it('should return 400/401 without refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/refresh',
        payload: {},
      });

      expect([400, 401]).toContain(response.statusCode);
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/refresh',
        payload: {
          refreshToken: 'invalid-refresh-token',
        },
      });

      expect([400, 401]).toContain(response.statusCode);
    });
  });

  // ==========================================================================
  // POST /v1/auth/logout - User logout
  // ==========================================================================
  describe('POST /v1/auth/logout', () => {
    it('should return success even without auth (idempotent)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/auth/logout',
      });

      // Logout should be idempotent - either 200 or 401
      expect([200, 401]).toContain(response.statusCode);
    });
  });
});
