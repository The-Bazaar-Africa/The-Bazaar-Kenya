/**
 * @fileoverview Middleware exports for @tbk/auth
 * @module @tbk/auth/middleware
 */

export {
  // Utility functions
  matchPath,
  matchAnyPath,
  hasRequiredRole,
  isAdminUser,
  isSuperAdminUser,
  isVendorUser,
  createRedirectUrl,
  mergeRouteConfig,
  checkRouteAccess,
  // Configurations
  defaultRouteConfig,
  mainAppRouteConfig,
  vendorPortalRouteConfig,
  adminPortalRouteConfig,
  // Types
  type RouteConfig,
} from './routeProtection';
