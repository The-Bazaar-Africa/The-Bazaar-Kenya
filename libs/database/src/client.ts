/**
 * Supabase Client Factory
 * ========================
 * Type-safe Supabase client creation for different environments.
 *
 * @see ADR-001: Backend Authority
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from './types';
import type { cookies } from 'next/headers';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client for browser/client-side usage.
 * Uses the anon key which is safe to expose.
 */
export function createClientBrowser(): TypedSupabaseClient {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Create a Supabase client for server-side usage in Next.js.
 * Requires the cookies function from next/headers.
 */
export function createClientServer(
  cookieStore: ReturnType<typeof cookies>
): TypedSupabaseClient {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client for backend-api usage.
 * Uses the service role key - NEVER expose this in frontend code.
 *
 * @see ADR-001: Backend Authority - Only backend-api should use this
 */
export function createAdminClient(): TypedSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Admin client should only be used in backend-api.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client for middleware usage.
 * Handles cookie operations for session management.
 */
export function createClientMiddleware(
  request: Request,
  response: Response
): TypedSupabaseClient {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') || '';
          return cookieHeader.split(';').map((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            return { name, value: rest.join('=') };
          });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append(
              'Set-Cookie',
              `${name}=${value}; Path=${options?.path || '/'}; ${
                options?.httpOnly ? 'HttpOnly;' : ''
              } ${options?.secure ? 'Secure;' : ''} SameSite=${
                options?.sameSite || 'Lax'
              }`
            );
          });
        },
      },
    }
  );
}
