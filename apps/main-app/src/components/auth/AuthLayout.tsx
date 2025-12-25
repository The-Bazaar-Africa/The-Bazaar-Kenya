'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
}

/**
 * Shared layout component for authentication pages
 * Provides consistent styling and branding across login, register, etc.
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  showBackToHome = true,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-netflix-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 space-y-6">
          {/* Header with Logo */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-netflix-red to-orange-500 bg-clip-text text-transparent">
                The Bazaar
              </h1>
            </Link>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="text-gray-400">{subtitle}</p>
          </div>

          {/* Content */}
          {children}

          {/* Back to Home Link */}
          {showBackToHome && (
            <div className="text-center pt-4 border-t border-netflix-medium-gray">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
