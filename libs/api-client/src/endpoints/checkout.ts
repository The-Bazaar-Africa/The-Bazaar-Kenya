/**
 * The Bazaar API v1 - Checkout Endpoint
 * ======================================
 * 
 * API functions for checkout and payment operations.
 * Maps to: apps/backend-api/src/routes/v1/checkout.ts
 */

import { get, post, patch, del } from '../http/client';
import type {
  ApiSuccessResponse,
  Order,
  CheckoutSession,
  ShippingMethod,
  InitiateCheckoutRequest,
  SetShippingRequest,
  SetBillingRequest,
  ApplyDiscountRequest,
  InitiatePaymentRequest,
  PaymentInitResponse,
  PaymentVerifyResponse,
} from '../generated';

// =============================================================================
// CHECKOUT SESSION ENDPOINTS
// =============================================================================

/**
 * Initiate a new checkout session.
 * 
 * @param cartId - Optional cart ID (uses current user's cart if not provided)
 * @returns Checkout session
 */
export function initiateCheckout(cartId?: string) {
  return post<ApiSuccessResponse<CheckoutSession>>('/v1/checkout', {
    cartId,
  } as InitiateCheckoutRequest, {
    requireAuth: true,
  });
}

/**
 * Get checkout session by ID.
 * 
 * @param sessionId - Checkout session ID
 * @returns Checkout session
 */
export function getCheckoutSession(sessionId: string) {
  return get<ApiSuccessResponse<CheckoutSession>>(`/v1/checkout/${sessionId}`, {
    requireAuth: true,
  });
}

/**
 * Set shipping address and method.
 * 
 * @param sessionId - Checkout session ID
 * @param addressId - Address ID
 * @param shippingMethodId - Shipping method ID
 * @returns Updated checkout session
 */
export function setShippingAddress(
  sessionId: string,
  addressId: string,
  shippingMethodId: string
) {
  return patch<ApiSuccessResponse<CheckoutSession>>(`/v1/checkout/${sessionId}/shipping`, {
    addressId,
    shippingMethodId,
  } as SetShippingRequest, {
    requireAuth: true,
  });
}

/**
 * Set billing address.
 * 
 * @param sessionId - Checkout session ID
 * @param addressId - Address ID
 * @returns Updated checkout session
 */
export function setBillingAddress(sessionId: string, addressId: string) {
  return patch<ApiSuccessResponse<CheckoutSession>>(`/v1/checkout/${sessionId}/billing`, {
    addressId,
  } as SetBillingRequest, {
    requireAuth: true,
  });
}

/**
 * Get available shipping methods.
 * 
 * @param sessionId - Checkout session ID
 * @returns Available shipping methods
 */
export function getShippingMethods(sessionId: string) {
  return get<ApiSuccessResponse<ShippingMethod[]>>(`/v1/checkout/${sessionId}/shipping-methods`, {
    requireAuth: true,
  });
}

// =============================================================================
// DISCOUNT ENDPOINTS
// =============================================================================

/**
 * Apply discount code.
 * 
 * @param sessionId - Checkout session ID
 * @param code - Discount code
 * @returns Updated checkout session
 */
export function applyDiscount(sessionId: string, code: string) {
  return post<ApiSuccessResponse<CheckoutSession>>(`/v1/checkout/${sessionId}/discount`, {
    code,
  } as ApplyDiscountRequest, {
    requireAuth: true,
  });
}

/**
 * Remove discount code.
 * 
 * @param sessionId - Checkout session ID
 * @returns Updated checkout session
 */
export function removeDiscount(sessionId: string) {
  return del<ApiSuccessResponse<CheckoutSession>>(`/v1/checkout/${sessionId}/discount`, {
    requireAuth: true,
  });
}

// =============================================================================
// PAYMENT ENDPOINTS
// =============================================================================

/**
 * Initiate payment.
 * 
 * @param sessionId - Checkout session ID
 * @param paymentMethodType - Payment method type
 * @returns Payment initialization data
 */
export function initiatePayment(
  sessionId: string,
  paymentMethodType: InitiatePaymentRequest['paymentMethodType']
) {
  return post<ApiSuccessResponse<PaymentInitResponse>>(
    `/v1/checkout/${sessionId}/payment/initialize`,
    { paymentMethodType } as InitiatePaymentRequest,
    { requireAuth: true }
  );
}

/**
 * Verify payment status.
 * 
 * @param reference - Payment reference
 * @returns Payment verification result
 */
export function verifyPayment(reference: string) {
  return get<ApiSuccessResponse<PaymentVerifyResponse>>(
    `/v1/checkout/payment/verify/${reference}`,
    { requireAuth: true }
  );
}

/**
 * Complete checkout and create order.
 * 
 * @param sessionId - Checkout session ID
 * @returns Created order
 */
export function completeCheckout(sessionId: string) {
  return post<ApiSuccessResponse<Order>>(`/v1/checkout/${sessionId}/complete`, undefined, {
    requireAuth: true,
  });
}
