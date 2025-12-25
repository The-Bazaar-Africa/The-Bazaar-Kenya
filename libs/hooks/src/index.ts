// Core hooks
export { useDebounce } from './use-debounce';
export { useLocalStorage } from './use-local-storage';
export { useMediaQuery } from './use-media-query';

// Cart
export { useCart } from './use-cart';
export type {
  CartItem,
  CartState,
  UseCartOptions,
  UseCartReturn,
  AddToCartInput,
} from './use-cart';

export { CartProvider, useCartContext, useOptionalCartContext } from './cart-context';
export type { CartContextValue, CartProviderProps } from './cart-context';

// Wishlist
export { useWishlist } from './use-wishlist';
export type {
  WishlistProduct,
  WishlistItem,
  WishlistState,
  UseWishlistOptions,
  UseWishlistReturn,
} from './use-wishlist';

export {
  WishlistProvider,
  useWishlistContext,
  useOptionalWishlistContext,
} from './wishlist-context';
export type { WishlistContextValue, WishlistProviderProps } from './wishlist-context';
