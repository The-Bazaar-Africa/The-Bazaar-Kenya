/**
 * The Bazaar - Cart Routes (Enterprise Grade)
 * ============================================
 * 
 * Provides complete shopping cart functionality with:
 * - Full input validation and sanitization
 * - Comprehensive error handling with typed responses
 * - Stock validation and reservation
 * - Guest cart to user cart merging
 * - Audit logging for cart operations
 * 
 * Routes:
 * - GET    /           - Get cart items for authenticated user
 * - GET    /summary    - Get cart summary with totals and validation
 * - GET    /validate   - Validate cart items (stock, availability)
 * - POST   /items      - Add item to cart
 * - PATCH  /items/:id  - Update cart item quantity
 * - DELETE /items/:id  - Remove item from cart
 * - DELETE /           - Clear entire cart
 * - POST   /merge      - Merge guest cart after login
 * 
 * @module routes/v1/cart
 * @see ADR-001: Backend Authority
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../middleware/index.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CartItemResponse {
  id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: string[];
    stock_quantity: number;
    is_active: boolean;
    sku: string | null;
    vendor: {
      id: string;
      business_name: string;
      slug: string;
    } | null;
  } | null;
  variant?: {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
  } | null;
}

interface CartSummaryResponse {
  items: CartItemResponse[];
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  currency: string;
  estimatedTax: number;
  estimatedTotal: number;
  hasInvalidItems: boolean;
  invalidItems: Array<{
    cartItemId: string;
    productName: string;
    reason: string;
    suggestedAction: 'remove' | 'reduce_quantity' | 'wait';
  }>;
}

interface AddToCartBody {
  productId: string;
  quantity: number;
  variantId?: string;
}

interface UpdateCartItemBody {
  quantity: number;
}

interface MergeCartBody {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  sessionId?: string;
}

interface CartValidationResult {
  valid: boolean;
  items: Array<{
    cartItemId: string;
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    isAvailable: boolean;
    reason?: string;
  }>;
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const CartErrorCodes = {
  CART_EMPTY: 'CART_EMPTY',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CART_ITEM_NOT_FOUND: 'CART_ITEM_NOT_FOUND',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  MAX_QUANTITY_EXCEEDED: 'MAX_QUANTITY_EXCEEDED',
  MERGE_FAILED: 'MERGE_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const;

type CartErrorCode = typeof CartErrorCodes[keyof typeof CartErrorCodes];

interface CartError {
  success: false;
  error: {
    code: CartErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_CART_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;
const TAX_RATE = 0.16; // 16% VAT in Kenya

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createCartError(
  code: CartErrorCode,
  message: string,
  details?: Record<string, unknown>
): CartError {
  return {
    success: false,
    error: { code, message, details },
  };
}

function calculateCartTotals(items: CartItemResponse[]): {
  subtotal: number;
  itemCount: number;
  uniqueItemCount: number;
  estimatedTax: number;
  estimatedTotal: number;
} {
  const activeItems = items.filter(item => item.product?.is_active);
  
  const subtotal = activeItems.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItemCount = activeItems.length;
  const estimatedTax = Math.round(subtotal * TAX_RATE);
  const estimatedTotal = subtotal + estimatedTax;

  return { subtotal, itemCount, uniqueItemCount, estimatedTax, estimatedTotal };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function cartRoutes(app: FastifyInstance) {
  
  // --------------------------------------------------------------------------
  // GET / - Get cart items
  // --------------------------------------------------------------------------
  app.get(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Get cart items for authenticated user',
        description: 'Retrieves all items in the user\'s cart with full product details including vendor information.',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: true },
              data: {
                type: 'object',
                properties: {
                  items: { type: 'array' },
                  itemCount: { type: 'integer' },
                  uniqueItemCount: { type: 'integer' },
                },
              },
              meta: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  cached: { type: 'boolean' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'object' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;
      const startTime = Date.now();

      try {
        const { data, error } = await app.supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            variant_id,
            created_at,
            updated_at,
            product:products!inner(
              id,
              name,
              slug,
              price,
              compare_at_price,
              images,
              stock_quantity,
              is_active,
              sku,
              vendor:vendors(
                id,
                business_name,
                slug
              )
            ),
            variant:product_variants(
              id,
              name,
              price,
              stock_quantity
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          request.log.error({ 
            error: error.message, 
            code: error.code,
            userId,
            operation: 'cart.get'
          }, 'Database error fetching cart');
          
          return reply.status(500).send(
            createCartError('VALIDATION_FAILED', 'Failed to fetch cart items')
          );
        }

        const items = (data || []) as unknown as CartItemResponse[];
        const activeItems = items.filter(item => item.product?.is_active);
        const { itemCount, uniqueItemCount } = calculateCartTotals(activeItems);

        request.log.info({
          userId,
          itemCount,
          uniqueItemCount,
          duration: Date.now() - startTime,
          operation: 'cart.get'
        }, 'Cart fetched successfully');

        return {
          success: true,
          data: {
            items: activeItems,
            itemCount,
            uniqueItemCount,
          },
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
          },
        };
      } catch (err) {
        request.log.error({ 
          err, 
          userId,
          operation: 'cart.get'
        }, 'Unexpected error fetching cart');
        
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /summary - Get cart summary with totals
  // --------------------------------------------------------------------------
  app.get(
    '/summary',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Get cart summary with totals and validation',
        description: 'Returns complete cart summary including subtotal, tax estimates, and validation of all items.',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;

      try {
        const { data, error } = await app.supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            variant_id,
            created_at,
            updated_at,
            product:products!inner(
              id,
              name,
              slug,
              price,
              compare_at_price,
              images,
              stock_quantity,
              is_active,
              sku,
              vendor:vendors(id, business_name, slug)
            ),
            variant:product_variants(id, name, price, stock_quantity)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          request.log.error({ error: error.message, userId }, 'Failed to fetch cart summary');
          return reply.status(500).send(
            createCartError('VALIDATION_FAILED', 'Failed to fetch cart summary')
          );
        }

        const items = (data || []) as unknown as CartItemResponse[];
        const totals = calculateCartTotals(items);

        // Validate items for stock and availability
        const invalidItems: CartSummaryResponse['invalidItems'] = [];
        
        for (const item of items) {
          if (!item.product) {
            invalidItems.push({
              cartItemId: item.id,
              productName: 'Unknown Product',
              reason: 'Product no longer exists',
              suggestedAction: 'remove',
            });
            continue;
          }

          if (!item.product.is_active) {
            invalidItems.push({
              cartItemId: item.id,
              productName: item.product.name,
              reason: 'Product is no longer available',
              suggestedAction: 'remove',
            });
            continue;
          }

          const availableStock = item.variant?.stock_quantity ?? item.product.stock_quantity;
          if (item.quantity > availableStock) {
            invalidItems.push({
              cartItemId: item.id,
              productName: item.product.name,
              reason: availableStock === 0 
                ? 'Product is out of stock' 
                : `Only ${availableStock} items available`,
              suggestedAction: availableStock === 0 ? 'remove' : 'reduce_quantity',
            });
          }
        }

        const summary: CartSummaryResponse = {
          items,
          ...totals,
          currency: 'KES',
          hasInvalidItems: invalidItems.length > 0,
          invalidItems,
        };

        request.log.info({
          userId,
          itemCount: totals.itemCount,
          subtotal: totals.subtotal,
          hasInvalidItems: invalidItems.length > 0,
          operation: 'cart.summary'
        }, 'Cart summary generated');

        return { success: true, data: summary };
      } catch (err) {
        request.log.error({ err, userId }, 'Cart summary error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /validate - Validate cart items
  // --------------------------------------------------------------------------
  app.get(
    '/validate',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Validate cart items for checkout readiness',
        description: 'Checks all cart items for stock availability and product status before checkout.',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;

      try {
        const { data, error } = await app.supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            product_id,
            variant_id,
            product:products(id, name, stock_quantity, is_active, status),
            variant:product_variants(id, stock_quantity)
          `)
          .eq('user_id', userId);

        if (error) {
          return reply.status(500).send(
            createCartError('VALIDATION_FAILED', 'Failed to validate cart')
          );
        }

        if (!data || data.length === 0) {
          return reply.status(400).send(
            createCartError('CART_EMPTY', 'Cart is empty')
          );
        }

        const validationResult: CartValidationResult = {
          valid: true,
          items: [],
        };

        for (const item of data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const product = item.product as Record<string, any>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const variant = item.variant as Record<string, any> | null;
          
          const availableQuantity = variant?.stock_quantity ?? product?.stock_quantity ?? 0;
          const isAvailable = product?.is_active && availableQuantity >= item.quantity;

          let reason: string | undefined;
          if (!product) {
            reason = 'Product not found';
          } else if (!product.is_active) {
            reason = 'Product is unavailable';
          } else if (availableQuantity === 0) {
            reason = 'Out of stock';
          } else if (availableQuantity < item.quantity) {
            reason = `Only ${availableQuantity} available`;
          }

          if (!isAvailable) {
            validationResult.valid = false;
          }

          validationResult.items.push({
            cartItemId: item.id,
            productId: item.product_id,
            productName: product?.name || 'Unknown',
            requestedQuantity: item.quantity,
            availableQuantity,
            isAvailable,
            reason,
          });
        }

        request.log.info({
          userId,
          valid: validationResult.valid,
          itemCount: validationResult.items.length,
          operation: 'cart.validate'
        }, 'Cart validation completed');

        return { success: true, data: validationResult };
      } catch (err) {
        request.log.error({ err, userId }, 'Cart validation error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /items - Add item to cart
  // --------------------------------------------------------------------------
  app.post<{ Body: AddToCartBody }>(
    '/items',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        description: 'Adds a product to the cart. If the product already exists, quantity is incremented.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { 
              type: 'string', 
              format: 'uuid',
              description: 'UUID of the product to add'
            },
            quantity: { 
              type: 'integer', 
              minimum: 1, 
              maximum: MAX_ITEM_QUANTITY,
              description: 'Quantity to add (1-99)'
            },
            variantId: { 
              type: 'string', 
              format: 'uuid',
              description: 'Optional variant UUID'
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: true },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AddToCartBody }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;
      const { productId, quantity, variantId } = request.body;

      // Validate quantity
      if (quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
        return reply.status(400).send(
          createCartError(
            'INVALID_QUANTITY',
            `Quantity must be between 1 and ${MAX_ITEM_QUANTITY}`,
            { min: 1, max: MAX_ITEM_QUANTITY, provided: quantity }
          )
        );
      }

      try {
        // Step 1: Verify product exists and is active
        const { data: product, error: productError } = await app.supabase
          .from('products')
          .select('id, name, stock_quantity, is_active, status, vendor_id')
          .eq('id', productId)
          .single();

        if (productError || !product) {
          request.log.warn({ productId, userId }, 'Attempted to add non-existent product to cart');
          return reply.status(404).send(
            createCartError('PRODUCT_NOT_FOUND', 'Product not found')
          );
        }

        if (!product.is_active || product.status !== 'active') {
          return reply.status(400).send(
            createCartError('PRODUCT_UNAVAILABLE', 'This product is currently unavailable')
          );
        }

        // Step 2: Check stock availability
        let availableStock = product.stock_quantity;

        // If variant specified, check variant stock
        if (variantId) {
          const { data: variant, error: variantError } = await app.supabase
            .from('product_variants')
            .select('id, stock_quantity')
            .eq('id', variantId)
            .eq('product_id', productId)
            .single();

          if (variantError || !variant) {
            return reply.status(404).send(
              createCartError('PRODUCT_NOT_FOUND', 'Product variant not found')
            );
          }
          availableStock = variant.stock_quantity;
        }

        // Step 3: Check if item already exists in cart
        const { data: existingItem } = await app.supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .eq('variant_id', variantId || null)
          .maybeSingle();

        const currentQuantity = existingItem?.quantity || 0;
        const newTotalQuantity = currentQuantity + quantity;

        // Step 4: Validate total quantity against stock
        if (newTotalQuantity > availableStock) {
          return reply.status(400).send(
            createCartError(
              'INSUFFICIENT_STOCK',
              availableStock === 0 
                ? 'This product is out of stock'
                : `Only ${availableStock} items available. You already have ${currentQuantity} in your cart.`,
              { 
                availableStock, 
                currentInCart: currentQuantity, 
                requestedToAdd: quantity 
              }
            )
          );
        }

        // Step 5: Check max cart items limit
        if (!existingItem) {
          const { count } = await app.supabase
            .from('cart_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          if ((count || 0) >= MAX_CART_ITEMS) {
            return reply.status(400).send(
              createCartError(
                'MAX_QUANTITY_EXCEEDED',
                `Cart cannot exceed ${MAX_CART_ITEMS} different items`,
                { maxItems: MAX_CART_ITEMS, currentItems: count }
              )
            );
          }
        }

        // Step 6: Add or update cart item
        let cartItem;
        let isNewItem = false;

        if (existingItem) {
          // Update existing item
          const { data, error } = await app.supabase
            .from('cart_items')
            .update({ 
              quantity: newTotalQuantity, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingItem.id)
            .select(`
              id, quantity, created_at, updated_at,
              product:products(id, name, price, images)
            `)
            .single();

          if (error) {
            request.log.error({ error, userId, productId }, 'Failed to update cart item');
            return reply.status(500).send(
              createCartError('VALIDATION_FAILED', 'Failed to update cart')
            );
          }
          cartItem = data;
        } else {
          // Create new cart item
          isNewItem = true;
          const { data, error } = await app.supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: productId,
              variant_id: variantId || null,
              quantity,
            })
            .select(`
              id, quantity, created_at, updated_at,
              product:products(id, name, price, images)
            `)
            .single();

          if (error) {
            request.log.error({ error, userId, productId }, 'Failed to add item to cart');
            return reply.status(500).send(
              createCartError('VALIDATION_FAILED', 'Failed to add item to cart')
            );
          }
          cartItem = data;
        }

        // Step 7: Log the operation
        request.log.info({
          userId,
          productId,
          variantId,
          quantity,
          newTotalQuantity,
          isNewItem,
          cartItemId: cartItem.id,
          operation: 'cart.addItem'
        }, 'Item added to cart');

        return reply.status(isNewItem ? 201 : 200).send({
          success: true,
          data: cartItem,
          message: isNewItem ? 'Item added to cart' : 'Cart updated',
        });

      } catch (err) {
        request.log.error({ err, userId, productId }, 'Add to cart error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // PATCH /items/:id - Update cart item quantity
  // --------------------------------------------------------------------------
  app.patch<{ Params: { id: string }; Body: UpdateCartItemBody }>(
    '/items/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        description: 'Updates the quantity of a cart item. Set to 0 to remove.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: { 
              type: 'integer', 
              minimum: 0, 
              maximum: MAX_ITEM_QUANTITY 
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateCartItemBody }>,
      reply: FastifyReply
    ) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;
      const { id: cartItemId } = request.params;
      const { quantity } = request.body;

      try {
        // Step 1: Get cart item with product info (verify ownership)
        const { data: cartItem, error: fetchError } = await app.supabase
          .from('cart_items')
          .select(`
            id, 
            product_id, 
            variant_id,
            quantity,
            product:products(id, name, stock_quantity, is_active),
            variant:product_variants(id, stock_quantity)
          `)
          .eq('id', cartItemId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !cartItem) {
          return reply.status(404).send(
            createCartError('CART_ITEM_NOT_FOUND', 'Cart item not found')
          );
        }

        // Step 2: Handle quantity = 0 (delete)
        if (quantity === 0) {
          const { error: deleteError } = await app.supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId)
            .eq('user_id', userId);

          if (deleteError) {
            return reply.status(500).send(
              createCartError('VALIDATION_FAILED', 'Failed to remove item')
            );
          }

          request.log.info({
            userId,
            cartItemId,
            productId: (cartItem as Record<string, unknown>).product_id,
            operation: 'cart.removeItem'
          }, 'Item removed from cart');

          return { 
            success: true, 
            message: 'Item removed from cart',
            data: { removed: true, cartItemId }
          };
        }

        // Step 3: Validate stock for new quantity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItemRecord = cartItem as Record<string, any>;
        const product = cartItemRecord.product;
        const variant = cartItemRecord.variant;
        const currentQuantity = cartItemRecord.quantity;
        const availableStock = variant?.stock_quantity ?? product?.stock_quantity ?? 0;

        if (!product?.is_active) {
          return reply.status(400).send(
            createCartError('PRODUCT_UNAVAILABLE', 'This product is no longer available')
          );
        }

        if (quantity > availableStock) {
          return reply.status(400).send(
            createCartError(
              'INSUFFICIENT_STOCK',
              `Only ${availableStock} items available`,
              { availableStock, requested: quantity }
            )
          );
        }

        // Step 4: Update quantity
        const { data: updatedItem, error: updateError } = await app.supabase
          .from('cart_items')
          .update({ 
            quantity, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', cartItemId)
          .select()
          .single();

        if (updateError) {
          return reply.status(500).send(
            createCartError('VALIDATION_FAILED', 'Failed to update cart')
          );
        }

        request.log.info({
          userId,
          cartItemId,
          productId: cartItemRecord.product_id,
          oldQuantity: currentQuantity,
          newQuantity: quantity,
          operation: 'cart.updateQuantity'
        }, 'Cart item quantity updated');

        return { 
          success: true, 
          data: updatedItem,
          message: 'Cart updated'
        };

      } catch (err) {
        request.log.error({ err, userId, cartItemId }, 'Update cart error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // DELETE /items/:id - Remove item from cart
  // --------------------------------------------------------------------------
  app.delete<{ Params: { id: string } }>(
    '/items/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;
      const { id: cartItemId } = request.params;

      try {
        // Verify ownership and delete
        const { data: deletedItem, error } = await app.supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', userId)
          .select('id, product_id')
          .single();

        if (error || !deletedItem) {
          return reply.status(404).send(
            createCartError('CART_ITEM_NOT_FOUND', 'Cart item not found')
          );
        }

        request.log.info({
          userId,
          cartItemId,
          productId: deletedItem.product_id,
          operation: 'cart.removeItem'
        }, 'Item removed from cart');

        return { 
          success: true, 
          message: 'Item removed from cart',
          data: { removed: true, cartItemId }
        };

      } catch (err) {
        request.log.error({ err, userId, cartItemId }, 'Remove from cart error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // DELETE / - Clear entire cart
  // --------------------------------------------------------------------------
  app.delete(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Clear entire cart',
        description: 'Removes all items from the user\'s cart. This action cannot be undone.',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;

      try {
        // Get count before clearing for logging
        const { count: itemCount } = await app.supabase
          .from('cart_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { error } = await app.supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) {
          request.log.error({ error, userId }, 'Failed to clear cart');
          return reply.status(500).send(
            createCartError('VALIDATION_FAILED', 'Failed to clear cart')
          );
        }

        request.log.info({
          userId,
          itemsCleared: itemCount || 0,
          operation: 'cart.clear'
        }, 'Cart cleared');

        return { 
          success: true, 
          message: 'Cart cleared',
          data: { itemsRemoved: itemCount || 0 }
        };

      } catch (err) {
        request.log.error({ err, userId }, 'Clear cart error');
        return reply.status(500).send(
          createCartError('VALIDATION_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /merge - Merge guest cart after login
  // --------------------------------------------------------------------------
  app.post<{ Body: MergeCartBody }>(
    '/merge',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Cart'],
        summary: 'Merge guest cart items after login',
        description: 'Merges items from a guest session cart into the authenticated user\'s cart.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              maxItems: MAX_CART_ITEMS,
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1, maximum: MAX_ITEM_QUANTITY },
                  variantId: { type: 'string', format: 'uuid' },
                },
              },
            },
            sessionId: { 
              type: 'string',
              description: 'Guest session ID for audit purposes'
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: MergeCartBody }>,
      reply: FastifyReply
    ) => {
      if (!request.user) {
        return reply.status(401).send(
          createCartError('VALIDATION_FAILED', 'Authentication required')
        );
      }

      const userId = request.user.id;
      const { items, sessionId } = request.body;

      if (!items || items.length === 0) {
        return { success: true, message: 'No items to merge', data: { merged: 0 } };
      }

      try {
        let mergedCount = 0;
        let skippedCount = 0;
        const errors: Array<{ productId: string; reason: string }> = [];

        for (const item of items) {
          try {
            // Verify product exists and is active
            const { data: product } = await app.supabase
              .from('products')
              .select('id, stock_quantity, is_active')
              .eq('id', item.productId)
              .single();

            if (!product || !product.is_active) {
              skippedCount++;
              errors.push({ productId: item.productId, reason: 'Product unavailable' });
              continue;
            }

            // Check existing cart item
            const { data: existing } = await app.supabase
              .from('cart_items')
              .select('id, quantity')
              .eq('user_id', userId)
              .eq('product_id', item.productId)
              .eq('variant_id', item.variantId || null)
              .maybeSingle();

            const currentQty = existing?.quantity || 0;
            const newQty = Math.min(currentQty + item.quantity, product.stock_quantity, MAX_ITEM_QUANTITY);

            if (existing) {
              await app.supabase
                .from('cart_items')
                .update({ 
                  quantity: newQty, 
                  updated_at: new Date().toISOString() 
                })
                .eq('id', existing.id);
            } else {
              await app.supabase
                .from('cart_items')
                .insert({
                  user_id: userId,
                  product_id: item.productId,
                  variant_id: item.variantId || null,
                  quantity: Math.min(item.quantity, product.stock_quantity),
                });
            }

            mergedCount++;
          } catch (_itemError) {
            skippedCount++;
            errors.push({ productId: item.productId, reason: 'Merge failed' });
          }
        }

        request.log.info({
          userId,
          sessionId,
          totalItems: items.length,
          mergedCount,
          skippedCount,
          operation: 'cart.merge'
        }, 'Guest cart merged');

        return {
          success: true,
          message: `Merged ${mergedCount} items`,
          data: {
            merged: mergedCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined,
          },
        };

      } catch (err) {
        request.log.error({ err, userId, sessionId }, 'Cart merge error');
        return reply.status(500).send(
          createCartError('MERGE_FAILED', 'Failed to merge cart')
        );
      }
    }
  );
}
