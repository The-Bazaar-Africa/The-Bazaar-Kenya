/**
 * The Bazaar API v1 - Health Endpoint
 * ====================================
 * 
 * API functions for health checks.
 * Maps to: apps/backend-api/src/routes/health.ts
 */

import { get } from '../http/client';
import type { HealthResponse } from '../generated';

/**
 * Check API health status.
 * 
 * @returns Health status
 */
export function checkHealth() {
  return get<HealthResponse>('/health');
}

/**
 * Check v1 API health status.
 * 
 * @returns Health status with version
 */
export function checkV1Health() {
  return get<HealthResponse>('/v1/health');
}
