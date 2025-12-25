/**
 * The Bazaar - Product Routes
 * 
 * Routes:
 * - GET / - List products with pagination and filters (public)
 * - GET /:id - Get product details by ID (public)
 * - POST / - Create product (vendor only)
 * - PATCH /:id - Update product (vendor only, owner or admin)
 * - DELETE /:id - Delete product (vendor only, owner or admin)
 */

import { FastifyInstance } from 'fastify';
import { requireAuth, requireVendor, optionalAuth } from '../../middleware/index.js';

interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  images?: string[];
  inventory?: number;
  sku?: string;
  attributes?: Record<string, unknown>;
}

interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  inventory?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export async function productsRoutes(app: FastifyInstance) {
  /**
   * GET / - List products with pagination and filters
   */
  app.get<{ Querystring: { page?: number; limit?: number; category?: string; vendor?: string; minPrice?: number; maxPrice?: number; search?: string } }>(
    '/',
    {
      preHandler: [optionalAuth],
      schema: {
        tags: ['Products'],
        summary: 'List products with pagination and filters',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            category: { type: 'string' },
            vendor: { type: 'string' },
            minPrice: { type: 'number', minimum: 0 },
            maxPrice: { type: 'number', minimum: 0 },
            search: { type: 'string' },
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
                  products: { type: 'array' },
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
        const page = request.query.page || 1;
        const limit = request.query.limit || 20;
        const offset = (page - 1) * limit;

        let query = app.supabase
          .from('products')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply filters
        if (request.query.category) {
          query = query.eq('category_id', request.query.category);
        }

        if (request.query.vendor) {
          query = query.eq('vendor_id', request.query.vendor);
        }

        if (request.query.minPrice !== undefined) {
          query = query.gte('price', request.query.minPrice);
        }

        if (request.query.maxPrice !== undefined) {
          query = query.lte('price', request.query.maxPrice);
        }

        if (request.query.search) {
          query = query.or(`name.ilike.%${request.query.search}%,description.ilike.%${request.query.search}%`);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          request.log.error({ error: error.message }, 'Failed to fetch products');
          return reply.status(500).send({
            success: false,
            error: 'Failed to fetch products',
          });
        }

        const totalPages = count ? Math.ceil(count / limit) : 0;

        return {
          success: true,
          data: {
            products: data || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages,
            },
          },
        };
      } catch (err) {
        request.log.error({ err }, 'List products error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /:id - Get product details by ID
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [optionalAuth],
      schema: {
        tags: ['Products'],
        summary: 'Get product details by ID',
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
        const { id } = request.params;

        const { data, error } = await app.supabase
          .from('products')
          .select('*, vendors(business_name, slug), categories(name, slug), product_variants(*)')
          .eq('id', id)
          .single();

        if (error || !data) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Only show active products to non-owners
        if (!data.is_active && (!request.user || (request.user.id !== data.vendor_id && !request.user.isAdmin))) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Get product error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * POST / - Create product (vendor only)
   */
  app.post<{ Body: CreateProductBody }>(
    '/',
    {
      preHandler: [requireVendor()],
      schema: {
        tags: ['Products'],
        summary: 'Create a new product (vendor only)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            categoryId: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            inventory: { type: 'integer', minimum: 0 },
            sku: { type: 'string' },
            attributes: { type: 'object' },
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

        // Get vendor ID for the user
        const { data: vendor, error: vendorError } = await app.supabase
          .from('vendors')
          .select('id')
          .eq('profile_id', request.user.id)
          .eq('status', 'active')
          .single();

        if (vendorError || !vendor) {
          return reply.status(403).send({
            success: false,
            error: 'Vendor account not found or not active',
          });
        }

        const { name, description, price, categoryId, images, inventory, sku, attributes } = request.body;

        // Generate slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const productData = {
          vendor_id: vendor.id,
          category_id: categoryId,
          name,
          slug,
          description: description || '',
          price,
          images: images || [],
          stock_quantity: inventory || 0,
          sku: sku || null,
          attributes: attributes || {},
          is_active: false, // Require approval
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await app.supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to create product');
          return reply.status(500).send({
            success: false,
            error: 'Failed to create product',
          });
        }

        request.log.info({ productId: data.id, vendorId: vendor.id }, 'Product created');

        return reply.status(201).send({
          success: true,
          data,
        });
      } catch (err) {
        request.log.error({ err }, 'Create product error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * PATCH /:id - Update product (vendor only, owner or admin)
   */
  app.patch<{ Params: { id: string }; Body: UpdateProductBody }>(
    '/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Products'],
        summary: 'Update product (vendor only)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            categoryId: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            inventory: { type: 'integer', minimum: 0 },
            stock_quantity: { type: 'integer', minimum: 0 },
            is_active: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const updates = request.body;

        // Check if product exists and get vendor_id
        const { data: product, error: productError } = await app.supabase
          .from('products')
          .select('vendor_id')
          .eq('id', id)
          .single();

        if (productError || !product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Check ownership (unless admin)
        if (!request.user?.isAdmin) {
          const { data: vendor } = await app.supabase
            .from('vendors')
            .select('id')
            .eq('profile_id', request.user?.id)
            .eq('id', product.vendor_id)
            .single();

          if (!vendor) {
            return reply.status(403).send({
              success: false,
              error: 'You can only update your own products',
            });
          }
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.name) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.categoryId) updateData.category_id = updates.categoryId;
        if (updates.images) updateData.images = updates.images;
        if (updates.inventory !== undefined) updateData.stock_quantity = updates.inventory;
        if (updates.stock_quantity !== undefined) updateData.stock_quantity = updates.stock_quantity;
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

        const { data, error } = await app.supabase
          .from('products')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to update product');
          return reply.status(500).send({
            success: false,
            error: 'Failed to update product',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Update product error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * DELETE /:id - Delete product (vendor only, owner or admin)
   */
  app.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Products'],
        summary: 'Delete product (vendor only)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        // Check if product exists and get vendor_id
        const { data: product, error: productError } = await app.supabase
          .from('products')
          .select('vendor_id')
          .eq('id', id)
          .single();

        if (productError || !product) {
          return reply.status(404).send({
            success: false,
            error: 'Product not found',
          });
        }

        // Check ownership (unless admin)
        if (!request.user?.isAdmin) {
          const { data: vendor } = await app.supabase
            .from('vendors')
            .select('id')
            .eq('profile_id', request.user?.id)
            .eq('id', product.vendor_id)
            .single();

          if (!vendor) {
            return reply.status(403).send({
              success: false,
              error: 'You can only delete your own products',
            });
          }
        }

        const { error } = await app.supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          request.log.error({ error: error.message }, 'Failed to delete product');
          return reply.status(500).send({
            success: false,
            error: 'Failed to delete product',
          });
        }

        request.log.info({ productId: id }, 'Product deleted');

        return {
          success: true,
          message: 'Product deleted successfully',
        };
      } catch (err) {
        request.log.error({ err }, 'Delete product error');
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

