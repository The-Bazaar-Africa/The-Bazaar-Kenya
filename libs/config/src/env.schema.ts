/**
 * Environment Validation Schema (Zod)
 * =====================================
 * Centralized schema for validating environment variables across all applications.
 *
 * This schema ensures that:
 * - All required environment variables are present.
 * - Variables have the correct format (e.g., URL, starts with 'sk_').
 * - The application fails fast on boot if the environment is misconfigured.
 *
 * @see Technical Implementation Details (Attachment 2)
 */

import { z } from 'zod';

export const envSchema = z.object({
  // Application Runtime
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('4000'),

  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  // Paystack (Payments) - ADR-002
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(20),

  // Authentication / Tokens
  JWT_SECRET: z.string().min(64),
  REFRESH_TOKEN_SECRET: z.string().min(64),

  // URLs / Frontend Portals - ADR-003
  BASE_API_URL: z.string().url(),
  FRONTEND_MAIN_URL: z.string().url(),
  FRONTEND_VENDOR_URL: z.string().url(),
  FRONTEND_ADMIN_URL: z.string().url(),

  // CORS Configuration
  CORS_ORIGIN: z.string(),

  // Email / Notifications
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

/**
 * Validates the current process.env against the schema.
 * Throws an error if validation fails.
 */
export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.info('✅ Environment variables validated successfully.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.format());
      process.exit(1);
    }
    throw error;
  }
}
