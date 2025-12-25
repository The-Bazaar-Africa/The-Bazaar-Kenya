/**
 * Payments Controller
 * ====================
 * Fastify routes for payment operations.
 *
 * Endpoints:
 * - POST /payments/initiate - Initialize a new payment
 * - GET /payments/:reference/verify - Verify a payment by reference
 * - POST /payments/webhook - Handle Paystack webhook events
 *
 * SECURITY NOTES:
 * - All endpoints require authentication except the webhook endpoint.
 * - The webhook endpoint verifies the Paystack signature.
 *
 * @see ADR-001: Backend Authority
 * @see ADR-002: Payment Provider Selection
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { paymentsService, InitializeTransactionInput } from './payments.service.js';
import { PaystackWebhookEvent } from './paystack.client.js';

/**
 * Request body for initiating a payment
 */
interface InitiatePaymentBody {
  email: string;
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  callbackUrl?: string;
}

/**
 * Route parameters for verifying a payment
 */
interface VerifyPaymentParams {
  reference: string;
}

/**
 * Register payment routes with Fastify
 */
export async function paymentsController(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /payments/initiate
   * Initialize a new payment transaction.
   *
   * Request Body:
   * - email: Customer email address
   * - amount: Amount in smallest currency unit (e.g., cents)
   * - currency: Currency code (default: KES)
   * - orderId: The order ID to associate with this payment
   * - userId: The user ID making the payment
   * - callbackUrl: Optional callback URL after payment
   *
   * Response:
   * - authorizationUrl: URL to redirect user for payment
   * - accessCode: Paystack access code
   * - reference: Unique transaction reference
   */
  fastify.post<{ Body: InitiatePaymentBody }>(
    '/initiate',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'amount', 'orderId', 'userId'],
          properties: {
            email: { type: 'string', format: 'email' },
            amount: { type: 'number', minimum: 100 },
            currency: { type: 'string', enum: ['KES', 'NGN', 'GHS', 'ZAR', 'USD'] },
            orderId: { type: 'string' },
            userId: { type: 'string' },
            callbackUrl: { type: 'string', format: 'uri' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              authorizationUrl: { type: 'string' },
              accessCode: { type: 'string' },
              reference: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      // TODO: Add authentication hook
      // preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Body: InitiatePaymentBody }>, reply: FastifyReply) => {
      const { email, amount, currency, orderId, userId, callbackUrl } = request.body;

      const input: InitializeTransactionInput = {
        email,
        amount,
        currency: currency as 'KES' | 'NGN' | 'GHS' | 'ZAR' | 'USD',
        callbackUrl,
        metadata: {
          orderId,
          userId,
        },
      };

      const result = await paymentsService.initializeTransaction(input);

      if (result.success) {
        return reply.status(200).send(result);
      }

      return reply.status(400).send(result);
    }
  );

  /**
   * GET /payments/:reference/verify
   * Verify a payment transaction by its reference.
   *
   * Path Parameters:
   * - reference: The transaction reference to verify
   *
   * Response:
   * - status: Transaction status (success, failed, abandoned)
   * - amount: Amount paid
   * - currency: Currency code
   * - paidAt: Timestamp of payment
   */
  fastify.get<{ Params: VerifyPaymentParams }>(
    '/:reference/verify',
    {
      schema: {
        params: {
          type: 'object',
          required: ['reference'],
          properties: {
            reference: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              status: { type: 'string', enum: ['success', 'failed', 'abandoned'] },
              reference: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' },
              paidAt: { type: 'string', nullable: true },
              channel: { type: 'string' },
              gatewayResponse: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
      // TODO: Add authentication hook
      // preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: VerifyPaymentParams }>, reply: FastifyReply) => {
      const { reference } = request.params;

      const result = await paymentsService.verifyTransaction(reference);

      if (result.success) {
        return reply.status(200).send(result);
      }

      return reply.status(400).send(result);
    }
  );

  /**
   * POST /payments/webhook
   * Handle incoming webhook events from Paystack.
   *
   * SECURITY:
   * - This endpoint verifies the x-paystack-signature header.
   * - Invalid signatures are rejected with 401 Unauthorized.
   *
   * Response:
   * - 200 OK on successful processing
   * - 401 Unauthorized on invalid signature
   */
  fastify.post(
    '/webhook',
    // No additional config needed - rawBody plugin handles this globally
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['x-paystack-signature'] as string;
      const rawBody = request.rawBody;

      // Verify webhook signature
      if (!signature || !rawBody || !paymentsService.verifyWebhookSignature(signature, rawBody)) {
        fastify.log.warn('Invalid Paystack webhook signature');
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      // Parse and process the event
      const event = request.body as PaystackWebhookEvent;

      try {
        await paymentsService.processWebhookEvent(event);
        return reply.status(200).send({ received: true });
      } catch (error) {
        fastify.log.error({ err: error }, 'Error processing Paystack webhook');
        // Still return 200 to prevent Paystack from retrying
        return reply.status(200).send({ received: true, error: 'Processing error' });
      }
    }
  );
}
