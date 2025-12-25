'use client';

/**
 * Admin Products List Page
 * ========================
 * 
 * Full-featured product management page using:
 * - DataTable from @tbk/ui
 * - Admin Products API from @tbk/api-client
 * - Feature flags for gradual rollout
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  StarOff,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  StatCard,
  StatCardGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Checkbox,
  Skeleton,
  toast,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import {
  adminGetProducts,
  adminDeleteProduct,
  adminBulkProductAction,
  adminToggleProductFeatured,
  adminToggleProductActive,
  type AdminProduct,
  type AdminProductFilters,
  type ProductSummary,
} from '@tbk/api-client';

// =============================================================================
// Types
// =============================================================================

interface ProductsPageState {
  products: AdminProduct[];
  summary: ProductSummary | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'outOfStock' | 'lowStock';

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function getStatusBadge(product: AdminProduct) {
  if (!product.isActive) {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  if (product.stockQuantity === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (product.stockQuantity <= product.lowStockThreshold) {
    return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Low Stock</Badge>;
  }
  return <Badge variant="default" className="bg-green-500">Active</Badge>;
}

// =============================================================================
// Component
// =============================================================================

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [state, setState] = useState<ProductsPageState>({
    products: [],
    summary: null,
    loading: true,
    error: null,
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    selectedIds: [],
  });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const filters: AdminProductFilters = {
        page: state.page,
        limit: state.limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter || undefined,
        sortBy: sortBy as AdminProductFilters['sortBy'],
        sortOrder,
      };

      const response = await adminGetProducts(filters);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          products: response.data.products,
          summary: response.data.summary,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      }));
    }
  }, [state.page, state.limit, search, statusFilter, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [search, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
  };

  const handleSelectAll = (selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedIds: selected ? prev.products.map(p => p.id) : [],
    }));
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedIds: selected
        ? [...prev.selectedIds, id]
        : prev.selectedIds.filter(i => i !== id),
    }));
  };

  const handleToggleFeatured = async (product: AdminProduct) => {
    try {
      await adminToggleProductFeatured(product.id, !product.isFeatured);
      toast(product.isFeatured ? 'Product unfeatured' : 'Product featured');
      fetchProducts();
    } catch {
      toast('Failed to update product');
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      await adminToggleProductActive(product.id, !product.isActive);
      toast(product.isActive ? 'Product deactivated' : 'Product activated');
      fetchProducts();
    } catch {
      toast('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await adminDeleteProduct(productToDelete.id);
      toast('Product deleted');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch {
      toast('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await adminBulkProductAction({
        productIds: state.selectedIds,
        action: 'delete',
      });
      toast(`${state.selectedIds.length} products deleted`);
      setBulkDeleteDialogOpen(false);
      setState(prev => ({ ...prev, selectedIds: [] }));
      fetchProducts();
    } catch {
      toast('Failed to delete products');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'feature' | 'unfeature') => {
    try {
      await adminBulkProductAction({
        productIds: state.selectedIds,
        action,
      });
      const actionLabels = {
        activate: 'activated',
        deactivate: 'deactivated',
        feature: 'featured',
        unfeature: 'unfeatured',
      };
      toast(`${state.selectedIds.length} products ${actionLabels[action]}`);
      setState(prev => ({ ...prev, selectedIds: [] }));
      fetchProducts();
    } catch {
      toast('Failed to perform bulk action');
    }
  };

  // Table columns
  const columns: DataTableColumn<AdminProduct>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      cell: (product: AdminProduct) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-full w-full p-2 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {product.sku || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (product: AdminProduct) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(product)}
          {product.isFeatured && (
            <Badge variant="outline" className="w-fit border-yellow-500">
              <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
              Featured
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      cell: (product: AdminProduct) => (
        <div>
          <div className="font-medium">{formatCurrency(product.price)}</div>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      sortable: true,
      align: 'right',
      cell: (product: AdminProduct) => (
        <div className={product.stockQuantity <= product.lowStockThreshold ? 'text-yellow-600' : ''}>
          {formatNumber(product.stockQuantity)}
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      cell: (product: AdminProduct) => (
        <div className="text-sm">
          {product.vendor?.businessName || 'Unknown'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      cell: (product: AdminProduct) => (
        <div className="text-sm text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (product: AdminProduct) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/main-app/products/${product.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/main-app/products/${product.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
              {product.isFeatured ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  Remove Featured
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Set Featured
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(product)}>
              {product.isActive ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setProductToDelete(product);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  // Summary stats
  const summaryStats = state.summary ? [
    {
      title: 'Total Products',
      value: formatNumber(state.summary.totalProducts),
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: 'Active',
      value: formatNumber(state.summary.activeProducts),
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'success' as const,
    },
    {
      title: 'Out of Stock',
      value: formatNumber(state.summary.outOfStockProducts),
      icon: <XCircle className="h-4 w-4" />,
      variant: 'error' as const,
    },
    {
      title: 'Low Stock',
      value: formatNumber(state.summary.lowStockProducts),
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'warning' as const,
    },
  ] : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Manage all products on the platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/main-app/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {state.loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatCardGroup>
          {summaryStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
        </StatCardGroup>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => handleStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
                <SelectItem value="lowStock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {state.selectedIds.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {state.selectedIds.length} product(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('feature')}>
                  <Star className="mr-2 h-4 w-4" />
                  Feature
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={state.products}
            columns={columns}
            isLoading={state.loading}
            selectable
            selectedIds={state.selectedIds}
            onSelectionChange={(ids) => setState(prev => ({ ...prev, selectedIds: ids as string[] }))}
            getRowId={(row) => row.id}
            pagination={{
              page: state.page,
              pageSize: state.limit,
              total: state.total,
              totalPages: state.totalPages,
            }}
            onPageChange={handlePageChange}
            sort={{
              column: sortBy,
              direction: sortOrder,
            }}
            onSortChange={(sort) => handleSort(sort.column, sort.direction as 'asc' | 'desc')}
            emptyMessage={search
              ? 'No products found. Try adjusting your search or filters.'
              : 'No products found. Get started by adding your first product.'
            }
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {state.selectedIds.length} Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {state.selectedIds.length} products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
