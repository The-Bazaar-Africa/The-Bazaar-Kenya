export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  stock_quantity: number;
  attributes?: Record<string, any> | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  images?: string[] | null;
  image_url?: string | null;
  price: number;
  compare_at_price?: number | null;
  currency: string;
  sku?: string | null;
  barcode?: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number | null;
  dimensions?: Record<string, any> | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: ProductVariant[];
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface Category {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  vendor_id?: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency: 'KES' | 'USD';
  images: string[];
  vendorName: string;
  vendorSlug: string;
  rating: number;
  reviewCount: number;
  isInStock: boolean;
  discount?: number;
}
