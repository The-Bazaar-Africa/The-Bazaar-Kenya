/**
 * @fileoverview Hook exports for @tbk/auth
 * @module @tbk/auth/hooks
 */

// Main auth hook
export {
  useAuth,
  useIsAuthenticated,
  useIsAdmin,
  useIsVendor,
  useAuthLoading,
  useAuthError,
  type UseAuthReturn,
  type AuthActions,
} from './useAuth';

// User data hooks
export {
  useUser,
  useDisplayName,
  useAvatarUrl,
  useRole,
  useVendorProfile,
  useAdminProfile,
  type UseUserReturn,
} from './useUser';

// Session hooks
export {
  useSession,
  useAccessToken,
  useHasValidSession,
  useSessionExpiry,
  type UseSessionReturn,
} from './useSession';

// Permission hooks
export {
  usePermissions,
  useHasPermission,
  useCanAccessModule,
  useHasAnyPermission,
  useHasAllPermissions,
  type UsePermissionsReturn,
} from './usePermissions';
