import Fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// Configuration
import { validateEnvironment } from './config/env.js';
import { getLoggerConfig } from './config/logger.js';
import { registerErrorHandler } from './middleware/errorHandler.js';

// Plugins
import rawBodyPlugin from './plugins/rawBody.js';
import supabasePlugin from './plugins/supabase.js';

// Routes
import { healthRoutes } from './routes/health.js';
import { v1Routes } from './routes/v1/index.js';

// Modules
import { paymentsController } from './modules/payments/index.js';

// Graceful shutdown (P0.4)
import { setupGracefulShutdown, setupSupabaseCleanup } from './lib/graceful-shutdown.js';

export async function buildApp(opts: FastifyServerOptions = {}) {
  // Validate environment variables on boot (fails fast in production)
  validateEnvironment();
  
  // Create Fastify instance with logger configuration
  const app = Fastify({
    ...opts,
    logger: opts.logger ?? getLoggerConfig(),
  });

  // Register error handler first
  await registerErrorHandler(app);

  // Raw body plugin - MUST be registered first for webhook signature verification
  await app.register(rawBodyPlugin);

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable for Swagger UI
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Database plugin - Supabase
  await app.register(supabasePlugin);

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'The Bazaar API',
        description: 'Backend API for The Bazaar marketplace',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Development' },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Products', description: 'Product management endpoints' },
        { name: 'Orders', description: 'Order management endpoints' },
        { name: 'Vendors', description: 'Vendor management endpoints' },
        { name: 'Payments', description: 'Payment processing endpoints (Paystack)' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter your Supabase access token',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(v1Routes, { prefix: '/v1' });
  
  // V2 API (placeholder - coming soon)
  const { v2Routes } = await import('./routes/v2/index.js');
  await app.register(v2Routes, { prefix: '/v2' });

  // Register payment routes (ADR-002)
  await app.register(paymentsController, { prefix: '/payments' });

  // Setup graceful shutdown (P0.4)
  setupGracefulShutdown(app, {
    timeout: 30000, // 30 seconds max wait
    onShutdownStart: () => {
      app.log.info('🛑 Starting graceful shutdown...');
    },
    onShutdownComplete: () => {
      app.log.info('✅ Shutdown complete');
    },
  });

  // Setup Supabase cleanup on close
  setupSupabaseCleanup(app);

  return app;
}
