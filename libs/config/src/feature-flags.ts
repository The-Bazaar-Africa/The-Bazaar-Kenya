/**
 * Feature Flags System
 * =====================
 * Centralized feature flag management for gradual rollouts.
 *
 * Usage:
 * - Server: import { getFeatureFlag } from '@tbk/config';
 * - Client: import { useFeatureFlag } from '@tbk/config/client';
 *
 * Environment Variables:
 * - Set NEXT_PUBLIC_FEATURE_<FLAG_NAME>=true to enable
 * - Flags default to false in production for safety
 *
 * @see ENTERPRISE_MIGRATION_PLAN.md
 */

/**
 * All available feature flags in the system
 */
export const FEATURE_FLAGS = {
  // ==========================================
  // ADMIN PORTAL FLAGS
  // ==========================================
  /** New products management page with enhanced filtering */
  ADMIN_NEW_PRODUCTS_PAGE: 'ADMIN_NEW_PRODUCTS_PAGE',
  /** New orders management with bulk actions */
  ADMIN_NEW_ORDERS_PAGE: 'ADMIN_NEW_ORDERS_PAGE',
  /** New finance dashboard with charts */
  ADMIN_NEW_FINANCE_PAGE: 'ADMIN_NEW_FINANCE_PAGE',
  /** New user management with roles */
  ADMIN_NEW_USERS_PAGE: 'ADMIN_NEW_USERS_PAGE',
  /** New vendor management */
  ADMIN_NEW_VENDORS_PAGE: 'ADMIN_NEW_VENDORS_PAGE',
  /** New analytics dashboard */
  ADMIN_NEW_ANALYTICS: 'ADMIN_NEW_ANALYTICS',
  /** New security dashboard */
  ADMIN_NEW_SECURITY: 'ADMIN_NEW_SECURITY',

  // ==========================================
  // VENDOR PORTAL FLAGS
  // ==========================================
  /** New product management for vendors */
  VENDOR_NEW_PRODUCTS: 'VENDOR_NEW_PRODUCTS',
  /** New order fulfillment workflow */
  VENDOR_NEW_ORDERS: 'VENDOR_NEW_ORDERS',
  /** New analytics dashboard */
  VENDOR_NEW_ANALYTICS: 'VENDOR_NEW_ANALYTICS',
  /** New finance/earnings page */
  VENDOR_NEW_FINANCE: 'VENDOR_NEW_FINANCE',
  /** New profile management */
  VENDOR_NEW_PROFILE: 'VENDOR_NEW_PROFILE',

  // ==========================================
  // MAIN APP FLAGS
  // ==========================================
  /** New homepage with carousels */
  MAIN_NEW_HOMEPAGE: 'MAIN_NEW_HOMEPAGE',
  /** New product grid with infinite scroll */
  MAIN_NEW_PRODUCT_GRID: 'MAIN_NEW_PRODUCT_GRID',
  /** New filter sidebar */
  MAIN_NEW_FILTERS: 'MAIN_NEW_FILTERS',
  /** New shopping cart */
  MAIN_NEW_CART: 'MAIN_NEW_CART',
  /** New multi-step checkout */
  MAIN_NEW_CHECKOUT: 'MAIN_NEW_CHECKOUT',
  /** New user profile */
  MAIN_NEW_PROFILE: 'MAIN_NEW_PROFILE',
  /** New wishlist */
  MAIN_NEW_WISHLIST: 'MAIN_NEW_WISHLIST',
  /** New vendor storefront */
  MAIN_NEW_VENDOR_STOREFRONT: 'MAIN_NEW_VENDOR_STOREFRONT',
  /** New search with autocomplete */
  MAIN_NEW_SEARCH: 'MAIN_NEW_SEARCH',

  // ==========================================
  // GLOBAL FLAGS
  // ==========================================
  /** Enable dark mode toggle */
  DARK_MODE: 'DARK_MODE',
  /** Enable PWA features */
  PWA_ENABLED: 'PWA_ENABLED',
  /** Enable real-time notifications */
  REALTIME_NOTIFICATIONS: 'REALTIME_NOTIFICATIONS',
  /** Enable new API client */
  NEW_API_CLIENT: 'NEW_API_CLIENT',

  // ==========================================
  // BACKEND INFRASTRUCTURE FLAGS (P0)
  // ==========================================
  /** Use shared database library instead of local client */
  BACKEND_USE_SHARED_DATABASE: 'BACKEND_USE_SHARED_DATABASE',
  /** Use shared types library instead of local types */
  BACKEND_USE_SHARED_TYPES: 'BACKEND_USE_SHARED_TYPES',
  /** Use shared config library instead of local config */
  BACKEND_USE_SHARED_CONFIG: 'BACKEND_USE_SHARED_CONFIG',
  /** Enable shadow mode - run both old and new implementations */
  BACKEND_ENABLE_SHADOW_MODE: 'BACKEND_ENABLE_SHADOW_MODE',
  /** Percentage of traffic to route to shared database (0-100) */
  BACKEND_SHARED_DB_PERCENTAGE: 'BACKEND_SHARED_DB_PERCENTAGE',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = (typeof FEATURE_FLAGS)[FeatureFlagKey];

/**
 * Default flag values by environment
 * Production defaults to false for safety
 */
const DEFAULT_VALUES: Record<string, Record<FeatureFlagValue, boolean>> = {
  development: {
    // Admin - enabled in dev
    [FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_ORDERS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_FINANCE_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_USERS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_VENDORS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_ANALYTICS]: true,
    [FEATURE_FLAGS.ADMIN_NEW_SECURITY]: true,
    // Vendor - enabled in dev
    [FEATURE_FLAGS.VENDOR_NEW_PRODUCTS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_ORDERS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_ANALYTICS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_FINANCE]: true,
    [FEATURE_FLAGS.VENDOR_NEW_PROFILE]: true,
    // Main - enabled in dev
    [FEATURE_FLAGS.MAIN_NEW_HOMEPAGE]: true,
    [FEATURE_FLAGS.MAIN_NEW_PRODUCT_GRID]: true,
    [FEATURE_FLAGS.MAIN_NEW_FILTERS]: true,
    [FEATURE_FLAGS.MAIN_NEW_CART]: true,
    [FEATURE_FLAGS.MAIN_NEW_CHECKOUT]: true,
    [FEATURE_FLAGS.MAIN_NEW_PROFILE]: true,
    [FEATURE_FLAGS.MAIN_NEW_WISHLIST]: true,
    [FEATURE_FLAGS.MAIN_NEW_VENDOR_STOREFRONT]: true,
    [FEATURE_FLAGS.MAIN_NEW_SEARCH]: true,
    // Global
    [FEATURE_FLAGS.DARK_MODE]: true,
    [FEATURE_FLAGS.PWA_ENABLED]: false,
    [FEATURE_FLAGS.REALTIME_NOTIFICATIONS]: false,
    [FEATURE_FLAGS.NEW_API_CLIENT]: true,
    // Backend Infrastructure - disabled by default, enable for testing
    [FEATURE_FLAGS.BACKEND_USE_SHARED_DATABASE]: false,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_TYPES]: false,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_CONFIG]: false,
    [FEATURE_FLAGS.BACKEND_ENABLE_SHADOW_MODE]: true, // Shadow mode ON in dev
    [FEATURE_FLAGS.BACKEND_SHARED_DB_PERCENTAGE]: false, // Use as string "0"-"100"
  },
  staging: {
    // Admin - enabled for testing
    [FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_ORDERS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_FINANCE_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_USERS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_VENDORS_PAGE]: true,
    [FEATURE_FLAGS.ADMIN_NEW_ANALYTICS]: true,
    [FEATURE_FLAGS.ADMIN_NEW_SECURITY]: true,
    // Vendor
    [FEATURE_FLAGS.VENDOR_NEW_PRODUCTS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_ORDERS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_ANALYTICS]: true,
    [FEATURE_FLAGS.VENDOR_NEW_FINANCE]: true,
    [FEATURE_FLAGS.VENDOR_NEW_PROFILE]: true,
    // Main
    [FEATURE_FLAGS.MAIN_NEW_HOMEPAGE]: true,
    [FEATURE_FLAGS.MAIN_NEW_PRODUCT_GRID]: true,
    [FEATURE_FLAGS.MAIN_NEW_FILTERS]: true,
    [FEATURE_FLAGS.MAIN_NEW_CART]: true,
    [FEATURE_FLAGS.MAIN_NEW_CHECKOUT]: true,
    [FEATURE_FLAGS.MAIN_NEW_PROFILE]: true,
    [FEATURE_FLAGS.MAIN_NEW_WISHLIST]: true,
    [FEATURE_FLAGS.MAIN_NEW_VENDOR_STOREFRONT]: true,
    [FEATURE_FLAGS.MAIN_NEW_SEARCH]: true,
    // Global
    [FEATURE_FLAGS.DARK_MODE]: true,
    [FEATURE_FLAGS.PWA_ENABLED]: true,
    [FEATURE_FLAGS.REALTIME_NOTIFICATIONS]: true,
    [FEATURE_FLAGS.NEW_API_CLIENT]: true,
    // Backend Infrastructure - enable shadow mode for validation
    [FEATURE_FLAGS.BACKEND_USE_SHARED_DATABASE]: false,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_TYPES]: true,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_CONFIG]: true,
    [FEATURE_FLAGS.BACKEND_ENABLE_SHADOW_MODE]: true,
    [FEATURE_FLAGS.BACKEND_SHARED_DB_PERCENTAGE]: false,
  },
  production: {
    // Admin - DISABLED by default in production
    [FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE]: false,
    [FEATURE_FLAGS.ADMIN_NEW_ORDERS_PAGE]: false,
    [FEATURE_FLAGS.ADMIN_NEW_FINANCE_PAGE]: false,
    [FEATURE_FLAGS.ADMIN_NEW_USERS_PAGE]: false,
    [FEATURE_FLAGS.ADMIN_NEW_VENDORS_PAGE]: false,
    [FEATURE_FLAGS.ADMIN_NEW_ANALYTICS]: false,
    [FEATURE_FLAGS.ADMIN_NEW_SECURITY]: false,
    // Vendor - DISABLED by default
    [FEATURE_FLAGS.VENDOR_NEW_PRODUCTS]: false,
    [FEATURE_FLAGS.VENDOR_NEW_ORDERS]: false,
    [FEATURE_FLAGS.VENDOR_NEW_ANALYTICS]: false,
    [FEATURE_FLAGS.VENDOR_NEW_FINANCE]: false,
    [FEATURE_FLAGS.VENDOR_NEW_PROFILE]: false,
    // Main - DISABLED by default
    [FEATURE_FLAGS.MAIN_NEW_HOMEPAGE]: false,
    [FEATURE_FLAGS.MAIN_NEW_PRODUCT_GRID]: false,
    [FEATURE_FLAGS.MAIN_NEW_FILTERS]: false,
    [FEATURE_FLAGS.MAIN_NEW_CART]: false,
    [FEATURE_FLAGS.MAIN_NEW_CHECKOUT]: false,
    [FEATURE_FLAGS.MAIN_NEW_PROFILE]: false,
    [FEATURE_FLAGS.MAIN_NEW_WISHLIST]: false,
    [FEATURE_FLAGS.MAIN_NEW_VENDOR_STOREFRONT]: false,
    [FEATURE_FLAGS.MAIN_NEW_SEARCH]: false,
    // Global
    [FEATURE_FLAGS.DARK_MODE]: true, // Safe to enable
    [FEATURE_FLAGS.PWA_ENABLED]: false,
    [FEATURE_FLAGS.REALTIME_NOTIFICATIONS]: false,
    [FEATURE_FLAGS.NEW_API_CLIENT]: false,
    // Backend Infrastructure - ALL DISABLED in production by default
    [FEATURE_FLAGS.BACKEND_USE_SHARED_DATABASE]: false,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_TYPES]: false,
    [FEATURE_FLAGS.BACKEND_USE_SHARED_CONFIG]: false,
    [FEATURE_FLAGS.BACKEND_ENABLE_SHADOW_MODE]: false,
    [FEATURE_FLAGS.BACKEND_SHARED_DB_PERCENTAGE]: false,
  },
};

