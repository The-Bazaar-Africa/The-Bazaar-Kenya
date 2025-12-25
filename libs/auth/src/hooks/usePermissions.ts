/**
 * @fileoverview usePermissions hook for RBAC permission checks
 * @module @tbk/auth/hooks/usePermissions
 * 
 * Provides hooks for checking user permissions based on the RBAC system.
 * Useful for conditional rendering and access control in components.
 * 
 * Based on backend guard patterns:
 * @see apps/backend-api/src/middleware/guards.ts
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { usePermissions, PERMISSIONS } from '@tbk/auth';
 * 
 * export function AdminPanel() {
 *   const { hasPermission, hasAnyPermission } = usePermissions();
 *   
 *   const canManageUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
 *   const canViewAnalytics = hasAnyPermission([
 *     PERMISSIONS.ANALYTICS_READ,
 *     PERMISSIONS.ANALYTICS_DASHBOARD,
 *   ]);
 *   
 *   return (
 *     <div>
 *       {canManageUsers && <UserManagementSection />}
 *       {canViewAnalytics && <AnalyticsDashboard />}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  Permission,
  AdminModule,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  canAccessModule as checkModuleAccess,
  type AuthenticatedUser,
} from '../types';

/**
 * Permissions hook return interface
 */
export interface UsePermissionsReturn {
  /** User's permissions array */
  permissions: Permission[];
  /** Check if user has a specific permission */
  hasPermission: (permission: Permission) => boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** Check if user can access an admin module */
  canAccessModule: (module: AdminModule) => boolean;
  /** Whether user is a super admin (has all permissions) */
  isSuperAdmin: boolean;
  /** Whether user is an admin (any admin role) */
  isAdmin: boolean;
}

/**
 * Hook to check user permissions
 * 
 * @returns Permission checking utilities
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { usePermissions, PERMISSIONS, ADMIN_MODULES } from '@tbk/auth';
 * 
 * export function VendorManagement() {
 *   const { 
 *     hasPermission, 
 *     hasAnyPermission, 
 *     canAccessModule 
 *   } = usePermissions();
 *   
 *   // Check single permission
 *   const canApproveVendors = hasPermission(PERMISSIONS.VENDORS_APPROVE);
 *   
 *   // Check multiple permissions (OR)
 *   const canManageVendors = hasAnyPermission([
 *     PERMISSIONS.VENDORS_UPDATE,
 *     PERMISSIONS.VENDORS_APPROVE,
 *     PERMISSIONS.VENDORS_SUSPEND,
 *   ]);
 *   
 *   // Check module access
 *   const hasVendorModuleAccess = canAccessModule(ADMIN_MODULES.VENDORS_MANAGEMENT);
 *   
 *   if (!hasVendorModuleAccess) {
 *     return <AccessDenied />;
 *   }
 *   
 *   return (
 *     <div>
 *       <VendorList />
 *       {canApproveVendors && <ApproveVendorButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, profile, adminProfile, isAdmin, isSuperAdmin } = useAuth();

  // Build authenticated user object for permission checks
  const authUser: AuthenticatedUser | null = useMemo(() => {
    if (!user || !profile) return null;

    return {
      id: user.id,
      email: user.email,
      role: profile.role,
      permissions: adminProfile?.permissions || [],
      isAdmin,
      isSuperAdmin,
    };
  }, [user, profile, adminProfile, isAdmin, isSuperAdmin]);

  // Get permissions array
  const permissions = useMemo(() => {
    return adminProfile?.permissions || [];
  }, [adminProfile]);

  // Permission check functions
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(authUser, permission);
    },
    [authUser]
  );

  const hasAnyPermission = useCallback(
    (perms: Permission[]): boolean => {
      return checkAnyPermission(authUser, perms);
    },
    [authUser]
  );

  const hasAllPermissions = useCallback(
    (perms: Permission[]): boolean => {
      return checkAllPermissions(authUser, perms);
    },
    [authUser]
  );

  const canAccessModule = useCallback(
    (module: AdminModule): boolean => {
      return checkModuleAccess(authUser, module);
    },
    [authUser]
  );

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isSuperAdmin,
    isAdmin,
  };
}

/**
 * Hook to check a single permission
 * Convenient shorthand for simple permission checks
 * 
 * @param permission - The permission to check
 * @returns Boolean indicating if user has the permission
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useHasPermission, PERMISSIONS } from '@tbk/auth';
 * 
 * export function DeleteButton({ onDelete }: { onDelete: () => void }) {
 *   const canDelete = useHasPermission(PERMISSIONS.PRODUCTS_DELETE);
 *   
 *   if (!canDelete) return null;
 *   
 *   return <button onClick={onDelete}>Delete</button>;
 * }
 * ```
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook to check module access
 * Convenient shorthand for module access checks
 * 
 * @param module - The admin module to check
 * @returns Boolean indicating if user can access the module
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useCanAccessModule, ADMIN_MODULES } from '@tbk/auth';
 * 
 * export function SettingsLink() {
 *   const canAccess = useCanAccessModule(ADMIN_MODULES.SETTINGS);
 *   
 *   if (!canAccess) return null;
 *   
 *   return <Link href="/admin/settings">Settings</Link>;
 * }
 * ```
 */
export function useCanAccessModule(module: AdminModule): boolean {
  const { canAccessModule } = usePermissions();
  return canAccessModule(module);
}

/**
 * Hook to check if user has any of the specified permissions
 * 
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has any of the permissions
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useHasAnyPermission, PERMISSIONS } from '@tbk/auth';
 * 
 * export function OrderActions() {
 *   const canManageOrders = useHasAnyPermission([
 *     PERMISSIONS.ORDERS_UPDATE,
 *     PERMISSIONS.ORDERS_CANCEL,
 *     PERMISSIONS.ORDERS_REFUND,
 *   ]);
 *   
 *   if (!canManageOrders) return null;
 *   
 *   return <OrderActionsMenu />;
 * }
 * ```
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has all of the specified permissions
 * 
 * @param permissions - Array of permissions to check
 * @returns Boolean indicating if user has all of the permissions
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useHasAllPermissions, PERMISSIONS } from '@tbk/auth';
 * 
 * export function FullVendorControl() {
 *   const hasFullControl = useHasAllPermissions([
 *     PERMISSIONS.VENDORS_UPDATE,
 *     PERMISSIONS.VENDORS_APPROVE,
 *     PERMISSIONS.VENDORS_SUSPEND,
 *     PERMISSIONS.VENDORS_DELETE,
 *   ]);
 *   
 *   if (!hasFullControl) return <LimitedVendorView />;
 *   
 *   return <FullVendorManagement />;
 * }
 * ```
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}
