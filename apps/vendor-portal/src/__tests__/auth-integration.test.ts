/**
 * @fileoverview Test auth library integration in vendor-portal
 */

import {
  // Constants
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  
  // Type guards
  isAdminRole,
  isUserRole,
  isVendorUser,
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
  VendorRoute,
  
  // Middleware
  matchPath,
  checkRouteAccess,
  vendorPortalRouteConfig,
} from '@tbk/auth';

import type {
  Role,
  VendorProfile,
} from '@tbk/auth';

// Verification
console.log('\n========================================');
console.log('Vendor-Portal Auth Integration Test');
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
test('isVendorUser imported', typeof isVendorUser === 'function');
test('hasPermission imported', typeof hasPermission === 'function');

test('createBrowserClient imported', typeof createBrowserClient === 'function');
test('isSupabaseConfigured imported', typeof isSupabaseConfigured === 'function');

test('AuthProvider imported', typeof AuthProvider === 'function');
test('useAuth imported', typeof useAuth === 'function');
test('useUser imported', typeof useUser === 'function');
test('useSession imported', typeof useSession === 'function');
test('usePermissions imported', typeof usePermissions === 'function');

test('ProtectedRoute imported', typeof ProtectedRoute === 'function');
test('VendorRoute imported', typeof VendorRoute === 'function');

test('matchPath imported', typeof matchPath === 'function');
test('checkRouteAccess imported', typeof checkRouteAccess === 'function');
test('vendorPortalRouteConfig imported', vendorPortalRouteConfig !== undefined);

// Test vendor-specific route config
console.log('\n--- Vendor-Portal Route Config ---');
test('vendorPortalRouteConfig has publicRoutes', Array.isArray(vendorPortalRouteConfig.publicRoutes));
test('vendorPortalRouteConfig has vendorRoutes', Array.isArray(vendorPortalRouteConfig.vendorRoutes));
test('vendorPortalRouteConfig redirects.login is /auth/login', vendorPortalRouteConfig.redirects?.login === '/auth/login');

// Test route access for vendor-portal scenarios
console.log('\n--- Vendor-Portal Route Access ---');

// Auth pages should be public
const authLoginAccess = checkRouteAccess('/auth/login', null, vendorPortalRouteConfig);
test('Auth login is public', authLoginAccess.allowed === true);

const authRegisterAccess = checkRouteAccess('/auth/register', null, vendorPortalRouteConfig);
test('Auth register is public', authRegisterAccess.allowed === true);

// Dashboard requires vendor role
const dashboardNoAuth = checkRouteAccess('/dashboard', null, vendorPortalRouteConfig);
test('Dashboard requires auth', dashboardNoAuth.allowed === false);

const dashboardCustomer = checkRouteAccess('/dashboard', 'customer', vendorPortalRouteConfig);
test('Dashboard blocks customer', dashboardCustomer.allowed === false);

const dashboardVendor = checkRouteAccess('/dashboard', 'vendor', vendorPortalRouteConfig);
test('Dashboard allows vendor', dashboardVendor.allowed === true);

const dashboardAdmin = checkRouteAccess('/dashboard', 'admin', vendorPortalRouteConfig);
test('Dashboard allows admin', dashboardAdmin.allowed === true);

// Products page requires vendor role
const productsNoAuth = checkRouteAccess('/products', null, vendorPortalRouteConfig);
test('Products requires auth', productsNoAuth.allowed === false);

const productsVendor = checkRouteAccess('/products', 'vendor', vendorPortalRouteConfig);
test('Products allows vendor', productsVendor.allowed === true);

// Orders page requires vendor role
const ordersVendor = checkRouteAccess('/orders', 'vendor', vendorPortalRouteConfig);
test('Orders allows vendor', ordersVendor.allowed === true);

// Test isVendorUser helper
console.log('\n--- Vendor Role Checks ---');
test('isVendorUser("vendor") = true', isVendorUser('vendor') === true);
test('isVendorUser("customer") = false', isVendorUser('customer') === false);
test('isVendorUser("admin") = false', isVendorUser('admin') === false);

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
  console.log('✅ VENDOR-PORTAL INTEGRATION SUCCESSFUL');
  process.exit(0);
}
