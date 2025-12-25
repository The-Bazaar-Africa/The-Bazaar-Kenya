'use client';

import Link from 'next/link';
import { Button } from '@tbk/ui';

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">FAQs</h1>
        <p className="text-gray-400 mb-8">
          For frequently asked questions, please visit our Help Center.
        </p>
        <Button className="bg-netflix-red hover:bg-netflix-red/90" asChild>
          <Link href="/help">Go to Help Center</Link>
        </Button>
      </div>
    </main>
  );
}
