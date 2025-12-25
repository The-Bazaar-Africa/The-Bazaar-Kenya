/**
 * The Bazaar API - Generated Types
 * ================================
 * 
 * This file contains manually defined types that match the backend API.
 * These serve as a fallback until openapi-typescript generation is configured.
 * 
 * Structure mirrors:
 * - apps/backend-api/src/routes/v1/*
 * - OpenAPI spec at /docs/json
 */

// =============================================================================
// BASE RESPONSE TYPES
// =============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// =============================================================================
// AUTH TYPES (v1/auth)
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isAdmin: boolean;
    fullName?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'buyer' | 'vendor';
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Base User type for admin operations
 * This is the full user record from the database
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isAdmin: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'buyer' | 'vendor' | 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer';

// =============================================================================
// PRODUCT TYPES (v1/products)
// =============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string | null;
  barcode: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  categoryId: string | null;
  vendorId: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: VendorSummary;
  category?: CategorySummary;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  images?: string[];
  inventory?: number;
  sku?: string;
  attributes?: Record<string, unknown>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  inventory?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

// =============================================================================
// CATEGORY TYPES (v1/categories)
// =============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFilters {
  parentId?: string;
  isActive?: boolean;
}

// =============================================================================
// VENDOR TYPES (v1/vendors)
// =============================================================================

export interface Vendor {
  id: string;
  profileId: string;
  businessName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: Address | null;
  rating: number;
  totalReviews: number;
  totalSales: number;
  status: VendorStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSummary {
  id: string;
  businessName: string;
  slug: string;
  logoUrl?: string | null;
}

export type VendorStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface VendorFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: VendorStatus;
}

export interface VendorListResponse {
  vendors: Vendor[];
  pagination: PaginationMeta;
}

export interface VendorApplicationRequest {
  businessName: string;
  description: string;
  category: string;
  phone?: string;
  address?: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
  website?: string;
}

export interface UpdateVendorProfileRequest {
  businessName?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface VendorAnalytics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  topProducts: Array<{
    productId: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

// =============================================================================
// ORDER TYPES (v1/orders)
// =============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  vendorId: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address | null;
  trackingNumber: string | null;
  notes: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  product?: Product;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: PaginationMeta;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  shippingAddress: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
  billingAddress?: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
}

export interface OrderTrackingResponse {
  status: OrderStatus;
  trackingNumber?: string;
  updates: Array<{
    status: OrderStatus;
    timestamp: string;
    message: string;
  }>;
}

// =============================================================================
// CART TYPES (v1/cart)
// =============================================================================

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    stockQuantity: number;
    isActive: boolean;
    sku: string | null;
    vendor: VendorSummary | null;
  } | null;
  variant?: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
  } | null;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  currency: string;
  estimatedTax: number;
  estimatedTotal: number;
  hasInvalidItems: boolean;
  invalidItems: Array<{
    cartItemId: string;
    productName: string;
    reason: string;
    suggestedAction: 'remove' | 'reduce_quantity' | 'wait';
  }>;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface MergeCartRequest {
  items: Array<{
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  sessionId?: string;
}

export interface CartValidationResult {
  valid: boolean;
  items: Array<{
    cartItemId: string;
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    isAvailable: boolean;
    reason?: string;
  }>;
}

// =============================================================================
// CHECKOUT TYPES (v1/checkout)
// =============================================================================

export interface CheckoutSession {
  id: string;
  cartId: string;
  status: CheckoutStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  discountCode?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CheckoutStatus = 'pending' | 'shipping_set' | 'ready_for_payment' | 'completed' | 'expired';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier?: string;
}

export interface InitiateCheckoutRequest {
  cartId?: string;
}

export interface SetShippingRequest {
  addressId: string;
  shippingMethodId: string;
}

export interface SetBillingRequest {
  addressId: string;
}

export interface ApplyDiscountRequest {
  code: string;
}

export interface InitiatePaymentRequest {
  paymentMethodType: 'paystack' | 'card' | 'bank_transfer' | 'mobile_money';
}

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failed' | 'pending';
  reference: string;
  order?: Order;
  message: string;
}

// =============================================================================
// WISHLIST TYPES (v1/wishlist)
// =============================================================================

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

export interface AddToWishlistRequest {
  productId: string;
}

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface Address {
  id?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthResponse {
  status: 'ok';
  version?: string;
  timestamp: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export const ErrorCodes = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Cart errors
  CART_EMPTY: 'CART_EMPTY',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CART_ITEM_NOT_FOUND: 'CART_ITEM_NOT_FOUND',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
