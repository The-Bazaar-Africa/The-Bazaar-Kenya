#!/usr/bin/env npx tsx
/**
 * The Bazaar - API Type Generation Script
 * 
 * Generates TypeScript types from the backend's OpenAPI/Swagger spec.
 * This ensures frontend types are always in sync with the API contract.
 * 
 * Usage:
 *   pnpm generate:api-types
 * 
 * Prerequisites:
 *   - Backend API must be running on localhost:3000
 *   - OR specify a different URL via API_URL environment variable
 * 
 * @see https://github.com/drwpow/openapi-typescript
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../libs/api-client/src/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api.ts');

async function generateTypes() {
  console.log('🔄 Fetching OpenAPI spec from:', `${API_URL}/docs/json`);
  
  try {
    // Fetch the OpenAPI spec from the running backend
    const response = await fetch(`${API_URL}/docs/json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }
    
    const spec = await response.json();
    
    // Write the spec to a local file for reference
    const specPath = path.join(OUTPUT_DIR, 'openapi.json');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
    console.log('📝 OpenAPI spec saved to:', specPath);
    
    // Import openapi-typescript dynamically
    const { default: openapiTS } = await import('openapi-typescript');
    
    // Generate TypeScript types
    console.log('⚙️  Generating TypeScript types...');
    const output = await openapiTS(spec, {
      exportType: true,
    });
    
    // Add header comment
    const header = `/**
 * This file is auto-generated from the OpenAPI spec.
 * DO NOT EDIT MANUALLY.
 * 
 * Generated: ${new Date().toISOString()}
 * Source: ${API_URL}/docs/json
 * 
 * To regenerate: pnpm generate:api-types
 */

`;
    
    fs.writeFileSync(OUTPUT_FILE, header + output);
    console.log('✅ Types generated:', OUTPUT_FILE);
    
    // Generate version info
    const versionFile = path.join(OUTPUT_DIR, 'version.json');
    fs.writeFileSync(versionFile, JSON.stringify({
      generatedAt: new Date().toISOString(),
      apiVersion: spec.info?.version || 'unknown',
      specUrl: `${API_URL}/docs/json`,
    }, null, 2));
    console.log('📋 Version info saved to:', versionFile);
    
    console.log('\n🎉 API types generated successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Failed to generate API types:');
    console.error(error instanceof Error ? error.message : error);
    console.error('\nMake sure the backend API is running on', API_URL);
    console.error('You can start it with: pnpm dev:api\n');
    process.exit(1);
  }
}

generateTypes();
