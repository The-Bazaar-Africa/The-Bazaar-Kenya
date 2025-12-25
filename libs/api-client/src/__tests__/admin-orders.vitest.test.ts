/**
 * Admin Orders Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the admin orders API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminRefundOrder,
  adminAddOrderNote,
  adminBulkOrderAction,
  adminExportOrders,
} from '../endpoints/admin/orders';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Admin Orders Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'admin-test-token',
    });
  });

  // ==========================================================================
  // adminGetOrders
  // ==========================================================================
  describe('adminGetOrders()', () => {
    it('should call /v1/admin/orders without params', async () => {
      const mockData = {
        success: true,
        data: {
          orders: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };
      mockFetchResponse(mockData);

      const result = await adminGetOrders();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer admin-test-token',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include status filter', async () => {
      mockFetchResponse({ success: true, data: { orders: [], pagination: {} } });

      await adminGetOrders({ status: 'pending' });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('status=pending');
    });

    it('should include payment status filter', async () => {
      mockFetchResponse({ success: true, data: { orders: [], pagination: {} } });

      await adminGetOrders({ paymentStatus: 'paid' });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('paymentStatus=paid');
    });

    it('should include date range filters', async () => {
      mockFetchResponse({ success: true, data: { orders: [], pagination: {} } });

      await adminGetOrders({ 
        createdAfter: '2024-01-01', 
        createdBefore: '2024-12-31',
      });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('createdAfter=2024-01-01');
      expect(calledUrl).toContain('createdBefore=2024-12-31');
    });

    it('should include pagination params', async () => {
      mockFetchResponse({ success: true, data: { orders: [], pagination: {} } });

      await adminGetOrders({ page: 3, limit: 50 });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('page=3');
      expect(calledUrl).toContain('limit=50');
    });
  });

  // ==========================================================================
  // adminGetOrder
  // ==========================================================================
  describe('adminGetOrder()', () => {
    it('should call /v1/admin/orders/:id', async () => {
      const mockOrder = {
        success: true,
        data: { 
          id: 'order-123', 
          orderNumber: 'ORD-2024-001',
          status: 'pending',
          buyer: { id: 'user-1', name: 'John Doe', email: 'john@test.com' },
        },
      };
      mockFetchResponse(mockOrder);

      const result = await adminGetOrder('order-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/order-123',
        expect.any(Object)
      );
      expect(result).toEqual(mockOrder);
    });
  });

  // ==========================================================================
  // adminUpdateOrderStatus
  // ==========================================================================
  describe('adminUpdateOrderStatus()', () => {
    it('should PATCH /v1/admin/orders/:id/status', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'order-123', status: 'confirmed' },
      };
      mockFetchResponse(mockResponse);

      const result = await adminUpdateOrderStatus('order-123', { status: 'confirmed' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/order-123/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'confirmed' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle all order status values', async () => {
      mockFetchResponse({ success: true, data: {} });

      const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
      
      for (const status of statuses) {
        await adminUpdateOrderStatus('order-123', { status });
        
        const lastCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.slice(-1)[0];
        const body = JSON.parse(lastCall[1].body);
        expect(body.status).toBe(status);
      }
    });
  });

  // ==========================================================================
  // adminCancelOrder
  // ==========================================================================
  describe('adminCancelOrder()', () => {
    it('should POST to /v1/admin/orders/:id/cancel', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'order-123', status: 'cancelled' },
      };
      mockFetchResponse(mockResponse);

      const result = await adminCancelOrder('order-123', 'Customer requested cancellation');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/order-123/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'Customer requested cancellation' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // adminRefundOrder
  // ==========================================================================
  describe('adminRefundOrder()', () => {
    it('should POST to /v1/admin/orders/:id/refund', async () => {
      const mockResponse = {
        success: true,
        data: { 
          id: 'order-123', 
          status: 'refunded',
          refundInfo: { amount: 50.00, reason: 'Partial refund' },
        },
      };
      mockFetchResponse(mockResponse);

      const result = await adminRefundOrder('order-123', { amount: 50.00, reason: 'Partial refund' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/order-123/refund',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amount: 50.00, reason: 'Partial refund' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle full refund', async () => {
      mockFetchResponse({ success: true, data: {} });

      await adminRefundOrder('order-123', { amount: 199.99, reason: 'Full refund - defective product' });

      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(body.amount).toBe(199.99);
      expect(body.reason).toBe('Full refund - defective product');
    });
  });

  // ==========================================================================
  // adminAddOrderNote
  // ==========================================================================
  describe('adminAddOrderNote()', () => {
    it('should POST to /v1/admin/orders/:id/notes', async () => {
      const mockResponse = {
        success: true,
        data: { 
          id: 'note-1', 
          content: 'Customer called about delivery',
          isPrivate: false,
        },
      };
      mockFetchResponse(mockResponse);

      const result = await adminAddOrderNote(
        'order-123',
        'Customer called about delivery',
        false
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/order-123/notes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ 
            content: 'Customer called about delivery',
            isPrivate: false,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle private notes', async () => {
      mockFetchResponse({ success: true, data: {} });

      await adminAddOrderNote(
        'order-123',
        'Internal: Fraud investigation pending',
        true
      );

      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(body.content).toBe('Internal: Fraud investigation pending');
      expect(body.isPrivate).toBe(true);
    });
  });

  // ==========================================================================
  // adminBulkOrderAction
  // ==========================================================================
  describe('adminBulkOrderAction()', () => {
    it('should POST to /v1/admin/orders/bulk-action', async () => {
      const mockResponse = {
        success: true,
        data: { processed: 5, failed: 0 },
      };
      mockFetchResponse(mockResponse);

      const bulkAction = {
        orderIds: ['order-1', 'order-2', 'order-3', 'order-4', 'order-5'],
        action: 'process' as const,
      };

      const result = await adminBulkOrderAction(bulkAction);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/admin/orders/bulk-action',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(bulkAction),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // adminExportOrders
  // ==========================================================================
  describe('adminExportOrders()', () => {
    it('should GET /v1/admin/orders/export', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      mockFetchResponse(mockBlob);

      await adminExportOrders({ status: 'all' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/admin/orders/export'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle filters in export', async () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      mockFetchResponse(mockBlob);

      await adminExportOrders({ 
        status: 'delivered',
        createdAfter: '2024-01-01',
      });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('status=delivered');
      expect(calledUrl).toContain('createdAfter=2024-01-01');
    });
  });
});
