/**
 * The Bazaar API v1 - Admin Finance Endpoint
 * ==========================================
 * 
 * Admin-specific API functions for financial management.
 * Includes revenue tracking, payouts, escrow, and reporting.
 * 
 * Maps to: apps/backend-api/src/routes/v1/admin/finance.ts
 */

import { get, post, patch } from '../../http/client';
import type {
  ApiSuccessResponse,
  PaginationMeta,
} from '../../generated';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Financial summary for dashboard
 */
export interface FinancialSummary {
  totalRevenue: number;
  revenueGrowth: number; // percentage
  totalCommissions: number;
  commissionGrowth: number;
  totalPayouts: number;
  pendingPayouts: number;
  escrowBalance: number;
  refundsTotal: number;
  averageOrderValue: number;
  transactionCount: number;
}

/**
 * Revenue data point for charts
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  commissions: number;
  payouts: number;
  refunds: number;
  netRevenue: number;
}

/**
 * Transaction record
 */
export interface Transaction {
  id: string;
  type: 'order' | 'payout' | 'refund' | 'commission' | 'adjustment' | 'escrow_release' | 'escrow_hold';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  referenceId?: string; // order ID, payout ID, etc.
  referenceType?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

/**
 * Payout record
 */
export interface Payout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'manual';
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  reference?: string;
  notes?: string;
  scheduledFor?: string;
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Escrow account
 */
export interface EscrowAccount {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  status: 'held' | 'released' | 'disputed' | 'refunded';
  heldAt: string;
  releaseCondition: 'delivery_confirmed' | 'time_elapsed' | 'manual_release';
  releaseDate?: string;
  releasedBy?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Financial report
 */
export interface FinancialReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  name: string;
  periodStart: string;
  periodEnd: string;
  status: 'generating' | 'ready' | 'failed';
  summary: {
    totalRevenue: number;
    totalCommissions: number;
    totalPayouts: number;
    totalRefunds: number;
    netProfit: number;
    transactionCount: number;
    orderCount: number;
    averageOrderValue: number;
  };
  downloadUrl?: string;
  generatedAt?: string;
  createdAt: string;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: Transaction['type'] | 'all';
  status?: Transaction['status'] | 'all';
  minAmount?: number;
  maxAmount?: number;
  from?: string;
  to?: string;
  vendorId?: string;
  search?: string;
  sortBy?: 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Payout filters
 */
export interface PayoutFilters {
  page?: number;
  limit?: number;
  status?: Payout['status'] | 'all';
  vendorId?: string;
  method?: Payout['method'] | 'all';
  from?: string;
  to?: string;
  search?: string;
  sortBy?: 'amount' | 'createdAt' | 'scheduledFor';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Escrow filters
 */
export interface EscrowFilters {
  page?: number;
  limit?: number;
  status?: EscrowAccount['status'] | 'all';
  vendorId?: string;
  buyerId?: string;
  from?: string;
  to?: string;
  search?: string;
}

/**
 * Create payout request
 */
export interface CreatePayoutRequest {
  vendorId: string;
  amount: number;
  method: Payout['method'];
  scheduledFor?: string;
  notes?: string;
}

/**
 * Process payout request
 */
export interface ProcessPayoutRequest {
  reference?: string;
  notes?: string;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get financial summary for dashboard
 */
export function adminGetFinancialSummary(period?: 'today' | 'week' | 'month' | 'quarter' | 'year') {
  const params = new URLSearchParams();
  if (period) params.set('period', period);
  const query = params.toString();
  return get<ApiSuccessResponse<FinancialSummary>>(
    `/v1/admin/finance/summary${query ? `?${query}` : ''}`
  );
}

/**
 * Get revenue data for charts
 */
export function adminGetRevenueData(options?: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  from?: string;
  to?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}) {
  const params = new URLSearchParams();
  if (options) {
    if (options.period) params.set('period', options.period);
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.granularity) params.set('granularity', options.granularity);
  }
  const query = params.toString();
  return get<ApiSuccessResponse<RevenueDataPoint[]>>(
    `/v1/admin/finance/revenue${query ? `?${query}` : ''}`
  );
}

/**
 * Get transactions with filtering
 */
export function adminGetTransactions(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.minAmount) params.set('minAmount', filters.minAmount.toString());
    if (filters.maxAmount) params.set('maxAmount', filters.maxAmount.toString());
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.vendorId) params.set('vendorId', filters.vendorId);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  }
  const query = params.toString();
  return get<ApiSuccessResponse<{ transactions: Transaction[]; pagination: PaginationMeta }>>(
    `/v1/admin/finance/transactions${query ? `?${query}` : ''}`
  );
}

