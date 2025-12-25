/**
 * Graceful Shutdown Handler (P0.4)
 * ==================================
 * Handles graceful shutdown to prevent data loss during deployments.
 * 
 * Features:
 * - Stops accepting new connections on SIGTERM/SIGINT
 * - Waits for in-flight requests to complete
 * - Configurable timeout (default 30 seconds)
 * - Proper cleanup of database connections
 * 
 * @see BACKEND_API_REMEDIATION_PLAN.md - P0.4
 */

import { FastifyInstance } from 'fastify';

interface ShutdownOptions {
  /** Maximum time to wait for graceful shutdown (ms) */
  timeout?: number;
  /** Called before shutdown starts */
  onShutdownStart?: () => void | Promise<void>;
  /** Called after shutdown completes */
  onShutdownComplete?: () => void | Promise<void>;
}

interface ShutdownState {
  isShuttingDown: boolean;
  shutdownStartTime: number | null;
  activeRequests: number;
}

const state: ShutdownState = {
  isShuttingDown: false,
  shutdownStartTime: null,
  activeRequests: 0,
};

/**
 * Get current shutdown state (for health checks)
 */
export function getShutdownState(): ShutdownState {
  return { ...state };
}

/**
 * Check if server is shutting down
 */
export function isShuttingDown(): boolean {
  return state.isShuttingDown;
}

/**
 * Setup graceful shutdown handlers for a Fastify instance
 * 
 * @param app - Fastify instance
 * @param options - Shutdown configuration options
 * 
 * @example
 * ```ts
 * import { setupGracefulShutdown } from './lib/graceful-shutdown.js';
 * 
 * const app = Fastify();
 * // ... register plugins and routes ...
 * 
 * setupGracefulShutdown(app, {
 *   timeout: 30000,
 *   onShutdownStart: () => console.log('Shutdown starting...'),
 * });
 * ```
 */
export function setupGracefulShutdown(
  app: FastifyInstance,
  options: ShutdownOptions = {}
): void {
  const {
    timeout = 30000,
    onShutdownStart,
    onShutdownComplete,
  } = options;

  // Track active requests
  app.addHook('onRequest', async () => {
    state.activeRequests++;
  });

  app.addHook('onResponse', async () => {
    state.activeRequests--;
  });

  // Reject new requests during shutdown
  app.addHook('onRequest', async (_request, reply) => {
    if (state.isShuttingDown) {
      reply.code(503).send({
        error: 'Service Unavailable',
        message: 'Server is shutting down',
      });
    }
  });

  const shutdown = async (signal: string) => {
    if (state.isShuttingDown) {
      app.log.warn(`Shutdown already in progress, ignoring ${signal}`);
      return;
    }

    state.isShuttingDown = true;
    state.shutdownStartTime = Date.now();

    app.log.info(`Received ${signal}, starting graceful shutdown...`);
    app.log.info(`Active requests: ${state.activeRequests}`);

    // Call shutdown start hook
    if (onShutdownStart) {
      try {
        await onShutdownStart();
      } catch (err) {
        app.log.error({ err }, 'Error in onShutdownStart hook');
      }
    }

    // Stop accepting new connections
    app.server.close();

    // Setup timeout for forced shutdown
    const forceShutdownTimer = setTimeout(() => {
      app.log.error(`Forcing shutdown after ${timeout}ms timeout`);
      app.log.error(`${state.activeRequests} requests were abandoned`);
      process.exit(1);
    }, timeout);

    // Wait for in-flight requests to complete
    const waitForRequests = async (): Promise<void> => {
      if (state.activeRequests > 0) {
        app.log.info(`Waiting for ${state.activeRequests} requests to complete...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return waitForRequests();
      }
    };

    try {
      await waitForRequests();
      
      // Close Fastify (this cleans up plugins)
      await app.close();

      clearTimeout(forceShutdownTimer);

      const shutdownDuration = Date.now() - (state.shutdownStartTime || Date.now());
      app.log.info(`Graceful shutdown completed in ${shutdownDuration}ms`);

      // Call shutdown complete hook
      if (onShutdownComplete) {
        try {
          await onShutdownComplete();
        } catch (err) {
          app.log.error({ err }, 'Error in onShutdownComplete hook');
        }
      }

      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Error during graceful shutdown');
      clearTimeout(forceShutdownTimer);
      process.exit(1);
    }
  };

  // Register signal handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    app.log.error({ err }, 'Uncaught exception');
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, 'Unhandled rejection');
    // Don't shutdown on unhandled rejection, just log
  });

  app.log.info('Graceful shutdown handlers registered');
}

/**
 * Fastify plugin for graceful shutdown
 * 
 * @example
 * ```ts
 * await app.register(gracefulShutdownPlugin, { timeout: 30000 });
 * ```
 */
export async function gracefulShutdownPlugin(
  app: FastifyInstance,
  options: ShutdownOptions = {}
): Promise<void> {
  setupGracefulShutdown(app, options);
}

// Add onClose hook for Supabase cleanup
export function setupSupabaseCleanup(app: FastifyInstance): void {
  app.addHook('onClose', async () => {
    if (app.supabase) {
      app.log.info('Cleaning up Supabase connections...');
      try {
        // Remove all realtime subscriptions
        await app.supabase.removeAllChannels();
        app.log.info('Supabase cleanup complete');
      } catch (err) {
        app.log.error({ err }, 'Error cleaning up Supabase');
      }
    }
  });
}
