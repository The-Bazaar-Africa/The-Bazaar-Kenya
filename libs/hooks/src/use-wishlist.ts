'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Product type for wishlist items
 */
export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  slug?: string;
  category?: string;
  inStock?: boolean;
  addedAt?: number;
}

/**
 * Wishlist item with metadata
 */
export interface WishlistItem {
  product: WishlistProduct;
  addedAt: number;
  notes?: string;
}

/**
 * Wishlist state
 */
export interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

/**
 * useWishlist hook return type
 */
export interface UseWishlistReturn {
  // State
  items: WishlistItem[];
  itemCount: number;
  loading: boolean;
  error: string | null;

  // Actions
  addToWishlist: (product: WishlistProduct, notes?: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getItem: (productId: string) => WishlistItem | undefined;
  updateNotes: (productId: string, notes: string) => void;
  moveToCart?: (productId: string) => void;
  
  // Utilities
  toggleWishlist: (product: WishlistProduct) => boolean; // Returns true if added, false if removed
}

// ============================================================================
// Constants
// ============================================================================

const WISHLIST_STORAGE_KEY = 'bazaar_wishlist';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Load wishlist from localStorage
 */
function loadWishlistFromStorage(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Validate and clean items
    return parsed.filter(
      (item): item is WishlistItem =>
        item &&
        typeof item === 'object' &&
        item.product &&
        typeof item.product.id === 'string' &&
        typeof item.product.name === 'string' &&
        typeof item.product.price === 'number'
    );
  } catch (error) {
    console.error('Failed to load wishlist from storage:', error);
    return [];
  }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save wishlist to storage:', error);
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export interface UseWishlistOptions {
  /**
   * Persist to localStorage (default: true)
   */
  persist?: boolean;
  
  /**
   * Storage key override
   */
  storageKey?: string;
  
  /**
   * Callback when item is added
   */
  onAdd?: (item: WishlistItem) => void;
  
  /**
   * Callback when item is removed
   */
  onRemove?: (productId: string) => void;
  
  /**
   * Callback for moving item to cart (optional integration)
   */
  onMoveToCart?: (item: WishlistItem) => void;
  
  /**
   * Maximum items allowed in wishlist (default: unlimited)
   */
  maxItems?: number;
}

/**
 * useWishlist - A comprehensive hook for managing wishlist state
 * 
 * Features:
 * - Add/remove products to wishlist
 * - Toggle wishlist status
 * - Notes for each item
 * - localStorage persistence
 * - Cart integration support
 * - Maximum items limit
 * 
 * @example
 * ```tsx
 * const { 
 *   items, 
 *   itemCount, 
 *   addToWishlist, 
 *   removeFromWishlist,
 *   isInWishlist,
 *   toggleWishlist 
 * } = useWishlist();
 * 
 * // Add to wishlist
 * addToWishlist({ id: '1', name: 'Product', price: 99.99 });
 * 
 * // Check if in wishlist
 * const inWishlist = isInWishlist('1'); // true
 * 
 * // Toggle (add if not present, remove if present)
 * const added = toggleWishlist(product); // false (removed)
 * ```
 */
export function useWishlist(options: UseWishlistOptions = {}): UseWishlistReturn {
  const {
    persist = true,
    storageKey = WISHLIST_STORAGE_KEY,
    onAdd,
    onRemove,
    onMoveToCart,
    maxItems,
  } = options;

  // ----------------------------------------------------------------------------
  // State
  // ----------------------------------------------------------------------------

  const [state, setState] = useState<WishlistState>(() => ({
    items: [],
    loading: true,
    error: null,
  }));

  // ----------------------------------------------------------------------------
  // Load from storage on mount
  // ----------------------------------------------------------------------------

  useEffect(() => {
    if (persist) {
      const storedItems = loadWishlistFromStorage();
      setState({
        items: storedItems,
        loading: false,
        error: null,
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [persist]);

  // ----------------------------------------------------------------------------
  // Persist to storage on change
  // ----------------------------------------------------------------------------

  useEffect(() => {
    if (persist && !state.loading) {
      saveWishlistToStorage(state.items);
    }
  }, [state.items, persist, state.loading]);

  // ----------------------------------------------------------------------------
  // Computed Values
  // ----------------------------------------------------------------------------

  const itemCount = useMemo(() => state.items.length, [state.items]);

  // ----------------------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------------------

  const addToWishlist = useCallback(
    (product: WishlistProduct, notes?: string) => {
      setState(prev => {
        // Check if already in wishlist
        const exists = prev.items.some(item => item.product.id === product.id);
        if (exists) return prev;

        // Check max items limit
        if (maxItems && prev.items.length >= maxItems) {
          return {
            ...prev,
            error: `Maximum ${maxItems} items allowed in wishlist`,
          };
        }

        const newItem: WishlistItem = {
          product,
          addedAt: Date.now(),
          notes,
        };

        // Trigger callback
        onAdd?.(newItem);

        return {
          ...prev,
          items: [...prev.items, newItem],
          error: null,
        };
      });
    },
    [maxItems, onAdd]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setState(prev => {
        const exists = prev.items.some(item => item.product.id === productId);
        if (!exists) return prev;

        // Trigger callback
        onRemove?.(productId);

        return {
          ...prev,
          items: prev.items.filter(item => item.product.id !== productId),
          error: null,
        };
      });
    },
    [onRemove]
  );

  const clearWishlist = useCallback(() => {
    setState(prev => ({
      ...prev,
      items: [],
      error: null,
    }));
  }, []);

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return state.items.some(item => item.product.id === productId);
    },
    [state.items]
  );

  const getItem = useCallback(
    (productId: string): WishlistItem | undefined => {
      return state.items.find(item => item.product.id === productId);
    },
    [state.items]
  );

  const updateNotes = useCallback((productId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  }, []);

  const toggleWishlist = useCallback(
    (product: WishlistProduct): boolean => {
      const exists = state.items.some(item => item.product.id === product.id);
      
      if (exists) {
        removeFromWishlist(product.id);
        return false;
      } else {
        addToWishlist(product);
        return true;
      }
    },
    [state.items, addToWishlist, removeFromWishlist]
  );

  const moveToCart = useMemo(() => {
    if (!onMoveToCart) return undefined;
    
    return (productId: string) => {
      const item = state.items.find(i => i.product.id === productId);
      if (item) {
        onMoveToCart(item);
        removeFromWishlist(productId);
      }
    };
  }, [onMoveToCart, state.items, removeFromWishlist]);

  // ----------------------------------------------------------------------------
  // Return Value
  // ----------------------------------------------------------------------------

  return {
    // State
    items: state.items,
    itemCount,
    loading: state.loading,
    error: state.error,

    // Actions
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getItem,
    updateNotes,
    moveToCart,

    // Utilities
    toggleWishlist,
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default useWishlist;
