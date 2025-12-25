'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts, getFeaturedProducts, getCategories } from '@/lib/supabase/products';
import { getMockProducts, mockCategories, mockProducts } from '@/lib/mock-data';
import type { Product, ProductFilters, Category } from '@/types/product';

interface UseProductsOptions {
  filters?: ProductFilters;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch products with Supabase fallback to mock data
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { filters, limit, offset, enabled = true } = options;

  return useQuery({
    queryKey: ['products', filters, limit, offset],
    queryFn: async () => {
      try {
        const { data, error } = await getProducts(filters, limit, offset);
        
        if (error || !data || data.length === 0) {
          // Fallback to mock data
          return getMockProducts({
            featured: filters?.isFeatured,
            categoryId: filters?.categoryId,
            search: filters?.search,
            limit,
          });
        }
        
        return data;
      } catch (e) {
        // Always fallback to mock data on any error
        return getMockProducts({
          featured: filters?.isFeatured,
          categoryId: filters?.categoryId,
          search: filters?.search,
          limit,
        });
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch featured products
 */
export function useFeaturedProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      try {
        const { data, error } = await getFeaturedProducts(limit);
        
        if (error || !data || data.length === 0) {
          return getMockProducts({ featured: true, limit });
        }
        
        return data;
      } catch (e) {
        return getMockProducts({ featured: true, limit });
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch categories
 */
export function useCategories(limit?: number) {
  return useQuery({
    queryKey: ['categories', limit],
    queryFn: async () => {
      const { data, error } = await getCategories(limit);
      
      if (error || !data || data.length === 0) {
        return limit ? mockCategories.slice(0, limit) : mockCategories;
      }
      
      return data as Category[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get all products (for infinite scroll)
 */
export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      try {
        const { data, error } = await getProducts(undefined, 100);
        
        if (error || !data || data.length === 0) {
          return mockProducts;
        }
        
        return data;
      } catch (e) {
        return mockProducts;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
