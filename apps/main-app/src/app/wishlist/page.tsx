'use client';

import Link from 'next/link';
import { Card, Button } from '@tbk/ui';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  // Mock empty wishlist for now
  const wishlistItems: any[] = [];

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-netflix-black">
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-netflix-dark-gray flex items-center justify-center">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-400 mb-8">
              Save items you love by clicking the heart icon on any product. They&apos;ll appear here for easy access later.
            </p>
            <Button className="bg-netflix-red hover:bg-netflix-red/90" size="lg" asChild>
              <Link href="/products">
                Discover Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Wishlist</h1>
        {/* Wishlist items would be rendered here */}
      </div>
    </main>
  );
}
