/**
 * Payments Module
 * ================
 * Exports for the payments module.
 *
 * @see ADR-002: Payment Provider Selection
 */

export { paymentsController } from './payments.controller.js';
export { paymentsService, PaymentsService } from './payments.service.js';
export type {
  InitializeTransactionInput,
  InitializeTransactionResult,
  VerifyTransactionResult,
} from './payments.service.js';
export {
  paystackClient,
  isPaystackError,
  getPaystackErrorMessage,
} from './paystack.client.js';
export type {
  PaystackResponse,
  PaystackTransactionInitData,
  PaystackTransactionVerifyData,
  PaystackWebhookEvent,
} from './paystack.client.js';
