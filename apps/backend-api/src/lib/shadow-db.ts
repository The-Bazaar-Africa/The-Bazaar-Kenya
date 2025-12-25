/**
 * Shadow Database Mode (P0.3)
 * ============================
 * Infrastructure for running old and new database implementations in parallel.
 * This allows safe validation of the shared database library before cutover.
 * 
 * How it works:
 * 1. When shadow mode is enabled, both implementations execute
 * 2. The "primary" (old) result is always returned to the user
 * 3. Results are compared asynchronously
 * 4. Mismatches are logged for investigation
 * 
 * Environment Variables:
 * - FF_BACKEND_ENABLE_SHADOW_MODE: Enable shadow mode
 * - FF_BACKEND_USE_SHARED_DATABASE: Use shared DB as primary
 * 
 * @see BACKEND_API_REMEDIATION_PLAN.md - P0.3
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Shadow mode metrics
interface ShadowMetrics {
  totalQueries: number;
  matches: number;
  mismatches: number;
  errors: number;
  lastMismatch: string | null;
  lastError: string | null;
}

const metrics: ShadowMetrics = {
  totalQueries: 0,
  matches: 0,
  mismatches: 0,
  errors: 0,
  lastMismatch: null,
  lastError: null,
};

/**
 * Logger interface (uses console, can be replaced with Fastify logger)
 */
interface Logger {
  info: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
}

const defaultLogger: Logger = {
  info: (msg, data) => console.info(`[SHADOW] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[SHADOW_ERROR] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[SHADOW_WARN] ${msg}`, data || ''),
};

let logger: Logger = defaultLogger;

/**
 * Set a custom logger (e.g., Fastify logger)
 */
export function setShadowLogger(customLogger: Logger): void {
  logger = customLogger;
}

/**
 * Check if shadow mode is enabled
 */
export function isShadowModeEnabled(): boolean {
  return process.env.FF_BACKEND_ENABLE_SHADOW_MODE === 'true';
}

/**
 * Check if shared database is the primary
 */
export function isSharedDbPrimary(): boolean {
  return process.env.FF_BACKEND_USE_SHARED_DATABASE === 'true';
}

/**
 * Deep comparison of two objects
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  
  if (aKeys.length !== bKeys.length) return false;
  
  return aKeys.every(key => deepEqual(aObj[key], bObj[key]));
}

/**
 * Truncate large objects for logging
 */
function truncateForLog(obj: unknown, maxLength = 500): string {
  const str = JSON.stringify(obj);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '... (truncated)';
}

/**
 * Execute a query with shadow mode
 * 
 * @param queryFn - Function that executes the query given a client
 * @param localClient - The local (old) Supabase client
 * @param sharedClient - The shared library Supabase client (optional)
 * @param context - Description of the query for logging
 * @returns The primary result (local unless USE_SHARED_DATABASE is true)
 * 
 * @example
 * ```ts
 * const result = await shadowQuery(
 *   async (client) => {
 *     const { data, error } = await client.from('users').select('*').eq('id', userId);
 *     if (error) throw error;
 *     return data;
 *   },
 *   app.supabase,
 *   sharedDbClient,
 *   'getUserById'
 * );
 * ```
 */
export async function shadowQuery<T>(
  queryFn: (client: SupabaseClient) => Promise<T>,
  localClient: SupabaseClient,
  sharedClient: SupabaseClient | null,
  context: string
): Promise<T> {
  metrics.totalQueries++;
  
  const useSharedAsPrimary = isSharedDbPrimary();
  const shadowEnabled = isShadowModeEnabled();
  
  // If shared DB is not available or shadow mode disabled, just use local
  if (!sharedClient || !shadowEnabled) {
    return queryFn(localClient);
  }
  
  // Determine primary and shadow clients
  const primaryClient = useSharedAsPrimary ? sharedClient : localClient;
  const shadowClient = useSharedAsPrimary ? localClient : sharedClient;
  
  // Execute primary query (this result is returned)
  const primaryResult = await queryFn(primaryClient);
  
  // Execute shadow query asynchronously (don't block the response)
  setImmediate(async () => {
    try {
      const shadowResult = await queryFn(shadowClient);
      
      // Compare results
      if (deepEqual(primaryResult, shadowResult)) {
        metrics.matches++;
        logger.info('SHADOW_MATCH', { context });
      } else {
        metrics.mismatches++;
        metrics.lastMismatch = new Date().toISOString();
        
        logger.error('SHADOW_MISMATCH', {
          context,
          primary: truncateForLog(primaryResult),
          shadow: truncateForLog(shadowResult),
          primarySource: useSharedAsPrimary ? 'shared' : 'local',
        });
      }
    } catch (err) {
      metrics.errors++;
      metrics.lastError = new Date().toISOString();
      
      logger.error('SHADOW_ERROR', {
        context,
        error: err instanceof Error ? err.message : String(err),
        primarySource: useSharedAsPrimary ? 'shared' : 'local',
      });
    }
  });
  
  return primaryResult;
}

/**
 * Execute a mutation with shadow mode (write operations)
 * 
 * Unlike queries, mutations are NOT executed on the shadow client.
 * This prevents duplicate writes and data inconsistency.
 * Shadow mode for mutations only logs that a mutation occurred.
 * 
 * @param mutationFn - Function that executes the mutation
 * @param client - The Supabase client to use
 * @param context - Description of the mutation for logging
 * @returns The mutation result
 */
export async function shadowMutation<T>(
  mutationFn: (client: SupabaseClient) => Promise<T>,
  client: SupabaseClient,
  context: string
): Promise<T> {
  const shadowEnabled = isShadowModeEnabled();
  
  if (shadowEnabled) {
    logger.info('SHADOW_MUTATION', {
      context,
      client: isSharedDbPrimary() ? 'shared' : 'local',
    });
  }
  
  return mutationFn(client);
}

/**
 * Get current shadow mode metrics
 */
export function getShadowMetrics(): ShadowMetrics {
  return { ...metrics };
}

/**
 * Reset shadow mode metrics (useful for testing)
 */
export function resetShadowMetrics(): void {
  metrics.totalQueries = 0;
  metrics.matches = 0;
  metrics.mismatches = 0;
  metrics.errors = 0;
  metrics.lastMismatch = null;
  metrics.lastError = null;
}

/**
 * Get shadow mode status for health checks
 */
export function getShadowStatus() {
  return {
    enabled: isShadowModeEnabled(),
    primarySource: isSharedDbPrimary() ? 'shared' : 'local',
    metrics: getShadowMetrics(),
  };
}
