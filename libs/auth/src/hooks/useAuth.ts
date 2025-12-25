/**
 * @fileoverview useAuth hook for authentication state and actions
 * @module @tbk/auth/hooks/useAuth
 * 
 * Provides access to authentication state and actions within React components.
 * Must be used within an AuthProvider.
 * 
 * Upgraded from legacy implementation:
 * @see shadcn-ui/src/contexts/AuthContext.tsx
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useAuth } from '@tbk/auth';
 * 
 * export function LoginButton() {
 *   const { signIn, isLoading, error } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     await signIn({ email: 'user@example.com', password: 'password' });
 *   };
 *   
 *   return (
 *     <button onClick={handleLogin} disabled={isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign In'}
 *     </button>
 *   );
 * }
 * ```
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthState, SignInData, SignUpData, OAuthProvider } from '../types';

/**
 * Auth actions interface
 */
export interface AuthActions {
  /**
   * Sign in with email and password
   */
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;

  /**
   * Sign up with email and password
   */
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;

  /**
   * Sign in with OAuth provider (Google, Apple, etc.)
   */
  signInWithOAuth: (provider: OAuthProvider, options?: {
    redirectTo?: string;
    scopes?: string;
  }) => Promise<{ error: Error | null }>;

  /**
   * Sign out the current user
   */
  signOut: () => Promise<void>;

  /**
   * Send password reset email
   */
  resetPassword: (email: string, redirectTo?: string) => Promise<{ error: Error | null }>;

  /**
   * Update user password
   */
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;

  /**
   * Refresh the current session
   */
  refreshSession: () => Promise<void>;

  /**
   * Clear any auth errors
   */
  clearError: () => void;
}

/**
 * Combined auth state and actions
 */
export interface UseAuthReturn extends AuthState, AuthActions {}

/**
 * Hook to access authentication state and actions
 * 
 * @returns Authentication state and action methods
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useAuth } from '@tbk/auth';
 * 
 * export function UserProfile() {
 *   const { user, profile, isAuthenticated, signOut } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <p>Please sign in</p>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {profile?.full_name || user?.email}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider.\n' +
        'Wrap your app with <AuthProvider> in your root layout.'
    );
  }

  return context;
}

/**
 * Hook to check if user is authenticated
 * Simpler alternative when you only need auth status
 * 
 * @returns Boolean indicating if user is authenticated
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useIsAuthenticated } from '@tbk/auth';
 * 
 * export function ConditionalContent() {
 *   const isAuthenticated = useIsAuthenticated();
 *   
 *   return isAuthenticated ? <PrivateContent /> : <PublicContent />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user has admin privileges
 * 
 * @returns Boolean indicating if user is an admin
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useIsAdmin } from '@tbk/auth';
 * 
 * export function AdminOnlyButton() {
 *   const isAdmin = useIsAdmin();
 *   
 *   if (!isAdmin) return null;
 *   
 *   return <button>Admin Action</button>;
 * }
 * ```
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}

/**
 * Hook to check if user is a vendor
 * 
 * @returns Boolean indicating if user is a vendor
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useIsVendor } from '@tbk/auth';
 * 
 * export function VendorDashboardLink() {
 *   const isVendor = useIsVendor();
 *   
 *   if (!isVendor) return null;
 *   
 *   return <Link href="/vendor/dashboard">Vendor Dashboard</Link>;
 * }
 * ```
 */
export function useIsVendor(): boolean {
  const { isVendor } = useAuth();
  return isVendor;
}

/**
 * Hook to get auth loading state
 * Useful for showing loading indicators
 * 
 * @returns Boolean indicating if auth is loading
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

/**
 * Hook to get auth error state
 * 
 * @returns Current auth error or null
 */
export function useAuthError(): Error | null {
  const { error } = useAuth();
  return error ? new Error(error.message) : null;
}
