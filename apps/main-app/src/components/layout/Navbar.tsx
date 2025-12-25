'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, Heart } from 'lucide-react';
import { Button, Badge, cn } from '@tbk/ui';
import { UserMenu } from './UserMenu';

/**
 * Main Navigation Bar Component
 * 
 * Features:
 * - Responsive design (mobile/desktop)
 * - Search bar
 * - Cart with badge
 * - Wishlist
 * - User menu with auth state
 * - Sticky/static based on page
 */
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  // Pages where navbar should be static (not sticky)
  const staticNavbarPages = ['/', '/vendors', '/categories'];
  const isStaticNavbar = staticNavbarPages.includes(pathname);

  // Mock cart count - will be replaced with real cart context
  const cartCount = 0;

  const navLinks = [
    { name: 'Vendors', href: '/vendors' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <nav
      className={cn(
        'z-50 w-full border-b border-netflix-dark-gray bg-netflix-black/95 backdrop-blur supports-[backdrop-filter]:bg-netflix-black/80',
        isStaticNavbar ? 'static' : 'sticky top-0'
      )}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo and Navigation */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-netflix-red to-orange-500 bg-clip-text text-transparent">
                The Bazaar
              </div>
            </Link>
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-white',
                    pathname === link.href ? 'text-white' : 'text-gray-300'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Search, Actions, and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Search */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:px-8">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, vendors..."
                  className="w-full bg-netflix-dark-gray border border-netflix-medium-gray rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              <div className="lg:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-300 hover:text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-netflix-red p-0 text-xs flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, vendors..."
                className="w-full bg-netflix-dark-gray border border-netflix-medium-gray rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-netflix-dark-gray py-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-white',
                    pathname === link.href ? 'text-white' : 'text-gray-300'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