/**
 * Get single transaction details
 */
export function adminGetTransaction(id: string) {
  return get<ApiSuccessResponse<Transaction>>(`/v1/admin/finance/transactions/${id}`);
}

/**
 * Get payouts with filtering
 */
export function adminGetPayouts(filters?: PayoutFilters) {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.vendorId) params.set('vendorId', filters.vendorId);
    if (filters.method && filters.method !== 'all') params.set('method', filters.method);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  }
  const query = params.toString();
  return get<ApiSuccessResponse<{ payouts: Payout[]; pagination: PaginationMeta; summary: { pending: number; processing: number; completed: number; total: number } }>>(
    `/v1/admin/finance/payouts${query ? `?${query}` : ''}`
  );
}

/**
 * Get single payout details
 */
export function adminGetPayout(id: string) {
  return get<ApiSuccessResponse<Payout>>(`/v1/admin/finance/payouts/${id}`);
}

/**
 * Create a new payout
 */
export function adminCreatePayout(request: CreatePayoutRequest) {
  return post<ApiSuccessResponse<Payout>>('/v1/admin/finance/payouts', request);
}

/**
 * Process a pending payout
 */
export function adminProcessPayout(id: string, request?: ProcessPayoutRequest) {
  return post<ApiSuccessResponse<Payout>>(`/v1/admin/finance/payouts/${id}/process`, request || {});
}

/**
 * Cancel a pending payout
 */
export function adminCancelPayout(id: string, reason?: string) {
  return post<ApiSuccessResponse<Payout>>(`/v1/admin/finance/payouts/${id}/cancel`, { reason });
}

/**
 * Retry a failed payout
 */
export function adminRetryPayout(id: string) {
  return post<ApiSuccessResponse<Payout>>(`/v1/admin/finance/payouts/${id}/retry`, {});
}

/**
 * Get escrow accounts with filtering
 */
export function adminGetEscrowAccounts(filters?: EscrowFilters) {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.vendorId) params.set('vendorId', filters.vendorId);
    if (filters.buyerId) params.set('buyerId', filters.buyerId);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.search) params.set('search', filters.search);
  }
  const query = params.toString();
  return get<ApiSuccessResponse<{ escrowAccounts: EscrowAccount[]; pagination: PaginationMeta; summary: { held: number; totalHeld: number } }>>(
    `/v1/admin/finance/escrow${query ? `?${query}` : ''}`
  );
}

/**
 * Get single escrow account details
 */
export function adminGetEscrowAccount(id: string) {
  return get<ApiSuccessResponse<EscrowAccount>>(`/v1/admin/finance/escrow/${id}`);
}

/**
 * Release escrow funds
 */
export function adminReleaseEscrow(id: string, notes?: string) {
  return post<ApiSuccessResponse<EscrowAccount>>(`/v1/admin/finance/escrow/${id}/release`, { notes });
}

/**
 * Refund escrow to buyer
 */
export function adminRefundEscrow(id: string, reason: string) {
  return post<ApiSuccessResponse<EscrowAccount>>(`/v1/admin/finance/escrow/${id}/refund`, { reason });
}

/**
 * Get financial reports
 */
export function adminGetFinancialReports(options?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (options) {
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
  }
  const query = params.toString();
  return get<ApiSuccessResponse<{ reports: FinancialReport[]; pagination: PaginationMeta }>>(
    `/v1/admin/finance/reports${query ? `?${query}` : ''}`
  );
}

/**
 * Generate a new financial report
 */
export function adminGenerateReport(request: {
  type: FinancialReport['type'];
  periodStart?: string;
  periodEnd?: string;
  name?: string;
}) {
  return post<ApiSuccessResponse<FinancialReport>>('/v1/admin/finance/reports', request);
}

/**
 * Download a financial report
 */
export function adminDownloadReport(id: string, format: 'csv' | 'xlsx' | 'pdf' = 'pdf') {
  return get<Blob>(`/v1/admin/finance/reports/${id}/download?format=${format}`);
}

/**
 * Get commission settings
 */
export function adminGetCommissionSettings() {
  return get<ApiSuccessResponse<{
    defaultRate: number;
    categoryRates: Array<{ categoryId: string; categoryName: string; rate: number }>;
    vendorOverrides: Array<{ vendorId: string; vendorName: string; rate: number }>;
  }>>('/v1/admin/finance/commission-settings');
}

/**
 * Update commission settings
 */
export function adminUpdateCommissionSettings(settings: {
  defaultRate?: number;
  categoryRates?: Array<{ categoryId: string; rate: number }>;
}) {
  return patch<ApiSuccessResponse<void>>('/v1/admin/finance/commission-settings', settings);
}