/**
 * Get the current environment
 */
function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || 'development';
  }
  return 'development';
}

/**
 * Get a feature flag value (server-side)
 *
 * @param flag - The feature flag to check
 * @returns boolean - Whether the flag is enabled
 *
 * @example
 * ```ts
 * import { getFeatureFlag, FEATURE_FLAGS } from '@tbk/config';
 *
 * if (getFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CHECKOUT)) {
 *   // Use new checkout flow
 * }
 * ```
 */
export function getFeatureFlag(flag: FeatureFlagValue): boolean {
  const env = getEnvironment();
  const envVarName = `NEXT_PUBLIC_FEATURE_${flag}`;

  // Check environment variable first (allows runtime override)
  if (typeof process !== 'undefined' && process.env) {
    const envValue = process.env[envVarName];
    if (envValue !== undefined) {
      return envValue === 'true' || envValue === '1';
    }
  }

  // Fall back to defaults
  const defaults = DEFAULT_VALUES[env] || DEFAULT_VALUES.production;
  return defaults[flag] ?? false;
}

/**
 * Get all feature flags with their current values
 *
 * @returns Record of all flags and their values
 */
export function getAllFeatureFlags(): Record<FeatureFlagValue, boolean> {
  const result: Record<string, boolean> = {};

  for (const flag of Object.values(FEATURE_FLAGS)) {
    result[flag] = getFeatureFlag(flag);
  }

  return result as Record<FeatureFlagValue, boolean>;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in staging mode
 */
export function isStaging(): boolean {
  return getEnvironment() === 'staging';
}

/**
 * Log all feature flag values (useful for debugging)
 */
export function logFeatureFlags(): void {
  const flags = getAllFeatureFlags();
  console.info('🚩 Feature Flags:');
  console.info(
    Object.entries(flags).map(([flag, enabled]) => ({
      Flag: flag,
      Enabled: enabled ? '✅' : '❌',
    }))
  );
}

// ==========================================
// BACKEND-SPECIFIC FEATURE FLAGS (P0)
// ==========================================

/**
 * Backend infrastructure feature flags for P0 remediation
 */
export interface BackendFeatureFlags {
  /** Use shared database library instead of local client */
  USE_SHARED_DATABASE: boolean;
  /** Use shared types library */
  USE_SHARED_TYPES: boolean;
  /** Use shared config library */
  USE_SHARED_CONFIG: boolean;
  /** Enable shadow mode - run both implementations in parallel */
  ENABLE_SHADOW_MODE: boolean;
  /** Percentage of traffic to route to shared database (0-100) */
  SHARED_DB_PERCENTAGE: number;
}

/**
 * Get backend-specific feature flags
 * 
 * @returns BackendFeatureFlags object with all backend infrastructure flags
 * 
 * @example
 * ```ts
 * import { getBackendFlags } from '@tbk/config';
 * 
 * const flags = getBackendFlags();
 * if (flags.USE_SHARED_DATABASE) {
 *   // Use shared database client
 * }
 * ```
 */
export function getBackendFlags(): BackendFeatureFlags {
  return {
    USE_SHARED_DATABASE: getFeatureFlag(FEATURE_FLAGS.BACKEND_USE_SHARED_DATABASE),
    USE_SHARED_TYPES: getFeatureFlag(FEATURE_FLAGS.BACKEND_USE_SHARED_TYPES),
    USE_SHARED_CONFIG: getFeatureFlag(FEATURE_FLAGS.BACKEND_USE_SHARED_CONFIG),
    ENABLE_SHADOW_MODE: getFeatureFlag(FEATURE_FLAGS.BACKEND_ENABLE_SHADOW_MODE),
    SHARED_DB_PERCENTAGE: getBackendDbPercentage(),
  };
}

/**
 * Get the percentage of traffic to route to shared database
 * Reads from FF_BACKEND_SHARED_DB_PERCENTAGE env var (0-100)
 */
export function getBackendDbPercentage(): number {
  const envValue = process.env.FF_BACKEND_SHARED_DB_PERCENTAGE;
  if (envValue === undefined) return 0;
  const percentage = parseInt(envValue, 10);
  if (isNaN(percentage)) return 0;
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Determine if a specific route should use the shared database
 * Based on percentage-based rollout using route hash
 * 
 * @param routeId - Unique identifier for the route/request
 * @returns boolean - Whether to use shared database for this route
 */
export function shouldUseSharedDb(routeId: string): boolean {
  const flags = getBackendFlags();
  if (!flags.USE_SHARED_DATABASE) return false;
  
  const percentage = flags.SHARED_DB_PERCENTAGE;
  if (percentage === 0) return false;
  if (percentage >= 100) return true;
  
  // Simple hash for consistent routing
  const hash = simpleHash(routeId) % 100;
  return hash < percentage;
}

/**
 * Simple string hash function for consistent percentage-based routing
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
