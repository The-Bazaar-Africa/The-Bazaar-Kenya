/**
 * The Bazaar - User Routes
 * 
 * Routes:
 * - GET /me - Get current user profile (authenticated)
 * - PATCH /me - Update current user profile (authenticated)
 * - GET /:id - Get user by ID (admin only)
 */

import { FastifyInstance } from 'fastify';
import { requireAuth, requireAdmin } from '../../middleware/index.js';

interface UpdateProfileBody {
  name?: string;
  phone?: string;
  avatar?: string;
}

export async function usersRoutes(app: FastifyInstance) {
  /**
   * GET /me - Get current user profile
   */
  app.get(
    '/me',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  full_name: { type: 'string' },
                  phone: { type: 'string' },
                  avatar_url: { type: 'string' },
                  role: { type: 'string' },
                  is_verified: { type: 'boolean' },
                  created_at: { type: 'string' },
                  updated_at: { type: 'string' },
                },
              },
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

        const { data, error } = await app.supabase
          .from('profiles')
          .select('*')
          .eq('id', request.user.id)
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to fetch user profile');
          return reply.code(500).send({
            success: false,
            error: 'Failed to fetch user profile',
          });
        }

        if (!data) {
          return reply.code(404).send({
            success: false,
            error: 'User profile not found',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Get user profile error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * PATCH /me - Update current user profile
   */
  app.patch<{ Body: UpdateProfileBody }>(
    '/me',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
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
          return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
          });
        }

        const { name, phone, avatar } = request.body;
        const updates: Record<string, unknown> = {};

        if (name) updates.full_name = name;
        if (phone) updates.phone = phone;
        if (avatar) updates.avatar_url = avatar;

        if (Object.keys(updates).length === 0) {
          return reply.code(400).send({
            success: false,
            error: 'No fields to update',
          });
        }

        updates.updated_at = new Date().toISOString();

        const { data, error } = await app.supabase
          .from('profiles')
          .update(updates)
          .eq('id', request.user.id)
          .select()
          .single();

        if (error) {
          request.log.error({ error: error.message }, 'Failed to update user profile');
          return reply.code(500).send({
            success: false,
            error: 'Failed to update user profile',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Update user profile error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /:id - Get user by ID (admin only)
   */
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [requireAdmin()],
      schema: {
        tags: ['Users', 'Admin'],
        summary: 'Get user by ID (admin only)',
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
        const { id } = request.params;

        const { data, error } = await app.supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          request.log.error({ error: error.message, userId: id }, 'Failed to fetch user');
          return reply.code(500).send({
            success: false,
            error: 'Failed to fetch user',
          });
        }

        if (!data) {
          return reply.code(404).send({
            success: false,
            error: 'User not found',
          });
        }

        return {
          success: true,
          data,
        };
      } catch (err) {
        request.log.error({ err }, 'Get user by ID error');
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );
}

