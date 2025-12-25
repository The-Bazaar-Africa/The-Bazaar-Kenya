/**
 * @tbk/database
 * ====================
 * Type-safe database access layer for The Bazaar platform.
 *
 * This library provides:
 * - Type-safe Supabase client factories
 * - Database schema types
 * - Query functions for common operations
 *
 * @see ADR-001: Backend Authority
 */

// Database types
export * from './types';

// Client factories
export {
  createClientBrowser,
  createClientServer,
  createAdminClient,
  createClientMiddleware,
  type TypedSupabaseClient,
} from './client';

// Query functions
export * from './queries';
