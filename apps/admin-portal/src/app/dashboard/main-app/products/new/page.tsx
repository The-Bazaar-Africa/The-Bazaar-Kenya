'use client';

/**
 * Admin Create Product Page
 * =========================
 * 
 * Create new product form with:
 * - All product fields
 * - Image upload
 * - Category selection
 * - Inventory settings
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
} from 'lucide-react';
import {
  Button,
  toast,
} from '@tbk/ui';
import {
  adminCreateProduct,
} from '@tbk/api-client';
import { ProductForm, type ProductFormData } from '../_components/product-form';

// =============================================================================
// Component
// =============================================================================

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Handle form submit
  const handleSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const response = await adminCreateProduct(data);
      if (response.success && response.data) {
        toast('Product created successfully');
        router.push(`/dashboard/main-app/products/${response.data.id}`);
      } else {
        toast('Failed to create product');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  // Default form data
  const initialData: ProductFormData = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    compareAtPrice: undefined,
    costPrice: undefined,
    sku: '',
    barcode: '',
    stockQuantity: 0,
    lowStockThreshold: 10,
    categoryId: '',
    vendorId: '',
    isActive: true,
    isFeatured: false,
    images: [],
    metaTitle: '',
    metaDescription: '',
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Product</h1>
            <p className="text-sm text-muted-foreground">Add a new product to the catalog</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel="Create Product"
      />
    </div>
  );
}
