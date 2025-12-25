/**
 * Paystack Configuration
 * ======================
 * Centralized configuration for Paystack payment integration.
 *
 * SECURITY NOTES:
 * - This configuration is loaded ONLY in the backend-api.
 * - The secret key must NEVER be exposed to any frontend application.
 * - The secret key must NEVER be prefixed with NEXT_PUBLIC_ or similar.
 * - This is the SINGLE SOURCE OF TRUTH for Paystack credentials.
 *
 * @see ADR-002: Payment Provider Selection
 */

const isProduction = process.env.NODE_ENV === 'production';
const hasPaystackKey = process.env.PAYSTACK_SECRET_KEY && 
  !process.env.PAYSTACK_SECRET_KEY.includes('your_paystack');

// Fail fast in production, warn in development
if (isProduction && !hasPaystackKey) {
  throw new Error(
    'PAYSTACK_SECRET_KEY is not defined. Please set it in your environment variables.'
  );
}

if (!hasPaystackKey) {
  console.warn(
    '⚠️  PAYSTACK_SECRET_KEY is not configured. Payment features will be disabled.'
  );
}

export const paystackConfig = {
  /**
   * Whether Paystack is properly configured
   */
  isConfigured: hasPaystackKey,

  /**
   * Paystack Secret Key (Backend-only)
   * Used for server-to-server API calls.
   */
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',

  /**
   * Paystack Webhook Secret
   * Used to verify the authenticity of incoming webhook events.
   */
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,

  /**
   * Paystack API Base URL
   */
  baseUrl: 'https://api.paystack.co',

  /**
   * Supported currencies
   */
  supportedCurrencies: ['KES', 'NGN', 'GHS', 'ZAR', 'USD'] as const,

  /**
   * Default currency for The Bazaar (Kenya)
   */
  defaultCurrency: 'KES',
} as const;

export type PaystackCurrency = (typeof paystackConfig.supportedCurrencies)[number];
