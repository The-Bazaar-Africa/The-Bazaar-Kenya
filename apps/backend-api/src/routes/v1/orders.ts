/**
 * The Bazaar - Order Routes
 * 
 * Routes:
 * - GET / - List orders (user sees their orders, vendor sees their store orders, admin sees all)
 * - GET /:id - Get order details (owner, vendor, or admin)
 * - POST / - Create a new order (authenticated buyer)
 * - PATCH /:id/status - Update order status (vendor/admin)
 */

import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/index.js';

interface CreateOrderBody {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
}

interface UpdateOrderStatusBody {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

export async function ordersRoutes(app: FastifyInstance) {
  /**
   * GET / - List orders with RBAC
   */
  app.get<{ Querystring: { page?: number; limit?: number; status?: string } }>(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Orders'],
        summary: 'List orders',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            status: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  orders: { type: 'array' },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const page = request.query.page || 1;
        const limit = request.query.limit || 20;
        const offset = (page - 1) * limit;

        let query = app.supabase
          .from('orders')
          .select('*, order_items(*, products(*))', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply RBAC filtering
        if (request.user.isAdmin) {
          // Admins see all orders
        } else if (request.user.role === 'vendor') {
          // Vendors see orders for their products
          const { data: vendor } = await app.supabase
            .from('vendors')
            .select('id')
            .eq('profile_id', request.user.id)
            .single();

          if (vendor) {
            query = query.eq('vendor_id', vendor.id);
          } else {
            return reply.status(403).send({
              success: false,
              error: 'Vendor account not found',
            });
          }
        } else {
          // Buyers see only their orders
          query = query.eq('buyer_id', request.user.id);
        }

        // Apply status filter
        if (request.query.status) {
          query = query.eq('status', request.query.status);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          request.log.error({ error: error.message }, 'Failed to fetch orders');
          return reply.status(500).send({
            success: false,
            error: 'Failed to fetch orders',
          });
        }

        const totalPages = count ? Math.ceil(count / limit) : 0;

        return {
          success: true,
          data: {
            orders: data || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages,
            },
          },
        };
      } catch (err) {
        request.log.error({ err }, 'List orders error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /:id - Get order details
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Orders'],
        summary: 'Get order details',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { id } = request.params;

        const { data: order, error: orderError } = await app.supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('id', id)
          .single();

        if (orderError || !order) {
          return reply.status(404).send({
            success: false,
            error: 'Order not found',
          });
        }

        // RBAC check: user must be buyer, vendor, or admin
        const isBuyer = order.buyer_id === request.user.id;
        const isAdmin = request.user.isAdmin;

        let isVendor = false;
        if (request.user.role === 'vendor') {
          const { data: vendor } = await app.supabase
            .from('vendors')
            .select('id')
            .eq('profile_id', request.user.id)
            .single();

          if (vendor && order.vendor_id === vendor.id) {
            isVendor = true;
          }
        }

        if (!isBuyer && !isVendor && !isAdmin) {
          return reply.status(403).send({
            success: false,
            error: 'Access denied',
          });
        }

        return {
          success: true,
          data: order,
        };
      } catch (err) {
        request.log.error({ err }, 'Get order error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * POST / - Create a new order
   */
  app.post<{ Body: CreateOrderBody }>(
    '/',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Orders'],
        summary: 'Create a new order',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['items', 'shippingAddress'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                  variantId: { type: 'string' },
                },
              },
            },
            shippingAddress: {
              type: 'object',
              required: ['line1', 'city', 'postalCode', 'country'],
              properties: {
                line1: { type: 'string' },
                line2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            billingAddress: { type: 'object' },
            paymentMethod: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        // Only buyers can create orders
        if (request.user.role !== 'buyer' && !request.user.isAdmin) {
          return reply.status(403).send({
            success: false,
            error: 'Only buyers can create orders',
          });
        }

        const { items, shippingAddress, billingAddress, paymentMethod, notes } = request.body;

        // Validate and fetch products
        const productIds = items.map(item => item.productId);
        const { data: products, error: productsError } = await app.supabase
          .from('products')
          .select('id, vendor_id, name, price, stock_quantity, is_active, sku')
          .in('id', productIds);

        if (productsError || !products || products.length !== productIds.length) {
          return reply.status(400).send({
            success: false,
            error: 'One or more products not found',
          });
        }

        // Check all products are active
        const inactiveProducts = products.filter(p => !p.is_active);
        if (inactiveProducts.length > 0) {
          return reply.status(400).send({
            success: false,
            error: 'One or more products are not available',
          });
        }

        // Check stock availability
        for (const item of items) {
          const product = products.find(p => p.id === item.productId);
          if (!product || product.stock_quantity < item.quantity) {
            return reply.status(400).send({
              success: false,
              error: `Insufficient stock for product: ${product?.name || item.productId}`,
            });
          }
        }

        // Group items by vendor
        const vendorGroups = new Map<string, typeof items>();
        for (const item of items) {
          const product = products.find(p => p.id === item.productId);
          if (!product) continue;

          if (!vendorGroups.has(product.vendor_id)) {
            vendorGroups.set(product.vendor_id, []);
          }
          const vendorItems = vendorGroups.get(product.vendor_id);
          if (vendorItems) vendorItems.push(item);
        }

        // Create orders for each vendor (multi-vendor order support)
        const createdOrders = [];

        for (const [vendorId, vendorItems] of vendorGroups) {
          // Calculate totals
          let subtotal = 0;
          for (const item of vendorItems) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              subtotal += product.price * item.quantity;
            }
          }

          const tax = subtotal * 0.16; // 16% VAT (Kenya)
          const shipping = 500; // Fixed shipping cost (KES)
          const total = subtotal + tax + shipping;

          // Generate order number
          const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          // Create order
          const { data: order, error: orderError } = await app.supabase
            .from('orders')
            .insert({
              buyer_id: request.user.id,
              vendor_id: vendorId,
              order_number: orderNumber,
              status: 'pending',
              payment_status: 'pending',
              subtotal,
              tax_amount: tax,
              shipping_fee: shipping,
              discount_amount: 0,
              total,
              currency: 'KES',
              shipping_address: shippingAddress,
              billing_address: billingAddress || shippingAddress,
              payment_method: paymentMethod || null,
              notes: notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (orderError || !order) {
            request.log.error({ error: orderError?.message }, 'Failed to create order');
            return reply.status(500).send({
              success: false,
              error: 'Failed to create order',
            });
          }

          // Create order items
          const orderItems = vendorItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              order_id: order.id,
              product_id: item.productId,
              variant_id: item.variantId || null,
              vendor_id: vendorId,
              product_name: product?.name || '',
              product_sku: product?.sku || null,
              variant_name: null,
              quantity: item.quantity,
              unit_price: product?.price || 0,
              total_price: (product?.price || 0) * item.quantity,
              tax_amount: 0,
              discount_amount: 0,
            };
          });

          const { error: itemsError } = await app.supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            request.log.error({ error: itemsError.message }, 'Failed to create order items');
            // Rollback order
            await app.supabase.from('orders').delete().eq('id', order.id);
            return reply.status(500).send({
              success: false,
              error: 'Failed to create order items',
            });
          }

          // Update product stock
          for (const item of vendorItems) {
            await app.supabase.rpc('decrement_product_stock', {
              product_id: item.productId,
              quantity: item.quantity,
            });
          }

          createdOrders.push(order);
        }

        request.log.info({ orderIds: createdOrders.map(o => o.id), userId: request.user.id }, 'Orders created');

        return reply.status(201).send({
          success: true,
          data: createdOrders.length === 1 ? createdOrders[0] : createdOrders,
          message: createdOrders.length > 1 ? 'Multiple orders created for different vendors' : 'Order created successfully',
        });
      } catch (err) {
        request.log.error({ err }, 'Create order error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * PATCH /:id/status - Update order status (vendor/admin)
   */
  app.patch<{ Params: { id: string }; Body: UpdateOrderStatusBody }>(
    '/:id/status',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Orders'],
        summary: 'Update order status',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            trackingNumber: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.status(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { id } = request.params;
        const { status, trackingNumber } = request.body;

        // Get order
        const { data: order, error: orderError } = await app.supabase
          .from('orders')
          .select('vendor_id, buyer_id, status')
          .eq('id', id)
          .single();

        if (orderError || !order) {
          return reply.status(404).send({
            success: false,
            error: 'Order not found',
          });
        }

        // RBAC: Vendor can update their orders, admin can update any
        if (!request.user.isAdmin) {
          if (request.user.role === 'vendor') {
            const { data: vendor } = await app.supabase
              .from('vendors')
              .select('id')
              .eq('profile_id', request.user.id)
              .single();

            if (!vendor || order.vendor_id !== vendor.id) {
              return reply.status(403).send({
                success: false,
                error: 'You can only update orders for your products',
              });
            }
          } else {
            return reply.status(403).send({
              success: false,
              error: 'Only vendors and admins can update order status',
            });
          }
        }

        const updateData: Record<string, unknown> = {
          status,
          updated_at: new Date().toISOString(),
        };

        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }

        // Update payment status if order is delivered
        if (status === 'delivered') {
          updateData.payment_status = 'paid';
        }

        const { data, error } = await app.supabase
          .from('orders')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to update order status');
          return reply.status(500).send({
            success: false,
            error: 'Failed to update order status',
          });
        }

        request.log.info({ orderId: id, newStatus: status, userId: request.user.id }, 'Order status updated');

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Update order status error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

