/**
 * The Bazaar - Wishlist Routes (Enterprise Grade)
 * ================================================
 * 
 * Provides wishlist functionality with:
 * - Add/remove products from wishlist
 * - Check if product is in wishlist
 * - Move items to cart
 * - Share wishlist (future)
 * 
 * Routes:
 * - GET    /           - Get wishlist items
 * - POST   /items      - Add item to wishlist
 * - DELETE /items/:productId - Remove item from wishlist
 * - GET    /check/:productId - Check if product is in wishlist
 * - POST   /items/:productId/move-to-cart - Move item to cart
 * - DELETE /           - Clear wishlist
 * 
 * @module routes/v1/wishlist
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../middleware/index.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price: number | null;
    images: string[];
    stock_quantity: number;
    is_active: boolean;
    vendor: {
      id: string;
      business_name: string;
      slug: string;
    } | null;
  } | null;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const WishlistErrorCodes = {
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ALREADY_IN_WISHLIST: 'ALREADY_IN_WISHLIST',
  NOT_IN_WISHLIST: 'NOT_IN_WISHLIST',
  MOVE_TO_CART_FAILED: 'MOVE_TO_CART_FAILED',
  FETCH_FAILED: 'FETCH_FAILED',
} as const;

type WishlistErrorCode = typeof WishlistErrorCodes[keyof typeof WishlistErrorCodes];

function createError(code: WishlistErrorCode, message: string, details?: Record<string, unknown>) {
  return {
    success: false,
    error: { code, message, details },
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_WISHLIST_ITEMS = 100;

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function wishlistRoutes(app: FastifyInstance) {

  // --------------------------------------------------------------------------
  // GET / - Get wishlist items
  // --------------------------------------------------------------------------
  app.get<{
    Querystring: { page?: number; limit?: number };
  }>(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Get wishlist items',
        description: 'Retrieves all items in the user\'s wishlist with product details.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;
      const page = request.query.page || 1;
      const limit = request.query.limit || 20;
      const offset = (page - 1) * limit;

      try {
        const { data, error, count } = await app.supabase
          .from('wishlists')
          .select(`
            id,
            product_id,
            created_at,
            product:products(
              id,
              name,
              slug,
              price,
              compare_at_price,
              images,
              stock_quantity,
              is_active,
              vendor:vendors(id, business_name, slug)
            )
          `, { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          request.log.error({ error, userId }, 'Failed to fetch wishlist');
          return reply.status(500).send(createError('FETCH_FAILED', 'Failed to fetch wishlist'));
        }

        const items = (data || []) as unknown as WishlistItem[];
        
        // Filter out unavailable products but keep them in response with flag
        const processedItems = items.map(item => ({
          ...item,
          isAvailable: item.product?.is_active && (item.product?.stock_quantity ?? 0) > 0,
          isInStock: (item.product?.stock_quantity ?? 0) > 0,
        }));

        const totalPages = count ? Math.ceil(count / limit) : 0;

        request.log.info({
          userId,
          itemCount: items.length,
          total: count,
          operation: 'wishlist.get'
        }, 'Wishlist fetched');

        return {
          success: true,
          data: {
            items: processedItems,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          },
        };

      } catch (err) {
        request.log.error({ err, userId }, 'Wishlist fetch error');
        return reply.status(500).send(createError('FETCH_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /items - Add item to wishlist
  // --------------------------------------------------------------------------
  app.post<{ Body: { productId: string } }>(
    '/items',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Add item to wishlist',
        description: 'Adds a product to the user\'s wishlist. Idempotent - returns success if already in wishlist.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { productId: string } }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;
      const { productId } = request.body;

      try {
        // Verify product exists
        const { data: product, error: productError } = await app.supabase
          .from('products')
          .select('id, name, is_active')
          .eq('id', productId)
          .single();

        if (productError || !product) {
          return reply.status(404).send(createError('PRODUCT_NOT_FOUND', 'Product not found'));
        }

        // Check if already in wishlist (idempotent)
        const { data: existing } = await app.supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        if (existing) {
          return {
            success: true,
            message: 'Product already in wishlist',
            data: { id: existing.id, productId, alreadyExists: true },
          };
        }

        // Check wishlist limit
        const { count } = await app.supabase
          .from('wishlists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        if ((count || 0) >= MAX_WISHLIST_ITEMS) {
          return reply.status(400).send(
            createError('FETCH_FAILED', `Wishlist cannot exceed ${MAX_WISHLIST_ITEMS} items`)
          );
        }

        // Add to wishlist
        const { data: wishlistItem, error } = await app.supabase
          .from('wishlists')
          .insert({
            user_id: userId,
            product_id: productId,
          })
          .select()
          .single();

        if (error) {
          request.log.error({ error, userId, productId }, 'Failed to add to wishlist');
          return reply.status(500).send(createError('FETCH_FAILED', 'Failed to add to wishlist'));
        }

        request.log.info({
          userId,
          productId,
          productName: product.name,
          operation: 'wishlist.add'
        }, 'Product added to wishlist');

        return reply.status(201).send({
          success: true,
          message: 'Added to wishlist',
          data: wishlistItem,
        });

      } catch (err) {
        request.log.error({ err, userId, productId }, 'Add to wishlist error');
        return reply.status(500).send(createError('FETCH_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // DELETE /items/:productId - Remove item from wishlist
  // --------------------------------------------------------------------------
  app.delete<{ Params: { productId: string } }>(
    '/items/:productId',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Remove item from wishlist',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { productId: string } }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;
      const { productId } = request.params;

      try {
        const { data: deleted, error } = await app.supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
          .select()
          .single();

        if (error || !deleted) {
          // Idempotent - return success even if not found
          return {
            success: true,
            message: 'Product removed from wishlist',
            data: { productId, wasInWishlist: false },
          };
        }

        request.log.info({
          userId,
          productId,
          operation: 'wishlist.remove'
        }, 'Product removed from wishlist');

        return {
          success: true,
          message: 'Removed from wishlist',
          data: { productId, wasInWishlist: true },
        };

      } catch (err) {
        request.log.error({ err, userId, productId }, 'Remove from wishlist error');
        return reply.status(500).send(createError('FETCH_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /check/:productId - Check if product is in wishlist
  // --------------------------------------------------------------------------
  app.get<{ Params: { productId: string } }>(
    '/check/:productId',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Check if product is in wishlist',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { productId: string } }>, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;
      const { productId } = request.params;

      try {
        const { data } = await app.supabase
          .from('wishlists')
          .select('id, created_at')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        return {
          success: true,
          data: {
            inWishlist: !!data,
            wishlistItemId: data?.id || null,
            addedAt: data?.created_at || null,
          },
        };

      } catch (err) {
        request.log.error({ err, userId, productId }, 'Check wishlist error');
        return reply.status(500).send(createError('FETCH_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // POST /items/:productId/move-to-cart - Move item to cart
  // --------------------------------------------------------------------------
  app.post<{ Params: { productId: string }; Body: { quantity?: number } }>(
    '/items/:productId/move-to-cart',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Move wishlist item to cart',
        description: 'Moves a product from wishlist to cart and removes it from wishlist.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            quantity: { type: 'integer', minimum: 1, default: 1 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { productId: string }; Body: { quantity?: number } }>,
      reply: FastifyReply
    ) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;
      const { productId } = request.params;
      const quantity = request.body.quantity || 1;

      try {
        // Verify product exists and check stock
        const { data: product, error: productError } = await app.supabase
          .from('products')
          .select('id, name, stock_quantity, is_active')
          .eq('id', productId)
          .single();

        if (productError || !product) {
          return reply.status(404).send(createError('PRODUCT_NOT_FOUND', 'Product not found'));
        }

        if (!product.is_active) {
          return reply.status(400).send(
            createError('MOVE_TO_CART_FAILED', 'Product is no longer available')
          );
        }

        if (product.stock_quantity < quantity) {
          return reply.status(400).send(
            createError('MOVE_TO_CART_FAILED', 
              product.stock_quantity === 0 
                ? 'Product is out of stock' 
                : `Only ${product.stock_quantity} available`
            )
          );
        }

        // Check if in wishlist
        const { data: wishlistItem } = await app.supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        if (!wishlistItem) {
          return reply.status(404).send(
            createError('NOT_IN_WISHLIST', 'Product not in wishlist')
          );
        }

        // Add to cart (or update quantity if exists)
        const { data: existingCartItem } = await app.supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .maybeSingle();

        if (existingCartItem) {
          const newQuantity = Math.min(
            existingCartItem.quantity + quantity,
            product.stock_quantity
          );

          await app.supabase
            .from('cart_items')
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq('id', existingCartItem.id);
        } else {
          await app.supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: productId,
              quantity,
            });
        }

        // Remove from wishlist
        await app.supabase
          .from('wishlists')
          .delete()
          .eq('id', wishlistItem.id);

        request.log.info({
          userId,
          productId,
          productName: product.name,
          quantity,
          operation: 'wishlist.moveToCart'
        }, 'Product moved from wishlist to cart');

        return {
          success: true,
          message: 'Moved to cart',
          data: {
            productId,
            quantity,
            removedFromWishlist: true,
          },
        };

      } catch (err) {
        request.log.error({ err, userId, productId }, 'Move to cart error');
        return reply.status(500).send(createError('MOVE_TO_CART_FAILED', 'Internal server error'));
      }
    }
  );

  // --------------------------------------------------------------------------
  // DELETE / - Clear wishlist
  // --------------------------------------------------------------------------
  app.delete(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Wishlist'],
        summary: 'Clear entire wishlist',
        description: 'Removes all items from the user\'s wishlist.',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.status(401).send(createError('FETCH_FAILED', 'Authentication required'));
      }

      const userId = request.user.id;

      try {
        const { count } = await app.supabase
          .from('wishlists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        await app.supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId);

        request.log.info({
          userId,
          itemsCleared: count || 0,
          operation: 'wishlist.clear'
        }, 'Wishlist cleared');

        return {
          success: true,
          message: 'Wishlist cleared',
          data: { itemsRemoved: count || 0 },
        };

      } catch (err) {
        request.log.error({ err, userId }, 'Clear wishlist error');
        return reply.status(500).send(createError('FETCH_FAILED', 'Internal server error'));
      }
    }
  );
}
