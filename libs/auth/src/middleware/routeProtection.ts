/**
 * @fileoverview Route protection utilities for Next.js middleware
 * @module @tbk/auth/middleware/routeProtection
 * 
 * Provides utilities for protecting routes in Next.js applications.
 * Based on backend guard patterns adapted for frontend middleware.
 * 
 * Note: This module exports utility functions and configuration types.
 * The actual middleware should be created in the app's middleware.ts file.
 */

import { ADMIN_ROLES, USER_ROLES, type Role } from '../types';

/**
 * Route configuration for auth middleware
 */
export interface RouteConfig {
  /** Routes accessible without authentication */
  publicRoutes?: string[];
  /** Routes requiring authentication */
  protectedRoutes?: string[];
  /** Routes requiring admin role */
  adminRoutes?: string[];
  /** Routes requiring vendor role */
  vendorRoutes?: string[];
  /** Routes requiring super admin role */
  superAdminRoutes?: string[];
  /** Custom route handlers */
  customRoutes?: {
    pattern: string;
    roles?: Role[];
  }[];
  /** Redirect paths */
  redirects?: {
    /** Where to redirect unauthenticated users (default: /auth/login) */
    login?: string;
    /** Where to redirect after login (default: /dashboard) */
    afterLogin?: string;
    /** Where to redirect unauthorized users (default: /) */
    unauthorized?: string;
  };
}

/**
 * Default route configuration
 */
export const defaultRouteConfig: RouteConfig = {
  publicRoutes: [
    '/',
    '/auth/*',
    '/products',
    '/products/*',
    '/categories',
    '/categories/*',
    '/vendors',
    '/vendors/*',
    '/search',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
  ],
  protectedRoutes: [
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/profile/*',
    '/orders',
    '/orders/*',
    '/wishlist',
    '/cart',
    '/checkout',
    '/checkout/*',
  ],
  adminRoutes: ['/admin', '/admin/*'],
  vendorRoutes: ['/vendor', '/vendor/*'],
  superAdminRoutes: ['/admin/staff', '/admin/staff/*', '/admin/settings/*'],
  redirects: {
    login: '/auth/login',
    afterLogin: '/dashboard',
    unauthorized: '/',
  },
};

/**
 * Check if a path matches a pattern
 * Supports wildcards (*) for path segments
 */
export function matchPath(path: string, pattern: string): boolean {
  // Normalize paths
  const normalizedPath = path.replace(/\/$/, '') || '/';
  const normalizedPattern = pattern.replace(/\/$/, '') || '/';

  // Exact match
  if (normalizedPath === normalizedPattern) {
    return true;
  }

  // Wildcard match
  if (normalizedPattern.endsWith('/*')) {
    const basePattern = normalizedPattern.slice(0, -2);
    return normalizedPath === basePattern || normalizedPath.startsWith(basePattern + '/');
  }

  return false;
}

/**
 * Check if a path matches any pattern in an array
 */
export function matchAnyPath(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchPath(path, pattern));
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: Role | null, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user is an admin (any admin role)
 */
export function isAdminUser(role: Role | null): boolean {
  if (!role) return false;
  return Object.values(ADMIN_ROLES).includes(role as typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]);
}

/**
 * Check if user is a super admin
 */
export function isSuperAdminUser(role: Role | null): boolean {
  return role === ADMIN_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is a vendor
 */
export function isVendorUser(role: Role | null): boolean {
  return role === USER_ROLES.VENDOR;
}

/**
 * Create redirect URL with original path preserved
 */
export function createRedirectUrl(
  loginPath: string,
  originalPath: string,
  baseUrl: string
): string {
  const url = new URL(loginPath, baseUrl);
  url.searchParams.set('redirectTo', originalPath);
  return url.toString();
}

/**
 * Merge route config with defaults
 */
export function mergeRouteConfig(config: RouteConfig = {}): Required<RouteConfig> {
  return {
    publicRoutes: config.publicRoutes || defaultRouteConfig.publicRoutes || [],
    protectedRoutes: config.protectedRoutes || defaultRouteConfig.protectedRoutes || [],
    adminRoutes: config.adminRoutes || defaultRouteConfig.adminRoutes || [],
    vendorRoutes: config.vendorRoutes || defaultRouteConfig.vendorRoutes || [],
    superAdminRoutes: config.superAdminRoutes || defaultRouteConfig.superAdminRoutes || [],
    customRoutes: config.customRoutes || [],
    redirects: {
      login: config.redirects?.login || defaultRouteConfig.redirects?.login || '/auth/login',
      afterLogin: config.redirects?.afterLogin || defaultRouteConfig.redirects?.afterLogin || '/dashboard',
      unauthorized: config.redirects?.unauthorized || defaultRouteConfig.redirects?.unauthorized || '/',
    },
  };
}

/**
 * Check route access based on configuration
 * 
 * @param pathname - Current path
 * @param userRole - User's role (null if not authenticated)
 * @param config - Route configuration
 * @returns Object with access decision and redirect info
 */
export function checkRouteAccess(
  pathname: string,
  userRole: Role | null,
  config: RouteConfig = {}
): {
  allowed: boolean;
  redirect?: string;
  reason?: 'unauthenticated' | 'unauthorized' | 'already_authenticated';
} {
  const mergedConfig = mergeRouteConfig(config);
  const isAuthenticated = userRole !== null;

  // Check public routes
  if (matchAnyPath(pathname, mergedConfig.publicRoutes)) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && pathname.startsWith('/auth/') && !pathname.includes('/callback')) {
      return {
        allowed: false,
        redirect: mergedConfig.redirects.afterLogin,
        reason: 'already_authenticated',
      };
    }
    return { allowed: true };
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return {
      allowed: false,
      redirect: mergedConfig.redirects.login,
      reason: 'unauthenticated',
    };
  }

  // Check super admin routes
  if (matchAnyPath(pathname, mergedConfig.superAdminRoutes)) {
    if (!isSuperAdminUser(userRole)) {
      return {
        allowed: false,
        redirect: mergedConfig.redirects.unauthorized,
        reason: 'unauthorized',
      };
    }
    return { allowed: true };
  }

  // Check admin routes
  if (matchAnyPath(pathname, mergedConfig.adminRoutes)) {
    if (!isAdminUser(userRole)) {
      return {
        allowed: false,
        redirect: mergedConfig.redirects.unauthorized,
        reason: 'unauthorized',
      };
    }
    return { allowed: true };
  }

  // Check vendor routes
  if (matchAnyPath(pathname, mergedConfig.vendorRoutes)) {
    if (!isVendorUser(userRole) && !isAdminUser(userRole)) {
      return {
        allowed: false,
        redirect: mergedConfig.redirects.unauthorized,
        reason: 'unauthorized',
      };
    }
    return { allowed: true };
  }

  // Check custom routes
  for (const customRoute of mergedConfig.customRoutes) {
    if (matchPath(pathname, customRoute.pattern)) {
      if (customRoute.roles && !hasRequiredRole(userRole, customRoute.roles)) {
        return {
          allowed: false,
          redirect: mergedConfig.redirects.unauthorized,
          reason: 'unauthorized',
        };
      }
    }
  }

  // Check protected routes
  if (matchAnyPath(pathname, mergedConfig.protectedRoutes)) {
    return { allowed: true };
  }

  // Default: allow access for authenticated users
  return { allowed: true };
}

