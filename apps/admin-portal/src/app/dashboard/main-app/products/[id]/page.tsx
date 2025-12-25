'use client';

/**
 * Admin Product Detail Page
 * =========================
 * 
 * Detailed product view with:
 * - Product information tabs
 * - Analytics & performance
 * - Inventory management
 * - Quick actions
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  StarOff,
  Power,
  PowerOff,
  ExternalLink,
  Copy,
  BarChart3,
  ShoppingCart,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package2,
  Store,
  Calendar,
  Hash,
  Tag,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  toast,
  StatCard,
  StatCardGroup,
} from '@tbk/ui';
import {
  adminGetProduct,
  adminDeleteProduct,
  adminToggleProductFeatured,
  adminToggleProductActive,
  adminGetProductAnalytics,
  type AdminProduct,
  type ProductAnalytics,
} from '@tbk/api-client';

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

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(product: AdminProduct) {
  if (!product.isActive) {
    return <Badge variant="secondary" className="text-base px-3 py-1">Inactive</Badge>;
  }
  if (product.stockQuantity === 0) {
    return <Badge variant="destructive" className="text-base px-3 py-1">Out of Stock</Badge>;
  }
  if (product.stockQuantity <= product.lowStockThreshold) {
    return <Badge variant="outline" className="border-yellow-500 text-yellow-600 text-base px-3 py-1">Low Stock</Badge>;
  }
  return <Badge variant="default" className="bg-green-500 text-base px-3 py-1">Active</Badge>;
}

// =============================================================================
// Component
// =============================================================================

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  // State
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const response = await adminGetProduct(id);
        if (response.success && response.data) {
          setProduct(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Fetch analytics when tab changes
  useEffect(() => {
    async function fetchAnalytics() {
      if (activeTab !== 'analytics' || !product) return;

      try {
        const response = await adminGetProductAnalytics(id);
        if (response.success && response.data) {
          setAnalytics(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    }

    fetchAnalytics();
  }, [activeTab, id, product]);

  // Handlers
  const handleToggleFeatured = async () => {
    if (!product) return;
    try {
      await adminToggleProductFeatured(product.id, !product.isFeatured);
      toast(product.isFeatured ? 'Product unfeatured' : 'Product featured');
      // Refetch product
      const response = await adminGetProduct(id);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch {
      toast('Failed to update product');
    }
  };

  const handleToggleActive = async () => {
    if (!product) return;
    try {
      await adminToggleProductActive(product.id, !product.isActive);
      toast(product.isActive ? 'Product deactivated' : 'Product activated');
      // Refetch product
      const response = await adminGetProduct(id);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch {
      toast('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    try {
      await adminDeleteProduct(product.id);
      toast('Product deleted');
      router.push('/dashboard/main-app/products');
    } catch {
      toast('Failed to delete product');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    toast('Product ID copied to clipboard');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Product Not Found</h2>
        <p className="text-muted-foreground">{error || 'The product you are looking for does not exist.'}</p>
        <Button asChild>
          <Link href="/dashboard/main-app/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Package className="h-full w-full p-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                {product.isFeatured && (
                  <Badge variant="outline" className="border-yellow-500">
                    <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                {getStatusBadge(product)}
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1 text-sm hover:text-foreground transition-colors"
                >
                  <Hash className="h-3 w-3" />
                  {product.id.slice(0, 8)}...
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleFeatured}>
            {product.isFeatured ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Unfeature
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Feature
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleToggleActive}>
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
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/main-app/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <StatCardGroup>
        <StatCard
          title="Price"
          value={formatCurrency(product.price)}
          icon={<DollarSign className="h-4 w-4" />}
          description={product.compareAtPrice ? `Compare at ${formatCurrency(product.compareAtPrice)}` : undefined}
        />
        <StatCard
          title="Stock"
          value={formatNumber(product.stockQuantity)}
          icon={<Package2 className="h-4 w-4" />}
          variant={product.stockQuantity <= product.lowStockThreshold ? 'warning' : 'default'}
          description={`Threshold: ${product.lowStockThreshold}`}
        />
        <StatCard
          title="Total Sales"
          value={formatNumber(product.totalSales || 0)}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(product.totalRevenue || 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
        />
      </StatCardGroup>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Slug</p>
                    <p className="font-medium font-mono text-sm">{product.slug}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-medium">{product.sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Barcode</p>
                    <p className="font-medium">{product.barcode || 'N/A'}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{product.description || 'No description'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compare at Price</p>
                    <p className="text-2xl font-bold">
                      {product.compareAtPrice ? formatCurrency(product.compareAtPrice) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <p className="font-medium">
                      {product.costPrice ? formatCurrency(product.costPrice) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margin</p>
                    <p className="font-medium">
                      {product.costPrice
                        ? `${(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Store className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{product.vendor?.businessName || 'Unknown Vendor'}</p>
                    <p className="text-sm text-muted-foreground">{product.vendor?.slug}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" asChild>
                    <Link href={`/dashboard/vendor-portal/vendors/${product.vendorId}`}>
                      View Vendor
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category?.name || 'Uncategorized'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Meta Title</p>
                  <p className="text-sm">{product.metaTitle || product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta Description</p>
                  <p className="text-sm">{product.metaDescription || 'No meta description'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(product.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="font-medium">{formatDate(product.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Sale</p>
                      <p className="font-medium">
                        {product.lastSoldAt ? formatDate(product.lastSoldAt) : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Views</p>
                      <p className="font-medium">{formatNumber(product.viewCount || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                {product.images?.length || 0} image(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4" />
                  <p>No images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-3xl font-bold">{formatNumber(product.stockQuantity)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Threshold</p>
                    <p className="text-3xl font-bold">{formatNumber(product.lowStockThreshold)}</p>
                  </div>
                </div>
                {product.stockQuantity <= product.lowStockThreshold && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      Stock is below threshold. Consider reordering.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Retail Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(product.price * product.stockQuantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Value</p>
                    <p className="text-2xl font-bold">
                      {product.costPrice
                        ? formatCurrency(product.costPrice * product.stockQuantity)
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatNumber(analytics.views)}</p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatNumber(analytics.addToCartCount)}</p>
                      <p className="text-sm text-muted-foreground">Add to Cart</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatNumber(analytics.purchaseCount)}</p>
                      <p className="text-sm text-muted-foreground">Purchases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatCurrency(analytics.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{(analytics.conversionRate * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Conversion</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Skeleton className="h-24 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
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
    </div>
  );
}
