/**
 * Raw Body Plugin
 * ================
 * Fastify plugin to preserve the raw request body for webhook signature verification.
 *
 * This plugin adds a `rawBody` property to the request object containing
 * the unparsed request body as a string. This is required for verifying
 * webhook signatures from services like Paystack.
 *
 * @see ADR-002: Payment Provider Selection
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

// Extend FastifyRequest to include rawBody
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string;
  }
}

/**
 * Raw body plugin implementation
 */
async function rawBodyPlugin(fastify: FastifyInstance): Promise<void> {
  // Add a custom content type parser that preserves the raw body
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req: FastifyRequest, body: string, done) => {
      // Store the raw body on the request object
      req.rawBody = body;

      // Parse the JSON and return it
      try {
        const json = JSON.parse(body);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );
}

export default fp(rawBodyPlugin, {
  name: 'rawBody',
  fastify: '5.x',
});
