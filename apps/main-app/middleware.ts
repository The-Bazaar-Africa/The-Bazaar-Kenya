/**
 * Next.js Middleware for Main-App Route Protection
 * 
 * This middleware handles:
 * 1. Session refresh on every request
 * 2. Protected route access control
 * 3. Auth page redirects for authenticated users
 * 4. Redirect to login for unauthenticated users on protected routes
 * 
 * @module middleware
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Route configuration for main-app
 */
const ROUTE_CONFIG = {
  // Routes that require authentication
  protectedRoutes: [
    '/dashboard',
    '/profile',
    '/orders',
    '/checkout',
    '/wishlist',
    '/settings',
  ],
  
  // Routes that should redirect to home if already authenticated
  authRoutes: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
  
  // Routes that are always public
  publicRoutes: [
    '/',
    '/products',
    '/product',
    '/categories',
    '/vendors',
    '/about',
    '/contact',
    '/help',
    '/faqs',
    '/terms',
    '/privacy',
    '/cookies',
    '/shipping',
    '/careers',
    '/press',
    '/blog',
    '/resources',
    '/pricing',
    '/auth/callback',
  ],
  
  // Redirect paths
  redirects: {
    login: '/login',
    afterLogin: '/',
    afterLogout: '/',
  },
};

/**
 * Check if a path matches any pattern in the list
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Exact match
    if (pathname === pattern) return true;
    // Prefix match (e.g., /products matches /products/123)
    if (pathname.startsWith(pattern + '/')) return true;
    // Pattern match for dynamic routes
    if (pattern.includes('[') && pattern.includes(']')) {
      const regex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '(/.*)?$');
      return regex.test(pathname);
    }
    return false;
  });
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request for subsequent middleware/handlers
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Set cookie on response for browser
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from request
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Remove cookie from response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user && !error;
  const isProtectedRoute = matchesPath(pathname, ROUTE_CONFIG.protectedRoutes);
  const isAuthRoute = matchesPath(pathname, ROUTE_CONFIG.authRoutes);

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(ROUTE_CONFIG.redirects.login, request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || ROUTE_CONFIG.redirects.afterLogin;
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
