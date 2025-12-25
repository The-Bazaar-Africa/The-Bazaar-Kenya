/**
 * Environment Configuration
 * 
 * Centralized environment variable validation and access.
 * Fails fast on missing required variables in production.
 */

import { z } from 'zod';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Server configuration
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Supabase (Required)
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Paystack (Required for payments)
  PAYSTACK_SECRET_KEY: z.string().min(1, 'PAYSTACK_SECRET_KEY is required'),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  
  // CORS
  CORS_ORIGIN: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws on invalid configuration
 */
let _env: Env | null = null;

/**
 * Get validated environment configuration
 * Validates on first access and caches the result
 */
export function getEnv(): Env {
  if (_env) return _env;
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => {
      return `  - ${issue.path.join('.')}: ${issue.message}`;
    }).join('\n');
    
    const message = `❌ Invalid environment configuration:\n${errors}`;
    
    // In production, fail immediately
    if (process.env.NODE_ENV === 'production') {
      console.error(message);
      process.exit(1);
    }
    
    // In development, warn but continue with defaults where possible
    console.warn(message);
    console.warn('⚠️  Continuing with defaults. Some features may not work.');
    
    // Try to create a partial env with defaults
    _env = {
      NODE_ENV: 'development',
      PORT: 3000,
      HOST: '0.0.0.0',
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'placeholder',
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder',
      LOG_LEVEL: 'info',
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_WINDOW: '1 minute',
    } as Env;
    
    return _env;
  }
  
  _env = result.data;
  return _env;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

/**
 * Validate environment on module load
 * This ensures errors are caught early
 */
export function validateEnvironment(): void {
  try {
    getEnv();
    console.info('✅ Environment configuration validated');
  } catch (_error) {
    // Error already logged in getEnv()
    if (isProduction()) {
      process.exit(1);
    }
  }
}
