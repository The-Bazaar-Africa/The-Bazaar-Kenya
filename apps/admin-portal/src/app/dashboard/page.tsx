'use client';

/**
 * Admin Dashboard Root Page
 * ==========================
 * Redirects to the Main App Control Console by default.
 * The dashboard layout handles console switching.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main-app console by default
    router.replace('/dashboard/main-app');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
