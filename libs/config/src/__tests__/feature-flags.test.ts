import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  FEATURE_FLAGS,
  getFeatureFlag,
  getAllFeatureFlags,
  isDevelopment,
  isProduction,
  isStaging,
} from '../feature-flags';

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('FEATURE_FLAGS', () => {
    it('should have all expected admin flags', () => {
      expect(FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE).toBe('ADMIN_NEW_PRODUCTS_PAGE');
      expect(FEATURE_FLAGS.ADMIN_NEW_ORDERS_PAGE).toBe('ADMIN_NEW_ORDERS_PAGE');
      expect(FEATURE_FLAGS.ADMIN_NEW_FINANCE_PAGE).toBe('ADMIN_NEW_FINANCE_PAGE');
      expect(FEATURE_FLAGS.ADMIN_NEW_USERS_PAGE).toBe('ADMIN_NEW_USERS_PAGE');
      expect(FEATURE_FLAGS.ADMIN_NEW_VENDORS_PAGE).toBe('ADMIN_NEW_VENDORS_PAGE');
      expect(FEATURE_FLAGS.ADMIN_NEW_ANALYTICS).toBe('ADMIN_NEW_ANALYTICS');
      expect(FEATURE_FLAGS.ADMIN_NEW_SECURITY).toBe('ADMIN_NEW_SECURITY');
    });

    it('should have all expected vendor flags', () => {
      expect(FEATURE_FLAGS.VENDOR_NEW_PRODUCTS).toBe('VENDOR_NEW_PRODUCTS');
      expect(FEATURE_FLAGS.VENDOR_NEW_ORDERS).toBe('VENDOR_NEW_ORDERS');
      expect(FEATURE_FLAGS.VENDOR_NEW_ANALYTICS).toBe('VENDOR_NEW_ANALYTICS');
      expect(FEATURE_FLAGS.VENDOR_NEW_FINANCE).toBe('VENDOR_NEW_FINANCE');
      expect(FEATURE_FLAGS.VENDOR_NEW_PROFILE).toBe('VENDOR_NEW_PROFILE');
    });

    it('should have all expected main app flags', () => {
      expect(FEATURE_FLAGS.MAIN_NEW_HOMEPAGE).toBe('MAIN_NEW_HOMEPAGE');
      expect(FEATURE_FLAGS.MAIN_NEW_PRODUCT_GRID).toBe('MAIN_NEW_PRODUCT_GRID');
      expect(FEATURE_FLAGS.MAIN_NEW_FILTERS).toBe('MAIN_NEW_FILTERS');
      expect(FEATURE_FLAGS.MAIN_NEW_CART).toBe('MAIN_NEW_CART');
      expect(FEATURE_FLAGS.MAIN_NEW_CHECKOUT).toBe('MAIN_NEW_CHECKOUT');
      expect(FEATURE_FLAGS.MAIN_NEW_PROFILE).toBe('MAIN_NEW_PROFILE');
      expect(FEATURE_FLAGS.MAIN_NEW_WISHLIST).toBe('MAIN_NEW_WISHLIST');
      expect(FEATURE_FLAGS.MAIN_NEW_VENDOR_STOREFRONT).toBe('MAIN_NEW_VENDOR_STOREFRONT');
      expect(FEATURE_FLAGS.MAIN_NEW_SEARCH).toBe('MAIN_NEW_SEARCH');
    });

    it('should have all expected global flags', () => {
      expect(FEATURE_FLAGS.DARK_MODE).toBe('DARK_MODE');
      expect(FEATURE_FLAGS.PWA_ENABLED).toBe('PWA_ENABLED');
      expect(FEATURE_FLAGS.REALTIME_NOTIFICATIONS).toBe('REALTIME_NOTIFICATIONS');
      expect(FEATURE_FLAGS.NEW_API_CLIENT).toBe('NEW_API_CLIENT');
    });
  });

  describe('getFeatureFlag', () => {
    it('should return default value for development environment', () => {
      process.env.NODE_ENV = 'development';
      
      // In development, most flags should be enabled by default
      expect(getFeatureFlag(FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE)).toBe(true);
      expect(getFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CART)).toBe(true);
    });

    it('should return default value for production environment', () => {
      process.env.NODE_ENV = 'production';
      
      // In production, most flags should be disabled by default
      expect(getFeatureFlag(FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE)).toBe(false);
      expect(getFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CHECKOUT)).toBe(false);
      
      // DARK_MODE is always safe
      expect(getFeatureFlag(FEATURE_FLAGS.DARK_MODE)).toBe(true);
    });

    it('should override with environment variable when set to true', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_FEATURE_MAIN_NEW_CHECKOUT = 'true';
      
      expect(getFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CHECKOUT)).toBe(true);
    });

    it('should override with environment variable when set to 1', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_FEATURE_MAIN_NEW_CART = '1';
      
      expect(getFeatureFlag(FEATURE_FLAGS.MAIN_NEW_CART)).toBe(true);
    });

    it('should override with environment variable when set to false', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_FEATURE_ADMIN_NEW_PRODUCTS_PAGE = 'false';
      
      expect(getFeatureFlag(FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE)).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags with their values', () => {
      process.env.NODE_ENV = 'development';
      
      const flags = getAllFeatureFlags();
      
      expect(typeof flags).toBe('object');
      expect(flags[FEATURE_FLAGS.ADMIN_NEW_PRODUCTS_PAGE]).toBeDefined();
      expect(flags[FEATURE_FLAGS.MAIN_NEW_CART]).toBeDefined();
      expect(flags[FEATURE_FLAGS.VENDOR_NEW_PRODUCTS]).toBeDefined();
    });

    it('should return boolean values for all flags', () => {
      const flags = getAllFeatureFlags();
      
      for (const value of Object.values(flags)) {
        expect(typeof value).toBe('boolean');
      }
    });
  });

  describe('environment checks', () => {
    it('isDevelopment should return true in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isStaging()).toBe(false);
    });

    it('isProduction should return true in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isStaging()).toBe(false);
    });

    it('isStaging should return true in staging', () => {
      process.env.NODE_ENV = 'staging';
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isStaging()).toBe(true);
    });
  });
});
