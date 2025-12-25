-- ============================================================================
-- Rollback Script: Move Tables Back to Public Schema
-- ============================================================================
-- Purpose: Rollback migration if issues are detected
-- Date: 2025-12-25
-- Status: Emergency Use Only
--
-- WARNING: Only use this if the migration causes critical issues
-- ============================================================================

BEGIN;

-- ============================================================================
-- Step 1: Move Tables Back to Public Schema
-- ============================================================================

DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'api' 
        AND table_type = 'BASE TABLE'
        AND table_name IN (
            'profiles', 'vendors', 'admin_staff', 'vendor_staff',
            'products', 'product_images', 'categories',
            'orders', 'order_items', 'payments',
            'addresses', 'cart_items', 'wishlists',
            'reviews', 'notifications', 'admin_audit_logs'
        )
    LOOP
        EXECUTE format('ALTER TABLE api.%I SET SCHEMA public', table_record.table_name);
        RAISE NOTICE 'Moved table back to public schema: %', table_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 2: Reset Search Path
-- ============================================================================

ALTER DATABASE postgres SET search_path TO public, extensions;
ALTER ROLE anon SET search_path TO public;
ALTER ROLE authenticated SET search_path TO public;
ALTER ROLE service_role SET search_path TO public;

-- ============================================================================
-- Step 3: Re-grant Permissions on Public Schema
-- ============================================================================

DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO anon', table_record.table_name);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', table_record.table_name);
        EXECUTE format('GRANT ALL ON public.%I TO service_role', table_record.table_name);
        RAISE NOTICE 'Granted permissions on public.%', table_record.table_name;
    END LOOP;
END $$;

-- ============================================================================
-- Step 4: Verification
-- ============================================================================

SELECT 'Rollback completed. Tables moved back to public schema.' AS status;

SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'api')
AND table_name IN (
    'profiles', 'vendors', 'admin_staff', 'vendor_staff',
    'products', 'product_images', 'categories',
    'orders', 'order_items', 'payments',
    'addresses', 'cart_items', 'wishlists',
    'reviews', 'notifications', 'admin_audit_logs'
)
ORDER BY table_schema, table_name;

COMMIT;
