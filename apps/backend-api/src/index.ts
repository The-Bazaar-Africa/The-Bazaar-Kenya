import 'dotenv/config';
import { buildApp } from './app.js';
import { getBackendFlags, FEATURE_FLAGS } from '@tbk/config';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  // Log feature flags on startup (P5: path alias test)
  const flags = getBackendFlags();
  console.info('📋 Backend Feature Flags:', flags);
  console.info(`   ${FEATURE_FLAGS.BACKEND_USE_SHARED_DATABASE}: ${flags.USE_SHARED_DATABASE}`);
  
  const app = await buildApp({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  try {
    await app.listen({ port: PORT, host: HOST });
    console.info(`🚀 Server running at http://${HOST}:${PORT}`);
    console.info(`📚 API Docs at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

