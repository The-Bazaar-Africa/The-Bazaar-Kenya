/**
 * Vendor Queries
 * ===============
 * Type-safe query functions for vendor operations.
 */

import type { TypedSupabaseClient } from '../client';
import type { Vendor, InsertTables, UpdateTables } from '../types';

export interface VendorFilters {
  status?: Vendor['status'];
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get a single vendor by ID
 */
export async function getVendorById(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .select('*')
    .eq('id', vendorId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get a single vendor by user ID
 */
export async function getVendorByUserId(
  client: TypedSupabaseClient,
  userId: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get a single vendor by slug
 */
export async function getVendorBySlug(
  client: TypedSupabaseClient,
  slug: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) return null;
  return data;
}

/**
 * Get vendors with filters and pagination
 */
export async function getVendors(
  client: TypedSupabaseClient,
  filters: VendorFilters = {}
): Promise<{ vendors: Vendor[]; count: number }> {
  const {
    status,
    category,
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = client
    .from('api.vendors')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching vendors:', error);
    return { vendors: [], count: 0 };
  }

  return { vendors: data || [], count: count || 0 };
}

/**
 * Get featured vendors (for homepage)
 */
export async function getFeaturedVendors(
  client: TypedSupabaseClient,
  limit = 6
): Promise<Vendor[]> {
  const { data, error } = await client
    .from('api.vendors')
    .select('*')
    .eq('status', 'active')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured vendors:', error);
    return [];
  }

  return data || [];
}

/**
 * Get pending vendors (for admin approval)
 */
export async function getPendingVendors(
  client: TypedSupabaseClient
): Promise<Vendor[]> {
  const { data, error } = await client
    .from('api.vendors')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending vendors:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new vendor application
 */
export async function createVendor(
  client: TypedSupabaseClient,
  vendor: InsertTables<'vendors'>
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .insert({
      ...vendor,
      status: 'pending',
      rating: 0,
      review_count: 0,
      product_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vendor:', error);
    return null;
  }

  return data;
}

/**
 * Update vendor profile
 */
export async function updateVendor(
  client: TypedSupabaseClient,
  vendorId: string,
  updates: UpdateTables<'vendors'>
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) {
    console.error('Error updating vendor:', error);
    return null;
  }

  return data;
}

/**
 * Approve a vendor (admin action)
 */
export async function approveVendor(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<Vendor | null> {
  // First, update the vendor status
  const { data: vendor, error: vendorError } = await client
    .from('api.vendors')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', vendorId)
    .select()
    .single();

  if (vendorError || !vendor) {
    console.error('Error approving vendor:', vendorError);
    return null;
  }

  // Then, update the user's role to vendor
  const { error: profileError } = await client
    .from('api.profiles')
    .update({ role: 'vendor', updated_at: new Date().toISOString() })
    .eq('id', vendor.user_id);

  if (profileError) {
    console.error('Error updating user role:', profileError);
    // Don't fail the operation, but log the error
  }

  return vendor;
}

/**
 * Reject a vendor (admin action)
 */
export async function rejectVendor(
  client: TypedSupabaseClient,
  vendorId: string,
  reason?: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .update({
      status: 'rejected',
      description: reason ? `Rejected: ${reason}` : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting vendor:', error);
    return null;
  }

  return data;
}

/**
 * Suspend a vendor (admin action)
 */
export async function suspendVendor(
  client: TypedSupabaseClient,
  vendorId: string,
  reason?: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .update({
      status: 'suspended',
      description: reason ? `Suspended: ${reason}` : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) {
    console.error('Error suspending vendor:', error);
    return null;
  }

  return data;
}

/**
 * Reactivate a suspended vendor (admin action)
 */
export async function reactivateVendor(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<Vendor | null> {
  const { data, error } = await client
    .from('api.vendors')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', vendorId)
    .select()
    .single();

  if (error) {
    console.error('Error reactivating vendor:', error);
    return null;
  }

  return data;
}

/**
 * Update vendor product count
 */
export async function updateVendorProductCount(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<boolean> {
  const { count, error: countError } = await client
    .from('api.products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .eq('status', 'active');

  if (countError) {
    console.error('Error counting products:', countError);
    return false;
  }

  const { error } = await client
    .from('api.vendors')
    .update({ product_count: count || 0, updated_at: new Date().toISOString() })
    .eq('id', vendorId);

  if (error) {
    console.error('Error updating vendor product count:', error);
    return false;
  }

  return true;
}

/**
 * Update vendor rating (called after a new review)
 */
export async function updateVendorRating(
  client: TypedSupabaseClient,
  vendorId: string
): Promise<boolean> {
  const { data: reviews, error: reviewsError } = await client
    .from('api.reviews')
    .select('rating')
    .eq('vendor_id', vendorId);

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
    return false;
  }

  const reviewCount = reviews?.length || 0;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const { error } = await client
    .from('api.vendors')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      review_count: reviewCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId);

  if (error) {
    console.error('Error updating vendor rating:', error);
    return false;
  }

  return true;
}

/**
 * Generate a unique vendor slug
 */
export async function generateVendorSlug(
  client: TypedSupabaseClient,
  businessName: string
): Promise<string> {
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await client
      .from('api.vendors')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!data) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
