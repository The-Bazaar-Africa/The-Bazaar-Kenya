import { FastifyInstance } from 'fastify';

/**
 * Health Check Routes
 * ====================
 * Provides health check endpoints for load balancers and monitoring.
 * 
 * Endpoints:
 * - GET /health - Shallow health (for load balancers, fast)
 * - GET /health/ready - Readiness check (Supabase connection)
 * - GET /health/deep - Deep health with DB metrics and feature flags (P0.2)
 * 
 * @see BACKEND_API_REMEDIATION_PLAN.md - P0.2
 */

interface DeepHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime_seconds: number;
  database: {
    connected: boolean;
    latency_ms: number;
    using_shared_lib: boolean;
  };
  flags: {
    USE_SHARED_DATABASE: boolean;
    USE_SHARED_TYPES: boolean;
    USE_SHARED_CONFIG: boolean;
    ENABLE_SHADOW_MODE: boolean;
    SHARED_DB_PERCENTAGE: number;
  };
  memory: {
    heap_used_mb: number;
    heap_total_mb: number;
    external_mb: number;
  };
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              version: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
      };
    }
  );

  app.get(
    '/health/ready',
    {
      schema: {
        tags: ['Health'],
        summary: 'Readiness check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              ready: { type: 'boolean' },
              checks: {
                type: 'object',
                properties: {
                  supabase: { type: 'boolean' },
                },
              },
            },
          },
          503: {
            type: 'object',
            properties: {
              ready: { type: 'boolean' },
              checks: {
                type: 'object',
                properties: {
                  supabase: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      // Check Supabase connection using auth health check
      let supabaseOk = false;
      let checkError = null;
      
      try {
        // Check if Supabase auth service is reachable
        const { error } = await app.supabase.auth.getSession();
        // No error means Supabase is reachable (session will be null for unauthenticated)
        supabaseOk = !error;
        if (error) {
          checkError = error.message;
        }
      } catch (err) {
        supabaseOk = false;
        checkError = String(err);
      }

      const ready = supabaseOk;

      if (!ready) {
        reply.code(503);
      }

      return {
        ready,
        checks: {
          supabase: supabaseOk
        },
        ...(checkError && { error: checkError }),
      };
    }
  );

  /**
   * Deep Health Check (P0.2)
   * ========================
   * Returns comprehensive health information including:
   * - Database connectivity and latency
   * - Feature flag states
   * - Memory usage
   * - Uptime
   * 
   * Use this endpoint for monitoring dashboards and debugging.
   */
  app.get(
    '/health/deep',
    {
      schema: {
        tags: ['Health'],
        summary: 'Deep health check with DB metrics and feature flags (P0.2)',
        description: 'Returns comprehensive health information for monitoring and debugging',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
              timestamp: { type: 'string' },
              version: { type: 'string' },
              uptime_seconds: { type: 'number' },
              database: {
                type: 'object',
                properties: {
                  connected: { type: 'boolean' },
                  latency_ms: { type: 'number' },
                  using_shared_lib: { type: 'boolean' },
                },
              },
              flags: {
                type: 'object',
                properties: {
                  USE_SHARED_DATABASE: { type: 'boolean' },
                  USE_SHARED_TYPES: { type: 'boolean' },
                  USE_SHARED_CONFIG: { type: 'boolean' },
                  ENABLE_SHADOW_MODE: { type: 'boolean' },
                  SHARED_DB_PERCENTAGE: { type: 'number' },
                },
              },
              memory: {
                type: 'object',
                properties: {
                  heap_used_mb: { type: 'number' },
                  heap_total_mb: { type: 'number' },
                  external_mb: { type: 'number' },
                },
              },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply): Promise<DeepHealthResponse> => {
      // Get backend feature flags
      // Note: Will use shared lib once P5 tsconfig is fixed
      const flags = {
        USE_SHARED_DATABASE: process.env.FF_BACKEND_USE_SHARED_DATABASE === 'true',
        USE_SHARED_TYPES: process.env.FF_BACKEND_USE_SHARED_TYPES === 'true',
        USE_SHARED_CONFIG: process.env.FF_BACKEND_USE_SHARED_CONFIG === 'true',
        ENABLE_SHADOW_MODE: process.env.FF_BACKEND_ENABLE_SHADOW_MODE === 'true',
        SHARED_DB_PERCENTAGE: parseInt(process.env.FF_BACKEND_SHARED_DB_PERCENTAGE || '0', 10),
      };

      // Measure database latency
      let dbConnected = false;
      let dbLatency = 0;
      
      try {
        const startTime = Date.now();
        const { error } = await app.supabase.auth.getSession();
        dbLatency = Date.now() - startTime;
        dbConnected = !error;
      } catch (err) {
        app.log.error({ err }, 'Health check DB error');
        dbConnected = false;
      }

      // Get memory usage
      const memUsage = process.memoryUsage();

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (!dbConnected) {
        status = 'unhealthy';
        reply.code(503);
      } else if (dbLatency > 500) {
        status = 'degraded';
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        uptime_seconds: Math.floor((Date.now() - serverStartTime) / 1000),
        database: {
          connected: dbConnected,
          latency_ms: dbLatency,
          using_shared_lib: flags.USE_SHARED_DATABASE,
        },
        flags,
        memory: {
          heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
          heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
          external_mb: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
        },
      };
    }
  );
}

