import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false, // We don't need declaration files for the backend
  splitting: false,
  treeshake: true,
  // External dependencies that should not be bundled
  external: [
    '@supabase/supabase-js',
    'fastify',
    '@fastify/cors',
    '@fastify/helmet',
    '@fastify/rate-limit',
    '@fastify/swagger',
    '@fastify/swagger-ui',
    'fastify-plugin',
    'dotenv',
    'zod',
    'axios',
  ],
  // Ensure path aliases resolve correctly
  esbuildOptions(options) {
    options.alias = {
      '@tbk/config': '../../libs/config/src',
      '@tbk/database': '../../libs/database/src',
      '@tbk/types': '../../libs/types/src',
      '@tbk/utils': '../../libs/utils/src',
    };
  },
});
