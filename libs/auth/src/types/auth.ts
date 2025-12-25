/**
 * @fileoverview Enterprise RBAC System for The Bazaar
 * @module @tbk/auth/types
 * 
 * Role Hierarchy:
 * - SUPER_ADMIN: "President" level - absolute control over entire ecosystem
 * - ADMIN: Department heads with broad access (created by Super Admin)
 * - MANAGER: Team leads with specific module access
 * - STAFF: Operational staff with limited access
 * - VIEWER: Read-only access for auditors/observers
 * 
 * Marketplace Users (non-admin):
 * - VENDOR: Sellers on the platform
 * - CUSTOMER: Buyers/shoppers (renamed from 'buyer' for clarity)
 * 
 * @see apps/backend-api/src/types/auth.ts (original implementation)
 */

// ============================================
// ROLE DEFINITIONS
// ============================================

/**
 * Admin portal roles - internal staff with elevated privileges
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

/**
 * Marketplace user roles - external platform users
 */
export const USER_ROLES = {
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
} as const;

/**
 * Combined roles as array for iteration
 */
export const ALL_ROLES = [
  ...Object.values(ADMIN_ROLES),
  ...Object.values(USER_ROLES),
] as const;

/**
 * Combined roles as object for lookup
 */
export const ALL_ROLES_MAP = {
  ...ADMIN_ROLES,
  ...USER_ROLES,
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type Role = AdminRole | UserRole;

// ============================================
// PERMISSION DEFINITIONS
// ============================================

/**
 * Permission format: resource:action
 * 
 * Resources correspond to admin portal modules:
 * - users: Main-app user management
 * - vendors: Vendor portal management
 * - products: Product catalog management
 * - orders: Order management
 * - admin: Internal admin/staff management
 * - settings: System settings
 * - analytics: Reports and dashboards
 * - services: 3rd party service providers
 * - audit: Audit logs and security
 */
export const PERMISSIONS = {
  // Users & Main-App Management
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_SUSPEND: 'users:suspend',
  USERS_VERIFY: 'users:verify',

  // Vendors & Vendor Portal Management
  VENDORS_READ: 'vendors:read',
  VENDORS_CREATE: 'vendors:create',
  VENDORS_UPDATE: 'vendors:update',
  VENDORS_DELETE: 'vendors:delete',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_SUSPEND: 'vendors:suspend',
  VENDORS_VERIFY_KYC: 'vendors:verify_kyc',
  VENDORS_PAYOUTS: 'vendors:payouts',

  // Products Management
  PRODUCTS_READ: 'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_APPROVE: 'products:approve',
  PRODUCTS_FEATURE: 'products:feature',

  // Orders Management
  ORDERS_READ: 'orders:read',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_CANCEL: 'orders:cancel',
  ORDERS_REFUND: 'orders:refund',
  ORDERS_DISPUTE: 'orders:dispute',

  // Categories Management
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // Internal Admin & Staff Management (Admin Portal Only)
  ADMIN_STAFF_READ: 'admin:staff:read',
  ADMIN_STAFF_CREATE: 'admin:staff:create',
  ADMIN_STAFF_UPDATE: 'admin:staff:update',
  ADMIN_STAFF_DELETE: 'admin:staff:delete',
  ADMIN_ROLES_MANAGE: 'admin:roles:manage',
  ADMIN_PERMISSIONS_MANAGE: 'admin:permissions:manage',

  // System Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_SECURITY: 'settings:security',

  // Analytics & Reports
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_DASHBOARD: 'analytics:dashboard',

  // 3rd Party Services Management
  SERVICES_READ: 'services:read',
  SERVICES_CONFIGURE: 'services:configure',
  SERVICES_PAYMENT: 'services:payment',
  SERVICES_SHIPPING: 'services:shipping',
  SERVICES_NOTIFICATIONS: 'services:notifications',

  // Audit & Security
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  SECURITY_ALERTS: 'security:alerts',
  SECURITY_MANAGE: 'security:manage',

  // Support & Communication
  SUPPORT_READ: 'support:read',
  SUPPORT_RESPOND: 'support:respond',
  SUPPORT_ESCALATE: 'support:escalate',
  SUPPORT_CLOSE: 'support:close',

  // Financial Management
  FINANCE_READ: 'finance:read',
  FINANCE_TRANSACTIONS: 'finance:transactions',
  FINANCE_ESCROW: 'finance:escrow',
  FINANCE_REPORTS: 'finance:reports',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ============================================
// ROLE-PERMISSION MAPPINGS
// ============================================

/**
 * Default permissions for each admin role.
 * Super Admin has ALL permissions by default.
 * Other roles have specific permissions that can be customized.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ADMIN_ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_VERIFY,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.VENDORS_UPDATE,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.VENDORS_SUSPEND,
    PERMISSIONS.VENDORS_VERIFY_KYC,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_APPROVE,
    PERMISSIONS.PRODUCTS_FEATURE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_DASHBOARD,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AUDIT_READ,
  ],

  [ADMIN_ROLES.MANAGER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.VENDORS_UPDATE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_APPROVE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_RESPOND,
  ],

  [ADMIN_ROLES.STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_RESPOND,
  ],

  [ADMIN_ROLES.VIEWER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.AUDIT_READ,
  ],
};

// ============================================
// ADMIN PORTAL MODULES
// ============================================

export const ADMIN_MODULES = {
  USERS_MANAGEMENT: 'users_management',
  VENDORS_MANAGEMENT: 'vendors_management',
  PRODUCTS_MANAGEMENT: 'products_management',
  ORDERS_MANAGEMENT: 'orders_management',
  ADMIN_MANAGEMENT: 'admin_management',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  SERVICES: 'services',
  SUPPORT: 'support',
  FINANCE: 'finance',
  AUDIT: 'audit',
} as const;

export type AdminModule = (typeof ADMIN_MODULES)[keyof typeof ADMIN_MODULES];

/**
 * Module access requirements - minimum permissions needed to access each module
 */
export const MODULE_PERMISSIONS: Record<AdminModule, Permission[]> = {
  [ADMIN_MODULES.USERS_MANAGEMENT]: [PERMISSIONS.USERS_READ],
  [ADMIN_MODULES.VENDORS_MANAGEMENT]: [PERMISSIONS.VENDORS_READ],
  [ADMIN_MODULES.PRODUCTS_MANAGEMENT]: [PERMISSIONS.PRODUCTS_READ],
  [ADMIN_MODULES.ORDERS_MANAGEMENT]: [PERMISSIONS.ORDERS_READ],
  [ADMIN_MODULES.ADMIN_MANAGEMENT]: [PERMISSIONS.ADMIN_STAFF_READ],
  [ADMIN_MODULES.SETTINGS]: [PERMISSIONS.SETTINGS_READ],
  [ADMIN_MODULES.ANALYTICS]: [PERMISSIONS.ANALYTICS_READ],
  [ADMIN_MODULES.SERVICES]: [PERMISSIONS.SERVICES_READ],
  [ADMIN_MODULES.SUPPORT]: [PERMISSIONS.SUPPORT_READ],
  [ADMIN_MODULES.FINANCE]: [PERMISSIONS.FINANCE_READ],
  [ADMIN_MODULES.AUDIT]: [PERMISSIONS.AUDIT_READ],
};

// ============================================
// AUTH INTERFACES
// ============================================

/**
 * JWT payload structure for token verification
 */
export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  permissions?: Permission[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Authenticated user object attached to requests/context
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * User profile from database (api.profiles table)
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: Role;
  is_active: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Vendor profile from database (api.vendors table)
 */
export interface VendorProfile {
  id: string;
  profile_id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  business_type: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  rating_average: number;
  rating_count: number;
  is_verified: boolean;
  is_featured: boolean;
  kyc_status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise';
  created_at: string;
  updated_at: string;
}

/**
 * Admin staff profile from database (api.admin_staff table)
 */
export interface AdminStaffProfile {
  id: string;
  profile_id: string;
  role: AdminRole;
  permissions: Permission[];
  department: string | null;
  is_active: boolean;
  created_by: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// AUTH STATE INTERFACES
// ============================================

/**
 * Complete auth state for React context
 */
export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: UserProfile | null;
  vendorProfile: VendorProfile | null;
  adminProfile: AdminStaffProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVendor: boolean;
  error: AuthError | null;
}

/**
 * Supabase user object (simplified)
 */
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: Role;
  };
}

/**
 * Supabase session object (simplified)
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

/**
 * Auth error object
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

// ============================================
// AUTH ACTION INTERFACES
// ============================================

/**
 * Sign up data for new user registration
 */
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role?: 'customer' | 'vendor';
  phone?: string;
}

