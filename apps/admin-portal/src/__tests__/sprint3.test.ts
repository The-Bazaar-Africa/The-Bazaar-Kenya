/**
 * Sprint 3 Admin Portal Tests
 * 
 * Tests for:
 * - User Management (A-010, A-011)
 * - Vendor Management (A-012, A-013)
 * - Finance Module (A-014, A-015, A-016)
 * - Analytics Dashboard (A-017)
 * - Security Dashboard (A-018)
 */

describe('Sprint 3 - Admin Portal Extended', () => {
  // ==========================================================================
  // User Management Tests (A-010, A-011)
  // ==========================================================================
  describe('User Management', () => {
    describe('User List Page (A-010)', () => {
      it('should have users list page module', () => {
        const usersPage = require('../app/dashboard/main-app/users/page');
        expect(usersPage).toBeDefined();
        expect(usersPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const usersPage = require('../app/dashboard/main-app/users/page');
        expect(typeof usersPage.default).toBe('function');
      });
    });

    describe('User Detail Page (A-011)', () => {
      it('should have user detail page module', () => {
        const userDetailPage = require('../app/dashboard/main-app/users/[id]/page');
        expect(userDetailPage).toBeDefined();
        expect(userDetailPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const userDetailPage = require('../app/dashboard/main-app/users/[id]/page');
        expect(typeof userDetailPage.default).toBe('function');
      });
    });
  });

  // ==========================================================================
  // Vendor Management Tests (A-012, A-013)
  // ==========================================================================
  describe('Vendor Management', () => {
    describe('Vendor List Page (A-012)', () => {
      it('should have vendors list page module', () => {
        const vendorsPage = require('../app/dashboard/main-app/vendors/page');
        expect(vendorsPage).toBeDefined();
        expect(vendorsPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const vendorsPage = require('../app/dashboard/main-app/vendors/page');
        expect(typeof vendorsPage.default).toBe('function');
      });
    });

    describe('Vendor Detail Page (A-013)', () => {
      it('should have vendor detail page module', () => {
        const vendorDetailPage = require('../app/dashboard/main-app/vendors/[id]/page');
        expect(vendorDetailPage).toBeDefined();
        expect(vendorDetailPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const vendorDetailPage = require('../app/dashboard/main-app/vendors/[id]/page');
        expect(typeof vendorDetailPage.default).toBe('function');
      });
    });
  });

  // ==========================================================================
  // Finance Module Tests (A-014, A-015, A-016)
  // ==========================================================================
  describe('Finance Module', () => {
    describe('Finance Dashboard (A-014)', () => {
      it('should have finance dashboard page module', () => {
        const financePage = require('../app/dashboard/main-app/finances/page');
        expect(financePage).toBeDefined();
        expect(financePage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const financePage = require('../app/dashboard/main-app/finances/page');
        expect(typeof financePage.default).toBe('function');
      });
    });

    describe('Payout Management (A-015)', () => {
      it('should have payouts page module', () => {
        const payoutsPage = require('../app/dashboard/main-app/finances/payouts/page');
        expect(payoutsPage).toBeDefined();
        expect(payoutsPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const payoutsPage = require('../app/dashboard/main-app/finances/payouts/page');
        expect(typeof payoutsPage.default).toBe('function');
      });
    });

    describe('Escrow Accounts (A-016)', () => {
      it('should have escrow page module', () => {
        const escrowPage = require('../app/dashboard/main-app/finances/escrow/page');
        expect(escrowPage).toBeDefined();
        expect(escrowPage.default).toBeDefined();
      });

      it('should export as default function component', () => {
        const escrowPage = require('../app/dashboard/main-app/finances/escrow/page');
        expect(typeof escrowPage.default).toBe('function');
      });
    });
  });

  // ==========================================================================
  // Analytics Dashboard Tests (A-017)
  // ==========================================================================
  describe('Analytics Dashboard (A-017)', () => {
    it('should have analytics page module', () => {
      const analyticsPage = require('../app/dashboard/main-app/analytics/page');
      expect(analyticsPage).toBeDefined();
      expect(analyticsPage.default).toBeDefined();
    });

    it('should export as default function component', () => {
      const analyticsPage = require('../app/dashboard/main-app/analytics/page');
      expect(typeof analyticsPage.default).toBe('function');
    });
  });

  // ==========================================================================
  // Security Dashboard Tests (A-018)
  // ==========================================================================
  describe('Security Dashboard (A-018)', () => {
    it('should have security page module', () => {
      const securityPage = require('../app/dashboard/main-app/security/page');
      expect(securityPage).toBeDefined();
      expect(securityPage.default).toBeDefined();
    });

    it('should export as default function component', () => {
      const securityPage = require('../app/dashboard/main-app/security/page');
      expect(typeof securityPage.default).toBe('function');
    });
  });

  // ==========================================================================
  // Admin Finance API Tests
  // ==========================================================================
  describe('Admin Finance API Integration', () => {
    it('should export finance API from api-client', () => {
      const adminApi = require('@tbk/api-client');
      expect(adminApi.adminFinanceApi).toBeDefined();
    });

    it('should have financial summary function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminFinanceApi.adminGetFinancialSummary).toBe('function');
    });

    it('should have revenue data function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminFinanceApi.adminGetRevenueData).toBe('function');
    });

    it('should have transactions function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminFinanceApi.adminGetTransactions).toBe('function');
    });

    it('should have payouts function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminFinanceApi.adminGetPayouts).toBe('function');
    });

    it('should have escrow accounts function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminFinanceApi.adminGetEscrowAccounts).toBe('function');
    });
  });

  // ==========================================================================
  // Admin User & Vendor API Tests
  // ==========================================================================
  describe('Admin User & Vendor API Integration', () => {
    it('should export users API from api-client', () => {
      const adminApi = require('@tbk/api-client');
      expect(adminApi.adminUsersApi).toBeDefined();
    });

    it('should export vendors API from api-client', () => {
      const adminApi = require('@tbk/api-client');
      expect(adminApi.adminVendorsApi).toBeDefined();
    });

    it('should have get users function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminUsersApi.adminGetUsers).toBe('function');
    });

    it('should have get vendors function', () => {
      const adminApi = require('@tbk/api-client');
      expect(typeof adminApi.adminVendorsApi.adminGetVendors).toBe('function');
    });
  });
});
