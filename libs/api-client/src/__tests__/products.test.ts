/**
 * Products Endpoint Unit Tests
 * 
 * Tests the products API functions to ensure correct request construction.
 * Mocks the HTTP client to verify request shapes.
 */

import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getFeaturedProducts,
} from '../endpoints/products';

// Mock the HTTP client
jest.mock('../http/client', () => ({
  http: jest.fn(),
}));

import { http } from '../http/client';

const mockHttp = http as jest.MockedFunction<typeof http>;

describe('Products Endpoints', () => {
  beforeEach(() => {
    mockHttp.mockReset();
  });

  // ==========================================================================
  // getProducts()
  // ==========================================================================
  describe('getProducts()', () => {
    it('should call /v1/products without params', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getProducts();

      expect(mockHttp).toHaveBeenCalledWith('/v1/products');
    });

    it('should include category filter in query params', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getProducts({ category: 'cat-123' });

      expect(mockHttp).toHaveBeenCalledWith(
        expect.stringMatching(/\/v1\/products\?.*category=cat-123/)
      );
    });

    it('should include price range filters', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getProducts({ minPrice: 100, maxPrice: 5000 });

      const calledUrl = mockHttp.mock.calls[0][0];
      expect(calledUrl).toContain('minPrice=100');
      expect(calledUrl).toContain('maxPrice=5000');
    });

    it('should include search filter', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getProducts({ search: 'test query' });

      expect(mockHttp).toHaveBeenCalledWith(
        expect.stringContaining('search=test')
      );
    });

    it('should exclude undefined filter values', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getProducts({ category: undefined, minPrice: 100 });

      const calledUrl = mockHttp.mock.calls[0][0];
      expect(calledUrl).not.toContain('category=');
      expect(calledUrl).toContain('minPrice=100');
    });
  });

  // ==========================================================================
  // getProductById()
  // ==========================================================================
  describe('getProductById()', () => {
    it('should call /v1/products/:id with correct ID', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: {} });

      await getProductById('prod-123');

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/prod-123');
    });
  });

  // ==========================================================================
  // getProductBySlug()
  // ==========================================================================
  describe('getProductBySlug()', () => {
    it('should call /v1/products/slug/:slug', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: {} });

      await getProductBySlug('awesome-product');

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/slug/awesome-product');
    });
  });

  // ==========================================================================
  // createProduct()
  // ==========================================================================
  describe('createProduct()', () => {
    it('should POST to /v1/products with product data', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: { id: 'new-123' } });

      const productData = {
        name: 'New Product',
        description: 'A great product',
        price: 2999,
        categoryId: 'cat-1',
        vendorId: 'vendor-1',
        slug: 'new-product',
        currency: 'KES',
        images: [],
        inventory: 100,
        status: 'active' as const,
      };

      await createProduct(productData);

      expect(mockHttp).toHaveBeenCalledWith('/v1/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    });
  });

  // ==========================================================================
  // updateProduct()
  // ==========================================================================
  describe('updateProduct()', () => {
    it('should PATCH to /v1/products/:id with update data', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: {} });

      const updates = { name: 'Updated Name', price: 3999 };

      await updateProduct('prod-123', updates);

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/prod-123', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    });
  });

  // ==========================================================================
  // deleteProduct()
  // ==========================================================================
  describe('deleteProduct()', () => {
    it('should DELETE to /v1/products/:id', async () => {
      mockHttp.mockResolvedValueOnce({ success: true });

      await deleteProduct('prod-123');

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/prod-123', {
        method: 'DELETE',
      });
    });
  });

  // ==========================================================================
  // searchProducts()
  // ==========================================================================
  describe('searchProducts()', () => {
    it('should encode search query properly', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await searchProducts('test & query');

      expect(mockHttp).toHaveBeenCalledWith(
        expect.stringContaining('/v1/products/search?q=test%20%26%20query')
      );
    });
  });

  // ==========================================================================
  // getFeaturedProducts()
  // ==========================================================================
  describe('getFeaturedProducts()', () => {
    it('should call /v1/products/featured without limit', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getFeaturedProducts();

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/featured');
    });

    it('should include limit when provided', async () => {
      mockHttp.mockResolvedValueOnce({ success: true, data: [] });

      await getFeaturedProducts(5);

      expect(mockHttp).toHaveBeenCalledWith('/v1/products/featured?limit=5');
    });
  });
});
