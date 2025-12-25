'use client';

import * as React from 'react';
import {
  useWishlist,
  type UseWishlistReturn,
  type UseWishlistOptions,
  type WishlistProduct,
  type WishlistItem,
} from './use-wishlist';

// ============================================================================
// Context Types
// ============================================================================

export interface WishlistContextValue extends UseWishlistReturn {
  /**
   * Whether the wishlist drawer/modal is open
   */
  isOpen: boolean;

  /**
   * Open the wishlist drawer/modal
   */
  openWishlist: () => void;

  /**
   * Close the wishlist drawer/modal
   */
  closeWishlist: () => void;

  /**
   * Toggle the wishlist drawer/modal
   */
  toggleWishlistDrawer: () => void;

  /**
   * Recently viewed products (for recommendations)
   */
  recentlyViewed: WishlistProduct[];

  /**
   * Add to recently viewed
   */
  addToRecentlyViewed: (product: WishlistProduct) => void;
}

export interface WishlistProviderProps extends UseWishlistOptions {
  children: React.ReactNode;
  
  /**
   * Default open state for wishlist drawer
   */
  defaultOpen?: boolean;
  
  /**
   * Maximum recently viewed items to track (default: 10)
   */
  maxRecentlyViewed?: number;
}

// ============================================================================
// Context
// ============================================================================

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

// ============================================================================
// Constants
// ============================================================================

const RECENTLY_VIEWED_KEY = 'bazaar_recently_viewed';
const DEFAULT_MAX_RECENTLY_VIEWED = 10;

// ============================================================================
// Recently Viewed Storage
// ============================================================================

function loadRecentlyViewed(): WishlistProduct[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter(
      (item): item is WishlistProduct =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number'
    );
  } catch {
    return [];
  }
}

function saveRecentlyViewed(items: WishlistProduct[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save recently viewed:', error);
  }
}

// ============================================================================
// Provider
// ============================================================================

/**
 * WishlistProvider - Provides wishlist context to the app
 * 
 * Features:
 * - All useWishlist functionality
 * - Wishlist drawer/modal state management
 * - Recently viewed products tracking
 * - localStorage persistence
 * 
 * @example
 * ```tsx
 * // In your app layout
 * import { WishlistProvider } from '@tbk/hooks';
 * 
 * export function Providers({ children }) {
 *   return (
 *     <WishlistProvider maxItems={100} maxRecentlyViewed={10}>
 *       {children}
 *     </WishlistProvider>
 *   );
 * }
 * 
 * // In components
 * import { useWishlistContext } from '@tbk/hooks';
 * 
 * function WishlistButton({ product }) {
 *   const { toggleWishlist, isInWishlist, openWishlist } = useWishlistContext();
 *   
 *   return (
 *     <>
 *       <button onClick={() => toggleWishlist(product)}>
 *         {isInWishlist(product.id) ? '❤️' : '🤍'}
 *       </button>
 *       <button onClick={openWishlist}>View Wishlist</button>
 *     </>
 *   );
 * }
 * ```
 */
export function WishlistProvider({
  children,
  defaultOpen = false,
  maxRecentlyViewed = DEFAULT_MAX_RECENTLY_VIEWED,
  ...wishlistOptions
}: WishlistProviderProps) {
  // Use the wishlist hook
  const wishlist = useWishlist(wishlistOptions);

  // Drawer/modal state
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Recently viewed state
  const [recentlyViewed, setRecentlyViewed] = React.useState<WishlistProduct[]>([]);

  // Load recently viewed on mount
  React.useEffect(() => {
    setRecentlyViewed(loadRecentlyViewed());
  }, []);

  // Drawer actions
  const openWishlist = React.useCallback(() => setIsOpen(true), []);
  const closeWishlist = React.useCallback(() => setIsOpen(false), []);
  const toggleWishlistDrawer = React.useCallback(() => setIsOpen(prev => !prev), []);

  // Recently viewed actions
  const addToRecentlyViewed = React.useCallback(
    (product: WishlistProduct) => {
      setRecentlyViewed(prev => {
        // Remove if already exists
        const filtered = prev.filter(p => p.id !== product.id);
        
        // Add to front
        const updated = [{ ...product, addedAt: Date.now() }, ...filtered];
        
        // Limit to max
        const limited = updated.slice(0, maxRecentlyViewed);
        
        // Save to storage
        saveRecentlyViewed(limited);
        
        return limited;
      });
    },
    [maxRecentlyViewed]
  );

  // Build context value
  const value = React.useMemo<WishlistContextValue>(
    () => ({
      ...wishlist,
      isOpen,
      openWishlist,
      closeWishlist,
      toggleWishlistDrawer,
      recentlyViewed,
      addToRecentlyViewed,
    }),
    [
      wishlist,
      isOpen,
      openWishlist,
      closeWishlist,
      toggleWishlistDrawer,
      recentlyViewed,
      addToRecentlyViewed,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// ============================================================================
// Consumer Hooks
// ============================================================================

/**
 * useWishlistContext - Access wishlist context (throws if outside provider)
 * 
 * @throws Error if used outside WishlistProvider
 */
export function useWishlistContext(): WishlistContextValue {
  const context = React.useContext(WishlistContext);
  
  if (!context) {
    throw new Error(
      'useWishlistContext must be used within a WishlistProvider. ' +
      'Make sure to wrap your app with <WishlistProvider>.'
    );
  }
  
  return context;
}

/**
 * useOptionalWishlistContext - Access wishlist context (returns null if outside provider)
 * 
 * Useful for components that should work both inside and outside the provider
 */
export function useOptionalWishlistContext(): WishlistContextValue | null {
  return React.useContext(WishlistContext);
}

// ============================================================================
// Re-exports
// ============================================================================

export type { WishlistProduct, WishlistItem, UseWishlistOptions };

// ============================================================================
// Default Export
// ============================================================================

export default WishlistContext;
