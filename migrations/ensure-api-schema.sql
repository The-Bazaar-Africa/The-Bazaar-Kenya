-- ============================================================================
-- Database Schema Migration: Ensure All Tables in API Schema
-- ============================================================================
-- Purpose: Migrate all custom tables from public schema to api schema
-- Date: 2025-12-25
-- Status: Development Only
-- Risk Level: Medium
--
-- This migration ensures all application tables are in the api schema
-- for better organization and security isolation from Supabase internal tables.
--
-- PREREQUISITES:
-- 1. Full database backup completed
-- 2. All applications stopped
-- 3. Run during maintenance window
-- 4. Test on staging environment first
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- Step 1: Create API Schema (if not exists)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS api;
GRANT USAGE ON SCHEMA api TO anon, authenticated, service_role;

-- ============================================================================
-- Step 2: Identify Tables in Public Schema
-- ============================================================================

-- Check if tables exist in public schema that should be in api
DO $$
DECLARE
    table_name text;
    tables_to_migrate text[] := ARRAY[
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
BEGIN
    FOREACH table_name IN ARRAY tables_to_migrate
    LOOP
        -- Check if table exists in public schema
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            RAISE NOTICE 'Found table in public schema: %', table_name;
        END IF;
        
        -- Check if table exists in api schema
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'api' 
            AND table_name = table_name
        ) THEN
            RAISE NOTICE 'Table already exists in api schema: %', table_name;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- Step 3: Move Tables from Public to API Schema (if needed)
-- ============================================================================

-- Note: This section only executes if tables exist in public schema
-- If your tables are already in api schema, this will be skipped

DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN (
            'profiles', 'vendors', 'admin_staff', 'vendor_staff',
            'products', 'product_images', 'categories',
            'orders', 'order_items', 'payments',
            'addresses', 'cart_items', 'wishlists',
            'reviews', 'notifications', 'admin_audit_logs'
        )
    LOOP
        -- Move table to api schema
        EXECUTE format('ALTER TABLE public.%I SET SCHEMA api', table_record.table_name);
        RAISE NOTICE 'Moved table to api schema: %', table_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 4: Update Foreign Key Constraints
-- ============================================================================

-- After moving tables, foreign key constraints should automatically update
-- But we'll verify and fix any that might be broken

DO $$
DECLARE
    constraint_record record;
BEGIN
    FOR constraint_record IN
        SELECT
            tc.constraint_name,
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'api'
    LOOP
        RAISE NOTICE 'Foreign key: %.% references %.%',
            constraint_record.table_name,
            constraint_record.column_name,
            constraint_record.foreign_table_name,
            constraint_record.foreign_column_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 5: Migrate RLS Policies
-- ============================================================================

-- RLS policies are attached to tables, so they move with the table
-- But we need to ensure they reference the correct schema

DO $$
DECLARE
    policy_record record;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'api'
    LOOP
        RAISE NOTICE 'RLS Policy on api.%: %', policy_record.tablename, policy_record.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- Step 6: Update Search Path (Optional but Recommended)
-- ============================================================================

-- Set default search path to include api schema
-- This allows queries to find tables without explicit schema qualification

ALTER DATABASE postgres SET search_path TO api, public, extensions;

-- For existing roles
ALTER ROLE anon SET search_path TO api, public;
ALTER ROLE authenticated SET search_path TO api, public;
ALTER ROLE service_role SET search_path TO api, public;

-- ============================================================================
-- Step 7: Grant Permissions on API Schema
-- ============================================================================

-- Ensure proper permissions on all tables in api schema
DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'api'
        AND table_type = 'BASE TABLE'
    LOOP
        -- Grant SELECT to anon role (public read access where RLS allows)
        EXECUTE format('GRANT SELECT ON api.%I TO anon', table_record.table_name);
        
        -- Grant full access to authenticated users (controlled by RLS)
        EXECUTE format('GRANT ALL ON api.%I TO authenticated', table_record.table_name);
        
        -- Grant full access to service_role (bypasses RLS)
        EXECUTE format('GRANT ALL ON api.%I TO service_role', table_record.table_name);
        
        RAISE NOTICE 'Granted permissions on api.%', table_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 8: Update Sequences
-- ============================================================================

-- Grant usage on all sequences in api schema
DO $$
DECLARE
    sequence_record record;
BEGIN
    FOR sequence_record IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'api'
    LOOP
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE api.%I TO authenticated', sequence_record.sequence_name);
        EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE api.%I TO service_role', sequence_record.sequence_name);
        RAISE NOTICE 'Granted sequence permissions on api.%', sequence_record.sequence_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 9: Verification
-- ============================================================================

-- Verify all expected tables are in api schema
DO $$
DECLARE
    expected_tables text[] := ARRAY[
        'profiles', 'vendors', 'admin_staff', 'vendor_staff',
        'products', 'product_images', 'categories',
        'orders', 'order_items', 'payments',
        'addresses', 'cart_items', 'wishlists',
        'reviews', 'notifications', 'admin_audit_logs'
    ];
    table_name text;
    missing_tables text[] := ARRAY[]::text[];
    found_count int := 0;
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'api' 
            AND table_name = table_name
        ) THEN
            found_count := found_count + 1;
            RAISE NOTICE '✓ Table exists in api schema: %', table_name;
        ELSE
            missing_tables := array_append(missing_tables, table_name);
            RAISE WARNING '✗ Table missing from api schema: %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration Summary: % of % tables verified in api schema', found_count, array_length(expected_tables, 1);
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- ============================================================================
-- Step 10: Create Views for Backward Compatibility (Optional)
-- ============================================================================

-- If you need backward compatibility with code still referencing public schema
-- Uncomment this section to create views in public schema that point to api schema

/*
DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'api'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('CREATE OR REPLACE VIEW public.%I AS SELECT * FROM api.%I', 
            table_record.table_name, table_record.table_name);
        RAISE NOTICE 'Created compatibility view: public.%', table_record.table_name;
    END LOOP;
END $$;
*/

COMMIT;

-- ============================================================================
-- Post-Migration Checks
-- ============================================================================

-- Run these queries after migration to verify success:

-- 1. Check all tables in api schema
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'api' 
ORDER BY tablename;

-- 2. Check all RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'api' 
ORDER BY tablename, policyname;

-- 3. Check all foreign keys
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'api'
ORDER BY tc.table_name;

-- 4. Test a simple query
-- SELECT COUNT(*) FROM api.profiles;
