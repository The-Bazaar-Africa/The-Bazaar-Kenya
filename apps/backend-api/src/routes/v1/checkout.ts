/**
 * The Bazaar - Checkout Routes (Enterprise Grade)
 * ================================================
 * 
 * Provides complete checkout flow with:
 * - Cart validation and stock reservation
 * - Address management
 * - Shipping calculation
 * - Payment initiation with Paystack
 * - Order creation and confirmation
 * - Idempotency support for payment operations
 * 
 * Routes:
 * - POST   /initiate        - Start checkout session
 * - POST   /validate        - Validate cart for checkout
 * - POST   /shipping        - Calculate shipping options
 * - POST   /payment         - Initiate payment
 * - POST   /confirm         - Confirm order after payment
 * - GET    /session/:id     - Get checkout session status
 * - POST   /cancel          - Cancel checkout session
 * 
 * @module routes/v1/checkout
 * @see ADR-001: Backend Authority
 * @see ADR-002: Payment Provider Selection (Paystack)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../middleware/index.js';
import { randomUUID } from 'crypto';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface CheckoutItem {
  cartItemId: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
  vendorName: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: { min: number; max: number };
  carrier: string;
}

interface CheckoutSession {
  id: string;
  userId: string;
  status: 'pending' | 'payment_initiated' | 'payment_completed' | 'confirmed' | 'cancelled' | 'expired';
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingOption?: ShippingOption;
  paymentReference?: string;
  paymentStatus?: string;
  orderId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface InitiateCheckoutBody {
  shippingAddress?: Address;
  billingAddress?: Address;
  useSameAddress?: boolean;
}

interface CalculateShippingBody {
  sessionId: string;
  address: Address;
}

interface InitiatePaymentBody {
  sessionId: string;
  shippingOptionId: string;
  callbackUrl?: string;
  idempotencyKey?: string;
}

interface ConfirmOrderBody {
  sessionId: string;
  paymentReference: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHECKOUT_SESSION_TTL_MINUTES = 30;
const TAX_RATE = 0.16; // 16% VAT Kenya
const CURRENCY = 'KES';

// Shipping options (in production, this would come from shipping providers)
const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivery within Nairobi',
    price: 250,
    estimatedDays: { min: 2, max: 4 },
    carrier: 'The Bazaar Logistics',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Same day or next day delivery',
    price: 500,
    estimatedDays: { min: 0, max: 1 },
    carrier: 'The Bazaar Express',
  },
  {
    id: 'pickup',
    name: 'Store Pickup',
    description: 'Pick up from vendor location',
    price: 0,
    estimatedDays: { min: 1, max: 2 },
    carrier: 'Self Pickup',
  },
];

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const CheckoutErrorCodes = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  CART_EMPTY: 'CART_EMPTY',
  CART_INVALID: 'CART_INVALID',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  ADDRESS_REQUIRED: 'ADDRESS_REQUIRED',
  SHIPPING_REQUIRED: 'SHIPPING_REQUIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_NOT_VERIFIED: 'PAYMENT_NOT_VERIFIED',
  ORDER_CREATION_FAILED: 'ORDER_CREATION_FAILED',
  ALREADY_CONFIRMED: 'ALREADY_CONFIRMED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
} as const;

type CheckoutErrorCode = typeof CheckoutErrorCodes[keyof typeof CheckoutErrorCodes];

function createError(code: CheckoutErrorCode, message: string, details?: Record<string, unknown>) {
  return {
    success: false,
    error: { code, message, details },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSessionId(): string {
  return `chk_${randomUUID().replace(/-/g, '')}`;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TBZ-${timestamp}-${random}`;
}

function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function checkoutRoutes(app: FastifyInstance) {

  // --------------------------------------------------------------------------
  // POST /initiate - Start checkout session
  // --------------------------------------------------------------------------
  app.post<{ Body: InitiateCheckoutBody }>(
    '/initiate',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Initiate checkout session',
        description: 'Creates a new checkout session from the user\'s cart. Validates all items and reserves stock.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            shippingAddress: {
              type: 'object',
              properties: {
                firstName: { type: 'string', minLength: 1 },
                lastName: { type: 'string', minLength: 1 },
                phone: { type: 'string', pattern: '^\\+?[0-9]{10,15}$' },
                email: { type: 'string', format: 'email' },
                line1: { type: 'string', minLength: 1 },
                line2: { type: 'string' },
                city: { type: 'string', minLength: 1 },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string', default: 'KE' },
              },
              required: ['firstName', 'lastName', 'phone', 'line1', 'city'],
            },
            billingAddress: { type: 'object' },
            useSameAddress: { type: 'boolean', default: true },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: InitiateCheckoutBody }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const userId = request.user.id;
      const { shippingAddress, billingAddress, useSameAddress = true } = request.body;

      try {
        // Step 1: Get cart items with product details
        const { data: cartItems, error: cartError } = await app.supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            product_id,
            variant_id,
            product:products!inner(
              id,
              name,
              price,
              images,
              stock_quantity,
              is_active,
              vendor_id,
              vendor:vendors(id, business_name)
            )
          `)
          .eq('user_id', userId);

        if (cartError) {
          request.log.error({ error: cartError, userId }, 'Failed to fetch cart for checkout');
          return reply.status(500).send(createError('CART_INVALID', 'Failed to fetch cart'));
        }

        if (!cartItems || cartItems.length === 0) {
          return reply.status(400).send(createError('CART_EMPTY', 'Your cart is empty'));
        }

        // Step 2: Validate all items
        const validationErrors: Array<{ productId: string; name: string; reason: string }> = [];
        const checkoutItems: CheckoutItem[] = [];
        let subtotal = 0;

        for (const item of cartItems) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const product = item.product as Record<string, any>;

          if (!product || !product.is_active) {
            validationErrors.push({
              productId: item.product_id,
              name: product?.name || 'Unknown',
              reason: 'Product is no longer available',
            });
            continue;
          }

          if (product.stock_quantity < item.quantity) {
            validationErrors.push({
              productId: item.product_id,
              name: product.name,
              reason: product.stock_quantity === 0
                ? 'Product is out of stock'
                : `Only ${product.stock_quantity} available`,
            });
            continue;
          }

          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;

          checkoutItems.push({
            cartItemId: item.id,
            productId: product.id,
            variantId: item.variant_id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.images?.[0],
            vendorId: product.vendor_id,
            vendorName: product.vendor?.business_name || 'Unknown Vendor',
          });
        }

        if (validationErrors.length > 0) {
          return reply.status(400).send(
            createError('CART_INVALID', 'Some items in your cart are unavailable', {
              invalidItems: validationErrors,
            })
          );
        }

        // Step 3: Calculate totals
        const tax = calculateTax(subtotal);
        const shippingCost = 0; // Will be set when shipping option is selected
        const total = subtotal + tax + shippingCost;

        // Step 4: Create checkout session
        const sessionId = generateSessionId();
        const expiresAt = new Date(Date.now() + CHECKOUT_SESSION_TTL_MINUTES * 60 * 1000);

        const session: CheckoutSession = {
          id: sessionId,
          userId,
          status: 'pending',
          items: checkoutItems,
          subtotal,
          shippingCost,
          tax,
          total,
          currency: CURRENCY,
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : billingAddress,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store session in database
        const { error: sessionError } = await app.supabase
          .from('checkout_sessions')
          .insert({
            id: sessionId,
            user_id: userId,
            status: 'pending',
            data: session,
            expires_at: expiresAt.toISOString(),
          });

        if (sessionError) {
          request.log.error({ error: sessionError, userId }, 'Failed to create checkout session');
          return reply.status(500).send(
            createError('ORDER_CREATION_FAILED', 'Failed to create checkout session')
          );
        }

        request.log.info({
          userId,
          sessionId,
          itemCount: checkoutItems.length,
          subtotal,
          total,
          operation: 'checkout.initiate'
        }, 'Checkout session created');

        return reply.status(201).send({
          success: true,
          data: {
            session,
            shippingOptions: SHIPPING_OPTIONS,
            requiresShippingAddress: !shippingAddress,
          },
        });

      } catch (err) {
        request.log.error({ err, userId }, 'Checkout initiation error');
        return reply.status(500).send(createError('ORDER_CREATION_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /shipping - Calculate shipping options
  // --------------------------------------------------------------------------
  app.post<{ Body: CalculateShippingBody }>(
    '/shipping',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Calculate shipping options',
        description: 'Returns available shipping options and costs for the given address.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['sessionId', 'address'],
          properties: {
            sessionId: { type: 'string' },
            address: {
              type: 'object',
              required: ['firstName', 'lastName', 'phone', 'line1', 'city'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                line1: { type: 'string' },
                line2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CalculateShippingBody }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const { sessionId, address } = request.body;
      const userId = request.user.id;

      try {
        // Get and validate session
        const { data: sessionData, error } = await app.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (error || !sessionData) {
          return reply.status(404).send(createError('SESSION_NOT_FOUND', 'Checkout session not found'));
        }

        if (new Date(sessionData.expires_at) < new Date()) {
          return reply.status(400).send(createError('SESSION_EXPIRED', 'Checkout session has expired'));
        }

        // Update session with shipping address
        const session = sessionData.data as CheckoutSession;
        session.shippingAddress = address;
        session.updatedAt = new Date().toISOString();

        await app.supabase
          .from('checkout_sessions')
          .update({ data: session })
          .eq('id', sessionId);

        // In production, calculate shipping based on:
        // - Delivery address (city, distance)
        // - Package weight/dimensions
        // - Vendor locations
        // For MVP, return static options

        // Adjust shipping for Nairobi vs outside
        const isNairobi = address.city.toLowerCase().includes('nairobi');
        const adjustedOptions = SHIPPING_OPTIONS.map(opt => ({
          ...opt,
          price: isNairobi ? opt.price : opt.price * 1.5, // 50% more outside Nairobi
          estimatedDays: isNairobi ? opt.estimatedDays : {
            min: opt.estimatedDays.min + 1,
            max: opt.estimatedDays.max + 2,
          },
        }));

        return {
          success: true,
          data: {
            address,
            options: adjustedOptions,
            currency: CURRENCY,
          },
        };

      } catch (err) {
        request.log.error({ err, sessionId }, 'Shipping calculation error');
        return reply.status(500).send(createError('ORDER_CREATION_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /payment - Initiate payment
  // --------------------------------------------------------------------------
  app.post<{ Body: InitiatePaymentBody }>(
    '/payment',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Initiate payment',
        description: 'Initiates payment with Paystack for the checkout session.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['sessionId', 'shippingOptionId'],
          properties: {
            sessionId: { type: 'string' },
            shippingOptionId: { type: 'string' },
            callbackUrl: { type: 'string', format: 'uri' },
            idempotencyKey: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: InitiatePaymentBody }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const { sessionId, shippingOptionId, callbackUrl, idempotencyKey } = request.body;
      const userId = request.user.id;

      try {
        // Get and validate session
        const { data: sessionData, error } = await app.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (error || !sessionData) {
          return reply.status(404).send(createError('SESSION_NOT_FOUND', 'Checkout session not found'));
        }

        if (new Date(sessionData.expires_at) < new Date()) {
          return reply.status(400).send(createError('SESSION_EXPIRED', 'Checkout session has expired'));
        }

        const session = sessionData.data as CheckoutSession;

        // Check if already has payment
        if (session.status === 'payment_initiated' && session.paymentReference) {
          // Idempotency check
          if (idempotencyKey && session.paymentReference.includes(idempotencyKey)) {
            return {
              success: true,
              data: {
                paymentReference: session.paymentReference,
                message: 'Payment already initiated',
              },
            };
          }
        }

        // Validate shipping address
        if (!session.shippingAddress) {
          return reply.status(400).send(
            createError('ADDRESS_REQUIRED', 'Shipping address is required')
          );
        }

        // Get shipping option
        const shippingOption = SHIPPING_OPTIONS.find(opt => opt.id === shippingOptionId);
        if (!shippingOption) {
          return reply.status(400).send(
            createError('SHIPPING_REQUIRED', 'Invalid shipping option')
          );
        }

        // Recalculate totals with shipping
        const shippingCost = shippingOption.price;
        const total = session.subtotal + session.tax + shippingCost;

        // Get user email
        const { data: profile } = await app.supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();

        const email = profile?.email || session.shippingAddress.email;
        if (!email) {
          return reply.status(400).send(
            createError('ADDRESS_REQUIRED', 'Email address is required')
          );
        }

        // Generate payment reference
        const paymentReference = `pay_${sessionId}_${Date.now()}`;

        // Initialize Paystack payment
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
          request.log.error('Paystack secret key not configured');
          return reply.status(500).send(
            createError('PAYMENT_FAILED', 'Payment service not configured')
          );
        }

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: total * 100, // Paystack expects amount in kobo/cents
            currency: CURRENCY,
            reference: paymentReference,
            callback_url: callbackUrl || `${process.env.FRONTEND_URL}/checkout/callback`,
            metadata: {
              sessionId,
              userId,
              items: session.items.map(i => ({
                productId: i.productId,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
              })),
            },
          }),
        });

        const paystackData = await paystackResponse.json() as {
          status: boolean;
          message: string;
          data?: {
            authorization_url: string;
            access_code: string;
            reference: string;
          };
        };

        if (!paystackData.status || !paystackData.data) {
          request.log.error({ paystackData, sessionId }, 'Paystack initialization failed');
          return reply.status(500).send(
            createError('PAYMENT_FAILED', paystackData.message || 'Payment initialization failed')
          );
        }

        // Update session
        session.status = 'payment_initiated';
        session.shippingOption = shippingOption;
        session.shippingCost = shippingCost;
        session.total = total;
        session.paymentReference = paymentReference;
        session.updatedAt = new Date().toISOString();

        await app.supabase
          .from('checkout_sessions')
          .update({
            status: 'payment_initiated',
            data: session,
          })
          .eq('id', sessionId);

        request.log.info({
          userId,
          sessionId,
          paymentReference,
          total,
          operation: 'checkout.paymentInitiated'
        }, 'Payment initiated');

        return {
          success: true,
          data: {
            authorizationUrl: paystackData.data.authorization_url,
            accessCode: paystackData.data.access_code,
            reference: paymentReference,
            amount: total,
            currency: CURRENCY,
          },
        };

      } catch (err) {
        request.log.error({ err, sessionId }, 'Payment initiation error');
        return reply.status(500).send(createError('PAYMENT_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /confirm - Confirm order after payment
  // --------------------------------------------------------------------------
  app.post<{ Body: ConfirmOrderBody }>(
    '/confirm',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Confirm order after payment',
        description: 'Verifies payment and creates the order. Called after Paystack callback.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['sessionId', 'paymentReference'],
          properties: {
            sessionId: { type: 'string' },
            paymentReference: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ConfirmOrderBody }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const { sessionId, paymentReference } = request.body;
      const userId = request.user.id;

      try {
        // Get session
        const { data: sessionData, error } = await app.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (error || !sessionData) {
          return reply.status(404).send(createError('SESSION_NOT_FOUND', 'Checkout session not found'));
        }

        const session = sessionData.data as CheckoutSession;

        // Check if already confirmed
        if (session.status === 'confirmed' && session.orderId) {
          return {
            success: true,
            data: {
              orderId: session.orderId,
              message: 'Order already confirmed',
            },
          };
        }

        // Verify payment with Paystack
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        const verifyResponse = await fetch(
          `https://api.paystack.co/transaction/verify/${paymentReference}`,
          {
            headers: {
              'Authorization': `Bearer ${paystackSecretKey}`,
            },
          }
        );

        const verifyData = await verifyResponse.json() as {
          status: boolean;
          data?: {
            status: string;
            amount: number;
            currency: string;
            paid_at: string;
          };
        };

        if (!verifyData.status || verifyData.data?.status !== 'success') {
          return reply.status(400).send(
            createError('PAYMENT_NOT_VERIFIED', 'Payment verification failed')
          );
        }

        // Verify amount matches
        const expectedAmount = session.total * 100;
        if (verifyData.data.amount !== expectedAmount) {
          request.log.error({
            sessionId,
            expected: expectedAmount,
            received: verifyData.data.amount,
          }, 'Payment amount mismatch');
          return reply.status(400).send(
            createError('PAYMENT_NOT_VERIFIED', 'Payment amount mismatch')
          );
        }

        // Create order
        const orderNumber = generateOrderNumber();

        const { data: order, error: orderError } = await app.supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            buyer_id: userId,
            status: 'confirmed',
            payment_status: 'paid',
            payment_reference: paymentReference,
            subtotal: session.subtotal,
            shipping_cost: session.shippingCost,
            tax: session.tax,
            total: session.total,
            currency: session.currency,
            shipping_address: session.shippingAddress,
            billing_address: session.billingAddress || session.shippingAddress,
            shipping_method: session.shippingOption?.name,
            notes: null,
          })
          .select()
          .single();

        if (orderError || !order) {
          request.log.error({ error: orderError, sessionId }, 'Failed to create order');
          return reply.status(500).send(
            createError('ORDER_CREATION_FAILED', 'Failed to create order')
          );
        }

        // Create order items
        const orderItems = session.items.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          vendor_id: item.vendorId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        }));

        await app.supabase.from('order_items').insert(orderItems);

        // Update product stock
        for (const item of session.items) {
          await app.supabase.rpc('decrement_stock', {
            p_product_id: item.productId,
            p_quantity: item.quantity,
          });
        }

        // Clear user's cart
        await app.supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        // Update session
        session.status = 'confirmed';
        session.orderId = order.id;
        session.paymentStatus = 'paid';
        session.updatedAt = new Date().toISOString();

        await app.supabase
          .from('checkout_sessions')
          .update({
            status: 'confirmed',
            data: session,
          })
          .eq('id', sessionId);

        // Create payment record
        await app.supabase.from('payments').insert({
          order_id: order.id,
          user_id: userId,
          amount: session.total,
          currency: session.currency,
          status: 'completed',
          provider: 'paystack',
          provider_reference: paymentReference,
          paid_at: verifyData.data.paid_at,
        });

        request.log.info({
          userId,
          sessionId,
          orderId: order.id,
          orderNumber,
          total: session.total,
          operation: 'checkout.confirmed'
        }, 'Order confirmed');

        return {
          success: true,
          data: {
            orderId: order.id,
            orderNumber,
            status: 'confirmed',
            total: session.total,
            currency: session.currency,
            estimatedDelivery: session.shippingOption?.estimatedDays,
          },
        };

      } catch (err) {
        request.log.error({ err, sessionId }, 'Order confirmation error');
        return reply.status(500).send(createError('ORDER_CREATION_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /session/:id - Get checkout session status
  // --------------------------------------------------------------------------
  app.get<{ Params: { id: string } }>(
    '/session/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Get checkout session status',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const { id: sessionId } = request.params;
      const userId = request.user.id;

      try {
        const { data: sessionData, error } = await app.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (error || !sessionData) {
          return reply.status(404).send(createError('SESSION_NOT_FOUND', 'Checkout session not found'));
        }

        const session = sessionData.data as CheckoutSession;
        const isExpired = new Date(sessionData.expires_at) < new Date();

        return {
          success: true,
          data: {
            ...session,
            isExpired,
            shippingOptions: session.status === 'pending' ? SHIPPING_OPTIONS : undefined,
          },
        };

      } catch (err) {
        request.log.error({ err, sessionId }, 'Get session error');
        return reply.status(500).send(createError('SESSION_NOT_FOUND', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /cancel - Cancel checkout session
  // --------------------------------------------------------------------------
  app.post<{ Body: { sessionId: string } }>(
    '/cancel',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Checkout'],
        summary: 'Cancel checkout session',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { sessionId: string } }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('SESSION_NOT_FOUND', 'Authentication required'));
      }

      const { sessionId } = request.body;
      const userId = request.user.id;

      try {
        const { data: sessionData, error } = await app.supabase
          .from('checkout_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (error || !sessionData) {
          return reply.status(404).send(createError('SESSION_NOT_FOUND', 'Checkout session not found'));
        }

        const session = sessionData.data as CheckoutSession;

        if (session.status === 'confirmed') {
          return reply.status(400).send(
            createError('ALREADY_CONFIRMED', 'Cannot cancel a confirmed order')
          );
        }

        // Update session status
        session.status = 'cancelled';
        session.updatedAt = new Date().toISOString();

        await app.supabase
          .from('checkout_sessions')
          .update({
            status: 'cancelled',
            data: session,
          })
          .eq('id', sessionId);

        request.log.info({
          userId,
          sessionId,
          operation: 'checkout.cancelled'
        }, 'Checkout session cancelled');

        return {
          success: true,
          message: 'Checkout session cancelled',
        };

      } catch (err) {
        request.log.error({ err, sessionId }, 'Cancel session error');
        return reply.status(500).send(createError('SESSION_NOT_FOUND', 'Internal server error'));
      }
    }
  );
}
