/**
 * @fileoverview Verification script for @tbk/auth exports
 * Run with: pnpm exec tsx src/__tests__/verify-exports.ts
 */

// ============================================
// IMPORT ALL EXPORTS
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

// Clients
import {
  createBrowserClient,
  isSupabaseConfigured,
  resetBrowserClient,
  createServerClient,
  createServiceClient,
  createMiddlewareClient,
} from '../index';

// Context
import {
  AuthContext,
  AuthProvider,
} from '../index';

// Hooks
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

// Components
import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  VendorRoute,
} from '../index';

// Middleware utilities
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

// ============================================
// VERIFICATION
// ============================================

let passed = 0;
let failed = 0;

function test(name: string, condition: boolean) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('@tbk/auth Export Verification');
console.log('========================================\n');

// Constants
console.log('--- Constants ---');
test('ADMIN_ROLES exported', typeof ADMIN_ROLES === 'object');
test('ADMIN_ROLES.SUPER_ADMIN = "super_admin"', ADMIN_ROLES.SUPER_ADMIN === 'super_admin');
test('ADMIN_ROLES.ADMIN = "admin"', ADMIN_ROLES.ADMIN === 'admin');
test('ADMIN_ROLES.MANAGER = "manager"', ADMIN_ROLES.MANAGER === 'manager');
test('ADMIN_ROLES.STAFF = "staff"', ADMIN_ROLES.STAFF === 'staff');
test('ADMIN_ROLES.VIEWER = "viewer"', ADMIN_ROLES.VIEWER === 'viewer');

test('USER_ROLES exported', typeof USER_ROLES === 'object');
test('USER_ROLES.VENDOR = "vendor"', USER_ROLES.VENDOR === 'vendor');
test('USER_ROLES.CUSTOMER = "customer"', USER_ROLES.CUSTOMER === 'customer');

test('ALL_ROLES is array with 7 roles', Array.isArray(ALL_ROLES) && ALL_ROLES.length === 7);
test('PERMISSIONS exported', typeof PERMISSIONS === 'object');
test('PERMISSIONS has 50+ entries', Object.keys(PERMISSIONS).length >= 50);
test('ROLE_PERMISSIONS exported', typeof ROLE_PERMISSIONS === 'object');
test('ADMIN_MODULES exported', typeof ADMIN_MODULES === 'object');
test('MODULE_PERMISSIONS exported', typeof MODULE_PERMISSIONS === 'object');

// Type guards
console.log('\n--- Type Guards ---');
test('isAdminRole is function', typeof isAdminRole === 'function');
test('isAdminRole("super_admin") = true', isAdminRole('super_admin') === true);
test('isAdminRole("admin") = true', isAdminRole('admin') === true);
test('isAdminRole("customer") = false', isAdminRole('customer') === false);
test('isAdminRole("vendor") = false', isAdminRole('vendor') === false);

test('isUserRole is function', typeof isUserRole === 'function');
test('isUserRole("vendor") = true', isUserRole('vendor') === true);
test('isUserRole("customer") = true', isUserRole('customer') === true);
test('isUserRole("admin") = false', isUserRole('admin') === false);

test('hasPermission is function', typeof hasPermission === 'function');
test('hasAnyPermission is function', typeof hasAnyPermission === 'function');
test('hasAllPermissions is function', typeof hasAllPermissions === 'function');
test('canAccessModule is function', typeof canAccessModule === 'function');
test('getPermissionsForRole is function', typeof getPermissionsForRole === 'function');

// Test getPermissionsForRole
const superAdminPerms = getPermissionsForRole('super_admin');
test('super_admin has all permissions', superAdminPerms.length === Object.keys(PERMISSIONS).length);

const customerPerms = getPermissionsForRole('customer');
test('customer has limited permissions', customerPerms.length < superAdminPerms.length);

// Clients
console.log('\n--- Clients ---');
test('createBrowserClient is function', typeof createBrowserClient === 'function');
test('isSupabaseConfigured is function', typeof isSupabaseConfigured === 'function');
test('resetBrowserClient is function', typeof resetBrowserClient === 'function');
test('createServerClient is function', typeof createServerClient === 'function');
test('createServiceClient is function', typeof createServiceClient === 'function');
test('createMiddlewareClient is function', typeof createMiddlewareClient === 'function');

// Context
console.log('\n--- Context ---');
test('AuthContext exported', AuthContext !== undefined);
test('AuthProvider is function', typeof AuthProvider === 'function');

