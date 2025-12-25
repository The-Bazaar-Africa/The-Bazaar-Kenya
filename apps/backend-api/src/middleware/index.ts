// Auth middleware
export { default as authPlugin } from './auth.js';
export {
  authenticate,
  optionalAuth,
  isAdminRole,
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './auth.js';

// Optional auth guard
export { optionalAuth as requireOptionalAuth } from './auth.js';

// Route guards
export {
  requireAuth,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAdmin,
  requireSuperAdmin,
  requireModuleAccess,
  requireOwnerOrAdmin,
  requireVendor,
  sensitiveOperation,
} from './guards.js';

