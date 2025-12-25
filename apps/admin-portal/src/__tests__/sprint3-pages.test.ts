/**
 * Sprint 3 - Admin Portal Page Verification Tests
 * 
 * Tests verify the existence and structure of Sprint 3 implementations:
 * - A-010: Products List Page (Sprint 2, but verify integration)
 * - A-011: Orders Management Page  
 * - A-012: Users Management Page
 * - A-013: Vendors Management Page
 * - A-014: Finance Dashboard Page
 * - A-015: Payouts Management Page
 * - A-016: Escrow Accounts Page
 * - A-017: Analytics Dashboard Page
 * - A-018: Security Dashboard Page
 */

import * as fs from 'fs';
import * as path from 'path';

const ADMIN_APP_PATH = path.resolve(__dirname, '../app/dashboard/main-app');

describe('Sprint 3 - Admin Portal Page Verification', () => {
  // Helper function to check if page file exists
  const pageExists = (pagePath: string): boolean => {
    const fullPath = path.join(ADMIN_APP_PATH, pagePath);
    return fs.existsSync(fullPath);
  };
  
  // Helper to get file content
  const getFileContent = (pagePath: string): string => {
    const fullPath = path.join(ADMIN_APP_PATH, pagePath);
    if (!fs.existsSync(fullPath)) return '';
    return fs.readFileSync(fullPath, 'utf-8');
  };

  describe('Users Management (A-012)', () => {
    it('should have users page file', () => {
      expect(pageExists('users/page.tsx')).toBe(true);
    });
    
    it('should have users page with default export', () => {
      const content = getFileContent('users/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should have user detail page', () => {
      expect(pageExists('users/[id]/page.tsx')).toBe(true);
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('users/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetUsers');
    });
    
    it('should have user management features', () => {
      const content = getFileContent('users/page.tsx');
      expect(content.toLowerCase()).toContain('suspend');
      expect(content).toContain('DataTable');
    });
  });

  describe('Vendors Management (A-013)', () => {
    it('should have vendors page file', () => {
      expect(pageExists('vendors/page.tsx')).toBe(true);
    });
    
    it('should have vendors page with default export', () => {
      const content = getFileContent('vendors/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should have vendor detail page', () => {
      expect(pageExists('vendors/[id]/page.tsx')).toBe(true);
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('vendors/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetVendors');
    });
    
    it('should have vendor management features', () => {
      const content = getFileContent('vendors/page.tsx');
      expect(content.toLowerCase()).toContain('verify');
      expect(content).toContain('DataTable');
    });
  });

  describe('Finance Dashboard (A-014)', () => {
    it('should have finances page file', () => {
      expect(pageExists('finances/page.tsx')).toBe(true);
    });
    
    it('should have finances page with default export', () => {
      const content = getFileContent('finances/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('finances/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetFinancialSummary');
    });
    
    it('should have finance dashboard features', () => {
      const content = getFileContent('finances/page.tsx');
      expect(content.toLowerCase()).toContain('revenue');
      expect(content.toLowerCase()).toContain('transaction');
    });
  });

  describe('Payouts Management (A-015)', () => {
    it('should have payouts page file', () => {
      expect(pageExists('finances/payouts/page.tsx')).toBe(true);
    });
    
    it('should have payouts page with default export', () => {
      const content = getFileContent('finances/payouts/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('finances/payouts/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetPayouts');
    });
    
    it('should have payout management features', () => {
      const content = getFileContent('finances/payouts/page.tsx');
      expect(content.toLowerCase()).toContain('process');
      expect(content).toContain('DataTable');
    });
  });

  describe('Escrow Accounts (A-016)', () => {
    it('should have escrow page file', () => {
      expect(pageExists('finances/escrow/page.tsx')).toBe(true);
    });
    
    it('should have escrow page with default export', () => {
      const content = getFileContent('finances/escrow/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('finances/escrow/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetEscrowAccounts');
    });
    
    it('should have escrow management features', () => {
      const content = getFileContent('finances/escrow/page.tsx');
      expect(content.toLowerCase()).toContain('release');
      expect(content.toLowerCase()).toContain('refund');
    });
  });

  describe('Analytics Dashboard (A-017)', () => {
    it('should have analytics page file', () => {
      expect(pageExists('analytics/page.tsx')).toBe(true);
    });
    
    it('should have analytics page with default export', () => {
      const content = getFileContent('analytics/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should have analytics dashboard features', () => {
      const content = getFileContent('analytics/page.tsx');
      expect(content.toLowerCase()).toContain('metric');
      expect(content.toLowerCase()).toContain('chart');
    });
  });

  describe('Security Dashboard (A-018)', () => {
    it('should have security page file', () => {
      expect(pageExists('security/page.tsx')).toBe(true);
    });
    
    it('should have security page with default export', () => {
      const content = getFileContent('security/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should have security dashboard features', () => {
      const content = getFileContent('security/page.tsx');
      expect(content.toLowerCase()).toContain('event');
      expect(content.toLowerCase()).toContain('security');
    });
  });

  describe('Orders Management (A-011)', () => {
    it('should have orders page file', () => {
      expect(pageExists('orders/page.tsx')).toBe(true);
    });
    
    it('should have orders page with default export', () => {
      const content = getFileContent('orders/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('orders/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetOrders');
    });
  });

  describe('Products Management (A-010)', () => {
    it('should have products page file', () => {
      expect(pageExists('products/page.tsx')).toBe(true);
    });
    
    it('should have products page with default export', () => {
      const content = getFileContent('products/page.tsx');
      expect(content).toContain('export default');
      expect(content).toContain('function');
    });
    
    it('should import from @tbk/api-client', () => {
      const content = getFileContent('products/page.tsx');
      expect(content).toContain('@tbk/api-client');
      expect(content).toContain('adminGetProducts');
    });
  });
});