// Hooks
console.log('\n--- Hooks ---');
test('useAuth is function', typeof useAuth === 'function');
test('useIsAuthenticated is function', typeof useIsAuthenticated === 'function');
test('useIsAdmin is function', typeof useIsAdmin === 'function');
test('useIsVendor is function', typeof useIsVendor === 'function');
test('useAuthLoading is function', typeof useAuthLoading === 'function');
test('useAuthError is function', typeof useAuthError === 'function');
test('useUser is function', typeof useUser === 'function');
test('useDisplayName is function', typeof useDisplayName === 'function');
test('useAvatarUrl is function', typeof useAvatarUrl === 'function');
test('useRole is function', typeof useRole === 'function');
test('useVendorProfile is function', typeof useVendorProfile === 'function');
test('useAdminProfile is function', typeof useAdminProfile === 'function');
test('useSession is function', typeof useSession === 'function');
test('useAccessToken is function', typeof useAccessToken === 'function');
test('useHasValidSession is function', typeof useHasValidSession === 'function');
test('useSessionExpiry is function', typeof useSessionExpiry === 'function');
test('usePermissions is function', typeof usePermissions === 'function');
test('useHasPermission is function', typeof useHasPermission === 'function');
test('useCanAccessModule is function', typeof useCanAccessModule === 'function');
test('useHasAnyPermission is function', typeof useHasAnyPermission === 'function');
test('useHasAllPermissions is function', typeof useHasAllPermissions === 'function');

// Components
console.log('\n--- Components ---');
test('ProtectedRoute is function', typeof ProtectedRoute === 'function');
test('AdminRoute is function', typeof AdminRoute === 'function');
test('SuperAdminRoute is function', typeof SuperAdminRoute === 'function');
test('VendorRoute is function', typeof VendorRoute === 'function');

// Middleware utilities
console.log('\n--- Middleware Utilities ---');
test('matchPath is function', typeof matchPath === 'function');
test('matchPath("/dashboard", "/dashboard") = true', matchPath('/dashboard', '/dashboard') === true);
test('matchPath("/dashboard/orders", "/dashboard/*") = true', matchPath('/dashboard/orders', '/dashboard/*') === true);
test('matchPath("/auth/login", "/dashboard/*") = false', matchPath('/auth/login', '/dashboard/*') === false);
test('matchPath("/products/123", "/products/*") = true', matchPath('/products/123', '/products/*') === true);

test('matchAnyPath is function', typeof matchAnyPath === 'function');
test('matchAnyPath("/auth/login", ["/auth/*"]) = true', matchAnyPath('/auth/login', ['/auth/*']) === true);
test('matchAnyPath("/dashboard", ["/auth/*"]) = false', matchAnyPath('/dashboard', ['/auth/*']) === false);

test('hasRequiredRole is function', typeof hasRequiredRole === 'function');
test('isAdminUser is function', typeof isAdminUser === 'function');
test('isSuperAdminUser is function', typeof isSuperAdminUser === 'function');
test('isVendorUser is function', typeof isVendorUser === 'function');
test('createRedirectUrl is function', typeof createRedirectUrl === 'function');
test('mergeRouteConfig is function', typeof mergeRouteConfig === 'function');
test('checkRouteAccess is function', typeof checkRouteAccess === 'function');

// Route configs
console.log('\n--- Route Configs ---');
test('defaultRouteConfig exported', defaultRouteConfig !== undefined);
test('defaultRouteConfig.publicRoutes exists', Array.isArray(defaultRouteConfig.publicRoutes));
test('mainAppRouteConfig exported', mainAppRouteConfig !== undefined);
test('vendorPortalRouteConfig exported', vendorPortalRouteConfig !== undefined);
test('adminPortalRouteConfig exported', adminPortalRouteConfig !== undefined);

// Test checkRouteAccess
console.log('\n--- Route Access Tests ---');
const publicAccess = checkRouteAccess('/auth/login', null, mainAppRouteConfig);
test('Public route allows unauthenticated', publicAccess.allowed === true);

const protectedNoAuth = checkRouteAccess('/dashboard', null, mainAppRouteConfig);
test('Protected route blocks unauthenticated', protectedNoAuth.allowed === false);
test('Protected route redirects to login', protectedNoAuth.redirect === '/auth/login');

const protectedWithAuth = checkRouteAccess('/dashboard', 'customer', mainAppRouteConfig);
test('Protected route allows authenticated customer', protectedWithAuth.allowed === true);

const adminRouteCustomer = checkRouteAccess('/admin/users', 'customer', adminPortalRouteConfig);
test('Admin route blocks customer', adminRouteCustomer.allowed === false);

const adminRouteAdmin = checkRouteAccess('/admin/users', 'admin', adminPortalRouteConfig);
test('Admin route allows admin', adminRouteAdmin.allowed === true);

// Summary
console.log('\n========================================');
console.log('VERIFICATION SUMMARY');
console.log('========================================');
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  console.log('❌ VERIFICATION FAILED - Some exports are missing or incorrect');
  process.exit(1);
} else {
  console.log('✅ ALL EXPORTS VERIFIED SUCCESSFULLY');
  process.exit(0);
}
