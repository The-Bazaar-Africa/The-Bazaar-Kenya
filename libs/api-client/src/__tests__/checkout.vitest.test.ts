/**
 * Checkout Endpoint Tests (Vitest)
 * 
 * Comprehensive tests for the checkout API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initiateCheckout,
  getCheckoutSession,
  setShippingAddress,
  setBillingAddress,
  getShippingMethods,
  applyDiscount,
  removeDiscount,
  initiatePayment,
  verifyPayment,
  completeCheckout,
} from '../endpoints/checkout';
import { configureHttpClient } from '../http/client';
import { mockFetchResponse } from './setup';

describe('Checkout Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureHttpClient({
      baseUrl: 'http://localhost:3000',
      getAccessToken: () => 'test-token',
    });
  });

  // ==========================================================================
  // initiateCheckout
  // ==========================================================================
  describe('initiateCheckout()', () => {
    it('should POST to /v1/checkout', async () => {
      mockFetchResponse({
        success: true,
        data: {
          id: 'checkout-1',
          cartId: 'cart-1',
          status: 'pending',
          total: 0,
        },
      });

      await initiateCheckout('cart-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cartId: 'cart-1' }),
        })
      );
    });
  });

  // ==========================================================================
  // getCheckoutSession
  // ==========================================================================
  describe('getCheckoutSession()', () => {
    it('should GET /v1/checkout/:id', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'checkout-1', status: 'pending' },
      });

      await getCheckoutSession('checkout-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // setShippingAddress
  // ==========================================================================
  describe('setShippingAddress()', () => {
    it('should PATCH /v1/checkout/:id/shipping', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'checkout-1', status: 'shipping_set' },
      });

      await setShippingAddress('checkout-1', 'addr-1', 'ship-method-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/shipping',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            addressId: 'addr-1',
            shippingMethodId: 'ship-method-1',
          }),
        })
      );
    });
  });

  // ==========================================================================
  // setBillingAddress
  // ==========================================================================
  describe('setBillingAddress()', () => {
    it('should PATCH /v1/checkout/:id/billing', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'checkout-1' },
      });

      await setBillingAddress('checkout-1', 'addr-2');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/billing',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ addressId: 'addr-2' }),
        })
      );
    });
  });

  // ==========================================================================
  // getShippingMethods
  // ==========================================================================
  describe('getShippingMethods()', () => {
    it('should GET /v1/checkout/:id/shipping-methods', async () => {
      mockFetchResponse({
        success: true,
        data: [
          { id: 'standard', name: 'Standard', price: 500, estimatedDays: 5 },
          { id: 'express', name: 'Express', price: 1000, estimatedDays: 2 },
        ],
      });

      await getShippingMethods('checkout-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/shipping-methods',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // applyDiscount
  // ==========================================================================
  describe('applyDiscount()', () => {
    it('should POST discount code to /v1/checkout/:id/discount', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'checkout-1', discount: 500, discountCode: 'SAVE10' },
      });

      await applyDiscount('checkout-1', 'SAVE10');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/discount',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'SAVE10' }),
        })
      );
    });
  });

  // ==========================================================================
  // removeDiscount
  // ==========================================================================
  describe('removeDiscount()', () => {
    it('should DELETE /v1/checkout/:id/discount', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'checkout-1', discount: 0 },
      });

      await removeDiscount('checkout-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/discount',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // initiatePayment
  // ==========================================================================
  describe('initiatePayment()', () => {
    it('should POST to /v1/checkout/:id/payment/initialize', async () => {
      mockFetchResponse({
        success: true,
        data: {
          authorizationUrl: 'https://paystack.com/pay/xyz',
          accessCode: 'access-123',
          reference: 'ref-123',
        },
      });

      await initiatePayment('checkout-1', 'paystack');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/payment/initialize',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ paymentMethodType: 'paystack' }),
        })
      );
    });
  });

  // ==========================================================================
  // verifyPayment
  // ==========================================================================
  describe('verifyPayment()', () => {
    it('should GET /v1/checkout/payment/verify/:reference', async () => {
      mockFetchResponse({
        success: true,
        data: {
          status: 'success',
          reference: 'ref-123',
          message: 'Payment successful',
        },
      });

      await verifyPayment('ref-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/payment/verify/ref-123',
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // completeCheckout
  // ==========================================================================
  describe('completeCheckout()', () => {
    it('should POST to /v1/checkout/:id/complete', async () => {
      mockFetchResponse({
        success: true,
        data: { id: 'order-1', orderNumber: 'ORD-001' },
      });

      await completeCheckout('checkout-1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/checkout/checkout-1/complete',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
