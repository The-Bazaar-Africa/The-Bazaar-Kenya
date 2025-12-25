'use client';

import Link from 'next/link';
import { Card, CardContent, Button } from '@tbk/ui';
import { Users, ShoppingBag, Store, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: ShoppingBag, label: 'Products', value: '10,000+' },
    { icon: Store, label: 'Vendors', value: '500+' },
    { icon: Users, label: 'Customers', value: '50,000+' },
    { icon: Award, label: 'Years', value: '5+' },
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We partner only with verified vendors who meet our strict quality standards.',
    },
    {
      title: 'Customer Focus',
      description: 'Your satisfaction is our priority. We\'re here to help 24/7.',
    },
    {
      title: 'Local Impact',
      description: 'Supporting Kenyan businesses and entrepreneurs to grow and succeed.',
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our platform to provide the best shopping experience.',
    },
  ];

  return (
    <main className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 to-transparent" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About The Bazaar
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            Kenya&apos;s premier online marketplace connecting trusted vendors with millions of customers. 
            We&apos;re building the future of e-commerce in Africa.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-netflix-dark-gray border-netflix-medium-gray text-center p-6">
                <CardContent className="p-0">
                  <Icon className="h-8 w-8 text-netflix-red mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Story Section */}
      <section className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Story</h2>
          <div className="text-gray-400 space-y-4">
            <p>
              The Bazaar was founded in 2019 with a simple mission: to create a trusted marketplace 
              where Kenyan vendors could reach customers across the country and beyond.
            </p>
            <p>
              What started as a small platform with just a handful of vendors has grown into 
              Kenya&apos;s leading e-commerce destination, featuring thousands of products across 
              dozens of categories.
            </p>
            <p>
              Today, we&apos;re proud to support over 500 local businesses, from small artisans 
              to established brands, helping them grow their reach and succeed in the digital economy.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container-custom py-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {values.map((value) => (
            <Card key={value.title} className="bg-netflix-dark-gray border-netflix-medium-gray">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-netflix-red to-orange-500 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Join The Bazaar?
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Whether you&apos;re looking to shop or sell, we&apos;d love to have you as part of our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
              <Link href="/vendors/register">
                Become a Vendor
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
