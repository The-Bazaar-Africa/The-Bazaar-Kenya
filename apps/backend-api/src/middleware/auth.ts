/**
 * The Bazaar - Authentication Middleware
 * 
 * Handles JWT verification and user authentication using Supabase Auth.
 * This middleware extracts the user from the JWT and attaches it to the request.
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
  AuthenticatedUser,
  Role,
  Permission,
  ADMIN_ROLES,
  USER_ROLES,
  ROLE_PERMISSIONS,
  AdminRole,
} from '../types/auth.js';

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Extract and verify JWT from request.
 * Attaches user object to request if valid.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
      code: 'AUTH_MISSING_TOKEN',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const { data, error } = await request.server.supabase.auth.getUser(token);

    if (error || !data.user) {
      request.log.warn({ error: error?.message }, 'Auth token verification failed');
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'AUTH_INVALID_TOKEN',
      });
      return;
    }

    const supabaseUser = data.user;
    const role = (supabaseUser.user_metadata?.role || USER_ROLES.BUYER) as Role;
    
    // Get permissions based on role
    const permissions = getPermissionsForRole(role);

    // Build authenticated user object
    const user: AuthenticatedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role,
      permissions,
      isAdmin: isAdminRole(role),
      isSuperAdmin: role === ADMIN_ROLES.SUPER_ADMIN,
    };

    request.user = user;
  } catch (err) {
    request.log.error({ err }, 'Authentication error');
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
}

/**
 * Optional authentication - attaches user if token present, continues if not.
 * Useful for public endpoints that behave differently for authenticated users.
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token, continue without user
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data, error } = await request.server.supabase.auth.getUser(token);

    if (!error && data.user) {
      const supabaseUser = data.user;
      const role = (supabaseUser.user_metadata?.role || USER_ROLES.BUYER) as Role;

      request.user = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role,
        permissions: getPermissionsForRole(role),
        isAdmin: isAdminRole(role),
        isSuperAdmin: role === ADMIN_ROLES.SUPER_ADMIN,
      };
    }
  } catch {
    // Silently continue without user on error
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: Role): boolean {
  return Object.values(ADMIN_ROLES).includes(role as AdminRole);
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  if (isAdminRole(role)) {
    return ROLE_PERMISSIONS[role as AdminRole] || [];
  }
  // Non-admin users don't have admin permissions
  return [];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  // Super admin has all permissions
  if (user.isSuperAdmin) return true;
  return user.permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: AuthenticatedUser, permissions: Permission[]): boolean {
  if (user.isSuperAdmin) return true;
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: AuthenticatedUser, permissions: Permission[]): boolean {
  if (user.isSuperAdmin) return true;
  return permissions.every(p => user.permissions.includes(p));
}

// ============================================
// FASTIFY PLUGIN
// ============================================

/**
 * Auth plugin that registers decorators for easy access to auth utilities
 */
const authPlugin = async (fastify: FastifyInstance) => {
  // Decorate request with user (will be set by authenticate middleware)
  fastify.decorateRequest('user', undefined);

  // Add auth utilities to fastify instance
  fastify.decorate('auth', {
    authenticate,
    optionalAuth,
    isAdminRole,
    getPermissionsForRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  });
};

// Extend Fastify types for the auth decorator
declare module 'fastify' {
  interface FastifyInstance {
    auth: {
      authenticate: typeof authenticate;
      optionalAuth: typeof optionalAuth;
      isAdminRole: typeof isAdminRole;
      getPermissionsForRole: typeof getPermissionsForRole;
      hasPermission: typeof hasPermission;
      hasAnyPermission: typeof hasAnyPermission;
      hasAllPermissions: typeof hasAllPermissions;
    };
  }
}

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['supabase'],
  fastify: '5.x',
});

