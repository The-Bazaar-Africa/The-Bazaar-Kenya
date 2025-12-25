import type { Product, Category, Vendor, ProductCardData } from '@/types/product';

// Mock categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', image_url: '/categories/electronics.jpg', is_active: true, display_order: 1, created_at: '', updated_at: '' },
  { id: '2', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', image_url: '/categories/fashion.jpg', is_active: true, display_order: 2, created_at: '', updated_at: '' },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and garden supplies', image_url: '/categories/home.jpg', is_active: true, display_order: 3, created_at: '', updated_at: '' },
  { id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment and apparel', image_url: '/categories/sports.jpg', is_active: true, display_order: 4, created_at: '', updated_at: '' },
  { id: '5', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care', image_url: '/categories/beauty.jpg', is_active: true, display_order: 5, created_at: '', updated_at: '' },
  { id: '6', name: 'Books', slug: 'books', description: 'Books and stationery', image_url: '/categories/books.jpg', is_active: true, display_order: 6, created_at: '', updated_at: '' },
];

// Mock vendors
export const mockVendors = [
  { id: 'v1', name: 'TechHub Kenya', slug: 'techhub-kenya', description: 'Your trusted electronics partner. We offer the latest gadgets and electronics with warranty and excellent customer service.', logo_url: null, banner_url: null, rating: 4.8, review_count: 256, is_verified: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'v2', name: 'Fashion Forward', slug: 'fashion-forward', description: 'Trendy fashion for everyone. Quality clothing, shoes, and accessories at affordable prices.', logo_url: null, banner_url: null, rating: 4.6, review_count: 189, is_verified: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'v3', name: 'Home Essentials', slug: 'home-essentials', description: 'Everything for your home. Furniture, decor, and garden supplies to make your house a home.', logo_url: null, banner_url: null, rating: 4.5, review_count: 142, is_verified: false, is_active: true, created_at: '', updated_at: '' },
  { id: 'v4', name: 'Sports Zone', slug: 'sports-zone', description: 'Premium sports equipment and fitness gear for athletes and enthusiasts.', logo_url: null, banner_url: null, rating: 4.7, review_count: 98, is_verified: true, is_active: true, created_at: '', updated_at: '' },
  { id: 'v5', name: 'Beauty Palace', slug: 'beauty-palace', description: 'Authentic beauty products from top brands. Skincare, makeup, and fragrances.', logo_url: null, banner_url: null, rating: 4.9, review_count: 312, is_verified: true, is_active: true, created_at: '', updated_at: '' },
];

// Mock products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    vendor_id: 'v1',
    category_id: '1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    short_description: 'Premium wireless headphones',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    price: 4999,
    compare_at_price: 6999,
    currency: 'KES',
    stock_quantity: 50,
    low_stock_threshold: 10,
    is_active: true,
    is_featured: true,
    rating: 4.7,
    review_count: 89,
    view_count: 1250,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v1', name: 'TechHub Kenya', slug: 'techhub-kenya' },
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
  },
  {
    id: 'p2',
    vendor_id: 'v1',
    category_id: '1',
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Feature-rich smartwatch with health monitoring',
    short_description: 'Advanced smartwatch',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    price: 12999,
    compare_at_price: 15999,
    currency: 'KES',
    stock_quantity: 30,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    review_count: 156,
    view_count: 2340,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v1', name: 'TechHub Kenya', slug: 'techhub-kenya' },
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
  },
  {
    id: 'p3',
    vendor_id: 'v2',
    category_id: '2',
    name: 'Classic Leather Jacket',
    slug: 'classic-leather-jacket',
    description: 'Premium genuine leather jacket for all seasons',
    short_description: 'Genuine leather jacket',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
    price: 8999,
    compare_at_price: 12999,
    currency: 'KES',
    stock_quantity: 25,
    low_stock_threshold: 5,
    is_active: true,
    is_featured: true,
    rating: 4.6,
    review_count: 78,
    view_count: 890,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v2', name: 'Fashion Forward', slug: 'fashion-forward' },
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
  },
  {
    id: 'p4',
    vendor_id: 'v2',
    category_id: '2',
    name: 'Designer Sunglasses',
    slug: 'designer-sunglasses',
    description: 'UV protection sunglasses with stylish design',
    short_description: 'Stylish UV sunglasses',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
    price: 2499,
    compare_at_price: 3499,
    currency: 'KES',
    stock_quantity: 100,
    low_stock_threshold: 20,
    is_active: true,
    is_featured: true,
    rating: 4.4,
    review_count: 45,
    view_count: 567,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v2', name: 'Fashion Forward', slug: 'fashion-forward' },
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
  },
  {
    id: 'p5',
    vendor_id: 'v3',
    category_id: '3',
    name: 'Modern Table Lamp',
    slug: 'modern-table-lamp',
    description: 'Elegant table lamp with adjustable brightness',
    short_description: 'Adjustable table lamp',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
    price: 3499,
    compare_at_price: 4999,
    currency: 'KES',
    stock_quantity: 40,
    low_stock_threshold: 10,
    is_active: true,
    is_featured: true,
    rating: 4.5,
    review_count: 34,
    view_count: 423,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v3', name: 'Home Essentials', slug: 'home-essentials' },
    category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
  },
  {
    id: 'p6',
    vendor_id: 'v1',
    category_id: '1',
    name: 'Portable Bluetooth Speaker',
    slug: 'portable-bluetooth-speaker',
    description: 'Waterproof portable speaker with 20-hour battery',
    short_description: 'Waterproof portable speaker',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
    price: 3999,
    compare_at_price: 5499,
    currency: 'KES',
    stock_quantity: 60,
    low_stock_threshold: 15,
    is_active: true,
    is_featured: true,
    rating: 4.8,
    review_count: 112,
    view_count: 1567,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v1', name: 'TechHub Kenya', slug: 'techhub-kenya' },
    category: { id: '1', name: 'Electronics', slug: 'electronics' },
  },
  {
    id: 'p7',
    vendor_id: 'v2',
    category_id: '2',
    name: 'Canvas Sneakers',
    slug: 'canvas-sneakers',
    description: 'Comfortable canvas sneakers for everyday wear',
    short_description: 'Comfortable canvas sneakers',
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400'],
    price: 2999,
    compare_at_price: 3999,
    currency: 'KES',
    stock_quantity: 80,
    low_stock_threshold: 20,
    is_active: true,
    is_featured: false,
    rating: 4.3,
    review_count: 67,
    view_count: 789,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v2', name: 'Fashion Forward', slug: 'fashion-forward' },
    category: { id: '2', name: 'Fashion', slug: 'fashion' },
  },
  {
    id: 'p8',
    vendor_id: 'v3',
    category_id: '3',
    name: 'Ceramic Plant Pot Set',
    slug: 'ceramic-plant-pot-set',
    description: 'Set of 3 decorative ceramic plant pots',
    short_description: 'Decorative plant pot set',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'],
    price: 1999,
    compare_at_price: 2999,
    currency: 'KES',
    stock_quantity: 45,
    low_stock_threshold: 10,
    is_active: true,
    is_featured: false,
    rating: 4.6,
    review_count: 28,
    view_count: 345,
    created_at: '',
    updated_at: '',
    vendor: { id: 'v3', name: 'Home Essentials', slug: 'home-essentials' },
    category: { id: '3', name: 'Home & Garden', slug: 'home-garden' },
  },
];

// Helper function to convert Product to ProductCardData
export function mapProductToCard(product: Product): ProductCardData {
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : undefined;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compare_at_price || undefined,
    currency: (product.currency as 'KES' | 'USD') || 'KES',
    images: product.images || [],
    vendorName: product.vendor?.name || 'Unknown Vendor',
    vendorSlug: product.vendor?.slug || 'unknown',
    rating: product.rating || 0,
    reviewCount: product.review_count || 0,
    isInStock: product.stock_quantity > 0,
    discount,
  };
}

// Get mock products with optional filters
export function getMockProducts(options?: {
  featured?: boolean;
  limit?: number;
  categoryId?: string;
  search?: string;
}): Product[] {
  let products = [...mockProducts];

  if (options?.featured) {
    products = products.filter(p => p.is_featured);
  }

  if (options?.categoryId) {
    products = products.filter(p => p.category_id === options.categoryId);
  }

  if (options?.search) {
    const query = options.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }

  if (options?.limit) {
    products = products.slice(0, options.limit);
  }

  return products;
}
