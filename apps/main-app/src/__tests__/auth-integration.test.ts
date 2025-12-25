/**
 * @fileoverview Test auth library integration in main-app
 */

// Test that all imports work correctly
import {
  // Constants
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  
  // Type guards
  isAdminRole,
  isUserRole,
  hasPermission,
  getPermissionsForRole,
  
  // Clients
  createBrowserClient,
  isSupabaseConfigured,
  
  // Context
  AuthProvider,
  AuthContext,
  
  // Hooks
  useAuth,
  useUser,
  useSession,
  usePermissions,
  
  // Components
  ProtectedRoute,
  AdminRoute,
  VendorRoute,
  
  // Middleware
  matchPath,
  checkRouteAccess,
  mainAppRouteConfig,
} from '@tbk/auth';

// Types
import type {
  Role,
  Permission,
  AuthState,
  UserProfile,
  SignInData,
  SignUpData,
} from '@tbk/auth';

// Verification
console.log('\n========================================');
console.log('Main-App Auth Integration Test');
console.log('========================================\n');

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

// Test imports
console.log('--- Import Verification ---');
test('ADMIN_ROLES imported', typeof ADMIN_ROLES === 'object');
test('USER_ROLES imported', typeof USER_ROLES === 'object');
test('ALL_ROLES imported', Array.isArray(ALL_ROLES));
test('PERMISSIONS imported', typeof PERMISSIONS === 'object');

test('isAdminRole imported', typeof isAdminRole === 'function');
test('isUserRole imported', typeof isUserRole === 'function');
test('hasPermission imported', typeof hasPermission === 'function');
test('getPermissionsForRole imported', typeof getPermissionsForRole === 'function');

test('createBrowserClient imported', typeof createBrowserClient === 'function');
test('isSupabaseConfigured imported', typeof isSupabaseConfigured === 'function');

test('AuthProvider imported', typeof AuthProvider === 'function');
test('AuthContext imported', AuthContext !== undefined);

test('useAuth imported', typeof useAuth === 'function');
test('useUser imported', typeof useUser === 'function');
test('useSession imported', typeof useSession === 'function');
test('usePermissions imported', typeof usePermissions === 'function');

test('ProtectedRoute imported', typeof ProtectedRoute === 'function');
test('AdminRoute imported', typeof AdminRoute === 'function');
test('VendorRoute imported', typeof VendorRoute === 'function');

test('matchPath imported', typeof matchPath === 'function');
test('checkRouteAccess imported', typeof checkRouteAccess === 'function');
test('mainAppRouteConfig imported', mainAppRouteConfig !== undefined);

// Test main-app specific route config
console.log('\n--- Main-App Route Config ---');
test('mainAppRouteConfig has publicRoutes', Array.isArray(mainAppRouteConfig.publicRoutes));
test('mainAppRouteConfig has protectedRoutes', Array.isArray(mainAppRouteConfig.protectedRoutes));
test('mainAppRouteConfig redirects.login is /auth/login', mainAppRouteConfig.redirects?.login === '/auth/login');

// Test route access for main-app scenarios
console.log('\n--- Main-App Route Access ---');
const homeAccess = checkRouteAccess('/', null, mainAppRouteConfig);
test('Home page is public', homeAccess.allowed === true);

const productsAccess = checkRouteAccess('/products/123', null, mainAppRouteConfig);
test('Product pages are public', productsAccess.allowed === true);

const categoriesAccess = checkRouteAccess('/categories/electronics', null, mainAppRouteConfig);
test('Category pages are public', categoriesAccess.allowed === true);

const authLoginAccess = checkRouteAccess('/auth/login', null, mainAppRouteConfig);
test('Auth pages are public', authLoginAccess.allowed === true);

const dashboardNoAuth = checkRouteAccess('/dashboard', null, mainAppRouteConfig);
test('Dashboard requires auth', dashboardNoAuth.allowed === false);

const dashboardWithAuth = checkRouteAccess('/dashboard', 'customer', mainAppRouteConfig);
test('Dashboard allows customer', dashboardWithAuth.allowed === true);

const checkoutNoAuth = checkRouteAccess('/checkout', null, mainAppRouteConfig);
test('Checkout requires auth', checkoutNoAuth.allowed === false);

const checkoutWithAuth = checkRouteAccess('/checkout', 'customer', mainAppRouteConfig);
test('Checkout allows customer', checkoutWithAuth.allowed === true);

// Summary
console.log('\n========================================');
console.log('INTEGRATION TEST SUMMARY');
console.log('========================================');
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  console.log('❌ INTEGRATION TEST FAILED');
  process.exit(1);
} else {
  console.log('✅ MAIN-APP INTEGRATION SUCCESSFUL');
  process.exit(0);
}
