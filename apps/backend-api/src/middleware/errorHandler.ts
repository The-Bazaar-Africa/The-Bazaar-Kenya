/**
 * Centralized Error Handler Middleware
 * 
 * Converts all errors to standardized API responses.
 * Logs errors appropriately and hides internal details in production.
 */

import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError, isAppError } from '../config/errors.js';
import { isProduction, isDevelopment } from '../config/env.js';

/**
 * Standard API error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    path: string;
    method: string;
  };
}

/**
 * Build standardized error response
 */
function buildErrorResponse(
  error: AppError | FastifyError | Error,
  request: FastifyRequest
): ErrorResponse {
  const isAppErr = isAppError(error);
  const isFastifyErr = 'statusCode' in error;
  
  // Determine error details
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let statusCode = 500;
  let details: Record<string, unknown> | undefined;

  if (isAppErr) {
    code = error.code;
    message = error.message;
    statusCode = error.statusCode;
    details = error.details;
  } else if (isFastifyErr) {
    const fastifyError = error as FastifyError;
    code = fastifyError.code || 'FASTIFY_ERROR';
    message = fastifyError.message;
    statusCode = fastifyError.statusCode || 500;
  } else {
    message = error.message || message;
  }

  // In production, hide internal error details
  if (isProduction() && statusCode >= 500) {
    message = 'An unexpected error occurred';
    details = undefined;
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.id,
      path: request.url,
      method: request.method,
    },
  };

  // Include stack trace in development
  if (isDevelopment() && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Log error with appropriate level
 */
function logError(
  error: Error,
  request: FastifyRequest,
  statusCode: number
): void {
  const logData = {
    err: error,
    requestId: request.id,
    method: request.method,
    url: request.url,
    statusCode,
  };

  if (statusCode >= 500) {
    request.log.error(logData, 'Internal server error');
  } else if (statusCode >= 400) {
    request.log.warn(logData, 'Client error');
  }
}

/**
 * Register error handler on Fastify instance
 */
export async function registerErrorHandler(app: FastifyInstance): Promise<void> {
  // Custom error handler
  app.setErrorHandler((error, request, reply) => {
    // Normalize error to known type
    const err = error as Error | FastifyError | AppError;
    const isAppErr = isAppError(err);
    const statusCode = isAppErr 
      ? err.statusCode 
      : ('statusCode' in err ? (err as FastifyError).statusCode || 500 : 500);

    // Log the error
    logError(err, request, statusCode);

    // Build and send response
    const response = buildErrorResponse(err, request);
    
    return reply.status(statusCode).send(response);
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        path: request.url,
        method: request.method,
      },
    };

    return reply.status(404).send(response);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    app.log.fatal({ err: error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    app.log.error({ err: reason }, 'Unhandled rejection');
  });
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and forwards to error handler
 */
export function asyncHandler<T>(
  fn: (request: FastifyRequest, reply: FastifyReply) => Promise<T>
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<T> => {
    return await fn(request, reply);
  };
}
