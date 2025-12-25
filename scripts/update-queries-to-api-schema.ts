#!/usr/bin/env tsx
/**
 * Script to update all Supabase queries to explicitly use api schema
 * 
 * This ensures all .from() calls use the api schema instead of defaulting to public
 * 
 * Usage: tsx scripts/update-queries-to-api-schema.ts
 */

import fs from 'fs';
import path from 'path';

// Tables that should be in api schema
const apiTables = [
  'profiles',
  'vendors',
  'admin_staff',
  'vendor_staff',
  'products',
  'product_images',
  'categories',
  'orders',
  'order_items',
  'payments',
  'addresses',
  'cart_items',
  'wishlists',
  'reviews',
  'notifications',
  'admin_audit_logs'
];

// Directories to scan
const dirsToScan = [
  'libs/database/src/queries',
  'apps/backend-api/src/routes',
  'apps/admin-portal/src',
  'apps/main-app/src',
  'apps/vendor-portal/src'
];

interface FileUpdate {
  file: string;
  oldPattern: string;
  newPattern: string;
  line: number;
}

const updates: FileUpdate[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    apiTables.forEach(table => {
      // Pattern 1: .from('table_name')
      const pattern1 = new RegExp(`\\.from\\(['"\`]${table}['"\`]\\)`, 'g');
      if (pattern1.test(line) && !line.includes(`'api.${table}'`)) {
        updates.push({
          file: filePath,
          oldPattern: `.from('${table}')`,
          newPattern: `.from('api.${table}')`,
          line: index + 1
        });
      }
      
      // Pattern 2: .from("table_name")
      const pattern2 = new RegExp(`\\.from\\("${table}"\\)`, 'g');
      if (pattern2.test(line) && !line.includes(`"api.${table}"`)) {
        updates.push({
          file: filePath,
          oldPattern: `.from("${table}")`,
          newPattern: `.from("api.${table}")`,
          line: index + 1
        });
      }
      
      // Pattern 3: .from(`table_name`)
      const pattern3 = new RegExp(`\\.from\\(\`${table}\`\\)`, 'g');
      if (pattern3.test(line) && !line.includes(`\`api.${table}\``)) {
        updates.push({
          file: filePath,
          oldPattern: `.from(\`${table}\`)`,
          newPattern: `.from(\`api.${table}\`)`,
          line: index + 1
        });
      }
    });
  });
}

function scanDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }
  
  const files = fs.readdirSync(dirPath, { recursive: true });
  
  files.forEach((file) => {
    const filePath = path.join(dirPath, file.toString());
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      scanFile(filePath);
    }
  });
}

// Main execution
console.log('🔍 Scanning for queries that need schema updates...\n');

dirsToScan.forEach(dir => {
  scanDirectory(dir);
});

if (updates.length === 0) {
  console.log('✅ All queries already use api schema!\n');
  process.exit(0);
}

// Group updates by file
const updatesByFile = updates.reduce((acc, update) => {
  if (!acc[update.file]) {
    acc[update.file] = [];
  }
  acc[update.file].push(update);
  return acc;
}, {} as Record<string, FileUpdate[]>);

console.log(`📝 Found ${updates.length} queries in ${Object.keys(updatesByFile).length} files that need updating:\n`);

Object.entries(updatesByFile).forEach(([file, fileUpdates]) => {
  console.log(`\n📄 ${file}`);
  fileUpdates.forEach(update => {
    console.log(`   Line ${update.line}: ${update.oldPattern} → ${update.newPattern}`);
  });
});

console.log('\n\n⚠️  This is a dry run. No files were modified.');
console.log('To apply these changes, manually update the queries or modify this script to write changes.\n');

export { updates, updatesByFile };
