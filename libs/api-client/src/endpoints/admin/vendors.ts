/**
 * The Bazaar API v1 - Admin Vendors Endpoint
 * ==========================================
 * 
 * Admin-specific API functions for vendor management.
 * Enhanced with verification, payouts, and performance tracking.
 * 
 * Maps to: apps/backend-api/src/routes/v1/admin/vendors.ts
 */

import { get, post, patch, del } from '../../http/client';
import type {
  ApiSuccessResponse,
  PaginationMeta,
  VendorStatus as BaseVendorStatus,
} from '../../generated';

// =============================================================================
// ADMIN-SPECIFIC TYPES
// =============================================================================

/**
 * Extended vendor account status (includes base + admin-only statuses)
 */
export type VendorStatus = BaseVendorStatus | 'rejected' | 'deactivated';

/**
 * Vendor verification status
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/**
 * Extended admin filters for vendors
 */
export interface AdminVendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: VendorStatus | 'all';
  verification?: VerificationStatus | 'all';
  sortBy?: 'name' | 'createdAt' | 'revenue' | 'productCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
  minRevenue?: number;
  maxRevenue?: number;
}

/**
 * Admin vendor list response with additional metadata
 */
export interface AdminVendorListResponse {
  vendors: AdminVendor[];
  pagination: PaginationMeta;
  summary: VendorListSummary;
}

/**
 * Extended vendor type with admin-only fields
 */
export interface AdminVendor {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: VendorStatus;
  verificationStatus: VerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  productCount: number;
  activeProductCount: number;
  orderCount: number;
  totalRevenue: number;
  pendingPayout: number;
  totalPayout: number;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  documents: VendorDocument[];
  flags: VendorFlag[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Vendor document for verification
 */
export interface VendorDocument {
  id: string;
  type: 'business_license' | 'tax_id' | 'id_document' | 'bank_statement' | 'utility_bill' | 'other';
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Vendor flags for marking special conditions
 */
export interface VendorFlag {
  type: 'fraud_risk' | 'top_seller' | 'new_vendor' | 'high_returns' | 'low_rating' | 'custom';
  label: string;
  severity: 'info' | 'warning' | 'critical';
  addedAt: string;
  addedBy: string;
  note?: string;
}

/**
 * Summary statistics for admin vendor listing
 */
export interface VendorListSummary {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  pendingVerification: number;
  newVendorsThisMonth: number;
  totalRevenue: number;
  pendingPayouts: number;
}

/**
 * Vendor performance metrics
 */
export interface VendorPerformance {
  vendorId: string;
  period: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  productsSold: number;
  returnRate: number;
  rating: number;
  reviewCount: number;
  responseTime: number; // hours
  fulfillmentRate: number;
}

/**
 * Vendor payout record
 */
export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  reference?: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

/**
 * Vendor update request
 */
export interface AdminUpdateVendorRequest {
  name?: string;
  description?: string;
  status?: VendorStatus;
  verificationStatus?: VerificationStatus;
  commissionRate?: number;
  subscriptionPlan?: string;
}

/**
 * Verification decision request
 */
export interface VendorVerificationRequest {
  decision: 'approve' | 'reject';
  reason?: string;
  documentDecisions?: {
    documentId: string;
    status: 'approved' | 'rejected';
    reason?: string;
  }[];
}

/**
 * Bulk action request
 */
export interface BulkVendorActionRequest {
  vendorIds: string[];
  action: 'suspend' | 'activate' | 'verify' | 'reject' | 'payout';
  reason?: string;
}

/**
 * Bulk action response
 */
export interface BulkVendorActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    vendorId: string;
    error: string;
  }>;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get paginated list of vendors with admin filtering
 */
export function adminGetVendors(filters?: AdminVendorFilters) {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.verification && filters.verification !== 'all') params.set('verification', filters.verification);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.createdAfter) params.set('createdAfter', filters.createdAfter);
    if (filters.createdBefore) params.set('createdBefore', filters.createdBefore);
    if (filters.minRevenue) params.set('minRevenue', filters.minRevenue.toString());
    if (filters.maxRevenue) params.set('maxRevenue', filters.maxRevenue.toString());
  }

  const query = params.toString();
  return get<ApiSuccessResponse<AdminVendorListResponse>>(
    `/v1/admin/vendors${query ? `?${query}` : ''}`
  );
}

/**
 * Get single vendor details
 */
export function adminGetVendor(id: string) {
  return get<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}`);
}

/**
 * Update vendor details
 */
export function adminUpdateVendor(id: string, data: AdminUpdateVendorRequest) {
  return patch<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}`, data);
}

