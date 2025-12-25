/**
 * The Bazaar - Route Guards
 * 
 * Middleware for protecting routes based on:
 * - Authentication status
 * - User roles
 * - Specific permissions
 * - Admin portal access
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import {
  Permission,
  Role,
  AdminModule,
  MODULE_PERMISSIONS,
} from '../types/auth.js';
import { authenticate, hasPermission, hasAnyPermission, hasAllPermissions } from './auth.js';

// ============================================
// GUARD FACTORY FUNCTIONS
// ============================================

/**
 * Require authentication - user must be logged in
 */
export function requireAuth() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
  };
}

/**
 * Require specific role(s) - user must have one of the specified roles
 */
export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return; // Auth failed

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Super admin can access everything
    if (request.user.isSuperAdmin) return;

    if (!roles.includes(request.user.role)) {
      request.log.warn(
        { userId: request.user.id, role: request.user.role, requiredRoles: roles },
        'Role check failed'
      );
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient role privileges',
        code: 'AUTH_INSUFFICIENT_ROLE',
      });
    }
  };
}

/**
 * Require specific permission - user must have the exact permission
 */
export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!hasPermission(request.user, permission)) {
      request.log.warn(
        { userId: request.user.id, permission, userPermissions: request.user.permissions },
        'Permission check failed'
      );
      reply.status(403).send({
        error: 'Forbidden',
        message: `Missing required permission: ${permission}`,
        code: 'AUTH_MISSING_PERMISSION',
      });
    }
  };
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!hasAnyPermission(request.user, permissions)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Missing required permissions',
        code: 'AUTH_MISSING_PERMISSION',
        requiredAny: permissions,
      });
    }
  };
}

/**
 * Require all of the specified permissions
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!hasAllPermissions(request.user, permissions)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Missing required permissions',
        code: 'AUTH_MISSING_PERMISSION',
        requiredAll: permissions,
      });
    }
  };
}

// ============================================
// ADMIN PORTAL GUARDS
// ============================================

/**
 * Require admin access - user must be an admin (any admin role)
 */
export function requireAdmin() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!request.user.isAdmin) {
      request.log.warn(
        { userId: request.user.id, role: request.user.role },
        'Admin access denied - not an admin user'
      );
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required',
        code: 'AUTH_ADMIN_REQUIRED',
      });
    }
  };
}

/**
 * Require super admin access - only the "President" can access
 */
export function requireSuperAdmin() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!request.user.isSuperAdmin) {
      request.log.warn(
        { userId: request.user.id, role: request.user.role },
        'Super admin access denied'
      );
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Super admin access required',
        code: 'AUTH_SUPER_ADMIN_REQUIRED',
      });
    }
  };
}

/**
 * Require access to a specific admin module
 */
export function requireModuleAccess(module: AdminModule) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Super admin has access to all modules
    if (request.user.isSuperAdmin) return;

    // Check if user is admin
    if (!request.user.isAdmin) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required',
        code: 'AUTH_ADMIN_REQUIRED',
      });
      return;
    }

    // Check module-specific permissions
    const requiredPermissions = MODULE_PERMISSIONS[module];
    if (!hasAnyPermission(request.user, requiredPermissions)) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `Access to ${module} module denied`,
        code: 'AUTH_MODULE_ACCESS_DENIED',
        module,
      });
    }
  };
}

// ============================================
// OWNERSHIP GUARDS
// ============================================

/**
 * Require ownership or admin access
 * The ownerIdExtractor function should extract the owner ID from the request
 */
export function requireOwnerOrAdmin(
  ownerIdExtractor: (request: FastifyRequest) => string | undefined
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Admins can access anything
    if (request.user.isAdmin) return;

    // Check ownership
    const ownerId = ownerIdExtractor(request);
    if (ownerId !== request.user.id) {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'You can only access your own resources',
        code: 'AUTH_NOT_OWNER',
      });
    }
  };
}

/**
 * Require vendor role for vendor-specific operations
 */
export function requireVendor() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;

    if (!request.user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Admins can also perform vendor operations
    if (request.user.isAdmin) return;

    if (request.user.role !== 'vendor') {
      reply.status(403).send({
        error: 'Forbidden',
        message: 'Vendor access required',
        code: 'AUTH_VENDOR_REQUIRED',
      });
    }
  };
}

// ============================================
// RATE LIMITING GUARDS (Placeholder for future)
// ============================================

/**
 * Apply stricter rate limiting for sensitive operations
 * TODO: Implement with @fastify/rate-limit overrides
 */
export function sensitiveOperation() {
  return async (_request: FastifyRequest, _reply: FastifyReply) => {
    // Placeholder for additional rate limiting
    // Will be implemented with stricter limits for sensitive ops
  };
}

