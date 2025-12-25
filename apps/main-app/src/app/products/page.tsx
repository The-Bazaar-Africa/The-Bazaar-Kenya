'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Badge, Skeleton, Input } from '@tbk/ui';
import { ProductGrid } from '@/components/marketplace/ProductGrid';
import { CategoryCard } from '@/components/marketplace/CategoryCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts({
    filters: {
      categoryId: selectedCategory || undefined,
      search: searchQuery || undefined,
    },
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">All Products</h1>
              <p className="text-muted-foreground">
                {products?.length || 0} products available
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          {categoriesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-24 rounded-lg flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              <CategoryCard
                id="all"
                name="All"
                slug="all"
                icon="🛍️"
                isActive={selectedCategory === null}
                onClick={() => handleCategoryClick('all')}
              />
              {categories?.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  slug={category.slug}
                  imageUrl={category.image_url}
                  isActive={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory(null)}>
                {categories?.find(c => c.id === selectedCategory)?.name || 'Category'}
                <span className="ml-1">×</span>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                Search: {searchQuery}
                <span className="ml-1">×</span>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
              Clear all
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[3/4]" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <ProductGrid products={products} columns={4} />
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
              Clear filters
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
