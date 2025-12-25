/**
 * Paystack API Client
 * ====================
 * Centralized HTTP client for all Paystack API interactions.
 *
 * This client is pre-configured with:
 * - Authorization header using the secret key
 * - Content-Type header
 * - Base URL for Paystack API
 *
 * SECURITY NOTES:
 * - This client must ONLY be used within the backend-api.
 * - Never expose this client or its configuration to frontend applications.
 *
 * @see ADR-002: Payment Provider Selection
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { paystackConfig } from '../../config/paystack.config.js';

/**
 * Pre-configured Axios instance for Paystack API calls.
 */
export const paystackClient: AxiosInstance = axios.create({
  baseURL: paystackConfig.baseUrl,
  headers: {
    Authorization: `Bearer ${paystackConfig.secretKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Paystack API Response Types
 */
export interface PaystackResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackTransactionInitData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackTransactionVerifyData {
  id: number;
  domain: string;
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
  };
  metadata: Record<string, unknown>;
}

export interface PaystackWebhookEvent {
  event: string;
  data: PaystackTransactionVerifyData;
}

/**
 * Type guard for Paystack API errors
 */
export function isPaystackError(error: unknown): error is AxiosError<PaystackResponse> {
  return axios.isAxiosError(error);
}

/**
 * Helper to extract error message from Paystack API errors
 */
export function getPaystackErrorMessage(error: unknown): string {
  if (isPaystackError(error)) {
    return error.response?.data?.message || error.message || 'Unknown Paystack error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}
