/**
 * User Queries
 * =============
 * Type-safe query functions for user/profile operations.
 */

import type { TypedSupabaseClient } from '../client';
import type { Profile, Address, InsertTables, UpdateTables } from '../types';

export interface UserWithAddresses extends Profile {
  addresses: Address[];
}

export interface UserFilters {
  role?: Profile['role'];
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get a single user profile by ID
 */
export async function getUserById(
  client: TypedSupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from('api.profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get a single user profile by email
 */
export async function getUserByEmail(
  client: TypedSupabaseClient,
  email: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from('api.profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get user with addresses
 */
export async function getUserWithAddresses(
  client: TypedSupabaseClient,
  userId: string
): Promise<UserWithAddresses | null> {
  const { data: profile, error: profileError } = await client
    .from('api.profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) return null;

  const { data: addresses } = await client
    .from('api.addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  return {
    ...profile,
    addresses: addresses || [],
  };
}

/**
 * Get users with filters and pagination (admin use)
 */
export async function getUsers(
  client: TypedSupabaseClient,
  filters: UserFilters = {}
): Promise<{ users: Profile[]; count: number }> {
  const { role, search, limit = 20, offset = 0 } = filters;

  let query = client
    .from('api.profiles')
    .select('*', { count: 'exact' });

  if (role) {
    query = query.eq('role', role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], count: 0 };
  }

  return { users: data || [], count: count || 0 };
}

/**
 * Create a user profile (usually called after auth signup)
 */
export async function createProfile(
  client: TypedSupabaseClient,
  profile: InsertTables<'profiles'>
): Promise<Profile | null> {
  const { data, error } = await client
    .from('api.profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  client: TypedSupabaseClient,
  userId: string,
  updates: UpdateTables<'profiles'>
): Promise<Profile | null> {
  const { data, error } = await client
    .from('api.profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user role (admin action)
 */
export async function updateUserRole(
  client: TypedSupabaseClient,
  userId: string,
  role: Profile['role']
): Promise<Profile | null> {
  const { data, error } = await client
    .from('api.profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error);
    return null;
  }

  return data;
}

/**
 * Get user addresses
 */
export async function getUserAddresses(
  client: TypedSupabaseClient,
  userId: string
): Promise<Address[]> {
  const { data, error } = await client
    .from('api.addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }

  return data || [];
}

/**
 * Get default address for a user
 */
export async function getDefaultAddress(
  client: TypedSupabaseClient,
  userId: string,
  type: 'shipping' | 'billing' = 'shipping'
): Promise<Address | null> {
  const { data, error } = await client
    .from('api.addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('is_default', true)
    .single();

  if (error) return null;
  return data;
}

/**
 * Add a new address
 */
export async function addAddress(
  client: TypedSupabaseClient,
  address: InsertTables<'addresses'>
): Promise<Address | null> {
  // If this is set as default, unset other defaults first
  if (address.is_default) {
    await client
      .from('api.addresses')
      .update({ is_default: false })
      .eq('user_id', address.user_id)
      .eq('type', address.type);
  }

  const { data, error } = await client
    .from('api.addresses')
    .insert(address)
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error);
    return null;
  }

  return data;
}

/**
 * Update an address
 */
export async function updateAddress(
  client: TypedSupabaseClient,
  addressId: string,
  userId: string,
  updates: UpdateTables<'addresses'>
): Promise<Address | null> {
  // If setting as default, unset other defaults first
  if (updates.is_default) {
    const { data: currentAddress } = await client
      .from('api.addresses')
      .select('type')
      .eq('id', addressId)
      .single();

    if (currentAddress) {
      await client
        .from('api.addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('type', currentAddress.type)
        .neq('id', addressId);
    }
  }

  const { data, error } = await client
    .from('api.addresses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error);
    return null;
  }

  return data;
}

/**
 * Delete an address
 */
export async function deleteAddress(
  client: TypedSupabaseClient,
  addressId: string,
  userId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting address:', error);
    return false;
  }

  return true;
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  client: TypedSupabaseClient,
  addressId: string,
  userId: string
): Promise<boolean> {
  // Get the address type
  const { data: address } = await client
    .from('api.addresses')
    .select('type')
    .eq('id', addressId)
    .single();

  if (!address) return false;

  // Unset other defaults of the same type
  await client
    .from('api.addresses')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('type', address.type);

  // Set this one as default
  const { error } = await client
    .from('api.addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId);

  if (error) {
    console.error('Error setting default address:', error);
    return false;
  }

  return true;
}

/**
 * Get user statistics (admin use)
 */
export async function getUserStats(
  client: TypedSupabaseClient
): Promise<{
  totalUsers: number;
  customers: number;
  vendors: number;
  admins: number;
}> {
  const { data, error } = await client
    .from('api.profiles')
    .select('role');

  if (error || !data) {
    return { totalUsers: 0, customers: 0, vendors: 0, admins: 0 };
  }

  return {
    totalUsers: data.length,
    customers: data.filter((u) => u.role === 'customer').length,
    vendors: data.filter((u) => u.role === 'vendor' || u.role === 'vendor_staff').length,
    admins: data.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
  };
}