/**
 * Sign in data for email/password login
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * OAuth provider options
 */
export type OAuthProvider = 'google' | 'apple' | 'facebook';

/**
 * Password reset request data
 */
export interface PasswordResetData {
  email: string;
  redirectTo?: string;
}

/**
 * Password update data
 */
export interface PasswordUpdateData {
  currentPassword?: string;
  newPassword: string;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: Role): role is AdminRole {
  return Object.values(ADMIN_ROLES).includes(role as AdminRole);
}

/**
 * Check if a role is a user role
 */
export function isUserRole(role: Role): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: AuthenticatedUser | null,
  permission: Permission
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: AuthenticatedUser | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: AuthenticatedUser | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if user can access a specific admin module
 * @param moduleOrUser - Either an AdminModule string (when using permissions array) or AuthenticatedUser
 * @param permissionsOrModule - Either Permission[] (when first arg is module) or AdminModule (when first arg is user)
 */
export function canAccessModule(
  moduleOrUser: AdminModule | AuthenticatedUser | null,
  permissionsOrModule: Permission[] | AdminModule
): boolean {
  // Overload 1: canAccessModule(module, permissions[])
  if (typeof moduleOrUser === 'string' && Array.isArray(permissionsOrModule)) {
    const module = moduleOrUser as AdminModule;
    const userPermissions = permissionsOrModule as Permission[];
    const requiredPermissions = MODULE_PERMISSIONS[module];
    if (!requiredPermissions) return false;
    return requiredPermissions.some(p => userPermissions.includes(p));
  }
  
  // Overload 2: canAccessModule(user, module)
  const user = moduleOrUser as AuthenticatedUser | null;
  const module = permissionsOrModule as AdminModule;
  if (!user) return false;
  if (!user.isAdmin) return false;
  if (user.isSuperAdmin) return true;
  const requiredPermissions = MODULE_PERMISSIONS[module];
  return hasAnyPermission(user, requiredPermissions);
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  if (isAdminRole(role)) {
    return ROLE_PERMISSIONS[role] || [];
  }
  return [];
}
