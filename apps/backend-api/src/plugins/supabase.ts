import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file explicitly from the backend-api directory
// Falls back to .env if .env.local doesn't exist
// Use override: true to override empty system env vars
config({ path: resolve(__dirname, '../../.env.local'), override: true });
config({ path: resolve(__dirname, '../../.env'), override: false });

declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
  }
}

export interface SupabasePluginOptions {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
}

const supabasePlugin: FastifyPluginAsync<SupabasePluginOptions> = async (
  fastify,
  options
) => {
  // Get values from options first, then from environment
  const supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL;
  const supabaseKey = options.supabaseServiceKey || 
    options.supabaseAnonKey || 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    fastify.log.error('Missing Supabase configuration:');
    fastify.log.error(`  SUPABASE_URL: ${supabaseUrl ? 'SET' : 'NOT SET'}`);
    fastify.log.error(`  SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'SET' : 'NOT SET'}`);
    throw new Error(
      'Supabase URL and Key are required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables in apps/backend-api/.env'
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'api',
    },
  });

  // Test connection by checking auth service
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      fastify.log.warn(`Supabase auth check: ${error.message}`);
    }
    fastify.log.info('✅ Supabase client initialized successfully');
  } catch (err) {
    fastify.log.error(`Supabase connection failed: ${err}`);
    throw new Error(`Failed to connect to Supabase: ${err}`);
  }

  // Decorate fastify instance with supabase client
  fastify.decorate('supabase', supabase);

  // Add hook to log database queries in development
  if (process.env.NODE_ENV === 'development') {
    fastify.addHook('onRequest', async (request) => {
      request.log.debug('Supabase client available on this request');
    });
  }
};

export default fp(supabasePlugin, {
  name: 'supabase',
  fastify: '5.x',
});
