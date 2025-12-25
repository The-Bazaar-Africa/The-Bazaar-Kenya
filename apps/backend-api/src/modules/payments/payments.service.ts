/**
 * Payments Service
 * =================
 * Business logic layer for all payment operations.
 *
 * This service handles:
 * - Transaction initialization
 * - Transaction verification
 * - Webhook event processing
 * - Refund initiation (future)
 *
 * SECURITY NOTES:
 * - All Paystack interactions go through this service.
 * - This service is the ONLY place where Paystack API calls are made.
 * - Frontend applications must call backend-api endpoints, not Paystack directly.
 *
 * @see ADR-001: Backend Authority
 * @see ADR-002: Payment Provider Selection
 */

import crypto from 'crypto';
import {
  paystackClient,
  PaystackResponse,
  PaystackTransactionInitData,
  PaystackTransactionVerifyData,
  PaystackWebhookEvent,
  getPaystackErrorMessage,
} from './paystack.client.js';
import { paystackConfig, PaystackCurrency } from '../../config/paystack.config.js';

/**
 * Input for initializing a transaction
 */
export interface InitializeTransactionInput {
  email: string;
  amount: number; // Amount in the smallest currency unit (e.g., cents/kobo)
  currency?: PaystackCurrency;
  reference?: string;
  callbackUrl?: string;
  metadata?: {
    orderId: string;
    userId: string;
    [key: string]: unknown;
  };
}

/**
 * Result of transaction initialization
 */
export interface InitializeTransactionResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  error?: string;
}

/**
 * Result of transaction verification
 */
export interface VerifyTransactionResult {
  success: boolean;
  status?: 'success' | 'failed' | 'abandoned';
  reference?: string;
  amount?: number;
  currency?: string;
  paidAt?: string | null;
  channel?: string;
  gatewayResponse?: string;
  customer?: {
    email: string;
  };
  metadata?: Record<string, unknown>;
  error?: string;
}

/**
 * Payments Service Class
 */
export class PaymentsService {
  /**
   * Initialize a new transaction with Paystack.
   *
   * @param input - Transaction initialization parameters
   * @returns InitializeTransactionResult
   */
  async initializeTransaction(
    input: InitializeTransactionInput
  ): Promise<InitializeTransactionResult> {
    try {
      const response = await paystackClient.post<PaystackResponse<PaystackTransactionInitData>>(
        '/transaction/initialize',
        {
          email: input.email,
          amount: input.amount,
          currency: input.currency || paystackConfig.defaultCurrency,
          reference: input.reference,
          callback_url: input.callbackUrl,
          metadata: input.metadata,
        }
      );

      if (response.data.status) {
        return {
          success: true,
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
        };
      }

      return {
        success: false,
        error: response.data.message || 'Failed to initialize transaction',
      };
    } catch (error) {
      return {
        success: false,
        error: getPaystackErrorMessage(error),
      };
    }
  }

  /**
   * Verify a transaction by its reference.
   *
   * @param reference - The transaction reference to verify
   * @returns VerifyTransactionResult
   */
  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    try {
      const response = await paystackClient.get<PaystackResponse<PaystackTransactionVerifyData>>(
        `/transaction/verify/${encodeURIComponent(reference)}`
      );

      if (response.data.status) {
        const data = response.data.data;
        return {
          success: true,
          status: data.status,
          reference: data.reference,
          amount: data.amount,
          currency: data.currency,
          paidAt: data.paid_at,
          channel: data.channel,
          gatewayResponse: data.gateway_response,
          customer: {
            email: data.customer.email,
          },
          metadata: data.metadata,
        };
      }

      return {
        success: false,
        error: response.data.message || 'Failed to verify transaction',
      };
    } catch (error) {
      return {
        success: false,
        error: getPaystackErrorMessage(error),
      };
    }
  }

  /**
   * Verify the authenticity of a Paystack webhook event.
   *
   * @param signature - The x-paystack-signature header value
   * @param payload - The raw request body as a string
   * @returns boolean indicating if the signature is valid
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!paystackConfig.webhookSecret) {
      console.warn('PAYSTACK_WEBHOOK_SECRET is not configured. Webhook verification skipped.');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', paystackConfig.webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Process a webhook event from Paystack.
   *
   * @param event - The parsed webhook event
   * @returns void
   */
  async processWebhookEvent(event: PaystackWebhookEvent): Promise<void> {
    switch (event.event) {
      case 'charge.success':
        await this.handleChargeSuccess(event.data);
        break;
      case 'charge.failed':
        await this.handleChargeFailed(event.data);
        break;
      case 'transfer.success':
        await this.handleTransferSuccess(event.data);
        break;
      case 'transfer.failed':
        await this.handleTransferFailed(event.data);
        break;
      default:
        console.info(`Unhandled Paystack event: ${event.event}`);
    }
  }

  /**
   * Handle a successful charge event.
   * This is where you update the order status in the database.
   */
  private async handleChargeSuccess(data: PaystackTransactionVerifyData): Promise<void> {
    console.info(`Payment successful for reference: ${data.reference}`);
    // TODO: Update order status to 'paid' in the database
    // TODO: Send confirmation email to customer
    // TODO: Notify vendor of new order
  }

  /**
   * Handle a failed charge event.
   */
  private async handleChargeFailed(data: PaystackTransactionVerifyData): Promise<void> {
    console.info(`Payment failed for reference: ${data.reference}`);
    // TODO: Update order status to 'payment_failed' in the database
    // TODO: Send failure notification to customer
  }

  /**
   * Handle a successful transfer event (for vendor payouts).
   */
  private async handleTransferSuccess(data: PaystackTransactionVerifyData): Promise<void> {
    console.info(`Transfer successful for reference: ${data.reference}`);
    // TODO: Update payout status in the database
  }

  /**
   * Handle a failed transfer event.
   */
  private async handleTransferFailed(data: PaystackTransactionVerifyData): Promise<void> {
    console.info(`Transfer failed for reference: ${data.reference}`);
    // TODO: Update payout status and notify admin
  }
}

/**
 * Singleton instance of the PaymentsService
 */
export const paymentsService = new PaymentsService();
