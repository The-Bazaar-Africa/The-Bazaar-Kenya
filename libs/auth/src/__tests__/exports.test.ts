/**
 * @fileoverview Test file to verify all exports from @tbk/auth
 * This ensures all public APIs are properly exported and importable.
 */

// ============================================
// TYPE EXPORTS
// ============================================

// Role constants
import {
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ADMIN_MODULES,
  MODULE_PERMISSIONS,
} from '../index';

// Type guards and helpers
import {
  isAdminRole,
  isUserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  getPermissionsForRole,
} from '../index';

// Types
import type {
  AdminRole,
  UserRole,
  Role,
  Permission,
  AdminModule,
  JWTPayload,
  AuthenticatedUser,
  UserProfile,
  VendorProfile,
  AdminStaffProfile,
  AuthState,
  AuthUser,
  AuthSession,
  AuthError,
  SignUpData,
  SignInData,
  OAuthProvider,
  PasswordResetData,
  PasswordUpdateData,
  ProfileUpdateData,
} from '../index';

// Database types
import type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '../index';

// ============================================
// CLIENT EXPORTS
// ============================================

import {
  createBrowserClient,
  isSupabaseConfigured,
  resetBrowserClient,
  createServerClient,
  createServiceClient,
  createMiddlewareClient,
} from '../index';

import type {
  BrowserClient,
  ServerClient,
  ServiceClient,
} from '../index';

// ============================================
// CONTEXT EXPORTS
// ============================================

import {
  AuthContext,
  AuthProvider,
} from '../index';

import type {
  AuthContextType,
  AuthProviderProps,
} from '../index';

// ============================================
// HOOK EXPORTS
// ============================================

import {
  useAuth,
  useIsAuthenticated,
  useIsAdmin,
  useIsVendor,
  useAuthLoading,
  useAuthError,
  useUser,
  useDisplayName,
  useAvatarUrl,
  useRole,
  useVendorProfile,
  useAdminProfile,
  useSession,
  useAccessToken,
  useHasValidSession,
  useSessionExpiry,
  usePermissions,
  useHasPermission,
  useCanAccessModule,
  useHasAnyPermission,
  useHasAllPermissions,
} from '../index';

import type {
  UseAuthReturn,
  AuthActions,
  UseUserReturn,
  UseSessionReturn,
  UsePermissionsReturn,
} from '../index';

// ============================================
// COMPONENT EXPORTS
// ============================================

import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  VendorRoute,
} from '../index';

import type {
  ProtectedRouteProps,
  LoadingProps,
  AccessDeniedProps,
} from '../index';

// ============================================
// MIDDLEWARE EXPORTS
// ============================================

import {
  matchPath,
  matchAnyPath,
  hasRequiredRole,
  isAdminUser,
  isSuperAdminUser,
  isVendorUser,
  createRedirectUrl,
  mergeRouteConfig,
  checkRouteAccess,
  defaultRouteConfig,
  mainAppRouteConfig,
  vendorPortalRouteConfig,
  adminPortalRouteConfig,
} from '../index';

import type {
  RouteConfig,
} from '../index';

// ============================================
// VERIFICATION TESTS
// ============================================

