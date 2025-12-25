/**
 * @fileoverview Supabase client exports for @tbk/auth
 * @module @tbk/auth/clients
 * 
 * This module only exports the browser client by default.
 * Server clients are exported from './server' directly.
 */

// Browser client (for client components)
export {
  createBrowserClient,
  isSupabaseConfigured,
  resetBrowserClient,
  type BrowserClient,
} from './browser';

// NOTE: Server clients are NOT exported here to avoid importing next/headers
// in client components. Import them directly from '@tbk/auth/server'.
