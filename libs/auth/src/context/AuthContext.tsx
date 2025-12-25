/**
 * @fileoverview AuthContext and AuthProvider for React applications
 * @module @tbk/auth/context/AuthContext
 * 
 * Provides authentication state management for React applications.
 * Handles session persistence, token refresh, and profile fetching.
 * 
 * Upgraded from legacy implementation:
 * @see shadcn-ui/src/contexts/AuthContext.tsx
 * 
 * Key improvements:
 * - Uses @supabase/ssr for Next.js 15 SSR compatibility
 * - Fetches and caches user profiles (profile, vendor, admin)
 * - Proper error handling with error state
 * - OAuth support (Google)
 * - TypeScript strict mode compatible
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { AuthProvider } from '@tbk/auth';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>{children}</AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createBrowserClient, isSupabaseConfigured } from '../clients/browser';
import type {
  AuthUser,
  AuthSession,
  AuthError,
  UserProfile,
  VendorProfile,
  AdminStaffProfile,
  SignInData,
  SignUpData,
  OAuthProvider,
} from '../types';
import { ADMIN_ROLES, USER_ROLES } from '../types';
import type { UseAuthReturn } from '../hooks/useAuth';

/**
 * Auth context type - combines state and actions
 */
export type AuthContextType = UseAuthReturn;

/**
 * Auth context - undefined when not within provider
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: ReactNode;
  /** Initial session from server-side (for SSR) */
  initialSession?: AuthSession | null;
  /** Callback when auth state changes */
  onAuthStateChange?: (event: string, session: AuthSession | null) => void;
}

