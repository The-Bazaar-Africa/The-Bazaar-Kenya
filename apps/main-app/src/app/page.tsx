'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, CardContent, Badge, Skeleton } from '@tbk/ui';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useFeaturedProducts, useCategories, useAllProducts } from '@/hooks/useProducts';
import { ArrowRight, ShoppingBag, Store, TrendingUp, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useRef, useState } from 'react';

// Netflix-style horizontal scroll component
function ProductCarousel({ 
  title, 
  products, 
  isLoading,
  badge,
  viewAllHref 
}: { 
  title: string; 
  products: any[]; 
  isLoading: boolean;
  badge?: React.ReactNode;
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {badge}
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 bg-gradient-to-r from-netflix-black to-transparent flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-10 w-10 text-white" />
            </button>
          )}

          {/* Products */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[180px] md:w-[220px]">
                  <Skeleton className="aspect-[3/4] rounded-lg" />
                </div>
              ))
            ) : products?.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[180px] md:w-[220px]">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || product.image_url}
                    rating={product.rating}
                    vendor={product.vendor?.name}
                    compareAtPrice={product.compare_at_price}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400">No products available</p>
            )}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-12 bg-gradient-to-l from-netflix-black to-transparent flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-10 w-10 text-white" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts(12);
  const { data: categories, isLoading: categoriesLoading } = useCategories(6);
  const { data: allProducts, isLoading: allLoading } = useAllProducts();

  // Get trending products (sorted by rating)
  const trendingProducts = allProducts
    ?.slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 12);

  // Get new arrivals (could be sorted by date in real app)
  const newArrivals = allProducts?.slice(0, 12);

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Banner - Netflix Style */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-netflix-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container-custom">
            <div className="max-w-2xl">
              <Badge className="bg-netflix-red text-white border-none mb-4">
                Kenya&apos;s #1 Marketplace
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Discover Amazing Products from Trusted Vendors
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Shop electronics, fashion, home goods, and more from verified sellers across Kenya.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-netflix-red hover:bg-netflix-red/90" asChild>
                  <Link href="/products">
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Start Shopping
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/vendors">
                    <Store className="mr-2 h-5 w-5" />
                    Explore Vendors
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="py-8 -mt-20 relative z-20">
        <div className="container-custom">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Browse Categories</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            <Link
              href="/products"
              className="flex-shrink-0 w-32 h-32 rounded-lg bg-gradient-to-br from-netflix-red to-orange-500 flex flex-col items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <ShoppingBag className="h-8 w-8 mb-2" />
              <span className="text-sm font-medium">All Products</span>
            </Link>
            {categoriesLoading ? (
              [...Array(5)].map((_, i) => (
                <Skeleton key={i} className="flex-shrink-0 w-32 h-32 rounded-lg" />
              ))
            ) : (
              categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="flex-shrink-0 w-32 h-32 rounded-lg bg-netflix-dark-gray border border-netflix-medium-gray flex flex-col items-center justify-center text-white hover:border-netflix-red hover:scale-105 transition-all"
                >
                  <span className="text-3xl mb-2">
                    {category.name === 'Electronics' && '📱'}
                    {category.name === 'Fashion' && '👗'}
                    {category.name === 'Home & Garden' && '🏠'}
                    {category.name === 'Sports' && '⚽'}
                    {category.name === 'Beauty' && '💄'}
                    {category.name === 'Books' && '📚'}
                  </span>
                  <span className="text-sm font-medium text-center px-2">{category.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <ProductCarousel
        title="Featured Products"
        products={featuredProducts || []}
        isLoading={featuredLoading}
        badge={<Badge className="bg-netflix-red text-white border-none">Featured</Badge>}
        viewAllHref="/products?featured=true"
      />

      {/* Trending Products Carousel */}
      <ProductCarousel
        title="Trending Now"
        products={trendingProducts || []}
        isLoading={allLoading}
        badge={<TrendingUp className="h-5 w-5 text-netflix-red" />}
        viewAllHref="/products?sort=trending"
      />

      {/* New Arrivals Carousel */}
      <ProductCarousel
        title="New Arrivals"
        products={newArrivals || []}
        isLoading={allLoading}
        badge={<Badge className="bg-green-600 text-white border-none">New</Badge>}
        viewAllHref="/products?sort=newest"
      />

      {/* CTA Banner */}
      <section className="py-12">
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-netflix-dark-gray to-netflix-medium-gray p-8 md:p-12">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"
                alt="Vendor"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Start Selling?
              </h2>
              <p className="text-gray-300 mb-6">
                Join thousands of successful vendors on The Bazaar. Reach customers across Kenya and grow your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
                  <Link href="/vendors/register">Become a Vendor</Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-t border-netflix-dark-gray">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray text-center p-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-netflix-red mb-2">10K+</div>
                <div className="text-gray-400">Products</div>
              </CardContent>
            </Card>
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray text-center p-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-netflix-red mb-2">500+</div>
                <div className="text-gray-400">Vendors</div>
              </CardContent>
            </Card>
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray text-center p-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-netflix-red mb-2">50K+</div>
                <div className="text-gray-400">Customers</div>
              </CardContent>
            </Card>
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray text-center p-6">
              <CardContent className="p-0">
                <div className="text-3xl md:text-4xl font-bold text-netflix-red mb-2">4.8</div>
                <div className="text-gray-400">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
