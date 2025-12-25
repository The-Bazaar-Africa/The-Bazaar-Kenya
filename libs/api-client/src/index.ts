/**
 * The Bazaar API Client
 * =====================
 * 
 * Type-safe API client for The Bazaar REST API v1.
 * 
 * Usage:
 * ```ts
 * import { getProducts, login, configureHttpClient } from '@tbk/api-client';
 * 
 * // Configure auth token provider
 * configureHttpClient({
 *   getAccessToken: () => localStorage.getItem('accessToken'),
 *   onUnauthorized: () => { window.location.href = '/login'; },
 * });
 * 
 * // Use API functions
 * const { data } = await getProducts({ limit: 10 });
 * ```
 */

// =============================================================================
// HTTP CLIENT & CONFIGURATION
// =============================================================================
export { 
  http, 
  get, 
  post, 
  patch, 
  put, 
  del,
  configureHttpClient,
  getHttpClientConfig,
} from './http/client';
export type { HttpClientConfig, RequestOptions } from './http/client';
export { ApiError } from './http/errors';

// =============================================================================
// GENERATED TYPES
// =============================================================================
export * from './generated';

// =============================================================================
// V1 ENDPOINT FUNCTIONS
// =============================================================================

// Auth
export {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  verifySession,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
} from './endpoints/auth';

// Products
export {
  getProducts,
  getProductById,
  getProductBySlug,
  searchProducts,
  getFeaturedProducts,
  getProductsByVendor,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoryBySlug,
} from './endpoints/products';

// Categories
export {
  listCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryProducts,
  getSubcategories,
} from './endpoints/categories';

// Orders
export {
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  getVendorOrders,
  trackOrder,
} from './endpoints/orders';

// Cart
export {
  getCart,
  getCartSummary,
  validateCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
} from './endpoints/cart';

// Checkout
export {
  initiateCheckout,
  getCheckoutSession,
  setShippingAddress,
  setBillingAddress,
  getShippingMethods,
  applyDiscount,
  removeDiscount,
  initiatePayment,
  verifyPayment,
  completeCheckout,
} from './endpoints/checkout';

// Vendors
export {
  listVendors,
  getVendorById,
  getVendorBySlug,
  getVendorProducts,
  applyToBeVendor,
  updateVendorProfile,
  getVendorAnalytics,
} from './endpoints/vendors';

// Wishlist
export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  clearWishlist,
  moveToCart,
} from './endpoints/wishlist';

// Users
export {
  getProfile,
  updateProfile,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
} from './endpoints/users';

// Health
export {
  checkHealth,
  checkV1Health,
} from './endpoints/health';

// =============================================================================
// ADMIN ENDPOINTS (Authenticated, Admin Role Required)
// =============================================================================
export {
  // Users
  adminGetUsers,
  adminGetUser,
  adminUpdateUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
  adminVerifyEmail,
  adminSendPasswordReset,
  adminGetUserActivity,
  adminGetUserOrders,
  adminAddUserFlag,
  adminRemoveUserFlag,
  adminBulkUserAction,
  adminExportUsers,
  adminGetUserStats,
  adminImpersonateUser,
  // Vendors
  adminGetVendors,
  adminGetVendor,
  adminUpdateVendor,
  adminActivateVendor,
  adminSuspendVendor,
  adminUnsuspendVendor,
  adminDeactivateVendor,
  adminVerifyVendor,
  adminGetVendorDocuments,
  adminReviewDocument,
  adminGetVendorPerformance,
  adminGetVendorPayouts,
  adminCreateVendorPayout,
  adminUpdateCommissionRate,
  adminAddVendorFlag,
  adminRemoveVendorFlag,
  adminBulkVendorAction,
  adminExportVendors,
  adminGetVendorStats,
  adminNotifyVendor,
  // Finance
  adminGetFinancialSummary,
  adminGetRevenueData,
  adminGetTransactions,
  adminGetTransaction,
  adminGetPayouts,
  adminGetPayout,
  adminCreatePayout,
  adminProcessPayout,
  adminCancelPayout,
  adminRetryPayout,
  adminGetEscrowAccounts,
  adminGetEscrowAccount,
  adminReleaseEscrow,
  adminRefundEscrow,
  adminGetFinancialReports,
  adminGenerateReport,
  adminDownloadReport,
  adminGetCommissionSettings,
  adminUpdateCommissionSettings,
  // Orders
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminRefundOrder,
  adminCancelOrder,
  adminAddOrderNote,
  adminAddShippingInfo,
  adminBulkOrderAction,
  adminExportOrders,
  // Products
  adminGetProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleProductFeatured,
  adminToggleProductActive,
  adminBulkProductAction,
  adminExportProducts,
  adminGetProductAnalytics,
} from './endpoints/admin';

// Admin Types (use AdminVendorStatus to avoid conflict with generated VendorStatus)
export type {
  // User types
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
  UserSummary,
  UserFlag,
  UserActivity,
  AdminUpdateUserRequest,
  BulkUserActionRequest,
  UserStatus,
  // Vendor types (rename VendorStatus to avoid conflict)
  VendorStatus as AdminVendorStatus,
  VerificationStatus,
  AdminVendorFilters,
  AdminVendorListResponse,
  AdminVendor,
  VendorDocument,
  VendorFlag,
  VendorListSummary,
  VendorPerformance,
  VendorPayout,
  AdminUpdateVendorRequest,
  VendorVerificationRequest,
  BulkVendorActionRequest,
  BulkVendorActionResponse,
  // Finance types
  FinancialSummary,
  RevenueDataPoint,
  Transaction,
  TransactionFilters,
  Payout,
  PayoutFilters,
  EscrowAccount,
  EscrowFilters,
  FinancialReport,
  CreatePayoutRequest,
  ProcessPayoutRequest,
  // Order types
  AdminOrder,
  AdminOrderFilters,
  OrderSummary,
  OrderTimelineEvent,
  // Product types
  AdminProduct,
  AdminProductFilters,
  ProductSummary,
  ProductAnalytics,
} from './endpoints/admin';
