/**
 * The Bazaar API v1 - Admin Users Endpoint
 * =========================================
 * 
 * Admin-specific API functions for user management.
 * Enhanced with account management, activity tracking, and bulk operations.
 * 
 * Maps to: apps/backend-api/src/routes/v1/admin/users.ts
 */

import { get, post, patch, del } from '../../http/client';
import type {
  ApiSuccessResponse,
  User,
  UserRole,
  PaginationMeta,
  Address,
} from '../../generated';

// =============================================================================
// ADMIN-SPECIFIC TYPES
// =============================================================================

/**
 * User account status
 */
export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

/**
 * Extended admin filters for users
 */
export interface AdminUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  email?: string;
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'orderCount';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
  hasOrders?: boolean;
}

/**
 * Admin user list response with additional metadata
 */
export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: PaginationMeta;
  summary: UserSummary;
}

/**
 * Extended user type with admin-only fields
 */
export interface AdminUser extends User {
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  loginCount: number;
  orderCount: number;
  totalSpent: number;
  addresses: Address[];
  flags: UserFlag[];
  metadata?: Record<string, unknown>;
}

/**
 * User flags for marking special conditions
 */
export interface UserFlag {
  type: 'fraud_risk' | 'vip' | 'support_priority' | 'chargebacks' | 'custom';
  label: string;
  severity: 'info' | 'warning' | 'critical';
  addedAt: string;
  addedBy: string;
  note?: string;
}

/**
 * Summary statistics for admin user listing
 */
export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  pendingVerification: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'order_placed' | 'review_posted' | 'support_ticket' | 'address_added' | 'payment_method_added';
  description: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * User update request
 */
export interface AdminUpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

/**
 * Bulk action request
 */
export interface BulkUserActionRequest {
  userIds: string[];
  action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'verify_email' | 'send_verification' | 'delete';
  reason?: string;
}

/**
 * Bulk action response
 */
export interface BulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    userId: string;
    error: string;
  }>;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get paginated list of users with admin filtering
 */
export function adminGetUsers(filters?: AdminUserFilters) {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.email) params.set('email', filters.email);
    if (filters.role && filters.role !== 'all') params.set('role', filters.role);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.createdAfter) params.set('createdAfter', filters.createdAfter);
    if (filters.createdBefore) params.set('createdBefore', filters.createdBefore);
    if (filters.hasOrders !== undefined) params.set('hasOrders', filters.hasOrders.toString());
  }

  const query = params.toString();
  return get<ApiSuccessResponse<AdminUserListResponse>>(
    `/v1/admin/users${query ? `?${query}` : ''}`
  );
}

/**
 * Get a single user by ID with full admin details
 */
export function adminGetUser(id: string) {
  return get<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}`);
}

/**
 * Get user by email
 */
export function adminGetUserByEmail(email: string) {
  return get<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/email/${encodeURIComponent(email)}`);
}

/**
 * Update user details
 */
export function adminUpdateUser(id: string, data: AdminUpdateUserRequest) {
  return patch<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}`, data);
}

/**
 * Update user status
 */
export function adminUpdateUserStatus(
  id: string,
  status: UserStatus,
  reason?: string
) {
  return patch<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/status`, {
    status,
    reason,
  });
}

/**
 * Suspend a user account
 */
export function adminSuspendUser(id: string, reason: string, duration?: number) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/suspend`, {
    reason,
    duration, // hours, undefined = indefinite
  });
}

/**
 * Unsuspend a user account
 */
export function adminUnsuspendUser(id: string) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/unsuspend`, {});
}

/**
 * Ban a user account
 */
export function adminBanUser(id: string, reason: string) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/ban`, {
    reason,
  });
}

/**
 * Unban a user account
 */
export function adminUnbanUser(id: string) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/unban`, {});
}

/**
 * Delete a user account (soft delete)
 */
export function adminDeleteUser(id: string, hardDelete = false) {
  return del<ApiSuccessResponse<void>>(
    `/v1/admin/users/${id}${hardDelete ? '?hard=true' : ''}`
  );
}

/**
 * Get user activity log
 */
export function adminGetUserActivity(
  id: string,
  options?: {
    page?: number;
    limit?: number;
    type?: UserActivity['type'];
    from?: string;
    to?: string;
  }
) {
  const params = new URLSearchParams();

  if (options) {
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.type) params.set('type', options.type);
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
  }

  const query = params.toString();
  return get<ApiSuccessResponse<{ activities: UserActivity[]; pagination: PaginationMeta }>>(
    `/v1/admin/users/${id}/activity${query ? `?${query}` : ''}`
  );
}

/**
 * Get user orders
 */
export function adminGetUserOrders(
  id: string,
  options?: {
    page?: number;
    limit?: number;
  }
) {
  const params = new URLSearchParams();

  if (options) {
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
  }

  const query = params.toString();
  return get<ApiSuccessResponse<{ orders: unknown[]; pagination: PaginationMeta }>>(
    `/v1/admin/users/${id}/orders${query ? `?${query}` : ''}`
  );
}

/**
 * Send password reset email
 */
export function adminSendPasswordReset(id: string) {
  return post<ApiSuccessResponse<{ sent: boolean }>>(`/v1/admin/users/${id}/password-reset`, {});
}

/**
 * Force email verification
 */
export function adminVerifyEmail(id: string) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/verify-email`, {});
}

/**
 * Send email verification link
 */
export function adminSendVerificationEmail(id: string) {
  return post<ApiSuccessResponse<{ sent: boolean }>>(`/v1/admin/users/${id}/send-verification`, {});
}

/**
 * Add a flag to user
 */
export function adminAddUserFlag(id: string, flag: Omit<UserFlag, 'addedAt' | 'addedBy'>) {
  return post<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/flags`, flag);
}

/**
 * Remove a flag from user
 */
export function adminRemoveUserFlag(id: string, flagType: UserFlag['type']) {
  return del<ApiSuccessResponse<AdminUser>>(`/v1/admin/users/${id}/flags/${flagType}`);
}

/**
 * Bulk action on multiple users
 */
export function adminBulkUserAction(request: BulkUserActionRequest) {
  return post<ApiSuccessResponse<BulkActionResponse>>('/v1/admin/users/bulk-action', request);
}

/**
 * Export users to CSV/Excel
 */
export function adminExportUsers(filters?: AdminUserFilters, format: 'csv' | 'xlsx' = 'csv') {
  const params = new URLSearchParams();
  params.set('format', format);

  if (filters) {
    if (filters.search) params.set('search', filters.search);
    if (filters.role && filters.role !== 'all') params.set('role', filters.role);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.createdAfter) params.set('createdAfter', filters.createdAfter);
    if (filters.createdBefore) params.set('createdBefore', filters.createdBefore);
  }

  return get<Blob>(`/v1/admin/users/export?${params.toString()}`);
}

/**
 * Impersonate user (get auth token for user)
 * SECURITY: Requires super_admin role and audit logging
 */
export function adminImpersonateUser(id: string) {
  return post<ApiSuccessResponse<{ token: string; expiresAt: string }>>(
    `/v1/admin/users/${id}/impersonate`,
    {}
  );
}

/**
 * Get user statistics summary
 */
export function adminGetUserStats() {
  return get<ApiSuccessResponse<UserSummary>>('/v1/admin/users/stats');
}
