/**
 * The Bazaar - Categories Routes (Enterprise Grade)
 * ==================================================
 * 
 * Provides category management and navigation with:
 * - Hierarchical category tree support
 * - SEO-friendly slug-based lookups
 * - Product counts and filtering
 * - Caching-friendly response structure
 * 
 * Routes:
 * - GET    /           - List all categories (flat or tree)
 * - GET    /tree       - Get full category tree structure
 * - GET    /:slug      - Get category by slug with metadata
 * - GET    /:slug/products - Get products in category with pagination
 * - GET    /:slug/subcategories - Get direct subcategories
 * 
 * @module routes/v1/categories
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
  productCount?: number;
}

interface CategoryWithMeta extends Category {
  subcategories: Pick<Category, 'id' | 'name' | 'slug' | 'image_url' | 'icon'>[];
  productCount: number;
  breadcrumbs: Array<{ name: string; slug: string }>;
}

// ProductListItem interface - used in response types
type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating_average: number | null;
  rating_count: number;
  is_featured: boolean;
  vendor: {
    id: string;
    business_name: string;
    slug: string;
  } | null;
};

// Suppress unused variable warning
const _ProductListItem: ProductListItem | null = null;
void _ProductListItem;

// PaginatedProducts interface removed - using inline types

// ============================================================================
// ERROR HANDLING
// ============================================================================

export const CategoryErrorCodes = {
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  INVALID_SLUG: 'INVALID_SLUG',
  FETCH_FAILED: 'FETCH_FAILED',
} as const;

type CategoryErrorCode = typeof CategoryErrorCodes[keyof typeof CategoryErrorCodes];

function createError(code: CategoryErrorCode, message: string, details?: Record<string, unknown>) {
  return {
    success: false,
    error: { code, message, details },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build nested category tree from flat list
 * Time complexity: O(n) with two passes
 */
