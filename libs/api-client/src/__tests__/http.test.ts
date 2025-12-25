/**
 * HTTP Client Unit Tests
 * 
 * Tests the core HTTP wrapper function with mocked fetch.
 * If this is wrong → every frontend is wrong.
 */

import { http } from '../http/client';
import { ApiError } from '../http/errors';

// Type the mocked fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('http() - Core HTTP Client', () => {
  // ==========================================================================
  // Request Construction
  // ==========================================================================
  describe('Request Construction', () => {
    it('should construct correct URL with base path', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      } as Response);

      await http('/v1/products');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products',
        expect.any(Object)
      );
    });

    it('should include Content-Type: application/json by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await http('/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include credentials: include for cookies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await http('/v1/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should allow custom headers to be passed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await http('/v1/test', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should support POST method with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: '1' } }),
      } as Response);

      const payload = { name: 'Test Product', price: 1000 };

      await http('/v1/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/products',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should support PATCH method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await http('/v1/products/123', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/products/123'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should support DELETE method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await http('/v1/products/123', {
        method: 'DELETE',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/products/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // Response Handling
  // ==========================================================================
  describe('Response Handling', () => {
    it('should parse and return JSON response on success', async () => {
      const mockData = { success: true, data: { id: '1', name: 'Product' } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      const result = await http<typeof mockData>('/v1/products/1');

      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Product not found' }),
      } as Response);

      await expect(http('/v1/products/non-existent')).rejects.toThrow(ApiError);
    });

    it('should include status code in ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      } as Response);

      try {
        await http('/v1/protected');
        fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(401);
      }
    });

    it('should include message from response body in ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Validation failed' }),
      } as Response);

      try {
        await http('/v1/products');
        fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Validation failed');
      }
    });

    it('should use default message when response body cannot be parsed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      try {
        await http('/v1/error');
        fail('Expected ApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('API request failed');
      }
    });
  });

  // ==========================================================================
  // Error Status Codes
  // ==========================================================================
  describe('Error Status Codes', () => {
    const errorCases = [
      { status: 400, description: 'Bad Request' },
      { status: 401, description: 'Unauthorized' },
      { status: 403, description: 'Forbidden' },
      { status: 404, description: 'Not Found' },
      { status: 422, description: 'Unprocessable Entity' },
      { status: 429, description: 'Too Many Requests' },
      { status: 500, description: 'Internal Server Error' },
      { status: 502, description: 'Bad Gateway' },
      { status: 503, description: 'Service Unavailable' },
    ];

    errorCases.forEach(({ status, description }) => {
      it(`should throw ApiError for ${status} ${description}`, async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          json: () => Promise.resolve({ message: description }),
        } as Response);

        try {
          await http('/v1/test');
          fail('Expected ApiError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          expect((error as ApiError).statusCode).toBe(status);
        }
      });
    });
  });
});

describe('ApiError class', () => {
  it('should have correct name property', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.name).toBe('ApiError');
  });

  it('should extend Error', () => {
    const error = new ApiError(500, 'Server error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have statusCode property', () => {
    const error = new ApiError(401, 'Unauthorized');
    expect(error.statusCode).toBe(401);
  });

  it('should have message property', () => {
    const error = new ApiError(400, 'Bad request');
    expect(error.message).toBe('Bad request');
  });
});
