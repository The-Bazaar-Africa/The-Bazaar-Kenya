/**
 * @fileoverview Browser-side Supabase client for client components
 * @module @tbk/auth/clients/browser
 * 
 * Creates a Supabase client optimized for browser/client-side usage.
 * Uses @supabase/ssr for proper cookie handling in Next.js.
 */

'use client';

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser client type - using any for schema to avoid complex generic issues
 */
export type BrowserClient = SupabaseClient;

/**
 * Check if Supabase credentials are properly configured
 */
function validateCredentials(): { url: string; key: string; isValid: boolean } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isValid =
    url !== '' &&
    key !== '' &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    key.length > 20;

  return { url, key, isValid };
}

/**
 * Singleton instance for browser client
 */
let browserClient: BrowserClient | null = null;

/**
 * Track if we've already warned about missing credentials
 */
let hasWarnedAboutCredentials = false;

/**
 * Creates a Supabase client for browser/client-side usage
 * 
 * Features:
 * - Automatic session persistence via cookies
 * - Token refresh handling
 * - Singleton pattern to prevent multiple instances
 * - Graceful fallback when credentials missing (for development)
 * 
 * @returns Supabase client instance
 */
export function createBrowserClient(): BrowserClient {
  // Return existing instance if available
  if (browserClient) {
    return browserClient;
  }

  const { url, key, isValid } = validateCredentials();

  // Warn once about missing credentials (development mode)
  if (!isValid && typeof window !== 'undefined' && !hasWarnedAboutCredentials) {
    console.warn(
      '⚠️ Supabase credentials not found or invalid.\n' +
        '   The app will work with mock data only.\n' +
        '   Please check your .env.local file has:\n' +
        '   - NEXT_PUBLIC_SUPABASE_URL\n' +
        '   - NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
    hasWarnedAboutCredentials = true;
  }

  // Use placeholder values if credentials are missing (allows app to run in dev)
  const supabaseUrl = isValid ? url : 'https://placeholder.supabase.co';
  const supabaseKey = isValid
    ? key
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

  browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'thebazaar-auth',
    },
    db: {
      schema: 'api',
    },
    global: {
      headers: {
        'x-client-info': '@tbk/auth-browser',
      },
    },
  });

  return browserClient;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const { isValid } = validateCredentials();
  return isValid;
}

/**
 * Resets the browser client singleton
 */
export function resetBrowserClient(): void {
  browserClient = null;
  hasWarnedAboutCredentials = false;
}