/**
 * Activate a vendor
 */
export function adminActivateVendor(id: string) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/activate`, {});
}

/**
 * Suspend a vendor
 */
export function adminSuspendVendor(id: string, reason: string) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/suspend`, {
    reason,
  });
}

/**
 * Unsuspend a vendor
 */
export function adminUnsuspendVendor(id: string) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/unsuspend`, {});
}

/**
 * Deactivate a vendor (soft delete)
 */
export function adminDeactivateVendor(id: string, reason?: string) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/deactivate`, {
    reason,
  });
}

/**
 * Process vendor verification
 */
export function adminVerifyVendor(id: string, request: VendorVerificationRequest) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/verify`, request);
}

/**
 * Get vendor documents
 */
export function adminGetVendorDocuments(id: string) {
  return get<ApiSuccessResponse<VendorDocument[]>>(`/v1/admin/vendors/${id}/documents`);
}

/**
 * Review vendor document
 */
export function adminReviewDocument(
  vendorId: string,
  documentId: string,
  decision: 'approved' | 'rejected',
  reason?: string
) {
  return post<ApiSuccessResponse<VendorDocument>>(
    `/v1/admin/vendors/${vendorId}/documents/${documentId}/review`,
    { decision, reason }
  );
}

/**
 * Get vendor performance metrics
 */
export function adminGetVendorPerformance(
  id: string,
  options?: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    from?: string;
    to?: string;
  }
) {
  const params = new URLSearchParams();

  if (options) {
    if (options.period) params.set('period', options.period);
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
  }

  const query = params.toString();
  return get<ApiSuccessResponse<VendorPerformance[]>>(
    `/v1/admin/vendors/${id}/performance${query ? `?${query}` : ''}`
  );
}

/**
 * Get vendor payout history
 */
export function adminGetVendorPayouts(
  id: string,
  options?: {
    page?: number;
    limit?: number;
    status?: VendorPayout['status'];
  }
) {
  const params = new URLSearchParams();

  if (options) {
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.status) params.set('status', options.status);
  }

  const query = params.toString();
  return get<ApiSuccessResponse<{ payouts: VendorPayout[]; pagination: PaginationMeta }>>(
    `/v1/admin/vendors/${id}/payouts${query ? `?${query}` : ''}`
  );
}

/**
 * Create manual payout for vendor
 */
export function adminCreateVendorPayout(id: string, amount: number, method: VendorPayout['method']) {
  return post<ApiSuccessResponse<VendorPayout>>(`/v1/admin/vendors/${id}/payouts`, {
    amount,
    method,
  });
}

/**
 * Update vendor commission rate
 */
export function adminUpdateCommissionRate(id: string, rate: number) {
  return patch<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/commission`, {
    rate,
  });
}

/**
 * Add flag to vendor
 */
export function adminAddVendorFlag(id: string, flag: Omit<VendorFlag, 'addedAt' | 'addedBy'>) {
  return post<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/flags`, flag);
}

/**
 * Remove flag from vendor
 */
export function adminRemoveVendorFlag(id: string, flagType: VendorFlag['type']) {
  return del<ApiSuccessResponse<AdminVendor>>(`/v1/admin/vendors/${id}/flags/${flagType}`);
}

/**
 * Bulk action on multiple vendors
 */
export function adminBulkVendorAction(request: BulkVendorActionRequest) {
  return post<ApiSuccessResponse<BulkVendorActionResponse>>('/v1/admin/vendors/bulk-action', request);
}

/**
 * Export vendors to CSV/Excel
 */
export function adminExportVendors(filters?: AdminVendorFilters, format: 'csv' | 'xlsx' = 'csv') {
  const params = new URLSearchParams();
  params.set('format', format);

  if (filters) {
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.verification && filters.verification !== 'all') params.set('verification', filters.verification);
    if (filters.createdAfter) params.set('createdAfter', filters.createdAfter);
    if (filters.createdBefore) params.set('createdBefore', filters.createdBefore);
  }

  return get<Blob>(`/v1/admin/vendors/export?${params.toString()}`);
}

/**
 * Get vendor statistics summary
 */
export function adminGetVendorStats() {
  return get<ApiSuccessResponse<VendorListSummary>>('/v1/admin/vendors/stats');
}

/**
 * Send notification to vendor
 */
export function adminNotifyVendor(id: string, message: string, type: 'email' | 'in_app' | 'both' = 'both') {
  return post<ApiSuccessResponse<{ sent: boolean }>>(`/v1/admin/vendors/${id}/notify`, {
    message,
    type,
  });
}
