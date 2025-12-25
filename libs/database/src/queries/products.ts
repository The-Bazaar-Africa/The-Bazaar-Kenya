/**
 * Product Queries
 * ================
 * Type-safe query functions for product operations.
 */

import type { TypedSupabaseClient } from '../client';
import type { Product, ProductImage, InsertTables, UpdateTables } from '../types';

export interface ProductWithImages extends Product {
  images: ProductImage[];
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  status?: Product['status'];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get a single product by ID with images
 */
export async function getProductById(
  client: TypedSupabaseClient,
  productId: string
): Promise<ProductWithImages | null> {
  const { data: product, error } = await client
    .from('api.products')
    .select('*, images:api.product_images(*)')
    .eq('id', productId)
    .single();

  if (error || !product) return null;

  return {
    ...product,
    images: (product.images as ProductImage[]) || [],
  };
}

/**
 * Get a single product by slug with images
 */
export async function getProductBySlug(
  client: TypedSupabaseClient,
  slug: string
): Promise<ProductWithImages | null> {
  const { data: product, error } = await client
    .from('api.products')
    .select('*, images:api.product_images(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !product) return null;

  return {
    ...product,
    images: (product.images as ProductImage[]) || [],
  };
}

/**
 * Get products with filters and pagination
 */
export async function getProducts(
  client: TypedSupabaseClient,
  filters: ProductFilters = {}
): Promise<{ products: ProductWithImages[]; count: number }> {
  const {
    categoryId,
    vendorId,
    status = 'active',
    minPrice,
    maxPrice,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = client
    .from('api.products')
    .select('*, images:api.product_images(*)', { count: 'exact' })
    .eq('status', status);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  if (minPrice !== undefined) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], count: 0 };
  }

  const products = (data || []).map((product) => ({
    ...product,
    images: (product.images as ProductImage[]) || [],
  }));

  return { products, count: count || 0 };
}

/**
 * Get featured products (for homepage)
 */
export async function getFeaturedProducts(
  client: TypedSupabaseClient,
  limit = 8
): Promise<ProductWithImages[]> {
  const { data, error } = await client
    .from('api.products')
    .select('*, images:api.product_images(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map((product) => ({
    ...product,
    images: (product.images as ProductImage[]) || [],
  }));
}

/**
 * Create a new product (vendor use)
 */
export async function createProduct(
  client: TypedSupabaseClient,
  product: InsertTables<'products'>
): Promise<Product | null> {
  const { data, error } = await client
    .from('api.products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return data;
}

/**
 * Update a product (vendor use)
 */
export async function updateProduct(
  client: TypedSupabaseClient,
  productId: string,
  updates: UpdateTables<'products'>
): Promise<Product | null> {
  const { data, error } = await client
    .from('api.products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data;
}

/**
 * Delete a product (soft delete by setting status to archived)
 */
export async function archiveProduct(
  client: TypedSupabaseClient,
  productId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) {
    console.error('Error archiving product:', error);
    return false;
  }

  return true;
}

/**
 * Add images to a product
 */
export async function addProductImages(
  client: TypedSupabaseClient,
  productId: string,
  images: Array<{ url: string; alt?: string; position: number }>
): Promise<ProductImage[]> {
  const { data, error } = await client
    .from('api.product_images')
    .insert(
      images.map((img) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt || null,
        position: img.position,
      }))
    )
    .select();

  if (error) {
    console.error('Error adding product images:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete a product image
 */
export async function deleteProductImage(
  client: TypedSupabaseClient,
  imageId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.product_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting product image:', error);
    return false;
  }

  return true;
}

/**
 * Update product inventory
 */
export async function updateProductInventory(
  client: TypedSupabaseClient,
  productId: string,
  quantity: number,
  operation: 'set' | 'increment' | 'decrement' = 'set'
): Promise<boolean> {
  let query;

  if (operation === 'set') {
    query = client
      .from('api.products')
      .update({ inventory: quantity, updated_at: new Date().toISOString() })
      .eq('id', productId);
  } else {
    // For increment/decrement, we need to use RPC or fetch-then-update
    const { data: product } = await client
      .from('api.products')
      .select('inventory')
      .eq('id', productId)
      .single();

    if (!product) return false;

    const newInventory =
      operation === 'increment'
        ? product.inventory + quantity
        : Math.max(0, product.inventory - quantity);

    query = client
      .from('api.products')
      .update({
        inventory: newInventory,
        status: newInventory === 0 ? 'out_of_stock' : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error updating product inventory:', error);
    return false;
  }

  return true;
}
