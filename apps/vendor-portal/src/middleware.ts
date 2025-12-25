/**
 * Vendor Portal Middleware
 * =========================
 * Enterprise-grade route protection for vendor portal.
 * Enforces authentication and vendor role verification.
 *
 * @see ADR-001: Backend Authority
 * @see ADR-004: Domain & Cookie Strategy
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/callback',
  '/auth/reset-password',
];

// Routes that require vendor approval
const PROTECTED_ROUTES = [
  '/dashboard',
  '/products',
  '/orders',
  '/inventory',
  '/payouts',
  '/settings',
  '/analytics',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Create response to modify cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if needed
  const { data: { session } } = await supabase.auth.getSession();

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If session exists and trying to access auth pages (except callback)
  if (session && isPublicRoute && !pathname.includes('/callback') && !pathname.includes('/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For protected routes, verify vendor status
  if (session && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, vendor_id')
        .eq('id', session.user.id)
        .single();

      // Check if user has vendor role
      if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
        // Sign out and redirect to login
        await supabase.auth.signOut();
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('error', 'Access denied. This portal is for registered vendors only.');
        return NextResponse.redirect(loginUrl);
      }

      // Check if vendor profile is complete
      if (!profile.vendor_id) {
        return NextResponse.redirect(new URL('/auth/register?step=business', request.url));
      }

      // Check vendor approval status
      const { data: vendor } = await supabase
        .from('vendors')
        .select('status')
        .eq('id', profile.vendor_id)
        .single();

      if (vendor?.status === 'pending') {
        if (!pathname.startsWith('/pending-approval')) {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }

      if (vendor?.status === 'rejected' || vendor?.status === 'suspended') {
        await supabase.auth.signOut();
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('error', 'Your vendor account has been suspended. Please contact support.');
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, allow access but log for monitoring
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
