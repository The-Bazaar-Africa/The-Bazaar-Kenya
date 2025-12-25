import { supabase, isSupabaseConfigured } from './client';
import type { Product, ProductFilters } from '@/types/product';

// Schema availability tracking
let schemaUnavailable = false;
let lastSchemaCheck = 0;
const SCHEMA_CHECK_INTERVAL = 60000; // 1 minute

function shouldSkipSupabase(): boolean {
  if (!isSupabaseConfigured) return true;
  if (!schemaUnavailable) return false;
  
  // Periodically retry
  const now = Date.now();
  if (now - lastSchemaCheck > SCHEMA_CHECK_INTERVAL) {
    schemaUnavailable = false;
    lastSchemaCheck = now;
    return false;
  }
  return true;
}

function markSchemaUnavailable() {
  schemaUnavailable = true;
  lastSchemaCheck = Date.now();
}

function markSchemaAvailable() {
  schemaUnavailable = false;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(
  filters?: ProductFilters,
  limit?: number,
  offset?: number
): Promise<{ data: Product[] | null; error: any }> {
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.inStock) {
      query = query.gt('stock_quantity', 0);
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 100) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST106' || error.message?.includes('schema must be one of')) {
        markSchemaUnavailable();
        return { data: null, error };
      }
      console.error('Supabase products query error:', error);
      return { data: null, error };
    }

    if (data && data.length > 0) {
      markSchemaAvailable();

      // Fetch vendors
      const vendorIds = [...new Set(data.map(p => p.vendor_id).filter(Boolean))];
      let vendors: any[] = [];
      if (vendorIds.length > 0) {
        const { data: vendorsData } = await supabase
          .from('vendors')
          .select('id, name, slug')
          .in('id', vendorIds);
        vendors = vendorsData || [];
      }

      // Fetch categories
      const categoryIds = [...new Set(data.map(p => p.category_id).filter(Boolean))];
      let categories: any[] = [];
      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .in('id', categoryIds);
        categories = categoriesData || [];
      }

      // Combine the data
      const transformedData = data.map(product => ({
        ...product,
        vendor: vendors.find(v => v.id === product.vendor_id) || null,
        category: categories.find(c => c.id === product.category_id) || null,
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
      }));

      return { data: transformedData, error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Supabase products fetch error:', error);
    return { data: null, error };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<{ data: Product | null; error: any }> {
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST106' || error?.message?.includes('schema must be one of')) {
        markSchemaUnavailable();
      }
      return { data: null, error };
    }

    markSchemaAvailable();

    // Fetch related data
    let vendor = null;
    if (data.vendor_id) {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, name, slug')
        .eq('id', data.vendor_id)
        .single();
      vendor = vendorData || null;
    }

    let category = null;
    if (data.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', data.category_id)
        .single();
      category = categoryData || null;
    }

    const transformedData = {
      ...data,
      vendor,
      category,
      images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 10): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ isFeatured: true }, limit);
}

/**
 * Search products
 */
export async function searchProducts(query: string, limit?: number): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ search: query }, limit);
}

/**
 * Get categories
 */
export async function getCategories(limit?: number): Promise<{ data: any[] | null; error: any }> {
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST106' || error.message?.includes('schema must be one of')) {
        markSchemaUnavailable();
      }
      return { data: null, error };
    }

    if (data && data.length > 0) {
      markSchemaAvailable();
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
