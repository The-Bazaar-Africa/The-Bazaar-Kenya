/**
 * Vendor Portal Auth Layout
 * ==========================
 * Professional authentication layout for vendor onboarding.
 * Split-screen design with branding on left, form on right.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vendor Authentication',
  description: 'Sign in or register to manage your store on The Bazaar marketplace.',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">B</span>
            </div>
            <span className="text-white text-2xl font-bold">The Bazaar</span>
          </Link>
          <p className="text-blue-100 mt-2 text-sm">Vendor Portal</p>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Grow Your Business<br />
              With The Bazaar
            </h1>
            <p className="text-blue-100 mt-4 text-lg max-w-md">
              Join thousands of vendors reaching millions of customers across East Africa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-blue-100 text-sm mt-1">Active Customers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white">1K+</div>
              <div className="text-blue-100 text-sm mt-1">Trusted Vendors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-blue-100 text-sm mt-1">Uptime SLA</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-blue-100 text-sm mt-1">Support</div>
            </div>
          </div>
        </div>

        <div className="text-blue-200 text-sm">
          &copy; {new Date().getFullYear()} The Bazaar. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-gray-900 text-2xl font-bold">The Bazaar</span>
            </Link>
            <p className="text-gray-500 mt-1 text-sm">Vendor Portal</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
