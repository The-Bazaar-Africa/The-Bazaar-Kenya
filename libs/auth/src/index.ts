/**
 * @fileoverview Main entry point for @tbk/auth
 * @module @tbk/auth
 * 
 * Enterprise-grade authentication library for The Bazaar marketplace.
 * Provides authentication, authorization, and route protection for
 * Next.js applications using Supabase Auth.
 * 
 * IMPORTANT: This module exports client-safe utilities only.
 * For server-side utilities (createServerClient, createServiceClient),
 * import from '@tbk/auth/server'.
 */

// ============================================
// TYPES
// ============================================

// Auth types (roles, permissions, interfaces)
export {
  // Role constants
  ADMIN_ROLES,
  USER_ROLES,
  ALL_ROLES,
  // Permission constants
  PERMISSIONS,
  // Role-permission mappings
  ROLE_PERMISSIONS,
  // Admin modules
  ADMIN_MODULES,
  MODULE_PERMISSIONS,
  // Type guards and helpers
  isAdminRole,
  isUserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  getPermissionsForRole,
  // Types
  type AdminRole,
  type UserRole,
  type Role,
  type Permission,
  type AdminModule,
  type JWTPayload,
  type AuthenticatedUser,
  type UserProfile,
  type VendorProfile,
  type AdminStaffProfile,
  type AuthState,
  type AuthUser,
  type AuthSession,
  type AuthError,
  type SignUpData,
  type SignInData,
  type OAuthProvider,
  type PasswordResetData,
  type PasswordUpdateData,
  type ProfileUpdateData,
} from './types';

// Database types
export {
  type Database,
  type Json,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
  type Enums,
} from './types';

// ============================================
// CLIENTS (Browser only - client-safe)
// ============================================

// Browser client (for client components)
export {
  createBrowserClient,
  isSupabaseConfigured,
  resetBrowserClient,
  type BrowserClient,
} from './clients/browser';

// ============================================
// CONTEXT & PROVIDER
// ============================================

export {
  AuthContext,
  AuthProvider,
  type AuthContextType,
  type AuthProviderProps,
} from './context';

// ============================================
// HOOKS
// ============================================

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
} from './hooks';

// User data hooks
export {
  useUser,
  useDisplayName,
  useAvatarUrl,
  useRole,
  useVendorProfile,
  useAdminProfile,
  type UseUserReturn,
} from './hooks';

// Session hooks
export {
  useSession,
  useAccessToken,
  useHasValidSession,
  useSessionExpiry,
  type UseSessionReturn,
} from './hooks';

// Permission hooks
export {
  usePermissions,
  useHasPermission,
  useCanAccessModule,
  useHasAnyPermission,
  useHasAllPermissions,
  type UsePermissionsReturn,
} from './hooks';

// ============================================
// COMPONENTS
// ============================================

export {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  VendorRoute,
  type ProtectedRouteProps,
  type LoadingProps,
  type AccessDeniedProps,
} from './components';

// ============================================
// MIDDLEWARE UTILITIES (Client-safe only)
// ============================================

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
} from './middleware';
