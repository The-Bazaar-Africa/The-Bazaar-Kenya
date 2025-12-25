export type VendorStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  category: string;
  status: VendorStatus;
  rating: number;
  reviewCount: number;
  productCount: number;
  contact: VendorContact;
  settings?: VendorSettings;
  createdAt: string;
  updatedAt: string;
}

export interface VendorContact {
  email: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface VendorSettings {
  commissionRate: number;
  payoutFrequency: 'weekly' | 'biweekly' | 'monthly';
  autoAcceptOrders: boolean;
  notifyOnOrder: boolean;
  notifyOnReview: boolean;
}

export interface VendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    revenue: number;
    quantity: number;
  }[];
}

