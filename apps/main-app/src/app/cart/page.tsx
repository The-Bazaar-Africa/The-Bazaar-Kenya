'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button, Separator } from '@tbk/ui';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  // Mock empty cart for now - will be replaced with real cart context
  const cartItems: any[] = [];
  const isLoading = false;

  const subtotal: number = 0;
  const shipping: number = 0;
  const total: number = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-netflix-black">
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-netflix-dark-gray flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-400 mb-8">
              Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Button className="bg-netflix-red hover:bg-netflix-red/90" size="lg" asChild>
              <Link href="/products">
                Start Shopping
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
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="bg-netflix-dark-gray border-netflix-medium-gray">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-netflix-medium-gray flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.vendor}</p>
                      <p className="text-netflix-red font-bold mt-2">
                        KES {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-netflix-medium-gray"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-netflix-medium-gray"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-netflix-dark-gray border-netflix-medium-gray sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `KES ${shipping.toLocaleString()}`}</span>
                  </div>
                </div>

                <Separator className="bg-netflix-medium-gray my-4" />

                <div className="flex justify-between text-white font-bold text-lg mb-6">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>

                <Button className="w-full bg-netflix-red hover:bg-netflix-red/90" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <p className="text-gray-400 text-xs text-center mt-4">
                  Taxes and shipping calculated at checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
