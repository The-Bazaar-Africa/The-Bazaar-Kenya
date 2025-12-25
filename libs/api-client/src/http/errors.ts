/**
 * API Error Class
 * 
 * Represents errors from API requests with status code, message,
 * optional error code, and additional details.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if this is a client error (4xx).
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this is a server error (5xx).
   */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if this is an authentication error.
   */
  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if this is an authorization error.
   */
  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Check if this is a not found error.
   */
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if this is a validation error.
   */
  get isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  /**
   * Convert to a plain object for serialization.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}
