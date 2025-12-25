/**
 * @fileoverview useSession hook for accessing session data
 * @module @tbk/auth/hooks/useSession
 * 
 * Provides access to the current authentication session including
 * tokens, expiry information, and session refresh capabilities.
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useSession } from '@tbk/auth';
 * 
 * export function SessionInfo() {
 *   const { session, isExpired, expiresAt } = useSession();
 *   
 *   if (!session) return <p>No active session</p>;
 *   
 *   return (
 *     <div>
 *       <p>Session expires: {expiresAt?.toLocaleString()}</p>
 *       {isExpired && <p>Session expired - please refresh</p>}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { AuthSession } from '../types';

/**
 * Session data interface
 */
export interface UseSessionReturn {
  /** Current session object */
  session: AuthSession | null;
  /** Access token for API calls */
  accessToken: string | null;
  /** Refresh token for session renewal */
  refreshToken: string | null;
  /** Session expiry timestamp */
  expiresAt: Date | null;
  /** Time until session expires (in seconds) */
  expiresIn: number | null;
  /** Whether session has expired */
  isExpired: boolean;
  /** Whether session is about to expire (within 5 minutes) */
  isExpiringSoon: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Whether a valid session exists */
  hasSession: boolean;
  /** Refresh the current session */
  refreshSession: () => Promise<void>;
}

/**
 * Hook to access session data and token information
 * 
 * @returns Session data including tokens and expiry information
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useSession } from '@tbk/auth';
 * 
 * export function ApiClient() {
 *   const { accessToken, isExpired, refreshSession } = useSession();
 *   
 *   const fetchData = async () => {
 *     if (isExpired) {
 *       await refreshSession();
 *     }
 *     
 *     const response = await fetch('/api/data', {
 *       headers: {
 *         Authorization: `Bearer ${accessToken}`,
 *       },
 *     });
 *     return response.json();
 *   };
 *   
 *   // ...
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const { session, isLoading, refreshSession } = useAuth();

  const sessionData = useMemo(() => {
    if (!session) {
      return {
        session: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        expiresIn: null,
        isExpired: false,
        isExpiringSoon: false,
        hasSession: false,
      };
    }

    const now = Date.now() / 1000; // Current time in seconds
    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : session.expires_in
        ? new Date(Date.now() + session.expires_in * 1000)
        : null;

    const expiresIn = session.expires_at
      ? session.expires_at - now
      : session.expires_in || null;

    const isExpired = expiresIn !== null && expiresIn <= 0;
    const isExpiringSoon = expiresIn !== null && expiresIn > 0 && expiresIn <= 300; // 5 minutes

    return {
      session,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt,
      expiresIn: expiresIn !== null ? Math.max(0, Math.floor(expiresIn)) : null,
      isExpired,
      isExpiringSoon,
      hasSession: true,
    };
  }, [session]);

  return {
    ...sessionData,
    isLoading,
    refreshSession,
  };
}

/**
 * Hook to get the access token
 * Convenient shorthand for API calls
 * 
 * @returns Access token string or null
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useAccessToken } from '@tbk/auth';
 * 
 * export function useApiClient() {
 *   const accessToken = useAccessToken();
 *   
 *   return {
 *     fetch: async (url: string) => {
 *       return fetch(url, {
 *         headers: accessToken
 *           ? { Authorization: `Bearer ${accessToken}` }
 *           : {},
 *       });
 *     },
 *   };
 * }
 * ```
 */
export function useAccessToken(): string | null {
  const { accessToken } = useSession();
  return accessToken;
}

/**
 * Hook to check if session is valid
 * 
 * @returns Boolean indicating if session is valid (exists and not expired)
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useHasValidSession } from '@tbk/auth';
 * 
 * export function ProtectedAction() {
 *   const hasValidSession = useHasValidSession();
 *   
 *   if (!hasValidSession) {
 *     return <p>Please sign in to continue</p>;
 *   }
 *   
 *   return <button>Perform Action</button>;
 * }
 * ```
 */
export function useHasValidSession(): boolean {
  const { hasSession, isExpired } = useSession();
  return hasSession && !isExpired;
}

/**
 * Hook to get session expiry information
 * Useful for displaying countdown or refresh prompts
 * 
 * @returns Object with expiry information
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { useSessionExpiry } from '@tbk/auth';
 * 
 * export function SessionTimer() {
 *   const { expiresIn, isExpiringSoon, refreshSession } = useSessionExpiry();
 *   
 *   if (isExpiringSoon) {
 *     return (
 *       <div>
 *         <p>Session expires in {expiresIn} seconds</p>
 *         <button onClick={refreshSession}>Extend Session</button>
 *       </div>
 *     );
 *   }
 *   
 *   return null;
 * }
 * ```
 */
export function useSessionExpiry(): {
  expiresAt: Date | null;
  expiresIn: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  refreshSession: () => Promise<void>;
} {
  const { expiresAt, expiresIn, isExpired, isExpiringSoon, refreshSession } = useSession();
  return { expiresAt, expiresIn, isExpired, isExpiringSoon, refreshSession };
}
