'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button, Badge, cn } from '@tbk/ui';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: 'KES' | 'USD';
  image?: string;
  images?: string[];
  vendor?: string;
  vendorName?: string;
  vendorSlug?: string;
  rating?: number;
  reviewCount?: number;
  isInStock?: boolean;
  discount?: number;
  className?: string;
}

export function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  currency = 'KES',
  image,
  images,
  vendor,
  vendorName,
  vendorSlug,
  rating = 0,
  reviewCount = 0,
  isInStock = true,
  discount,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Support both image and images props
  const defaultImage = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
  const imageUrl: string = !imageError && (image || images?.[0])
    ? (image || images?.[0] || defaultImage)
    : defaultImage;

  // Support both vendor and vendorName props
  const displayVendor = vendor || vendorName;

  const formatPrice = (amount: number) => {
    return currency === 'KES'
      ? `KES ${amount.toLocaleString()}`
      : `$${amount.toFixed(2)}`;
  };

  // Calculate discount if not provided
  const calculatedDiscount = discount || (compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add to cart:', id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
  };

  return (
    <Link
      href={`/product/${id}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg bg-netflix-dark-gray border border-netflix-medium-gray transition-all duration-300 ease-in-out',
        isHovered && 'scale-105 z-10 shadow-xl shadow-black/50 border-netflix-red',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-netflix-medium-gray">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={cn(
            'object-cover transition-all duration-500',
            isHovered && 'scale-110'
          )}
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Discount Badge */}
        {calculatedDiscount && (
          <Badge className="absolute top-2 left-2 bg-netflix-red text-white border-none">
            -{calculatedDiscount}%
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 z-10',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'h-8 w-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-netflix-red border border-white/20',
              isInWishlist && 'bg-netflix-red'
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn('h-4 w-4 text-white', isInWishlist && 'fill-current')} />
          </Button>
          {isInStock && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-netflix-red border border-white/20"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-netflix-red transition-colors">
            {name}
          </h3>
          {displayVendor && (
            <p className="text-gray-400 text-xs">{displayVendor}</p>
          )}
        </div>
      </div>

      {/* Price and Rating Section */}
      <div className="p-3 space-y-2 bg-netflix-dark-gray">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-netflix-red font-bold">
            {formatPrice(price)}
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-gray-500 text-xs line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-400 text-xs">
              {rating.toFixed(1)}
              {reviewCount > 0 && ` (${reviewCount})`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
