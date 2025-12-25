/**
 * Auth Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the auth API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  verifySession,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../endpoints/auth';
import { configureHttpClient } from '../http/client';
import { ApiError } from '../http/errors';
import { mockFetchResponse, mockFetchError } from './setup';

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'test-token',
    });
  });

  // ==========================================================================
  // login
  // ==========================================================================
  describe('login()', () => {
    it('should POST credentials to /v1/auth/login', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 'user-1', email: 'test@example.com', role: 'buyer' },
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          expiresIn: 3600,
        },
      };
      mockFetchResponse(mockResponse);

      const result = await login({ email: 'test@example.com', password: 'password123' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
      expect(result.data.accessToken).toBe('access-token-123');
    });

    it('should throw on invalid credentials', async () => {
      mockFetchError(401, 'Invalid credentials', 'AUTH_INVALID_CREDENTIALS');

      await expect(
        login({ email: 'wrong@example.com', password: 'wrongpass' })
      ).rejects.toThrow(ApiError);
    });
  });

  // ==========================================================================
  // register
  // ==========================================================================
  describe('register()', () => {
    it('should POST registration data to /v1/auth/register', async () => {
      mockFetchResponse({
        success: true,
        data: {
          user: { id: 'new-user', email: 'new@example.com', role: 'buyer' },
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        },
      });

      await register({
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
        role: 'buyer',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('new@example.com'),
        })
      );
    });
  });

  // ==========================================================================
  // logout
  // ==========================================================================
  describe('logout()', () => {
    it('should POST to /v1/auth/logout with auth', async () => {
      mockFetchResponse({ success: true });

      await logout();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // refreshToken
  // ==========================================================================
  describe('refreshToken()', () => {
    it('should POST refresh token to /v1/auth/refresh', async () => {
      mockFetchResponse({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600,
        },
      });

      await refreshToken('old-refresh-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
        })
      );
    });
  });

  // ==========================================================================
  // getCurrentUser
  // ==========================================================================
  describe('getCurrentUser()', () => {
    it('should GET /v1/auth/me with auth', async () => {
      mockFetchResponse({
        success: true,
        data: {
          id: 'user-1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'buyer',
        },
      });

      await getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // verifySession
  // ==========================================================================
  describe('verifySession()', () => {
    it('should GET /v1/auth/session with auth', async () => {
      mockFetchResponse({
        success: true,
        data: { valid: true, expiresAt: '2025-12-24T00:00:00Z' },
      });

      const result = await verifySession();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/session',
        expect.any(Object)
      );
      expect(result.data.valid).toBe(true);
    });
  });

  // ==========================================================================
  // changePassword
  // ==========================================================================
  describe('changePassword()', () => {
    it('should POST password change to /v1/auth/change-password', async () => {
      mockFetchResponse({ success: true });

      await changePassword('oldPassword123', 'newPassword456');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/change-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            currentPassword: 'oldPassword123',
            newPassword: 'newPassword456',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // requestPasswordReset
  // ==========================================================================
  describe('requestPasswordReset()', () => {
    it('should POST email to /v1/auth/forgot-password', async () => {
      mockFetchResponse({ success: true });

      await requestPasswordReset('forgot@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'forgot@example.com' }),
        })
      );
    });
  });

  // ==========================================================================
  // resetPassword
  // ==========================================================================
  describe('resetPassword()', () => {
    it('should POST token and new password to /v1/auth/reset-password', async () => {
      mockFetchResponse({ success: true });

      await resetPassword('reset-token-xyz', 'newSecurePassword123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            token: 'reset-token-xyz',
            password: 'newSecurePassword123',
          }),
        })
      );
    });
  });
});
