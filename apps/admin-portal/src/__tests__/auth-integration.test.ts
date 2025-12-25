/**
 * @fileoverview Test auth library integration in admin-portal
 */

import {
  // Constants
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  PERMISSIONS,
  ADMIN_MODULES,
  MODULE_PERMISSIONS,
  
  // Type guards
  isAdminRole,
  isUserRole,
  isAdminUser,
  isSuperAdminUser,
  hasPermission,
  canAccessModule,
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
  useCanAccessModule,
  
  // Components
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  
  // Middleware
  matchPath,
  checkRouteAccess,
  adminPortalRouteConfig,
} from '@tbk/auth';

import type {
  Role,
  AdminRole,
  Permission,
  AdminModule,
  AdminStaffProfile,
} from '@tbk/auth';

// Verification
console.log('\n========================================');
console.log('Admin-Portal Auth Integration Test');
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
test('ADMIN_MODULES imported', typeof ADMIN_MODULES === 'object');
test('MODULE_PERMISSIONS imported', typeof MODULE_PERMISSIONS === 'object');

test('isAdminRole imported', typeof isAdminRole === 'function');
test('isAdminUser imported', typeof isAdminUser === 'function');
test('isSuperAdminUser imported', typeof isSuperAdminUser === 'function');
test('hasPermission imported', typeof hasPermission === 'function');
test('canAccessModule imported', typeof canAccessModule === 'function');

test('createBrowserClient imported', typeof createBrowserClient === 'function');
test('isSupabaseConfigured imported', typeof isSupabaseConfigured === 'function');

test('AuthProvider imported', typeof AuthProvider === 'function');
test('useAuth imported', typeof useAuth === 'function');
test('useUser imported', typeof useUser === 'function');
test('useSession imported', typeof useSession === 'function');
test('usePermissions imported', typeof usePermissions === 'function');
test('useCanAccessModule imported', typeof useCanAccessModule === 'function');

test('ProtectedRoute imported', typeof ProtectedRoute === 'function');
test('AdminRoute imported', typeof AdminRoute === 'function');
test('SuperAdminRoute imported', typeof SuperAdminRoute === 'function');

test('matchPath imported', typeof matchPath === 'function');
test('checkRouteAccess imported', typeof checkRouteAccess === 'function');
test('adminPortalRouteConfig imported', adminPortalRouteConfig !== undefined);

// Test admin-specific route config
console.log('\n--- Admin-Portal Route Config ---');
test('adminPortalRouteConfig has publicRoutes', Array.isArray(adminPortalRouteConfig.publicRoutes));
test('adminPortalRouteConfig has adminRoutes', Array.isArray(adminPortalRouteConfig.adminRoutes));
test('adminPortalRouteConfig has superAdminRoutes', Array.isArray(adminPortalRouteConfig.superAdminRoutes));
test('adminPortalRouteConfig redirects.login is /auth/login', adminPortalRouteConfig.redirects?.login === '/auth/login');

// Test route access for admin-portal scenarios
console.log('\n--- Admin-Portal Route Access ---');

// Auth pages should be public
const authLoginAccess = checkRouteAccess('/auth/login', null, adminPortalRouteConfig);
test('Auth login is public', authLoginAccess.allowed === true);

// Dashboard requires admin role
const dashboardNoAuth = checkRouteAccess('/dashboard', null, adminPortalRouteConfig);
test('Dashboard requires auth', dashboardNoAuth.allowed === false);

const dashboardCustomer = checkRouteAccess('/dashboard', 'customer', adminPortalRouteConfig);
test('Dashboard blocks customer', dashboardCustomer.allowed === false);

const dashboardVendor = checkRouteAccess('/dashboard', 'vendor', adminPortalRouteConfig);
test('Dashboard blocks vendor', dashboardVendor.allowed === false);

const dashboardAdmin = checkRouteAccess('/dashboard', 'admin', adminPortalRouteConfig);
test('Dashboard allows admin', dashboardAdmin.allowed === true);

const dashboardSuperAdmin = checkRouteAccess('/dashboard', 'super_admin', adminPortalRouteConfig);
test('Dashboard allows super_admin', dashboardSuperAdmin.allowed === true);

// Staff management requires super_admin
const staffAdmin = checkRouteAccess('/staff', 'admin', adminPortalRouteConfig);
test('Staff page blocks admin', staffAdmin.allowed === false);

const staffSuperAdmin = checkRouteAccess('/staff', 'super_admin', adminPortalRouteConfig);
test('Staff page allows super_admin', staffSuperAdmin.allowed === true);

// Test admin role checks
console.log('\n--- Admin Role Checks ---');
test('isAdminUser("super_admin") = true', isAdminUser('super_admin') === true);
test('isAdminUser("admin") = true', isAdminUser('admin') === true);
test('isAdminUser("manager") = true', isAdminUser('manager') === true);
test('isAdminUser("staff") = true', isAdminUser('staff') === true);
test('isAdminUser("viewer") = true', isAdminUser('viewer') === true);
test('isAdminUser("vendor") = false', isAdminUser('vendor') === false);
test('isAdminUser("customer") = false', isAdminUser('customer') === false);

test('isSuperAdminUser("super_admin") = true', isSuperAdminUser('super_admin') === true);
test('isSuperAdminUser("admin") = false', isSuperAdminUser('admin') === false);

// Test module access
console.log('\n--- Module Access Checks ---');
const superAdminPerms = getPermissionsForRole('super_admin');
const adminPerms = getPermissionsForRole('admin');
const viewerPerms = getPermissionsForRole('viewer');

test('super_admin can access users_management module', canAccessModule('users_management', superAdminPerms));
test('super_admin can access vendors_management module', canAccessModule('vendors_management', superAdminPerms));
test('super_admin can access analytics module', canAccessModule('analytics', superAdminPerms));
test('super_admin can access settings module', canAccessModule('settings', superAdminPerms));

test('admin can access users_management module', canAccessModule('users_management', adminPerms));
test('admin can access vendors_management module', canAccessModule('vendors_management', adminPerms));

test('viewer can access analytics module', canAccessModule('analytics', viewerPerms));
test('viewer cannot access settings module', !canAccessModule('settings', viewerPerms));

// Test permission hierarchy
console.log('\n--- Permission Hierarchy ---');
test('super_admin has all permissions', superAdminPerms.length === Object.keys(PERMISSIONS).length);
test('admin has fewer permissions than super_admin', adminPerms.length < superAdminPerms.length);
test('viewer has fewer permissions than admin', viewerPerms.length < adminPerms.length);

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
  console.log('✅ ADMIN-PORTAL INTEGRATION SUCCESSFUL');
  process.exit(0);
}