/**
 * AuthProvider component
 * 
 * Wraps your application to provide authentication state and actions.
 * Should be placed at the root of your application (e.g., in layout.tsx).
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AuthProvider } from '@tbk/auth';
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <AuthProvider
 *           onAuthStateChange={(event, session) => {
 *             console.log('Auth event:', event);
 *           }}
 *         >
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AuthProvider({
  children,
  initialSession,
  onAuthStateChange,
}: AuthProviderProps) {
  // Core auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(initialSession || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminStaffProfile | null>(null);

  // Get Supabase client
  const supabase = useMemo(() => createBrowserClient(), []);

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          return null;
        }

        return data as UserProfile;
      } catch (err) {
        console.error('Error fetching profile:', err);
        return null;
      }
    },
    [supabase]
  );

  /**
   * Fetch vendor profile if user is a vendor
   */
  const fetchVendorProfile = useCallback(
    async (profileId: string): Promise<VendorProfile | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('vendors')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        if (fetchError) {
          // Not an error if vendor doesn't exist
          if (fetchError.code !== 'PGRST116') {
            console.error('Error fetching vendor profile:', fetchError);
          }
          return null;
        }

        return data as VendorProfile;
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        return null;
      }
    },
    [supabase]
  );

  /**
   * Fetch admin staff profile if user is an admin
   */
  const fetchAdminProfile = useCallback(
    async (profileId: string): Promise<AdminStaffProfile | null> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('admin_staff')
          .select('*')
          .eq('profile_id', profileId)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          // Not an error if admin doesn't exist
          if (fetchError.code !== 'PGRST116') {
            console.error('Error fetching admin profile:', fetchError);
          }
          return null;
        }

        return data as AdminStaffProfile;
      } catch (err) {
        console.error('Error fetching admin profile:', err);
        return null;
      }
    },
    [supabase]
  );

  /**
   * Load all user data (profile, vendor, admin)
   */
  const loadUserData = useCallback(
    async (authUser: AuthUser) => {
      const userProfile = await fetchProfile(authUser.id);
      setProfile(userProfile);

      if (userProfile) {
        // Fetch vendor profile if user is a vendor
        if (userProfile.role === USER_ROLES.VENDOR) {
          const vendor = await fetchVendorProfile(userProfile.id);
          setVendorProfile(vendor);
        } else {
          setVendorProfile(null);
        }

        // Fetch admin profile if user has admin role
        const adminRoles = Object.values(ADMIN_ROLES);
        if (adminRoles.includes(userProfile.role as typeof adminRoles[number])) {
          const admin = await fetchAdminProfile(userProfile.id);
          setAdminProfile(admin);
        } else {
          setAdminProfile(null);
        }
      }
    },
    [fetchProfile, fetchVendorProfile, fetchAdminProfile]
  );

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession) {
          setSession(currentSession as unknown as AuthSession);
          setUser(currentSession.user as unknown as AuthUser);
          await loadUserData(currentSession.user as unknown as AuthUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError({
          message: 'Failed to initialize authentication',
          code: 'AUTH_INIT_ERROR',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Update session and user
      setSession(currentSession as unknown as AuthSession | null);
      setUser(currentSession?.user as unknown as AuthUser | null);

      // Load user data if signed in
      if (currentSession?.user) {
        await loadUserData(currentSession.user as unknown as AuthUser);
      } else {
        // Clear profiles on sign out
        setProfile(null);
        setVendorProfile(null);
        setAdminProfile(null);
      }

      // Call external callback if provided
      onAuthStateChange?.(event, currentSession as unknown as AuthSession | null);

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadUserData, onAuthStateChange]);

  // ============================================
  // AUTH ACTIONS
  // ============================================

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (data: SignInData): Promise<{ error: Error | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          const authError: AuthError = {
            message: signInError.message,
            code: signInError.name,
            status: signInError.status,
          };
          setError(authError);
          return { error: new Error(signInError.message) };
        }

        return { error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
        setError({ message: errorMessage, code: 'AUTH_SIGNIN_ERROR' });
        return { error: new Error(errorMessage) };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (data: SignUpData): Promise<{ error: Error | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role || 'customer',
              phone: data.phone,
            },
          },
        });

        if (signUpError) {
          const authError: AuthError = {
            message: signUpError.message,
            code: signUpError.name,
            status: signUpError.status,
          };
          setError(authError);
          return { error: new Error(signUpError.message) };
        }

        return { error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
        setError({ message: errorMessage, code: 'AUTH_SIGNUP_ERROR' });
        return { error: new Error(errorMessage) };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Sign in with OAuth provider
   */
  const signInWithOAuth = useCallback(
    async (
      provider: OAuthProvider,
      options?: { redirectTo?: string; scopes?: string }
    ): Promise<{ error: Error | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
            scopes: options?.scopes,
          },
        });

        if (oauthError) {
          const authError: AuthError = {
            message: oauthError.message,
            code: oauthError.name,
          };
          setError(authError);
          return { error: new Error(oauthError.message) };
        }

        return { error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OAuth sign in failed';
        setError({ message: errorMessage, code: 'AUTH_OAUTH_ERROR' });
        return { error: new Error(errorMessage) };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setVendorProfile(null);
      setAdminProfile(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Reset password
   */
  const resetPassword = useCallback(
    async (email: string, redirectTo?: string): Promise<{ error: Error | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
        });

        if (resetError) {
          const authError: AuthError = {
            message: resetError.message,
            code: resetError.name,
          };
          setError(authError);
          return { error: new Error(resetError.message) };
        }

        return { error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
        setError({ message: errorMessage, code: 'AUTH_RESET_ERROR' });
        return { error: new Error(errorMessage) };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Update password
   */
  const updatePassword = useCallback(
    async (newPassword: string): Promise<{ error: Error | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          const authError: AuthError = {
            message: updateError.message,
            code: updateError.name,
          };
          setError(authError);
          return { error: new Error(updateError.message) };
        }

        return { error: null };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password update failed';
        setError({ message: errorMessage, code: 'AUTH_UPDATE_ERROR' });
        return { error: new Error(errorMessage) };
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return;
      }

      if (data.session) {
        setSession(data.session as unknown as AuthSession);
        setUser(data.session.user as unknown as AuthUser);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  }, [supabase]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const isAuthenticated = !!user && !!session;

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    const adminRoles = Object.values(ADMIN_ROLES);
    return adminRoles.includes(profile.role as typeof adminRoles[number]);
  }, [profile]);

  const isSuperAdmin = useMemo(() => {
    return profile?.role === ADMIN_ROLES.SUPER_ADMIN;
  }, [profile]);

  const isVendor = useMemo(() => {
    return profile?.role === USER_ROLES.VENDOR;
  }, [profile]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = useMemo(
    () => ({
      // State
      user,
      session,
      profile,
      vendorProfile,
      adminProfile,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isVendor,
      error,

      // Actions
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
      refreshSession,
      clearError,
    }),
    [
      user,
      session,
      profile,
      vendorProfile,
      adminProfile,
      isLoading,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isVendor,
      error,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      resetPassword,
      updatePassword,
      refreshSession,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