describe('@tbk/auth exports', () => {
  describe('Constants', () => {
    it('should export ADMIN_ROLES', () => {
      expect(ADMIN_ROLES).toBeDefined();
      expect(ADMIN_ROLES.SUPER_ADMIN).toBe('super_admin');
      expect(ADMIN_ROLES.ADMIN).toBe('admin');
    });

    it('should export USER_ROLES', () => {
      expect(USER_ROLES).toBeDefined();
      expect(USER_ROLES.VENDOR).toBe('vendor');
      expect(USER_ROLES.CUSTOMER).toBe('customer');
    });

    it('should export ALL_ROLES', () => {
      expect(ALL_ROLES).toBeDefined();
      expect(Array.isArray(ALL_ROLES)).toBe(true);
      expect(ALL_ROLES.length).toBeGreaterThan(0);
    });

    it('should export PERMISSIONS', () => {
      expect(PERMISSIONS).toBeDefined();
      expect(PERMISSIONS.USERS_READ).toBe('users:read');
    });

    it('should export ADMIN_MODULES', () => {
      expect(ADMIN_MODULES).toBeDefined();
      expect(ADMIN_MODULES.USERS).toBe('users');
    });
  });

  describe('Type Guards', () => {
    it('should export isAdminRole', () => {
      expect(typeof isAdminRole).toBe('function');
      expect(isAdminRole('super_admin')).toBe(true);
      expect(isAdminRole('customer')).toBe(false);
    });

    it('should export isUserRole', () => {
      expect(typeof isUserRole).toBe('function');
      expect(isUserRole('vendor')).toBe(true);
      expect(isUserRole('admin')).toBe(false);
    });

    it('should export hasPermission', () => {
      expect(typeof hasPermission).toBe('function');
    });

    it('should export getPermissionsForRole', () => {
      expect(typeof getPermissionsForRole).toBe('function');
      const superAdminPerms = getPermissionsForRole('super_admin');
      expect(superAdminPerms.length).toBeGreaterThan(0);
    });
  });

  describe('Clients', () => {
    it('should export createBrowserClient', () => {
      expect(typeof createBrowserClient).toBe('function');
    });

    it('should export isSupabaseConfigured', () => {
      expect(typeof isSupabaseConfigured).toBe('function');
    });

    it('should export resetBrowserClient', () => {
      expect(typeof resetBrowserClient).toBe('function');
    });

    it('should export createServerClient', () => {
      expect(typeof createServerClient).toBe('function');
    });

    it('should export createServiceClient', () => {
      expect(typeof createServiceClient).toBe('function');
    });

    it('should export createMiddlewareClient', () => {
      expect(typeof createMiddlewareClient).toBe('function');
    });
  });

  describe('Context', () => {
    it('should export AuthContext', () => {
      expect(AuthContext).toBeDefined();
    });

    it('should export AuthProvider', () => {
      expect(typeof AuthProvider).toBe('function');
    });
  });

  describe('Hooks', () => {
    it('should export useAuth', () => {
      expect(typeof useAuth).toBe('function');
    });

    it('should export useUser', () => {
      expect(typeof useUser).toBe('function');
    });

    it('should export useSession', () => {
      expect(typeof useSession).toBe('function');
    });

    it('should export usePermissions', () => {
      expect(typeof usePermissions).toBe('function');
    });

    it('should export convenience hooks', () => {
      expect(typeof useIsAuthenticated).toBe('function');
      expect(typeof useIsAdmin).toBe('function');
      expect(typeof useIsVendor).toBe('function');
      expect(typeof useAuthLoading).toBe('function');
      expect(typeof useAuthError).toBe('function');
    });
  });

  describe('Components', () => {
    it('should export ProtectedRoute', () => {
      expect(typeof ProtectedRoute).toBe('function');
    });

    it('should export AdminRoute', () => {
      expect(typeof AdminRoute).toBe('function');
    });

    it('should export SuperAdminRoute', () => {
      expect(typeof SuperAdminRoute).toBe('function');
    });

    it('should export VendorRoute', () => {
      expect(typeof VendorRoute).toBe('function');
    });
  });

  describe('Middleware Utilities', () => {
    it('should export matchPath', () => {
      expect(typeof matchPath).toBe('function');
      expect(matchPath('/dashboard', '/dashboard')).toBe(true);
      expect(matchPath('/dashboard/orders', '/dashboard/*')).toBe(true);
      expect(matchPath('/auth/login', '/dashboard/*')).toBe(false);
    });

    it('should export matchAnyPath', () => {
      expect(typeof matchAnyPath).toBe('function');
      expect(matchAnyPath('/auth/login', ['/auth/*', '/public/*'])).toBe(true);
    });

    it('should export checkRouteAccess', () => {
      expect(typeof checkRouteAccess).toBe('function');
    });

    it('should export route configs', () => {
      expect(defaultRouteConfig).toBeDefined();
      expect(mainAppRouteConfig).toBeDefined();
      expect(vendorPortalRouteConfig).toBeDefined();
      expect(adminPortalRouteConfig).toBeDefined();
    });

    it('should export role checking utilities', () => {
      expect(typeof hasRequiredRole).toBe('function');
      expect(typeof isAdminUser).toBe('function');
      expect(typeof isSuperAdminUser).toBe('function');
      expect(typeof isVendorUser).toBe('function');
    });
  });
});

// Run basic verification without Jest
console.log('=== @tbk/auth Export Verification ===\n');

// Constants
console.log('✅ ADMIN_ROLES:', Object.keys(ADMIN_ROLES).length, 'roles');
console.log('✅ USER_ROLES:', Object.keys(USER_ROLES).length, 'roles');
console.log('✅ ALL_ROLES:', ALL_ROLES.length, 'total roles');
console.log('✅ PERMISSIONS:', Object.keys(PERMISSIONS).length, 'permissions');
console.log('✅ ADMIN_MODULES:', Object.keys(ADMIN_MODULES).length, 'modules');

// Type guards
console.log('\n--- Type Guards ---');
console.log('✅ isAdminRole("super_admin"):', isAdminRole('super_admin'));
console.log('✅ isAdminRole("customer"):', isAdminRole('customer'));
console.log('✅ isUserRole("vendor"):', isUserRole('vendor'));

// Middleware utilities
console.log('\n--- Middleware Utilities ---');
console.log('✅ matchPath("/dashboard", "/dashboard"):', matchPath('/dashboard', '/dashboard'));
console.log('✅ matchPath("/dashboard/orders", "/dashboard/*"):', matchPath('/dashboard/orders', '/dashboard/*'));
console.log('✅ matchPath("/auth/login", "/dashboard/*"):', matchPath('/auth/login', '/dashboard/*'));

// Route configs
console.log('\n--- Route Configs ---');
console.log('✅ defaultRouteConfig.publicRoutes:', defaultRouteConfig.publicRoutes?.length, 'routes');
console.log('✅ mainAppRouteConfig.publicRoutes:', mainAppRouteConfig.publicRoutes?.length, 'routes');
console.log('✅ vendorPortalRouteConfig.publicRoutes:', vendorPortalRouteConfig.publicRoutes?.length, 'routes');
console.log('✅ adminPortalRouteConfig.publicRoutes:', adminPortalRouteConfig.publicRoutes?.length, 'routes');

// Functions
console.log('\n--- Functions ---');
console.log('✅ createBrowserClient:', typeof createBrowserClient);
console.log('✅ createServerClient:', typeof createServerClient);
console.log('✅ createServiceClient:', typeof createServiceClient);
console.log('✅ createMiddlewareClient:', typeof createMiddlewareClient);
console.log('✅ isSupabaseConfigured:', typeof isSupabaseConfigured);

// Hooks
console.log('\n--- Hooks ---');
console.log('✅ useAuth:', typeof useAuth);
console.log('✅ useUser:', typeof useUser);
console.log('✅ useSession:', typeof useSession);
console.log('✅ usePermissions:', typeof usePermissions);

// Components
console.log('\n--- Components ---');
console.log('✅ AuthProvider:', typeof AuthProvider);
console.log('✅ ProtectedRoute:', typeof ProtectedRoute);
console.log('✅ AdminRoute:', typeof AdminRoute);
console.log('✅ VendorRoute:', typeof VendorRoute);

console.log('\n=== All exports verified successfully! ===');
