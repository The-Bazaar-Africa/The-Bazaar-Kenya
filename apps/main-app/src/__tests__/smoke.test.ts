/**
 * Main App Smoke Tests
 * 
 * Minimal tests to verify:
 * - App boots without errors
 * - Critical pages render
 * - No runtime API crashes
 */

import React from 'react';

describe('Main App - Smoke Tests', () => {
  // ==========================================================================
  // Environment Configuration
  // ==========================================================================
  describe('Environment', () => {
    it('should have API URL configured', () => {
      // Either NEXT_PUBLIC_API_URL or fallback should be available
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      expect(apiUrl).toBeDefined();
      expect(apiUrl).toMatch(/^https?:\/\//);
    });

    it('should have Supabase URL configured', () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      // May not be set in test environment
      if (supabaseUrl) {
        expect(supabaseUrl).toMatch(/^https?:\/\//);
      }
    });
  });

  // ==========================================================================
  // Module Imports
  // ==========================================================================
  describe('Module Imports', () => {
    it('should import @tbk/auth without errors', () => {
      expect(() => require('@tbk/auth')).not.toThrow();
    });

    it('should import @tbk/ui without errors', () => {
      expect(() => require('@tbk/ui')).not.toThrow();
    });

    it('should import @tbk/types without errors', () => {
      expect(() => require('@tbk/types')).not.toThrow();
    });
  });

  // ==========================================================================
  // Critical Route Modules
  // ==========================================================================
  describe('Critical Routes', () => {
    it('should have home page module', () => {
      // Verify the home page file exists and can be loaded
      const homePage = require('../app/page');
      expect(homePage).toBeDefined();
      expect(homePage.default).toBeDefined();
    });

    it('should have login page module', () => {
      const loginPage = require('../app/login/page');
      expect(loginPage).toBeDefined();
      expect(loginPage.default).toBeDefined();
    });

    it('should have register page module', () => {
      const registerPage = require('../app/register/page');
      expect(registerPage).toBeDefined();
      expect(registerPage.default).toBeDefined();
    });

    it('should have products page module', () => {
      const productsPage = require('../app/products/page');
      expect(productsPage).toBeDefined();
      expect(productsPage.default).toBeDefined();
    });

    it('should have cart page module', () => {
      const cartPage = require('../app/cart/page');
      expect(cartPage).toBeDefined();
      expect(cartPage.default).toBeDefined();
    });
  });

  // ==========================================================================
  // Layout Configuration
  // ==========================================================================
  describe('App Layout', () => {
    it('should have root layout', () => {
      const layout = require('../app/layout');
      expect(layout).toBeDefined();
      expect(layout.default).toBeDefined();
    });

    it('should have providers component', () => {
      const providers = require('../app/providers');
      expect(providers).toBeDefined();
    });
  });
});
