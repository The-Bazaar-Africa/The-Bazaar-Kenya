export interface Product {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  categoryId: string;
  images: ProductImage[];
  inventory: number;
  sku?: string;
  status: ProductStatus;
  tags?: string[];
  attributes?: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  position: number;
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  search?: string;
}

