/**
 * The Bazaar API v1 - Auth Endpoint
 * ==================================
 * 
 * API functions for authentication operations.
 * Maps to: apps/backend-api/src/routes/v1/auth.ts
 */

import { get, post } from '../http/client';
import type {
  ApiSuccessResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserProfile,
} from '../generated';

// =============================================================================
// PUBLIC ENDPOINTS
// =============================================================================

/**
 * Login user with email and password.
 * Works for all user types (marketplace & admin).
 * 
 * @param credentials - Login credentials
 * @returns User data and tokens
 */
export function login(credentials: LoginRequest) {
  return post<ApiSuccessResponse<LoginResponse>>('/v1/auth/login', credentials);
}

/**
 * Register a new marketplace user.
 * Note: This is for marketplace users only, not admin portal.
 * 
 * @param data - Registration data
 * @returns Created user and tokens
 */
export function register(data: RegisterRequest) {
  return post<ApiSuccessResponse<RegisterResponse>>('/v1/auth/register', data);
}

/**
 * Logout current session.
 * 
 * @returns Success response
 */
export function logout() {
  return post<ApiSuccessResponse<void>>('/v1/auth/logout', undefined, {
    requireAuth: true,
  });
}

/**
 * Refresh access token using refresh token.
 * 
 * @param refreshToken - The refresh token
 * @returns New tokens
 */
export function refreshToken(refreshToken: string) {
  return post<ApiSuccessResponse<RefreshTokenResponse>>('/v1/auth/refresh', {
    refreshToken,
  } as RefreshTokenRequest);
}

// =============================================================================
// AUTHENTICATED ENDPOINTS
// =============================================================================

/**
 * Get current authenticated user's profile.
 * 
 * @returns User profile
 */
export function getCurrentUser() {
  return get<ApiSuccessResponse<UserProfile>>('/v1/auth/me', {
    requireAuth: true,
  });
}

/**
 * Verify current session is valid.
 * 
 * @returns Session validity info
 */
export function verifySession() {
  return get<ApiSuccessResponse<{ valid: boolean; expiresAt: string }>>('/v1/auth/session', {
    requireAuth: true,
  });
}

/**
 * Change password for authenticated user.
 * 
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success response
 */
export function changePassword(currentPassword: string, newPassword: string) {
  return post<ApiSuccessResponse<void>>('/v1/auth/change-password', {
    currentPassword,
    newPassword,
  }, {
    requireAuth: true,
  });
}

// =============================================================================
// PASSWORD RESET ENDPOINTS
// =============================================================================

/**
 * Request password reset email.
 * 
 * @param email - User's email address
 * @returns Success response
 */
export function requestPasswordReset(email: string) {
  return post<ApiSuccessResponse<void>>('/v1/auth/forgot-password', { email });
}

/**
 * Reset password using reset token.
 * 
 * @param token - Password reset token
 * @param password - New password
 * @returns Success response
 */
export function resetPassword(token: string, password: string) {
  return post<ApiSuccessResponse<void>>('/v1/auth/reset-password', { token, password });
}

// =============================================================================
// EMAIL VERIFICATION ENDPOINTS
// =============================================================================

/**
 * Verify email using verification token.
 * 
 * @param token - Email verification token
 * @returns Success response
 */
export function verifyEmail(token: string) {
  return post<ApiSuccessResponse<void>>('/v1/auth/verify-email', { token });
}

/**
 * Resend verification email.
 * 
 * @param email - User's email address
 * @returns Success response
 */
export function resendVerification(email: string) {
  return post<ApiSuccessResponse<void>>('/v1/auth/resend-verification', { email });
}