/**
 * Pre-configured route config for main-app
 */
export const mainAppRouteConfig: RouteConfig = {
  publicRoutes: [
    '/',
    '/auth/*',
    '/products',
    '/products/*',
    '/categories',
    '/categories/*',
    '/vendors',
    '/vendors/*',
    '/search',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/help',
  ],
  protectedRoutes: [
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/profile/*',
    '/orders',
    '/orders/*',
    '/wishlist',
    '/cart',
    '/checkout',
    '/checkout/*',
    '/settings',
    '/settings/*',
  ],
  redirects: {
    login: '/auth/login',
    afterLogin: '/dashboard',
    unauthorized: '/',
  },
};

/**
 * Pre-configured route config for vendor-portal
 */
export const vendorPortalRouteConfig: RouteConfig = {
  publicRoutes: ['/auth/*'],
  protectedRoutes: ['/*'],
  vendorRoutes: ['/*'],
  redirects: {
    login: '/auth/login',
    afterLogin: '/dashboard',
    unauthorized: '/auth/login',
  },
};

/**
 * Pre-configured route config for admin-portal
 */
export const adminPortalRouteConfig: RouteConfig = {
  publicRoutes: ['/auth/*'],
  protectedRoutes: ['/*'],
  adminRoutes: ['/*'],
  superAdminRoutes: ['/staff', '/staff/*', '/settings/security'],
  redirects: {
    login: '/auth/login',
    afterLogin: '/dashboard',
    unauthorized: '/auth/login',
  },
};
