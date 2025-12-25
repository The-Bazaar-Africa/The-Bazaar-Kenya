'use client';

/**
 * Feature Flags Client Hook
 * ==========================
 * React hook for accessing feature flags in client components.
 *
 * @example
 * ```tsx
 * import { useFeatureFlag, FEATURE_FLAGS } from '@tbk/config/client';
 *
 * function CheckoutButton() {
 *   const isNewCheckout = useFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CHECKOUT);
 *
 *   if (isNewCheckout) {
 *     return <NewCheckoutButton />;
 *   }
 *   return <LegacyCheckoutButton />;
 * }
 * ```
 */

import { useMemo } from 'react';

// Re-export constants for convenience
export { FEATURE_FLAGS } from './feature-flags';
export type { FeatureFlagKey, FeatureFlagValue } from './feature-flags';

/**
 * Get environment variable value on client side
 */
function getClientEnvValue(flag: string): boolean | undefined {
  const envVarName = `NEXT_PUBLIC_FEATURE_${flag}`;

  // Access via window for client-side
  if (typeof window !== 'undefined') {
    // Next.js exposes NEXT_PUBLIC_ vars at build time
    const value = (process.env as Record<string, string | undefined>)[envVarName];
    if (value !== undefined) {
      return value === 'true' || value === '1';
    }
  }

  return undefined;
}

/**
 * Default values for client-side (should match server defaults)
 */
const CLIENT_DEFAULTS: Record<string, boolean> = {
  // Development defaults - all features enabled
  ADMIN_NEW_PRODUCTS_PAGE: process.env.NODE_ENV === 'development',
  ADMIN_NEW_ORDERS_PAGE: process.env.NODE_ENV === 'development',
  ADMIN_NEW_FINANCE_PAGE: process.env.NODE_ENV === 'development',
  ADMIN_NEW_USERS_PAGE: process.env.NODE_ENV === 'development',
  ADMIN_NEW_VENDORS_PAGE: process.env.NODE_ENV === 'development',
  ADMIN_NEW_ANALYTICS: process.env.NODE_ENV === 'development',
  ADMIN_NEW_SECURITY: process.env.NODE_ENV === 'development',
  VENDOR_NEW_PRODUCTS: process.env.NODE_ENV === 'development',
  VENDOR_NEW_ORDERS: process.env.NODE_ENV === 'development',
  VENDOR_NEW_ANALYTICS: process.env.NODE_ENV === 'development',
  VENDOR_NEW_FINANCE: process.env.NODE_ENV === 'development',
  VENDOR_NEW_PROFILE: process.env.NODE_ENV === 'development',
  MAIN_NEW_HOMEPAGE: process.env.NODE_ENV === 'development',
  MAIN_NEW_PRODUCT_GRID: process.env.NODE_ENV === 'development',
  MAIN_NEW_FILTERS: process.env.NODE_ENV === 'development',
  MAIN_NEW_CART: process.env.NODE_ENV === 'development',
  MAIN_NEW_CHECKOUT: process.env.NODE_ENV === 'development',
  MAIN_NEW_PROFILE: process.env.NODE_ENV === 'development',
  MAIN_NEW_WISHLIST: process.env.NODE_ENV === 'development',
  MAIN_NEW_VENDOR_STOREFRONT: process.env.NODE_ENV === 'development',
  MAIN_NEW_SEARCH: process.env.NODE_ENV === 'development',
  DARK_MODE: true,
  PWA_ENABLED: false,
  REALTIME_NOTIFICATIONS: false,
  NEW_API_CLIENT: process.env.NODE_ENV === 'development',
};

/**
 * React hook to check if a feature flag is enabled
 *
 * @param flag - The feature flag to check
 * @returns boolean - Whether the flag is enabled
 */
export function useFeatureFlag(flag: string): boolean {
  return useMemo(() => {
    const envValue = getClientEnvValue(flag);
    if (envValue !== undefined) {
      return envValue;
    }
    return CLIENT_DEFAULTS[flag] ?? false;
  }, [flag]);
}

/**
 * React hook to get all feature flags
 *
 * @returns Record of all flags and their values
 */
export function useAllFeatureFlags(): Record<string, boolean> {
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const flag of Object.keys(CLIENT_DEFAULTS)) {
      const envValue = getClientEnvValue(flag);
      result[flag] = envValue !== undefined ? envValue : CLIENT_DEFAULTS[flag];
    }
    return result;
  }, []);
}

/**
 * Higher-order component for feature-flagged components
 *
 * @example
 * ```tsx
 * const NewCheckout = withFeatureFlag(
 *   FEATURE_FLAGS.MAIN_NEW_CHECKOUT,
 *   NewCheckoutComponent,
 *   LegacyCheckoutComponent
 * );
 * ```
 */
export function withFeatureFlag<P extends object>(
  flag: string,
  EnabledComponent: React.ComponentType<P>,
  DisabledComponent?: React.ComponentType<P>
): React.FC<P> {
  return function FeatureFlaggedComponent(props: P) {
    const isEnabled = useFeatureFlag(flag);

    if (isEnabled) {
      return <EnabledComponent {...props} />;
    }

    if (DisabledComponent) {
      return <DisabledComponent {...props} />;
    }

    return null;
  };
}

/**
 * Component that conditionally renders children based on feature flag
 *
 * @example
 * ```tsx
 * <FeatureFlag flag={FEATURE_FLAGS.MAIN_NEW_CART}>
 *   <NewCartComponent />
 * </FeatureFlag>
 *
 * <FeatureFlag flag={FEATURE_FLAGS.MAIN_NEW_CART} fallback={<OldCart />}>
 *   <NewCart />
 * </FeatureFlag>
 * ```
 */
export function FeatureFlag({
  flag,
  children,
  fallback = null,
}: {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactNode {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? children : fallback;
}
