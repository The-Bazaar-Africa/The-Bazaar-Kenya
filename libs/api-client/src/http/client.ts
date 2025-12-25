/**
 * The Bazaar - HTTP Client
 * ========================
 * 
 * Type-safe HTTP client for REST API communication.
 * Handles authentication, error handling, and request/response typing.
 */

import { ApiError } from './errors';

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface HttpClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
  onError?: (error: ApiError) => void;
}

let globalConfig: HttpClientConfig = {
  baseUrl: typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')
    : (process.env.API_URL ?? 'http://localhost:3000'),
};

/**
 * Configure the HTTP client globally.
 */
export function configureHttpClient(config: Partial<HttpClientConfig>) {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current HTTP client configuration.
 */
export function getHttpClientConfig(): HttpClientConfig {
  return globalConfig;
}

// =============================================================================
// REQUEST OPTIONS
// =============================================================================

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  requireAuth?: boolean;
  timeout?: number;
}

// =============================================================================
// HTTP CLIENT
// =============================================================================

/**
 * Make an HTTP request to the API.
 * 
 * @template T - The expected response type
 * @param path - API endpoint path (e.g., '/v1/products')
 * @param options - Request options
 * @returns Promise resolving to the response data
 * @throws ApiError on request failure
 */
export async function http<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, requireAuth = false, timeout = 30000, ...fetchOptions } = options;
  
  // Build URL with query params
  let url = `${globalConfig.baseUrl}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };
  
  // Add auth token if available
  if (globalConfig.getAccessToken) {
    const token = await Promise.resolve(globalConfig.getAccessToken());
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new ApiError(401, 'Authentication required');
    }
  } else if (requireAuth) {
    throw new ApiError(401, 'Authentication not configured');
  }
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const error = new ApiError(
        response.status,
        errorBody?.error || errorBody?.message || `Request failed: ${response.statusText}`,
        errorBody?.code,
        errorBody?.details
      );
      
      // Handle 401 unauthorized
      if (response.status === 401 && globalConfig.onUnauthorized) {
        globalConfig.onUnauthorized();
      }
      
      // Call global error handler
      if (globalConfig.onError) {
        globalConfig.onError(error);
      }
      
      throw error;
    }
    
    // Handle empty responses
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return undefined as T;
    }
    
    return response.json() as Promise<T>;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle abort/timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network error: Unable to reach server');
    }
    
    throw new ApiError(500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// =============================================================================
// CONVENIENCE METHODS
// =============================================================================

/**
 * Make a GET request.
 */
export function get<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
  return http<T>(path, { ...options, method: 'GET' });
}

/**
 * Make a POST request.
 */
export function post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return http<T>(path, { ...options, method: 'POST', body });
}

/**
 * Make a PATCH request.
 */
export function patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return http<T>(path, { ...options, method: 'PATCH', body });
}

/**
 * Make a PUT request.
 */
export function put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
  return http<T>(path, { ...options, method: 'PUT', body });
}

/**
 * Make a DELETE request.
 */
export function del<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
  return http<T>(path, { ...options, method: 'DELETE' });
}
