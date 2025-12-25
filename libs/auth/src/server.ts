/**
 * Server-side only exports
 * 
 * This module exports server-side utilities that require Next.js server APIs
 * like cookies(). These should only be used in Server Components, Route Handlers,
 * and Server Actions.
 * 
 * @module @tbk/auth/server
 */

// Server clients
export {
  createServerClient,
  createServiceClient,
  createMiddlewareClient,
} from './clients/server';

// Types (safe for both client and server)
export * from './types';

// Middleware utilities
export * from './middleware';
