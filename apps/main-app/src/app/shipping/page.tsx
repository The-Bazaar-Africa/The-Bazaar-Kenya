'use client';

import Link from 'next/link';
import { Button } from '@tbk/ui';
import { Construction } from 'lucide-react';

export default function Page() {
  const pageName = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
  
  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16 text-center">
        <Construction className="h-16 w-16 text-netflix-red mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4 capitalize">
          {pageName?.replace('-', ' ') || 'Page'}
        </h1>
        <p className="text-gray-400 mb-8">
          This page is coming soon. We&apos;re working hard to bring you this feature.
        </p>
        <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </main>
  );
}
