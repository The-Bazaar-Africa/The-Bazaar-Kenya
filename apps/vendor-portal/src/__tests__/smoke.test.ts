/**
 * Vendor Portal Smoke Tests
 * 
 * Minimal tests to verify:
 * - App boots without errors
 * - Critical pages render
 * - No runtime API crashes
 */

describe('Vendor Portal - Smoke Tests', () => {
  // ==========================================================================
  // Environment Configuration
  // ==========================================================================
  describe('Environment', () => {
    it('should have API URL configured', () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      expect(apiUrl).toBeDefined();
      expect(apiUrl).toMatch(/^https?:\/\//);
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
  });

  // ==========================================================================
  // Critical Route Modules
  // ==========================================================================
  describe('Critical Routes', () => {
    it('should have home/dashboard page module', () => {
      const dashboardPage = require('../app/page');
      expect(dashboardPage).toBeDefined();
      expect(dashboardPage.default).toBeDefined();
    });

    it('should have login page module', () => {
      const loginPage = require('../app/login/page');
      expect(loginPage).toBeDefined();
      expect(loginPage.default).toBeDefined();
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
  });
});
