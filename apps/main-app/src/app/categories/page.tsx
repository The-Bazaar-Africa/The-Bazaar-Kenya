'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/hooks/useProducts';
import { Card, CardContent, Skeleton } from '@tbk/ui';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explore our wide range of product categories and find exactly what you&apos;re looking for.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container-custom py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden bg-netflix-dark-gray border-netflix-medium-gray hover:border-netflix-red transition-all duration-300 netflix-card">
                  <div className="relative aspect-square">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-netflix-medium-gray flex items-center justify-center">
                        <span className="text-6xl">
                          {category.name === 'Electronics' && '📱'}
                          {category.name === 'Fashion' && '👗'}
                          {category.name === 'Home & Garden' && '🏠'}
                          {category.name === 'Sports' && '⚽'}
                          {category.name === 'Beauty' && '💄'}
                          {category.name === 'Books' && '📚'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
