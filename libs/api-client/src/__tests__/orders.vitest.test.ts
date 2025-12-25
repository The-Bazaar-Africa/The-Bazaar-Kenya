/**
 * Orders Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the orders API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  trackOrder,
} from '../endpoints/orders';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Orders Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'test-token',
    });
  });

  // ==========================================================================
  // getMyOrders
  // ==========================================================================
  describe('getMyOrders()', () => {
    it('should GET /v1/orders with auth', async () => {
      mockFetchResponse({
        success: true,
        data: {
          orders: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      });

      await getMyOrders();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should include filters as query params', async () => {
      mockFetchResponse({
        success: true,
        data: { orders: [], pagination: {} },
      });

      await getMyOrders({ status: 'pending', page: 2 });

      const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledUrl).toContain('status=pending');
      expect(calledUrl).toContain('page=2');
    });
  });

  // ==========================================================================
  // getOrderById
  // ==========================================================================
  describe('getOrderById()', () => {
    it('should GET /v1/orders/:id with auth', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'order-1', orderNumber: 'ORD-001' },
      });

      await getOrderById('order-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders/order-1',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // getOrderByNumber
  // ==========================================================================
  describe('getOrderByNumber()', () => {
    it('should GET /v1/orders/number/:orderNumber with auth', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'order-1', orderNumber: 'ORD-001' },
      });

      await getOrderByNumber('ORD-001');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders/number/ORD-001',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // createOrder
  // ==========================================================================
  describe('createOrder()', () => {
    it('should POST order data to /v1/orders', async () => {
      const orderData = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        shippingAddress: {
          line1: '123 Test St',
          city: 'Nairobi',
          postalCode: '00100',
          country: 'Kenya',
        },
        paymentMethod: 'paystack',
      };
      mockFetchResponse({
        success: true,
        data: { id: 'order-new', orderNumber: 'ORD-002' },
      });

      await createOrder(orderData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(orderData),
        })
      );
    });
  });

  // ==========================================================================
  // cancelOrder
  // ==========================================================================
  describe('cancelOrder()', () => {
    it('should POST to /v1/orders/:id/cancel with reason', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'order-1', status: 'cancelled' },
      });

      await cancelOrder('order-1', 'Changed my mind');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders/order-1/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'Changed my mind' }),
        })
      );
    });
  });

  // ==========================================================================
  // updateOrderStatus
  // ==========================================================================
  describe('updateOrderStatus()', () => {
    it('should PATCH /v1/orders/:id/status with new status', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'order-1', status: 'shipped' },
      });

      await updateOrderStatus('order-1', {
        status: 'shipped',
        trackingNumber: 'TRACK123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders/order-1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            status: 'shipped',
            trackingNumber: 'TRACK123',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // trackOrder
  // ==========================================================================
  describe('trackOrder()', () => {
    it('should GET /v1/orders/track/:orderNumber (public)', async () => {
      mockFetchResponse({
        success: true,
        data: {
          status: 'shipped',
          trackingNumber: 'TRACK123',
          updates: [],
        },
      });

      await trackOrder('ORD-001');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/orders/track/ORD-001',
        expect.any(Object)
      );
    });
  });
});
