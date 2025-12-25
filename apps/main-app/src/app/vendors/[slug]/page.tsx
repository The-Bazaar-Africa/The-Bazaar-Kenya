'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@tbk/ui';
import { Star, MapPin, CheckCircle, Calendar, Package, MessageSquare } from 'lucide-react';
import { mockVendors, mockProducts } from '@/lib/mock-data';
import { ProductCard } from '@/components/marketplace/ProductCard';

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Find vendor from mock data
  const vendor = mockVendors.find(v => v.slug === slug) || mockVendors[0];
  const vendorProducts = mockProducts.filter(p => p.vendor_id === vendor?.id);

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-netflix-red/30 to-orange-500/30">
        {vendor?.banner_url && (
          <Image
            src={vendor.banner_url}
            alt={`${vendor.name} banner`}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black to-transparent" />
      </div>

      <div className="container-custom">
        {/* Vendor Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="relative w-32 h-32 rounded-xl border-4 border-netflix-black bg-netflix-dark-gray overflow-hidden flex-shrink-0">
              {vendor?.logo_url ? (
                <Image
                  src={vendor.logo_url}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {vendor?.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{vendor?.name}</h1>
                {vendor?.is_verified && (
                  <Badge className="bg-netflix-red/20 text-netflix-red border-none">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {vendor?.description && (
                <p className="text-gray-400 mb-4 max-w-2xl">{vendor.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold">{vendor?.rating?.toFixed(1)}</span>
                  <span className="text-gray-400">({vendor?.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Package className="h-4 w-4" />
                  <span>{vendorProducts.length} products</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Joined 2023</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="bg-netflix-red hover:bg-netflix-red/90">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="mb-12">
          <TabsList className="bg-netflix-dark-gray border-netflix-medium-gray">
            <TabsTrigger value="products" className="data-[state=active]:bg-netflix-red">
              Products
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-netflix-red">
              About
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-netflix-red">
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {vendorProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {vendorProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image_url || undefined}
                    rating={product.rating}
                    vendor={vendor?.name}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
                  <p className="text-gray-400">This vendor hasn&apos;t added any products yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">About {vendor?.name}</h3>
                <p className="text-gray-400 mb-6">
                  {vendor?.description || 'No description available.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Business Hours</h4>
                    <p className="text-gray-400">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-400">Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Shipping</h4>
                    <p className="text-gray-400">Free shipping on orders over KES 5,000</p>
                    <p className="text-gray-400">Delivery within 2-5 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
              <CardContent className="p-12 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                <p className="text-gray-400">Be the first to review this vendor.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
