/**
 * Vitest Test Setup
 * 
 * Global setup for API client tests.
 * Mocks fetch and provides test utilities.
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { configureHttpClient } from '../http/client';

// Set default environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

// Mock fetch globally
global.fetch = vi.fn();

// Reset fetch mock before each test
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset HTTP client config
  configureHttpClient({
    baseUrl: 'http://localhost:3000',
    getAccessToken: undefined,
    onUnauthorized: undefined,
    onError: undefined,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Helper to create a mock fetch response.
 */
export function mockFetchResponse<T>(data: T, options?: {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}) {
  const { status = 200, statusText = 'OK', headers = {} } = options ?? {};
  
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({
      'content-type': 'application/json',
      'content-length': JSON.stringify(data).length.toString(),
      ...headers,
    }),
    json: vi.fn().mockResolvedValueOnce(data),
  });
}

/**
 * Helper to create a mock fetch error.
 */
export function mockFetchError(status: number, message: string, code?: string) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    headers: new Headers({
      'content-type': 'application/json',
      'content-length': '100',
    }),
    json: vi.fn().mockResolvedValueOnce({
      success: false,
      error: message,
      code,
    }),
  });
}

/**
 * Helper to create a mock network error.
 */
export function mockNetworkError() {
  (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
    new TypeError('fetch failed')
  );
}
