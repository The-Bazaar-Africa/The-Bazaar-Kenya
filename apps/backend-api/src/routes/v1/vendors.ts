/**
 * The Bazaar - Vendor Routes
 * 
 * Routes:
 * - GET / - List vendors (public)
 * - GET /:id - Get vendor details (public)
 * - GET /:id/products - Get vendor's products (public)
 * - POST /apply - Apply to become a vendor (authenticated)
 * - PATCH /profile - Update vendor profile (vendor only)
 * - GET /analytics - Get vendor analytics (vendor only)
 */

import { FastifyInstance } from 'fastify';
import { requireAuth, requireVendor } from '../../middleware/index.js';

interface VendorApplicationBody {
  businessName: string;
  description: string;
  category: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  website?: string;
}

interface UpdateVendorProfileBody {
  businessName?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export async function vendorsRoutes(app: FastifyInstance) {
  /**
   * GET / - List vendors (public)
   */
  app.get<{ Querystring: { page?: number; limit?: number; category?: string; search?: string } }>(
    '/',
    {
      schema: {
        tags: ['Vendors'],
        summary: 'List vendors',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            category: { type: 'string' },
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
                  vendors: { type: 'array' },
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
          .from('vendors')
          .select('id, business_name, slug, description, logo_url, banner_url, rating, total_reviews, status, is_verified, created_at', { count: 'exact' })
          .eq('status', 'active')
          .order('rating', { ascending: false, nullsFirst: false });

        // Apply filters
        if (request.query.category) {
          // Note: category filtering would require a categories table join
          // For now, we'll skip category filtering
        }

        if (request.query.search) {
          query = query.or(`business_name.ilike.%${request.query.search}%,description.ilike.%${request.query.search}%`);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          request.log.error({ error: error.message }, 'Failed to fetch vendors');
          return reply.code(500).send({
            success: false,
            error: 'Failed to fetch vendors',
          });
        }

        const totalPages = count ? Math.ceil(count / limit) : 0;

        return {
          success: true,
          data: {
            vendors: data || [],
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages,
            },
          },
        };
      } catch (err) {
        request.log.error({ err }, 'List vendors error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /:id - Get vendor details (public)
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Vendors'],
        summary: 'Get vendor details',
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
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { data, error } = await app.supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          return reply.code(404).send({
            success: false,
            error: 'Vendor not found',
          });
        }

        // Only show active vendors to public
        if (data.status !== 'active' && (!request.user || (!request.user.isAdmin && request.user.id !== data.profile_id))) {
          return reply.code(404).send({
            success: false,
            error: 'Vendor not found',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Get vendor error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /:id/products - Get vendor's products (public)
   */
  app.get<{ Params: { id: string }; Querystring: { page?: number; limit?: number } }>(
    '/:id/products',
    {
      schema: {
        tags: ['Vendors'],
        summary: "Get vendor's products",
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
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
        const { id } = request.params;
        const page = request.query.page || 1;
        const limit = request.query.limit || 20;
        const offset = (page - 1) * limit;

        // Verify vendor exists
        const { data: vendor, error: vendorError } = await app.supabase
          .from('vendors')
          .select('id, status')
          .eq('id', id)
          .single();

        if (vendorError || !vendor) {
          return reply.code(404).send({
            success: false,
            error: 'Vendor not found',
          });
        }

        // Get products
        const { data, error, count } = await app.supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('vendor_id', id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          request.log.error({ error: error.message }, 'Failed to fetch vendor products');
          return reply.code(500).send({
            success: false,
            error: 'Failed to fetch vendor products',
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
        request.log.error({ err }, 'Get vendor products error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * POST /apply - Apply to become a vendor
   */
  app.post<{ Body: VendorApplicationBody }>(
    '/apply',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Vendors'],
        summary: 'Apply to become a vendor',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['businessName', 'description'],
          properties: {
            businessName: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            category: { type: 'string' },
            phone: { type: 'string' },
            address: {
              type: 'object',
              properties: {
                line1: { type: 'string' },
                line2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            website: { type: 'string' },
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
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        // Check if user already has a vendor account
        const { data: existingVendor } = await app.supabase
          .from('vendors')
          .select('id')
          .eq('profile_id', request.user.id)
          .single();

        if (existingVendor) {
          return reply.code(400).send({
            success: false,
            error: 'You already have a vendor account',
          });
        }

        const { businessName, description, phone, address, website } = request.body;

        // Generate slug from business name
        const slug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if slug is unique
        const { data: slugCheck } = await app.supabase
          .from('vendors')
          .select('id')
          .eq('slug', slug)
          .single();

        if (slugCheck) {
          return reply.code(400).send({
            success: false,
            error: 'Business name is already taken',
          });
        }

        const vendorData = {
          profile_id: request.user.id,
          business_name: businessName,
          slug,
          description: description || '',
          phone: phone || null,
          email: request.user.email,
          website: website || null,
          address: address?.line1 || null,
          city: address?.city || null,
          state: address?.state || null,
          postal_code: address?.postalCode || null,
          country: address?.country || 'Kenya',
          status: 'pending',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await app.supabase
          .from('vendors')
          .insert(vendorData)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to create vendor application');
          return reply.code(500).send({
            success: false,
            error: 'Failed to submit vendor application',
          });
        }

        // Update user role to vendor (pending approval)
        await app.supabase
          .from('profiles')
          .update({ role: 'vendor' })
          .eq('id', request.user.id);

        request.log.info({ vendorId: data.id, userId: request.user.id }, 'Vendor application submitted');

        return reply.code(201).send({
          success: true,
          data,
          message: 'Vendor application submitted successfully. Pending admin approval.',
        });
      } catch (err) {
        request.log.error({ err }, 'Vendor application error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * PATCH /profile - Update vendor profile (vendor only)
   */
  app.patch<{ Body: UpdateVendorProfileBody }>(
    '/profile',
    {
      preHandler: [requireVendor()],
      schema: {
        tags: ['Vendors'],
        summary: 'Update vendor profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            businessName: { type: 'string' },
            description: { type: 'string' },
            logo: { type: 'string' },
            banner: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            address: {
              type: 'object',
              properties: {
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
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        // Get vendor
        const { data: vendor, error: vendorError } = await app.supabase
          .from('vendors')
          .select('id')
          .eq('profile_id', request.user.id)
          .single();

        if (vendorError || !vendor) {
          return reply.code(404).send({
            success: false,
            error: 'Vendor account not found',
          });
        }

        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const { businessName, description, logo, banner, phone, email, website, address } = request.body;

        if (businessName) updates.business_name = businessName;
        if (description !== undefined) updates.description = description;
        if (logo) updates.logo_url = logo;
        if (banner) updates.banner_url = banner;
        if (phone) updates.phone = phone;
        if (email) updates.email = email;
        if (website) updates.website = website;
        if (address) {
          if (address.line1) updates.address = address.line1;
          if (address.city) updates.city = address.city;
          if (address.state) updates.state = address.state;
          if (address.postalCode) updates.postal_code = address.postalCode;
          if (address.country) updates.country = address.country;
        }

        if (Object.keys(updates).length === 1) {
          // Only updated_at
          return reply.code(400).send({
            success: false,
            error: 'No fields to update',
          });
        }

        const { data, error } = await app.supabase
          .from('vendors')
          .update(updates)
          .eq('id', vendor.id)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to update vendor profile');
          return reply.code(500).send({
            success: false,
            error: 'Failed to update vendor profile',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Update vendor profile error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /analytics - Get vendor analytics (vendor only)
   */
  app.get(
    '/analytics',
    {
      preHandler: [requireVendor()],
      schema: {
        tags: ['Vendors'],
        summary: 'Get vendor analytics',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        // Get vendor
        const { data: vendor, error: vendorError } = await app.supabase
          .from('vendors')
          .select('id, total_sales, total_orders, rating, total_reviews')
          .eq('profile_id', request.user.id)
          .single();

        if (vendorError || !vendor) {
          return reply.code(404).send({
            success: false,
            error: 'Vendor account not found',
          });
        }

        // Get recent orders count
        const { count: recentOrdersCount } = await app.supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Get total products
        const { count: productsCount } = await app.supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
          .eq('is_active', true);

        // Get revenue by period (last 6 months)
        const revenueByPeriod = [];
        for (let i = 5; i >= 0; i--) {
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - i);
          startDate.setDate(1);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);

          const { data: periodOrders } = await app.supabase
            .from('orders')
            .select('total')
            .eq('vendor_id', vendor.id)
            .eq('status', 'delivered')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString());

          const revenue = periodOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
          const orders = periodOrders?.length || 0;

          revenueByPeriod.push({
            period: startDate.toISOString().substring(0, 7), // YYYY-MM
            revenue,
            orders,
          });
        }

        const analytics = {
          totalRevenue: Number(vendor.total_sales || 0),
          totalOrders: vendor.total_orders || 0,
          recentOrders: recentOrdersCount || 0,
          totalProducts: productsCount || 0,
          averageRating: Number(vendor.rating || 0),
          totalReviews: vendor.total_reviews || 0,
          revenueByPeriod,
        };

        return {
          success: true,
          data: analytics,
        };
      } catch (err) {
        request.log.error({ err }, 'Get vendor analytics error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

