'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Badge, Skeleton, Button } from '@tbk/ui';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { mockVendors } from '@/lib/mock-data';

export default function VendorsPage() {
  // Using mock vendors for now - will be replaced with real data
  const vendors = mockVendors;
  const isLoading = false;

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Vendors
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">
            Discover trusted vendors offering quality products across Kenya. Shop with confidence from verified sellers.
          </p>
          <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
            <Link href="/vendors/register">Become a Vendor</Link>
          </Button>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="container-custom py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.slug}`}>
                <Card className="overflow-hidden bg-netflix-dark-gray border-netflix-medium-gray hover:border-netflix-red transition-all duration-300 netflix-card h-full">
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-r from-netflix-red/30 to-orange-500/30">
                    {vendor.banner_url && (
                      <Image
                        src={vendor.banner_url}
                        alt={`${vendor.name} banner`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-6 -mt-12 relative">
                    {/* Logo */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-netflix-dark-gray bg-netflix-medium-gray overflow-hidden mb-4">
                      {vendor.logo_url ? (
                        <Image
                          src={vendor.logo_url}
                          alt={vendor.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                          {vendor.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                        {vendor.name}
                        {vendor.is_verified && (
                          <CheckCircle className="h-4 w-4 text-netflix-red" />
                        )}
                      </h3>
                      {vendor.is_verified && (
                        <Badge className="bg-netflix-red/20 text-netflix-red border-none">
                          Verified
                        </Badge>
                      )}
                    </div>

                    {vendor.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {vendor.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-400">
                        {vendor.review_count} reviews
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container-custom py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-netflix-dark-gray to-netflix-medium-gray p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Want to Sell on The Bazaar?
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Join our growing community of vendors and reach thousands of customers across Kenya.
          </p>
          <Button className="bg-netflix-red hover:bg-netflix-red/90" size="lg" asChild>
            <Link href="/vendors/register">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
