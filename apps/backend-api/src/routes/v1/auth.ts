/**
 * The Bazaar - Authentication Routes
 * 
 * Routes:
 * - POST /login - Login for all users (marketplace & admin)
 * - POST /register - Public registration (marketplace users ONLY - NOT admin portal)
 * - POST /refresh - Refresh access token
 * - POST /logout - Logout current session
 * - GET /me - Get current user profile
 * 
 * Admin-only routes (Super Admin only):
 * - POST /admin/create-staff - Create admin staff account
 * - POST /admin/invite - Send invitation to new admin staff
 */

import { FastifyInstance } from 'fastify';
import {
  requireAuth,
  requireSuperAdmin,
  requireAdmin,
} from '../../middleware/index.js';
import { ADMIN_ROLES, USER_ROLES, ROLE_PERMISSIONS, Permission } from '../../types/auth.js';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  role?: 'buyer' | 'vendor';
}

interface CreateStaffBody {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  permissions?: Permission[];
}

export async function authRoutes(app: FastifyInstance) {
  // ============================================
  // PUBLIC AUTH ROUTES
  // ============================================

  /**
   * POST /login - Universal login for all users
   */
  app.post<{ Body: LoginBody }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'User login (marketplace & admin)',
        description: 'Authenticate user and return access tokens. Works for all user types.',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
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
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string' },
                      isAdmin: { type: 'boolean' },
                    },
                  },
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                  expiresIn: { type: 'number' },
                },
              },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const { data, error } = await app.supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          request.log.warn({ email, error: error.message }, 'Login failed');
          return reply.code(401).send({
            success: false,
            error: 'Invalid credentials',
            code: 'AUTH_INVALID_CREDENTIALS',
          });
        }

        const user = data.user;
        const role = user.user_metadata?.role || USER_ROLES.BUYER;
        const isAdmin = Object.values(ADMIN_ROLES).includes(role);

        // Log admin logins for audit
        if (isAdmin) {
          request.log.info({ userId: user.id, email, role }, 'Admin user logged in');
        }

        return {
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              role,
              isAdmin,
              fullName: user.user_metadata?.full_name,
            },
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresIn: data.session?.expires_in,
          },
        };
      } catch (err) {
        request.log.error({ err }, 'Login error');
        return reply.code(500).send({
          success: false,
          error: 'Authentication service error',
          code: 'AUTH_SERVICE_ERROR',
        });
      }
    }
  );

  /**
   * POST /register - Public registration for MARKETPLACE users only
   * NOTE: Admin portal has NO signup - staff are created by Super Admin
   */
  app.post<{ Body: RegisterBody }>(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Marketplace user registration',
        description: 'Register a new buyer or vendor account. NOT for admin portal.',
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            role: { 
              type: 'string', 
              enum: ['buyer', 'vendor'],
              default: 'buyer',
              description: 'User role - only buyer or vendor allowed for public registration',
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, name, role = 'buyer' } = request.body;

      // SECURITY: Prevent admin role registration via public endpoint
      if (!['buyer', 'vendor'].includes(role)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid role. Only buyer or vendor registration is allowed.',
          code: 'AUTH_INVALID_ROLE',
        });
      }

      try {
        const { data, error } = await app.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,
            },
          },
        });

        if (error) {
          request.log.warn({ email, error: error.message }, 'Registration failed');
          return reply.code(400).send({
            success: false,
            error: error.message,
            code: 'AUTH_REGISTRATION_FAILED',
          });
        }

        request.log.info({ userId: data.user?.id, email, role }, 'New user registered');

        return reply.code(201).send({
          success: true,
          message: 'Registration successful. Please check your email to verify your account.',
          data: {
            userId: data.user?.id,
            email: data.user?.email,
            role,
          },
        });
      } catch (err) {
        request.log.error({ err }, 'Registration error');
        return reply.code(500).send({
          success: false,
          error: 'Registration service error',
          code: 'AUTH_SERVICE_ERROR',
        });
      }
    }
  );

  /**
   * POST /refresh - Refresh access token
   */
  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body as { refreshToken: string };

      try {
        const { data, error } = await app.supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error) {
          return reply.code(401).send({
            success: false,
            error: 'Invalid or expired refresh token',
            code: 'AUTH_REFRESH_FAILED',
          });
        }

        return {
          success: true,
          data: {
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
            expiresIn: data.session?.expires_in,
          },
        };
      } catch (err) {
        request.log.error({ err }, 'Token refresh error');
        return reply.code(500).send({
          success: false,
          error: 'Token refresh service error',
          code: 'AUTH_SERVICE_ERROR',
        });
      }
    }
  );

  /**
   * POST /logout - Logout current session
   */
  app.post(
    '/logout',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Auth'],
        summary: 'User logout',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, _reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (authHeader) {
          // Sign out from Supabase
          await app.supabase.auth.signOut();
        }

        if (request.user?.isAdmin) {
          request.log.info({ userId: request.user.id }, 'Admin user logged out');
        }

        return { success: true, message: 'Logged out successfully' };
      } catch (err) {
        request.log.error({ err }, 'Logout error');
        return { success: true, message: 'Logged out' };
      }
    }
  );

  /**
   * GET /me - Get current user profile
   */
  app.get(
    '/me',
    {
      preHandler: [requireAuth()],
      schema: {
        tags: ['Auth'],
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
                  role: { type: 'string' },
                  isAdmin: { type: 'boolean' },
                  isSuperAdmin: { type: 'boolean' },
                  permissions: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      return {
        success: true,
        data: request.user,
      };
    }
  );

  // ============================================
  // ADMIN-ONLY ROUTES (Super Admin)
  // ============================================

  /**
   * POST /admin/create-staff - Create admin staff account
   * ONLY Super Admin can create admin accounts
   * This is the ONLY way to create admin portal accounts
   */
  app.post<{ Body: CreateStaffBody }>(
    '/admin/create-staff',
    {
      preHandler: [requireSuperAdmin()],
      schema: {
        tags: ['Auth', 'Admin'],
        summary: 'Create admin staff account (Super Admin only)',
        description: 'Create a new admin portal user. Only accessible by Super Admin.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['email', 'password', 'fullName', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 12, description: 'Minimum 12 characters for admin accounts' },
            fullName: { type: 'string', minLength: 2 },
            role: { 
              type: 'string', 
              enum: ['admin', 'manager', 'staff', 'viewer'],
              description: 'Admin role level',
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Custom permissions (optional, defaults to role permissions)',
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  staffId: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  permissions: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password, fullName, role, permissions } = request.body;

      // SECURITY: Prevent creation of super_admin via API
      if ((role as string) === 'super_admin') {
        return reply.code(403).send({
          success: false,
          error: 'Cannot create super_admin accounts via API',
          code: 'AUTH_FORBIDDEN',
        });
      }

      try {
        // Create auth user
        const { data: authData, error: authError } = await app.supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm admin accounts
          user_metadata: {
            full_name: fullName,
            role: role,
          },
        });

        if (authError) {
          request.log.warn({ email, error: authError.message }, 'Admin staff creation failed');
          return reply.code(400).send({
            success: false,
            error: authError.message,
            code: 'AUTH_CREATE_FAILED',
          });
        }

        // Determine permissions
        const staffPermissions = permissions || ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

        // Create admin_staff record in database
        const { error: dbError } = await app.supabase.from('admin_staff').insert({
          profile_id: authData.user.id,
          role: role,
          permissions: staffPermissions,
          is_active: true,
          created_by: request.user?.id,
        });

        if (dbError) {
          request.log.error({ error: dbError.message }, 'Failed to create admin_staff record');
          // Note: User was created but staff record failed - may need cleanup
        }

        // Audit log
        request.log.info(
          { 
            createdBy: request.user?.id, 
            newStaffId: authData.user.id, 
            email, 
            role 
          },
          'Admin staff account created'
        );

        return reply.code(201).send({
          success: true,
          message: 'Admin staff account created successfully',
          data: {
            staffId: authData.user.id,
            email: authData.user.email,
            role,
            permissions: staffPermissions,
          },
        });
      } catch (err) {
        request.log.error({ err }, 'Create staff error');
        return reply.code(500).send({
          success: false,
          error: 'Failed to create staff account',
          code: 'AUTH_SERVICE_ERROR',
        });
      }
    }
  );

  /**
   * GET /admin/staff - List all admin staff
   * Super Admin sees all, others see based on permissions
   */
  app.get(
    '/admin/staff',
    {
      preHandler: [requireAdmin()],
      schema: {
        tags: ['Auth', 'Admin'],
        summary: 'List admin staff',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const { data, error } = await app.supabase
          .from('admin_staff')
          .select(`
            id,
            profile_id,
            role,
            permissions,
            is_active,
            created_at,
            last_login_at,
            profiles:profile_id (
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return {
          success: true,
          data: data,
        };
      } catch (err) {
        request.log.error({ err }, 'List staff error');
        return reply.code(500).send({
          success: false,
          error: 'Failed to list staff',
          code: 'STAFF_LIST_ERROR',
        });
      }
    }
  );

  /**
   * PATCH /admin/staff/:id - Update admin staff permissions/role
   */
  app.patch<{ Params: { id: string }; Body: { role?: string; permissions?: Permission[]; isActive?: boolean } }>(
    '/admin/staff/:id',
    {
      preHandler: [requireSuperAdmin()],
      schema: {
        tags: ['Auth', 'Admin'],
        summary: 'Update admin staff (Super Admin only)',
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
            role: { type: 'string', enum: ['admin', 'manager', 'staff', 'viewer'] },
            permissions: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { role, permissions, isActive } = request.body;

      try {
        const updates: Record<string, unknown> = {};
        if (role) updates.role = role;
        if (permissions) updates.permissions = permissions;
        if (typeof isActive === 'boolean') updates.is_active = isActive;

        const { error } = await app.supabase
          .from('admin_staff')
          .update(updates)
          .eq('id', id);

        if (error) {
          throw error;
        }

        request.log.info(
          { updatedBy: request.user?.id, staffId: id, updates },
          'Admin staff updated'
        );

        return {
          success: true,
          message: 'Staff updated successfully',
        };
      } catch (err) {
        request.log.error({ err }, 'Update staff error');
        return reply.code(500).send({
          success: false,
          error: 'Failed to update staff',
          code: 'STAFF_UPDATE_ERROR',
        });
      }
    }
  );

  /**
   * DELETE /admin/staff/:id - Deactivate admin staff account
   */
  app.delete<{ Params: { id: string } }>(
    '/admin/staff/:id',
    {
      preHandler: [requireSuperAdmin()],
      schema: {
        tags: ['Auth', 'Admin'],
        summary: 'Deactivate admin staff (Super Admin only)',
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
      const { id } = request.params;

      try {
        // Soft delete - deactivate rather than delete
        const { error } = await app.supabase
          .from('admin_staff')
          .update({ is_active: false })
          .eq('id', id);

        if (error) {
          throw error;
        }

        request.log.info(
          { deactivatedBy: request.user?.id, staffId: id },
          'Admin staff deactivated'
        );

        return {
          success: true,
          message: 'Staff account deactivated',
        };
      } catch (err) {
        request.log.error({ err }, 'Delete staff error');
        return reply.code(500).send({
          success: false,
          error: 'Failed to deactivate staff',
          code: 'STAFF_DELETE_ERROR',
        });
      }
    }
  );
}
