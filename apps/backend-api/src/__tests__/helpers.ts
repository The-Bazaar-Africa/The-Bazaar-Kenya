/**
 * Test Utilities for Backend API
 * 
 * Provides helpers for building Fastify test instances and mocking dependencies.
 */

import { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';

let testApp: FastifyInstance | null = null;

/**
 * Create a test Fastify instance with all routes registered.
 * Reuses the same instance across tests for performance.
 */
export async function createTestApp(): Promise<FastifyInstance> {
  if (testApp) {
    return testApp;
  }

  testApp = await buildApp({
    logger: false,
  });

  return testApp;
}

/**
 * Close the test app after all tests complete.
 * Call this in afterAll() in your test suites.
 */
export async function closeTestApp(): Promise<void> {
  if (testApp) {
    await testApp.close();
    testApp = null;
  }
}

/**
 * Mock authenticated user for protected routes
 */
export function mockAuthUser(role: 'user' | 'vendor' | 'admin' = 'user') {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate test product data
 */
export function generateTestProduct(overrides = {}) {
  return {
    id: 'test-product-id',
    vendorId: 'test-vendor-id',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    price: 1999,
    currency: 'KES',
    categoryId: 'test-category-id',
    images: [],
    inventory: 100,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Generate test order data
 */
export function generateTestOrder(overrides = {}) {
  return {
    id: 'test-order-id',
    userId: 'test-user-id',
    vendorId: 'test-vendor-id',
    orderNumber: 'ORD-TEST-001',
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    items: [],
    subtotal: 1999,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 1999,
    currency: 'KES',
    shippingAddress: {
      id: 'test-address-id',
      type: 'shipping' as const,
      line1: '123 Test Street',
      city: 'Nairobi',
      postalCode: '00100',
      country: 'KE',
      isDefault: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
