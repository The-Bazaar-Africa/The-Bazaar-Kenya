/**
 * API Types
 * 
 * Re-exports all types from generated module for backwards compatibility.
 * New code should import directly from './generated'.
 * 
 * @deprecated Import from './generated' instead
 */

export * from './generated';

// Legacy alias for backwards compatibility
export type { ApiSuccessResponse as ApiResponse } from './generated';
