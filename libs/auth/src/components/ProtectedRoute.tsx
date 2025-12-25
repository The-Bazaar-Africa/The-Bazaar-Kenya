/**
 * @fileoverview ProtectedRoute component for client-side route protection
 * @module @tbk/auth/components/ProtectedRoute
 * 
 * Provides client-side route protection for React components.
 * Use this in addition to middleware for defense-in-depth.
 */

'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Role, Permission, AdminModule } from '../types';
import { hasPermission, hasAnyPermission, canAccessModule } from '../types';

/**
 * Loading component props
 */
export interface LoadingProps {
  message?: string;
}

/**
 * Default loading component
 */
function DefaultLoading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Access denied component props
 */
export interface AccessDeniedProps {
  message?: string;
  showHomeLink?: boolean;
}

/**
 * Default access denied component
 */
function DefaultAccessDenied({
  message = 'You do not have permission to access this page.',
  showHomeLink = true,
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 text-center p-8">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">{message}</p>
        {showHomeLink && (
          <a href="/" className="text-primary hover:underline">
            Return to Home
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * ProtectedRoute component props
 */
export interface ProtectedRouteProps {
  children: ReactNode;
  /** Require authentication (default: true) */
  requireAuth?: boolean;
  /** Require specific role(s) */
  requireRole?: Role | Role[];
  /** Require specific permission */
  requirePermission?: Permission;
  /** Require any of these permissions */
  requireAnyPermission?: Permission[];
  /** Require all of these permissions */
  requireAllPermissions?: Permission[];
  /** Require access to admin module */
  requireModule?: AdminModule;
  /** Require admin role */
  requireAdmin?: boolean;
  /** Require super admin role */
  requireSuperAdmin?: boolean;
  /** Require vendor role */
  requireVendor?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom access denied component */
  accessDeniedComponent?: ReactNode;
  /** Redirect path for unauthenticated users */
  redirectTo?: string;
  /** Callback when access is denied */
  onAccessDenied?: () => void;
}

/**
 * ProtectedRoute component
 * 
 * Wraps content that requires authentication or specific permissions.
 * Provides client-side protection in addition to middleware.
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireModule,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireVendor = false,
  loadingComponent,
  accessDeniedComponent,
  redirectTo = '/auth/login',
  onAccessDenied,
}: ProtectedRouteProps) {
  const {
    user,
    profile,
    adminProfile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isVendor,
  } = useAuth();

  // Build authenticated user object for permission checks
  const authUser = user && profile
    ? {
        id: user.id,
        email: user.email,
        role: profile.role,
        permissions: adminProfile?.permissions || [],
        isAdmin,
        isSuperAdmin,
      }
    : null;

  // Check access
  const checkAccess = (): boolean => {
    // Check authentication
    if (requireAuth && !isAuthenticated) {
      return false;
    }

    // Check super admin
    if (requireSuperAdmin && !isSuperAdmin) {
      return false;
    }

    // Check admin
    if (requireAdmin && !isAdmin) {
      return false;
    }

    // Check vendor
    if (requireVendor && !isVendor && !isAdmin) {
      return false;
    }

    // Check role
    if (requireRole) {
      const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!profile || !roles.includes(profile.role)) {
        return false;
      }
    }

    // Check single permission
    if (requirePermission && !hasPermission(authUser, requirePermission)) {
      return false;
    }

    // Check any permission
    if (requireAnyPermission && !hasAnyPermission(authUser, requireAnyPermission)) {
      return false;
    }

    // Check all permissions
    if (requireAllPermissions) {
      for (const perm of requireAllPermissions) {
        if (!hasPermission(authUser, perm)) {
          return false;
        }
      }
    }

    // Check module access
    if (requireModule && !canAccessModule(authUser, requireModule)) {
      return false;
    }

    return true;
  };

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Use window.location for redirect to avoid Next.js module dependency
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`;
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo]);

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoading />}</>;
  }

  // Redirect if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <>{loadingComponent || <DefaultLoading message="Redirecting to login..." />}</>;
  }

  // Check access permissions
  const hasAccess = checkAccess();

  if (!hasAccess) {
    // Call access denied callback
    onAccessDenied?.();

    // Show access denied component
    return <>{accessDeniedComponent || <DefaultAccessDenied />}</>;
  }

  // Render children
  return <>{children}</>;
}

/**
 * AdminRoute component - shorthand for admin-only routes
 */
export function AdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAdmin {...props}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * SuperAdminRoute component - shorthand for super admin-only routes
 */
export function SuperAdminRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireSuperAdmin'>) {
  return (
    <ProtectedRoute requireSuperAdmin {...props}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * VendorRoute component - shorthand for vendor-only routes
 */
export function VendorRoute({
  children,
  ...props
}: Omit<ProtectedRouteProps, 'requireVendor'>) {
  return (
    <ProtectedRoute requireVendor {...props}>
      {children}
    </ProtectedRoute>
  );
}
