'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Settings,
  Package,
  Heart,
  ChevronDown,
  Store,
} from 'lucide-react';
import { Button, cn } from '@tbk/ui';
import { useAuth, useUser } from '@tbk/auth';
import { toast } from 'sonner';

/**
 * User Menu Component
 * 
 * Displays user profile dropdown for authenticated users
 * or login/register buttons for unauthenticated users.
 * 
 * Features:
 * - User avatar with initials
 * - Dropdown menu with profile links
 * - Sign out functionality
 * - Vendor portal link (if vendor)
 */
export function UserMenu() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { profile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  /**
   * Get user initials for avatar
   */
  const getInitials = (): string => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  /**
   * Get display name
   */
  const getDisplayName = (): string => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Loading state
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-300"
        disabled
      >
        <div className="h-5 w-5 animate-pulse rounded-full bg-netflix-medium-gray" />
      </Button>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <Link href="/login">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white"
        >
          <User className="h-5 w-5" />
        </Button>
      </Link>
    );
  }

  // Authenticated state with dropdown
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-300 hover:text-white px-2"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-netflix-red flex items-center justify-center text-white text-sm font-medium">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={getDisplayName()}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>
        {/* Name (hidden on mobile) */}
        <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform hidden md:inline',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-netflix-dark-gray border border-netflix-medium-gray shadow-lg py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-netflix-medium-gray">
            <p className="text-sm font-medium text-white truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-netflix-medium-gray hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-netflix-medium-gray hover:text-white transition-colors"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-netflix-medium-gray hover:text-white transition-colors"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-netflix-medium-gray hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

          {/* Vendor Link (if applicable) */}
          {profile?.role === 'vendor' && (
            <div className="py-1 border-t border-netflix-medium-gray">
              <a
                href={process.env.NEXT_PUBLIC_VENDOR_PORTAL_URL || 'http://localhost:3002'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-red hover:bg-netflix-medium-gray transition-colors"
              >
                <Store className="h-4 w-4" />
                Vendor Portal
              </a>
            </div>
          )}

          {/* Sign Out */}
          <div className="py-1 border-t border-netflix-medium-gray">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-netflix-medium-gray hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
