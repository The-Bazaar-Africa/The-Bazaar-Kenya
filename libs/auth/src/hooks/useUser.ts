/**
 * @fileoverview useUser hook for accessing current user data
 * @module @tbk/auth/hooks/useUser
 * 
 * Provides access to the current authenticated user's data including
 * profile, vendor profile (if vendor), and admin profile (if admin).
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useUser } from '@tbk/auth';
 * 
 * export function UserAvatar() {
 *   const { user, profile, isLoading } = useUser();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (!user) return null;
 *   
 *   return (
 *     <img 
 *       src={profile?.avatar_url || '/default-avatar.png'} 
 *       alt={profile?.full_name || user.email} 
 *     />
 *   );
 * }
 * ```
 */

'use client';

import { useAuth } from './useAuth';
import type {
  AuthUser,
  UserProfile,
  VendorProfile,
  AdminStaffProfile,
  Role,
} from '../types';

/**
 * User data interface
 */
export interface UseUserReturn {
  /** Supabase auth user object */
  user: AuthUser | null;
  /** User profile from api.profiles table */
  profile: UserProfile | null;
  /** Vendor profile if user is a vendor */
  vendorProfile: VendorProfile | null;
  /** Admin staff profile if user is admin */
  adminProfile: AdminStaffProfile | null;
  /** User's role */
  role: Role | null;
  /** Loading state */
  isLoading: boolean;
  /** Whether user data is available */
  hasUser: boolean;
}

/**
 * Hook to access current user data
 * 
 * @returns User data including profile information
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useUser } from '@tbk/auth';
 * 
 * export function WelcomeMessage() {
 *   const { profile, hasUser, isLoading } = useUser();
 *   
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!hasUser) return <p>Please sign in</p>;
 *   
 *   return <p>Welcome back, {profile?.full_name || 'User'}!</p>;
 * }
 * ```
 */
export function useUser(): UseUserReturn {
  const { user, profile, vendorProfile, adminProfile, isLoading } = useAuth();

  const role = profile?.role || user?.user_metadata?.role || null;

  return {
    user,
    profile,
    vendorProfile,
    adminProfile,
    role,
    isLoading,
    hasUser: !!user,
  };
}

/**
 * Hook to get user's display name
 * Returns full name from profile, or email as fallback
 * 
 * @returns Display name string or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useDisplayName } from '@tbk/auth';
 * 
 * export function Greeting() {
 *   const displayName = useDisplayName();
 *   return <h1>Hello, {displayName || 'Guest'}!</h1>;
 * }
 * ```
 */
export function useDisplayName(): string | null {
  const { profile, user } = useUser();
  return profile?.full_name || user?.user_metadata?.full_name || user?.email || null;
}

/**
 * Hook to get user's avatar URL
 * Returns avatar from profile, user metadata, or null
 * 
 * @returns Avatar URL string or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useAvatarUrl } from '@tbk/auth';
 * 
 * export function Avatar() {
 *   const avatarUrl = useAvatarUrl();
 *   return <img src={avatarUrl || '/default-avatar.png'} alt="User avatar" />;
 * }
 * ```
 */
export function useAvatarUrl(): string | null {
  const { profile, user } = useUser();
  return profile?.avatar_url || user?.user_metadata?.avatar_url || null;
}

/**
 * Hook to get user's role
 * 
 * @returns User role or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useRole } from '@tbk/auth';
 * 
 * export function RoleBadge() {
 *   const role = useRole();
 *   if (!role) return null;
 *   return <span className="badge">{role}</span>;
 * }
 * ```
 */
export function useRole(): Role | null {
  const { role } = useUser();
  return role;
}

/**
 * Hook to get vendor profile (if user is a vendor)
 * 
 * @returns Vendor profile or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useVendorProfile } from '@tbk/auth';
 * 
 * export function VendorInfo() {
 *   const vendor = useVendorProfile();
 *   if (!vendor) return null;
 *   
 *   return (
 *     <div>
 *       <h2>{vendor.business_name}</h2>
 *       <p>Rating: {vendor.rating_average}/5</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVendorProfile(): VendorProfile | null {
  const { vendorProfile } = useUser();
  return vendorProfile;
}

/**
 * Hook to get admin staff profile (if user is admin)
 * 
 * @returns Admin staff profile or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useAdminProfile } from '@tbk/auth';
 * 
 * export function AdminInfo() {
 *   const admin = useAdminProfile();
 *   if (!admin) return null;
 *   
 *   return (
 *     <div>
 *       <p>Role: {admin.role}</p>
 *       <p>Department: {admin.department}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminProfile(): AdminStaffProfile | null {
  const { adminProfile } = useUser();
  return adminProfile;
}
