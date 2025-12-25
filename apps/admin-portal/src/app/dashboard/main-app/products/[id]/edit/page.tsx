'use client';

/**
 * Admin Product Edit Page
 * =======================
 * 
 * Edit existing product form with:
 * - Full product details editing
 * - Image management
 * - Category selection
 * - Inventory settings
 * - SEO fields
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Button,
  Skeleton,
  toast,
} from '@tbk/ui';
import {
  adminGetProduct,
  adminUpdateProduct,
  type AdminProduct,
} from '@tbk/api-client';
import { ProductForm, type ProductFormData } from '../../_components/product-form';

// =============================================================================
// Component
// =============================================================================

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { id } = params;

  // State
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        const response = await adminGetProduct(id);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Handle form submit
  const handleSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const response = await adminUpdateProduct(id, data);
      if (response.success) {
        toast('Product updated successfully');
        router.push(`/dashboard/main-app/products/${id}`);
      } else {
        toast('Failed to update product');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px]" />
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

  // Convert product to form data
  const initialData: ProductFormData = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    costPrice: product.costPrice ?? undefined,
    sku: product.sku || '',
    barcode: product.barcode || '',
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    categoryId: product.categoryId || '',
    vendorId: product.vendorId || '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    images: product.images || [],
    metaTitle: product.metaTitle || '',
    metaDescription: product.metaDescription || '',
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/main-app/products/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-sm text-muted-foreground">{product.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
