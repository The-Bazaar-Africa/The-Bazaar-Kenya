/**
 * The Bazaar API v1 - Users Endpoint
 * ===================================
 * 
 * API functions for user profile operations.
 * Maps to: apps/backend-api/src/routes/v1/users.ts
 */

import { get, patch, del, post } from '../http/client';
import type {
  ApiSuccessResponse,
  UserProfile,
  Address,
} from '../generated';

// =============================================================================
// PROFILE ENDPOINTS
// =============================================================================

/**
 * Get current user's profile.
 * Requires authentication.
 * 
 * @returns User profile
 */
export function getProfile() {
  return get<ApiSuccessResponse<UserProfile>>('/v1/users/profile', {
    requireAuth: true,
  });
}

/**
 * Update current user's profile.
 * Requires authentication.
 * 
 * @param data - Profile update data
 * @returns Updated profile
 */
export function updateProfile(data: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  return patch<ApiSuccessResponse<UserProfile>>('/v1/users/profile', data, {
    requireAuth: true,
  });
}

/**
 * Delete current user's account.
 * Requires authentication.
 * 
 * @returns Success response
 */
export function deleteAccount() {
  return del<ApiSuccessResponse<void>>('/v1/users/profile', {
    requireAuth: true,
  });
}

// =============================================================================
// ADDRESS ENDPOINTS
// =============================================================================

/**
 * Get current user's addresses.
 * Requires authentication.
 * 
 * @returns List of addresses
 */
export function getAddresses() {
  return get<ApiSuccessResponse<Address[]>>('/v1/users/addresses', {
    requireAuth: true,
  });
}

/**
 * Add a new address.
 * Requires authentication.
 * 
 * @param address - Address data
 * @returns Created address
 */
export function addAddress(address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) {
  return post<ApiSuccessResponse<Address>>('/v1/users/addresses', address, {
    requireAuth: true,
  });
}

/**
 * Update an address.
 * Requires authentication.
 * 
 * @param addressId - Address ID
 * @param data - Address update data
 * @returns Updated address
 */
export function updateAddress(
  addressId: string,
  data: Partial<Omit<Address, 'id' | 'createdAt' | 'updatedAt'>>
) {
  return patch<ApiSuccessResponse<Address>>(`/v1/users/addresses/${addressId}`, data, {
    requireAuth: true,
  });
}

/**
 * Delete an address.
 * Requires authentication.
 * 
 * @param addressId - Address ID
 * @returns Success response
 */
export function deleteAddress(addressId: string) {
  return del<ApiSuccessResponse<void>>(`/v1/users/addresses/${addressId}`, {
    requireAuth: true,
  });
}

/**
 * Set default shipping address.
 * Requires authentication.
 * 
 * @param addressId - Address ID to set as default
 * @returns Success response
 */
export function setDefaultShippingAddress(addressId: string) {
  return patch<ApiSuccessResponse<void>>(`/v1/users/addresses/${addressId}/default-shipping`, undefined, {
    requireAuth: true,
  });
}

/**
 * Set default billing address.
 * Requires authentication.
 * 
 * @param addressId - Address ID to set as default
 * @returns Success response
 */
export function setDefaultBillingAddress(addressId: string) {
  return patch<ApiSuccessResponse<void>>(`/v1/users/addresses/${addressId}/default-billing`, undefined, {
    requireAuth: true,
  });
}
