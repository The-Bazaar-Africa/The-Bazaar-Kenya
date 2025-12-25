/**
 * The Bazaar - API v1 Routes
 * ==========================
 * 
 * Central registration point for all v1 API routes.
 * 
 * Route Groups:
 * - /auth       - Authentication (login, register, password reset)
 * - /users      - User profile management
 * - /products   - Product catalog
 * - /categories - Category navigation
 * - /orders     - Order management
 * - /vendors    - Vendor operations
 * - /cart       - Shopping cart
 * - /wishlist   - User wishlist
 * - /checkout   - Checkout flow
 * - /payments   - Payment processing (Paystack)
 */

import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.js';
import { usersRoutes } from './users.js';
import { productsRoutes } from './products.js';
import { ordersRoutes } from './orders.js';
import { vendorsRoutes } from './vendors.js';
import { cartRoutes } from './cart.js';
import { categoriesRoutes } from './categories.js';
import { wishlistRoutes } from './wishlist.js';
import { checkoutRoutes } from './checkout.js';

export async function v1Routes(app: FastifyInstance) {
  // ============================================================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================================================
  
  // Authentication
  await app.register(authRoutes, { prefix: '/auth' });
  
  // Product catalog (public read, auth for write)
  await app.register(productsRoutes, { prefix: '/products' });
  
  // Categories (public)
  await app.register(categoriesRoutes, { prefix: '/categories' });

  // ============================================================================
  // AUTHENTICATED ROUTES
  // ============================================================================
  
  // User management
  await app.register(usersRoutes, { prefix: '/users' });
  
  // Shopping cart
  await app.register(cartRoutes, { prefix: '/cart' });
  
  // Wishlist
  await app.register(wishlistRoutes, { prefix: '/wishlist' });
  
  // Checkout flow
  await app.register(checkoutRoutes, { prefix: '/checkout' });
  
  // Orders
  await app.register(ordersRoutes, { prefix: '/orders' });
  
  // Vendors
  await app.register(vendorsRoutes, { prefix: '/vendors' });

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  
  app.get('/health', async () => ({
    status: 'ok',
    version: 'v1',
    timestamp: new Date().toISOString(),
  }));
}
