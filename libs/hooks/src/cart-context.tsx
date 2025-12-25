'use client';

/**
 * Cart Context Provider
 * ======================
 * Global cart state management with React Context.
 * 
 * Features:
 * - Provides cart state to entire app
 * - Handles authenticated vs guest cart
 * - Syncs with API when authenticated
 * - Persists to localStorage for guests
 * - Auto-migrates guest cart on login
 * 
 * @example
 * ```tsx
 * // In app layout
 * import { CartProvider } from '@tbk/hooks';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <CartProvider>
 *       {children}
 *     </CartProvider>
 *   );
 * }
 * 
 * // In components
 * import { useCartContext } from '@tbk/hooks';
 * 
 * function CartIcon() {
 *   const { itemCount } = useCartContext();
 *   return <Badge>{itemCount}</Badge>;
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useCart, type CartItem, type AddToCartInput } from './use-cart';

// =============================================================================
// TYPES
// =============================================================================

export interface CartContextValue {
  /** Cart items */
  items: CartItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Total number of items (sum of quantities) */
  itemCount: number;
  /** Number of unique products */
  uniqueItemCount: number;
  /** Cart subtotal (before tax/shipping) */
  subtotal: number;
  /** Formatted subtotal with currency */
  formattedSubtotal: string;
  /** Whether cart is empty */
  isEmpty: boolean;
  /** Add item to cart */
  addToCart: (item: AddToCartInput) => Promise<void>;
  /** Update item quantity */
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  /** Increment item quantity by 1 */
  incrementQuantity: (itemId: string) => Promise<void>;
  /** Decrement item quantity by 1 */
  decrementQuantity: (itemId: string) => Promise<void>;
  /** Remove item from cart */
  removeFromCart: (itemId: string) => Promise<void>;
  /** Clear all items */
  clearCart: () => Promise<void>;
  /** Check if product is in cart */
  isInCart: (productId: string, variantId?: string | null) => boolean;
  /** Get cart item by product ID */
  getCartItem: (productId: string, variantId?: string | null) => CartItem | undefined;
  /** Refresh cart from server */
  refreshCart: () => Promise<void>;
  /** Open cart drawer/modal */
  openCart: () => void;
  /** Close cart drawer/modal */
  closeCart: () => void;
  /** Toggle cart drawer/modal */
  toggleCart: () => void;
  /** Whether cart drawer/modal is open */
  isCartOpen: boolean;
}

export interface CartProviderProps {
  children: ReactNode;
  /** Currency code for formatting */
  currency?: string;
  /** Locale for formatting */
  locale?: string;
  /** Storage key for guest cart */
  storageKey?: string;
  /** Max items allowed in cart */
  maxItems?: number;
  /** Max quantity per item */
  maxQuantityPerItem?: number;
  /** Callback when item is added */
  onItemAdded?: (item: CartItem) => void;
  /** Callback when item is removed */
  onItemRemoved?: (item: CartItem) => void;
  /** Callback when cart is cleared */
  onCartCleared?: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const CartContext = createContext<CartContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function CartProvider({
  children,
  currency = 'KES',
  locale = 'en-KE',
  storageKey,
  maxItems,
  maxQuantityPerItem,
  onItemAdded,
  onItemRemoved,
  onCartCleared,
}: CartProviderProps) {
  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Use the cart hook
  const cart = useCart({
    storageKey,
    maxItems,
    maxQuantityPerItem,
  });

  // Format currency
  const formatCurrency = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    [locale, currency]
  );

  // Computed values
  const formattedSubtotal = useMemo(
    () => formatCurrency(cart.subtotal),
    [cart.subtotal, formatCurrency]
  );

  const isEmpty = useMemo(() => cart.items.length === 0, [cart.items.length]);

  // Enhanced addToCart with callback
  const addToCart = useCallback(
    async (item: AddToCartInput) => {
      await cart.addToCart(item);
      const addedItem = cart.items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (addedItem && onItemAdded) {
        onItemAdded(addedItem);
      }
    },
    [cart, onItemAdded]
  );

  // Enhanced removeFromCart with callback
  const removeFromCart = useCallback(
    async (itemId: string) => {
      const removedItem = cart.items.find((i) => i.id === itemId);
      await cart.removeFromCart(itemId);
      if (removedItem && onItemRemoved) {
        onItemRemoved(removedItem);
      }
    },
    [cart, onItemRemoved]
  );

  // Enhanced clearCart with callback
  const clearCart = useCallback(async () => {
    await cart.clearCart();
    onCartCleared?.();
  }, [cart, onCartCleared]);

  // Increment/decrement helpers
  const incrementQuantity = useCallback(
    async (itemId: string) => {
      const item = cart.items.find((i) => i.id === itemId);
      if (item) {
        await cart.updateQuantity(itemId, item.quantity + 1);
      }
    },
    [cart]
  );

  const decrementQuantity = useCallback(
    async (itemId: string) => {
      const item = cart.items.find((i) => i.id === itemId);
      if (item && item.quantity > 1) {
        await cart.updateQuantity(itemId, item.quantity - 1);
      }
    },
    [cart]
  );

  // Cart drawer controls
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Context value
  const value: CartContextValue = useMemo(
    () => ({
      items: cart.items,
      isLoading: cart.isLoading,
      error: cart.error,
      itemCount: cart.itemCount,
      uniqueItemCount: cart.uniqueItemCount,
      subtotal: cart.subtotal,
      formattedSubtotal,
      isEmpty,
      addToCart,
      updateQuantity: cart.updateQuantity,
      incrementQuantity,
      decrementQuantity,
      removeFromCart,
      clearCart,
      isInCart: cart.isInCart,
      getCartItem: cart.getCartItem,
      refreshCart: cart.refreshCart,
      openCart,
      closeCart,
      toggleCart,
      isCartOpen,
    }),
    [
      cart,
      formattedSubtotal,
      isEmpty,
      addToCart,
      incrementQuantity,
      decrementQuantity,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      isCartOpen,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Use cart context
 * 
 * @throws Error if used outside CartProvider
 */
export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

/**
 * Optional cart context hook that returns undefined if not in provider
 */
export function useOptionalCartContext(): CartContextValue | undefined {
  return useContext(CartContext);
}
