/**
 * @fileoverview Server-side Supabase clients for SSR and API routes
 * @module @tbk/auth/clients/server
 * 
 * Provides server-side Supabase clients for:
 * - Server Components (read-only session)
 * - API Routes (full auth capabilities)
 * - Middleware (session refresh)
 * - Service role operations (admin tasks)
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server client type - generic Supabase client
 */
export type ServerClient = SupabaseClient;

/**
 * Service client type (admin access)
 */
export type ServiceClient = SupabaseClient;

/**
 * Cookie interface for middleware
 */
interface CookieOptions {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

/**
 * Get Supabase URL from environment
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
}

/**
 * Get Supabase anon key from environment
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
}

/**
 * Get Supabase service role key from environment
 */
function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return key;
}

/**
 * Create a Supabase client for Server Components
 * 
 * This client is read-only and uses the current user's session.
 * Use this in Server Components to fetch data for the current user.
 * 
 * @returns Supabase server client
 */
export async function createServerClient(): Promise<ServerClient> {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptions[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
      db: {
        schema: 'api',
      },
    }
  ) as ServerClient;
}

/**
 * Create a Supabase client with service role (admin) privileges
 * 
 * WARNING: This client bypasses RLS! Only use for admin operations
 * that need to access all data regardless of user permissions.
 * 
 * @returns Supabase service client with admin privileges
 */
export function createServiceClient(): ServiceClient {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'api',
      },
    }
  ) as unknown as ServiceClient;
}

/**
 * Create a Supabase client for Next.js middleware
 * 
 * This client can refresh sessions and set cookies.
 * Use this in middleware.ts to keep sessions alive.
 * 
 * @param request - Object with cookies.getAll method
 * @param response - Object with cookies.set method
 * @returns Supabase middleware client
 */
export function createMiddlewareClient(
  request: { cookies: { getAll: () => Array<{ name: string; value: string }> } },
  response: { cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void } }
): ServerClient {
  return createSupabaseServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieOptions[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      db: {
        schema: 'api',
      },
    }
  ) as ServerClient;
}
