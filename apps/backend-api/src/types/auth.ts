/**
 * The Bazaar - Enterprise RBAC System
 * 
 * Role Hierarchy:
 * - SUPER_ADMIN: "President" level - absolute control over entire ecosystem
 * - ADMIN: Department heads with broad access (created by Super Admin)
 * - MANAGER: Team leads with specific module access
 * - STAFF: Operational staff with limited access
 * - VIEWER: Read-only access for auditors/observers
 * 
 * For marketplace users (non-admin):
 * - VENDOR: Sellers on the platform
 * - BUYER: Customers/shoppers
 */

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

export const USER_ROLES = {
  VENDOR: 'vendor',
  BUYER: 'buyer',
} as const;

export const ALL_ROLES = {
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
  // SUPER ADMIN - "President" level - has EVERYTHING
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  // ADMIN - Department heads with broad access
  [ADMIN_ROLES.ADMIN]: [
    // Users
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_VERIFY,
    // Vendors
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.VENDORS_UPDATE,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.VENDORS_SUSPEND,
    PERMISSIONS.VENDORS_VERIFY_KYC,
    // Products
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_APPROVE,
    PERMISSIONS.PRODUCTS_FEATURE,
    // Orders
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    // Categories
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    // Analytics
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_DASHBOARD,
    // Support
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_RESPOND,
    PERMISSIONS.SUPPORT_ESCALATE,
    // Settings (read only)
    PERMISSIONS.SETTINGS_READ,
    // Audit (read only)
    PERMISSIONS.AUDIT_READ,
  ],

  // MANAGER - Team leads with specific module access
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

  // STAFF - Operational staff with limited access
  [ADMIN_ROLES.STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_RESPOND,
  ],

  // VIEWER - Read-only access for auditors
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
// AUTH TYPES
// ============================================

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: Role;
  permissions?: Permission[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

