'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button, Badge, Separator } from '@tbk/ui';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Minus, Plus, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { mockProducts, mockVendors } from '@/lib/mock-data';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  // Find product from mock data
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
  const vendor = mockVendors.find(v => v.id === product?.vendor_id) || mockVendors[0];
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock multiple images
  const images = product?.images || [product?.image_url || '/placeholder.jpg'];

  const features = [
    { icon: Truck, text: 'Free delivery on orders over KES 5,000' },
    { icon: Shield, text: 'Buyer protection guarantee' },
    { icon: RotateCcw, text: '7-day return policy' },
  ];

  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center gap-2 text-gray-400">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-white">Products</Link></li>
            <li>/</li>
            <li className="text-white">{product?.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-netflix-dark-gray">
              <Image
                src={images[selectedImage]}
                alt={product?.name || 'Product'}
                fill
                className="object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === index ? 'border-netflix-red' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">{product?.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? 'text-netflix-red' : 'text-gray-400 hover:text-netflix-red'}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product?.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">({product?.review_count || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-netflix-red">
                  KES {product?.price?.toLocaleString()}
                </span>
                {product?.compare_at_price && product.compare_at_price > product.price && (
                  <span className="ml-3 text-lg text-gray-500 line-through">
                    KES {product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-netflix-medium-gray" />

            {/* Vendor Info */}
            <Link href={`/vendors/${vendor?.slug}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-netflix-medium-gray overflow-hidden">
                {vendor?.logo_url ? (
                  <Image src={vendor.logo_url} alt={vendor.name} width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {vendor?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium group-hover:text-netflix-red transition-colors">
                    {vendor?.name}
                  </span>
                  {vendor?.is_verified && <CheckCircle className="h-4 w-4 text-netflix-red" />}
                </div>
                <span className="text-gray-400 text-sm">View store</span>
              </div>
            </Link>

            <Separator className="bg-netflix-medium-gray" />

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-white">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 border-netflix-medium-gray"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-white w-12 text-center text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 border-netflix-medium-gray"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-netflix-red hover:bg-netflix-red/90" size="lg">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray" size="lg">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3 text-gray-400">
                    <Icon className="h-5 w-5 text-netflix-red" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Product Description</h2>
          <Card className="bg-netflix-dark-gray border-netflix-medium-gray">
            <CardContent className="p-6">
              <p className="text-gray-400 whitespace-pre-line">
                {product?.description || 'No description available for this product.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
