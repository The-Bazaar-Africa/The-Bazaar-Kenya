/**
 * Cart Queries
 * =============
 * Type-safe query functions for shopping cart operations.
 */

import type { TypedSupabaseClient } from '../client';
import type { CartItem, Product, ProductImage, InsertTables } from '../types';

export interface CartItemWithProduct extends CartItem {
  product: Product & { images: ProductImage[] };
}

export interface CartSummary {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  currency: string;
}

/**
 * Get cart items for a user with product details
 */
export async function getCartItems(
  client: TypedSupabaseClient,
  userId: string
): Promise<CartItemWithProduct[]> {
  const { data, error } = await client
    .from('api.cart_items')
    .select(`
      *,
      product:api.products(
        *,
        images:api.product_images(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  // Filter out items where product is null or not active
  return (data || [])
    .filter((item) => item.product && item.product.status === 'active')
    .map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: item.product.images || [],
      },
    })) as CartItemWithProduct[];
}

/**
 * Get cart summary with totals
 */
export async function getCartSummary(
  client: TypedSupabaseClient,
  userId: string
): Promise<CartSummary> {
  const items = await getCartItems(client, userId);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    itemCount,
    subtotal,
    currency: 'KES',
  };
}

/**
 * Get cart item count for a user
 */
export async function getCartItemCount(
  client: TypedSupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await client
    .from('api.cart_items')
    .select('quantity')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart count:', error);
    return 0;
  }

  return (data || []).reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Add item to cart (or update quantity if exists)
 */
export async function addToCart(
  client: TypedSupabaseClient,
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<CartItem | null> {
  // Check if item already exists in cart
  const { data: existingItem } = await client
    .from('api.cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // Update quantity
    const { data, error } = await client
      .from('api.cart_items')
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      return null;
    }

    return data;
  }

  // Create new cart item
  const { data, error } = await client
    .from('api.cart_items')
    .insert({
      user_id: userId,
      product_id: productId,
      quantity,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to cart:', error);
    return null;
  }

  return data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  client: TypedSupabaseClient,
  cartItemId: string,
  userId: string,
  quantity: number
): Promise<CartItem | null> {
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    await removeFromCart(client, cartItemId, userId);
    return null;
  }

  const { data, error } = await client
    .from('api.cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating cart item quantity:', error);
    return null;
  }

  return data;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  client: TypedSupabaseClient,
  cartItemId: string,
  userId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing from cart:', error);
    return false;
  }

  return true;
}

/**
 * Clear entire cart for a user
 */
export async function clearCart(
  client: TypedSupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }

  return true;
}

/**
 * Merge guest cart with user cart (after login)
 */
export async function mergeGuestCart(
  client: TypedSupabaseClient,
  userId: string,
  guestCartItems: Array<{ productId: string; quantity: number }>
): Promise<boolean> {
  try {
    for (const item of guestCartItems) {
      await addToCart(client, userId, item.productId, item.quantity);
    }
    return true;
  } catch (error) {
    console.error('Error merging guest cart:', error);
    return false;
  }
}

/**
 * Validate cart items (check stock availability)
 */
export async function validateCart(
  client: TypedSupabaseClient,
  userId: string
): Promise<{
  valid: boolean;
  invalidItems: Array<{ cartItemId: string; productName: string; reason: string }>;
}> {
  const items = await getCartItems(client, userId);
  const invalidItems: Array<{ cartItemId: string; productName: string; reason: string }> = [];

  for (const item of items) {
    if (item.product.status !== 'active') {
      invalidItems.push({
        cartItemId: item.id,
        productName: item.product.name,
        reason: 'Product is no longer available',
      });
    } else if (item.product.inventory < item.quantity) {
      invalidItems.push({
        cartItemId: item.id,
        productName: item.product.name,
        reason: `Only ${item.product.inventory} items available`,
      });
    }
  }

  return {
    valid: invalidItems.length === 0,
    invalidItems,
  };
}

// ============================================================================
// WISHLIST OPERATIONS
// ============================================================================

/**
 * Get wishlist items for a user
 */
export async function getWishlistItems(
  client: TypedSupabaseClient,
  userId: string
): Promise<Array<{ id: string; product: Product & { images: ProductImage[] }; created_at: string }>> {
  const { data, error } = await client
    .from('api.wishlists')
    .select(`
      id,
      created_at,
      product:api.products(
        *,
        images:api.product_images(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return (data || [])
    .filter((item) => item.product)
    .map((item) => ({
      id: item.id,
      created_at: item.created_at,
      product: {
        ...item.product,
        images: item.product.images || [],
      },
    })) as Array<{ id: string; product: Product & { images: ProductImage[] }; created_at: string }>;
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
  client: TypedSupabaseClient,
  userId: string,
  productId: string
): Promise<boolean> {
  const { data } = await client
    .from('api.wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return !!data;
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(
  client: TypedSupabaseClient,
  userId: string,
  productId: string
): Promise<boolean> {
  // Check if already in wishlist
  const exists = await isInWishlist(client, userId, productId);
  if (exists) return true;

  const { error } = await client
    .from('api.wishlists')
    .insert({ user_id: userId, product_id: productId });

  if (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }

  return true;
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(
  client: TypedSupabaseClient,
  userId: string,
  productId: string
): Promise<boolean> {
  const { error } = await client
    .from('api.wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }

  return true;
}

/**
 * Move item from wishlist to cart
 */
export async function moveWishlistToCart(
  client: TypedSupabaseClient,
  userId: string,
  productId: string
): Promise<boolean> {
  const addedToCart = await addToCart(client, userId, productId, 1);
  if (!addedToCart) return false;

  await removeFromWishlist(client, userId, productId);
  return true;
}
