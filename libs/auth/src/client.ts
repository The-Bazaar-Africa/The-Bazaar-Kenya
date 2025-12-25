/**
 * Client-side only exports
 * 
 * This module exports only the browser-safe components that can be used
 * in client components ('use client'). Server-side utilities are in server.ts.
 * 
 * @module @tbk/auth/client
 */

// Browser client
export { createBrowserClient } from './clients/browser';

// Types (safe for both client and server)
export * from './types';

// Hooks (client-only)
export * from './hooks';

// Context and Provider (client-only)
export * from './context';

// Components (client-only)
export * from './components';
