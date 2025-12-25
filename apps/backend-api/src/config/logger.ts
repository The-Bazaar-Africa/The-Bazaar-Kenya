/**
 * Logger Configuration
 * 
 * Centralized logging using Pino (Fastify's built-in logger).
 * Provides structured JSON logging in production and pretty logs in development.
 */

import { FastifyServerOptions } from 'fastify';
import { isDevelopment, isTest, getEnv } from './env.js';

/**
 * Get Pino logger configuration based on environment
 */
export function getLoggerConfig(): FastifyServerOptions['logger'] {
  // Disable logging in tests
  if (isTest()) {
    return false;
  }

  // Pretty printing in development
  if (isDevelopment()) {
    return {
      level: getEnv().LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    };
  }

  // Structured JSON logging in production
  return {
    level: getEnv().LOG_LEVEL,
    formatters: {
      level: (label) => ({ level: label }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        host: bindings.hostname,
        node_version: process.version,
      }),
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    base: {
      service: 'backend-api',
      version: process.env.npm_package_version || '0.1.0',
    },
  };
}

/**
 * Create a child logger with additional context
 */
export function createLogger(baseLogger: unknown, context: Record<string, unknown>) {
  if (typeof baseLogger === 'object' && baseLogger !== null && 'child' in baseLogger) {
    return (baseLogger as { child: (ctx: Record<string, unknown>) => unknown }).child(context);
  }
  return baseLogger;
}

/**
 * Log levels for different scenarios
 */
export const LogLevel = {
  /** Trace level for detailed debugging */
  TRACE: 'trace',
  /** Debug information for development */
  DEBUG: 'debug',
  /** General information */
  INFO: 'info',
  /** Warning - something unexpected but not critical */
  WARN: 'warn',
  /** Error - operation failed */
  ERROR: 'error',
  /** Fatal - application cannot continue */
  FATAL: 'fatal',
} as const;