function buildCategoryTree(categoriesInput: Category[]): CategoryWithChildren[] {
  const categories = categoriesInput;
  const map = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  // First pass: create map with children arrays
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] } as CategoryWithChildren);
  }

  // Second pass: build tree structure
  for (const cat of categories) {
    const node = map.get(cat.id);
    if (!node) continue;
    if (cat.parent_id && map.has(cat.parent_id)) {
      const parent = map.get(cat.parent_id);
      if (parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by display_order
  const sortChildren = (nodes: CategoryWithChildren[]) => {
    nodes.sort((a, b) => a.display_order - b.display_order);
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    }
  };

  sortChildren(roots);
  return roots;
}

/**
 * Build breadcrumb trail for a category
 */
async function buildBreadcrumbs(
  supabase: SupabaseClient,
  categoryId: string,
  categoriesInput?: Category[]
): Promise<Array<{ name: string; slug: string }>> {
  const breadcrumbs: Array<{ name: string; slug: string }> = [];
  
  // If categories not provided, fetch them
  let categories = categoriesInput;
  if (!categories) {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id')
      .eq('is_active', true);
    categories = (data as Category[]) || [];
  }

  const categoryMap = new Map((categories as Category[]).map(c => [c.id, c]));
  let currentId: string | null = categoryId;

  while (currentId) {
    const cat = categoryMap.get(currentId);
    if (!cat) break;
    breadcrumbs.unshift({ name: cat.name, slug: cat.slug });
    currentId = cat.parent_id;
  }

  return breadcrumbs;
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function categoriesRoutes(app: FastifyInstance) {

  // --------------------------------------------------------------------------
  // GET / - List all categories
  // --------------------------------------------------------------------------
  app.get<{
    Querystring: {
      tree?: boolean;
      parent?: string;
      featured?: boolean;
      includeCount?: boolean;
    };
  }>(
    '/',
    {
      schema: {
        tags: ['Categories'],
        summary: 'List all categories',
        description: 'Retrieves categories with optional tree structure and product counts.',
        querystring: {
          type: 'object',
          properties: {
            tree: { 
              type: 'boolean', 
              description: 'Return as nested tree structure',
              default: false
            },
            parent: { 
              type: 'string', 
              format: 'uuid',
              description: 'Filter by parent category ID (null for root categories)'
            },
            featured: { 
              type: 'boolean', 
              description: 'Only return featured categories'
            },
            includeCount: { 
              type: 'boolean', 
              description: 'Include product counts (slower)',
              default: false
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: true },
              data: { type: 'array' },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { tree, parent, featured, includeCount } = request.query;

      try {
        let query = app.supabase
          .from('categories')
          .select('id, name, slug, description, image_url, icon, parent_id, display_order, is_active, is_featured, meta_title, meta_description, created_at, updated_at')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });

        // Filter by parent
        if (parent === 'null' || parent === '') {
          query = query.is('parent_id', null);
        } else if (parent) {
          query = query.eq('parent_id', parent);
        }

        // Filter featured
        if (featured) {
          query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) {
          request.log.error({ error }, 'Failed to fetch categories');
          return reply.status(500).send(
            createError('FETCH_FAILED', 'Failed to fetch categories')
          );
        }

        let categories = data || [];

        // Add product counts if requested
        if (includeCount && categories.length > 0) {
          const categoryIds = categories.map(c => c.id);
          
          // Get counts for all categories in one query
          const { data: counts } = await app.supabase
            .from('products')
            .select('category_id')
            .in('category_id', categoryIds)
            .eq('is_active', true);

          const countMap = new Map<string, number>();
          for (const p of counts || []) {
            countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
          }

          categories = categories.map(cat => ({
            ...cat,
            productCount: countMap.get(cat.id) || 0,
          }));
        }

        // Build tree if requested
        if (tree) {
          const treeData = buildCategoryTree(categories);
          return {
            success: true,
            data: treeData,
            meta: {
              total: categories.length,
              structure: 'tree',
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          success: true,
          data: categories,
          meta: {
            total: categories.length,
            structure: 'flat',
            timestamp: new Date().toISOString(),
          },
        };

      } catch (err) {
        request.log.error({ err }, 'Categories fetch error');
        return reply.status(500).send(
          createError('FETCH_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /tree - Get full category tree
  // --------------------------------------------------------------------------
  app.get(
    '/tree',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get full category tree structure',
        description: 'Returns all categories in a nested tree structure optimized for navigation menus.',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', const: true },
              data: { type: 'array' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'object' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { data, error } = await app.supabase
          .from('categories')
          .select('id, name, slug, description, image_url, icon, parent_id, display_order, is_active, is_featured')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          return reply.status(500).send(
            createError('FETCH_FAILED', 'Failed to fetch category tree')
          );
        }

        const tree = buildCategoryTree((data as Category[]) || []);

        return {
          success: true,
          data: tree,
          meta: {
            totalCategories: data?.length || 0,
            rootCategories: tree.length,
            timestamp: new Date().toISOString(),
          },
        };

      } catch (err) {
        request.log.error({ err }, 'Category tree fetch error');
        return reply.status(500).send(
          createError('FETCH_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /:slug - Get category by slug
  // --------------------------------------------------------------------------
  app.get<{ Params: { slug: string } }>(
    '/:slug',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get category by slug',
        description: 'Retrieves a single category with subcategories, product count, and breadcrumbs.',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { 
              type: 'string',
              pattern: '^[a-z0-9-]+$',
              description: 'URL-friendly category slug'
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return reply.status(400).send(
          createError('INVALID_SLUG', 'Invalid category slug format')
        );
      }

      try {
        // Get category
        const { data: category, error } = await app.supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error || !category) {
          return reply.status(404).send(
            createError('CATEGORY_NOT_FOUND', `Category '${slug}' not found`)
          );
        }

        // Get subcategories
        const { data: subcategories } = await app.supabase
          .from('categories')
          .select('id, name, slug, image_url, icon, display_order')
          .eq('parent_id', category.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        // Get product count
        const { count: productCount } = await app.supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_active', true);

        // Build breadcrumbs
        const breadcrumbs = await buildBreadcrumbs(app.supabase, category.id);

        const response: CategoryWithMeta = {
          ...category,
          subcategories: subcategories || [],
          productCount: productCount || 0,
          breadcrumbs,
        };

        request.log.info({
          slug,
          categoryId: category.id,
          subcategoryCount: subcategories?.length || 0,
          productCount,
          operation: 'categories.getBySlug'
        }, 'Category fetched');

        return {
          success: true,
          data: response,
        };

      } catch (err) {
        request.log.error({ err, slug }, 'Get category error');
        return reply.status(500).send(
          createError('FETCH_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /:slug/products - Get products in category
  // --------------------------------------------------------------------------
  app.get<{
    Params: { slug: string };
    Querystring: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      vendor?: string;
    };
  }>(
    '/:slug/products',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get products in a category',
        description: 'Retrieves paginated products within a category with filtering and sorting.',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 24 },
            sort: { 
              type: 'string', 
              enum: ['newest', 'price_asc', 'price_desc', 'popular', 'rating'],
              default: 'newest'
            },
            minPrice: { type: 'number', minimum: 0 },
            maxPrice: { type: 'number', minimum: 0 },
            inStock: { type: 'boolean' },
            vendor: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const {
        page = 1,
        limit = 24,
        sort = 'newest',
        minPrice,
        maxPrice,
        inStock,
        vendor,
      } = request.query;

      const offset = (page - 1) * limit;

      try {
        // Get category ID from slug
        const { data: category, error: catError } = await app.supabase
          .from('categories')
          .select('id, name, slug')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (catError || !category) {
          return reply.status(404).send(
            createError('CATEGORY_NOT_FOUND', `Category '${slug}' not found`)
          );
        }

        // Build product query
        let query = app.supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            compare_at_price,
            images,
            stock_quantity,
            rating_average,
            rating_count,
            is_featured,
            view_count,
            created_at,
            vendor:vendors(id, business_name, slug)
          `, { count: 'exact' })
          .eq('category_id', category.id)
          .eq('is_active', true);

        // Apply filters
        if (minPrice !== undefined) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice !== undefined) {
          query = query.lte('price', maxPrice);
        }
        if (inStock) {
          query = query.gt('stock_quantity', 0);
        }
        if (vendor) {
          query = query.eq('vendor_id', vendor);
        }

        // Apply sorting
        switch (sort) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'popular':
            query = query.order('view_count', { ascending: false, nullsFirst: false });
            break;
          case 'rating':
            query = query.order('rating_average', { ascending: false, nullsFirst: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
          request.log.error({ error, slug }, 'Failed to fetch category products');
          return reply.status(500).send(
            createError('FETCH_FAILED', 'Failed to fetch products')
          );
        }

        // Get price range for filters
        const { data: priceRange } = await app.supabase
          .from('products')
          .select('price')
          .eq('category_id', category.id)
          .eq('is_active', true)
          .order('price', { ascending: true })
          .limit(1);

        const { data: maxPriceData } = await app.supabase
          .from('products')
          .select('price')
          .eq('category_id', category.id)
          .eq('is_active', true)
          .order('price', { ascending: false })
          .limit(1);

        const totalPages = count ? Math.ceil(count / limit) : 0;

        const response: { category: { id: string; name: string; slug: string }; products: unknown[]; pagination: Record<string, unknown>; filters: Record<string, unknown> } = {
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          products: products || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          filters: {
            applied: {
              minPrice,
              maxPrice,
              inStock,
              vendor,
              sort,
            },
            priceRange: {
              min: priceRange?.[0]?.price || 0,
              max: maxPriceData?.[0]?.price || 0,
            },
          },
        };

        request.log.info({
          slug,
          categoryId: category.id,
          page,
          limit,
          total: count,
          sort,
          operation: 'categories.getProducts'
        }, 'Category products fetched');

        return {
          success: true,
          data: response,
        };

      } catch (err) {
        request.log.error({ err, slug }, 'Category products error');
        return reply.status(500).send(
          createError('FETCH_FAILED', 'Internal server error')
        );
      }
    }
  );

  // --------------------------------------------------------------------------
  // GET /:slug/subcategories - Get direct subcategories
  // --------------------------------------------------------------------------
  app.get<{ Params: { slug: string } }>(
    '/:slug/subcategories',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get direct subcategories',
        description: 'Returns immediate child categories of the specified category.',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          },
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      try {
        // Get parent category
        const { data: parent, error: parentError } = await app.supabase
          .from('categories')
          .select('id, name, slug')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (parentError || !parent) {
          return reply.status(404).send(
            createError('CATEGORY_NOT_FOUND', `Category '${slug}' not found`)
          );
        }

        // Get subcategories with product counts
        const { data: subcategories, error } = await app.supabase
          .from('categories')
          .select('id, name, slug, description, image_url, icon, display_order')
          .eq('parent_id', parent.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          return reply.status(500).send(
            createError('FETCH_FAILED', 'Failed to fetch subcategories')
          );
        }

        // Get product counts for each subcategory
        const subcategoriesWithCounts = await Promise.all(
          (subcategories || []).map(async (sub) => {
            const { count } = await app.supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', sub.id)
              .eq('is_active', true);

            return {
              ...sub,
              productCount: count || 0,
            };
          })
        );

        return {
          success: true,
          data: {
            parent: {
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
            },
            subcategories: subcategoriesWithCounts,
          },
        };

      } catch (err) {
        request.log.error({ err, slug }, 'Subcategories fetch error');
        return reply.status(500).send(
          createError('FETCH_FAILED', 'Internal server error')
        );
      }
    }
  );
}
