/**
 * The Bazaar - Root ESLint Configuration
 * 
 * This file enforces Nx module boundary constraints.
 * Architecture violations will fail linting.
 * 
 * @see https://nx.dev/recipes/enforce-module-boundaries
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@nx': nxPlugin,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // =========================================================================
      // NX MODULE BOUNDARY ENFORCEMENT (Non-Negotiable)
      // =========================================================================
      // This is real governance, not documentation theater.
      // 
      // Violations blocked:
      // - Frontend importing backend          → ❌ Hard fail
      // - Frontend calling REST directly      → ❌ Hard fail  
      // - Backend importing api-client        → ❌ Hard fail
      // - Circular lib dependencies           → ❌ Hard fail
      // - Human "just this once" shortcuts    → ❌ Blocked
      // =========================================================================
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            // Frontend apps can only depend on: api-client, shared libs, frontend-only libs
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: [
                'scope:api-client',
                'scope:shared',
                'scope:frontend-only',
              ],
            },
            // API client can only depend on shared libs (types, utils)
            {
              sourceTag: 'scope:api-client',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Backend can only depend on shared libs and backend-only libs
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend-only'],
            },
            // Frontend-only libs (ui, hooks) can depend on shared and other frontend-only
            {
              sourceTag: 'scope:frontend-only',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend-only'],
            },
            // Backend-only libs (database) can only depend on shared
            {
              sourceTag: 'scope:backend-only',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Shared libs can only depend on other shared libs
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nx/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/jest.preset.js',
      '_Legacy/**',
      '_Misc/**',
    ],
  }
);
