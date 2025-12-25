/**
 * Admin Portal Middleware
 * ========================
 * Enterprise-grade route protection for admin portal.
 * Enforces strict admin/super_admin role verification.
 *
 * @see ADR-001: Backend Authority
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/callback',
  '/auth/reset-password',
];

// MFA routes (require auth but not MFA verification)
const MFA_ROUTES = [
  '/auth/mfa/setup',
  '/auth/mfa/verify',
];

// Route for forced password change
const CHANGE_PASSWORD_ROUTE = '/auth/change-password';

// Route for MFA verification
const MFA_VERIFY_ROUTE = '/auth/mfa/verify';
const MFA_SETUP_ROUTE = '/auth/mfa/setup';

// Session timeout in milliseconds (30 minutes for admin)
const SESSION_TIMEOUT = 30 * 60 * 1000;

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
      db: {
        schema: 'api',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
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
  if (session && isPublicRoute && !pathname.includes('/callback') && !pathname.includes('/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For protected routes, verify admin role
  if (session && !isPublicRoute) {
    try {
      // Check session age for timeout
      const sessionCreated = new Date(session.user.last_sign_in_at || session.user.created_at).getTime();
      const now = Date.now();

      if (now - sessionCreated > SESSION_TIMEOUT) {
        // Session expired - sign out and redirect
        await supabase.auth.signOut();
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('error', 'Session expired. Please sign in again.');
        return NextResponse.redirect(loginUrl);
      }

      // Get user profile to verify admin role, password change, and MFA status
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, must_change_password, mfa_enabled, mfa_verified_at')
        .eq('id', session.user.id)
        .single();

      // Strict admin role check
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        // Not an admin - sign out and redirect
        await supabase.auth.signOut();
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('error', 'Access denied. Administrator privileges required.');
        return NextResponse.redirect(loginUrl);
      }

      // Check if user must change password (first login)
      if (profile.must_change_password && pathname !== CHANGE_PASSWORD_ROUTE) {
        return NextResponse.redirect(new URL(CHANGE_PASSWORD_ROUTE, request.url));
      }

      // Check MFA status (skip for MFA routes)
      const isMFARoute = MFA_ROUTES.some((route) => pathname.startsWith(route));
      
      if (!isMFARoute && pathname !== CHANGE_PASSWORD_ROUTE) {
        // If MFA is enabled, check if it's been verified this session
        if (profile.mfa_enabled) {
          const mfaVerifiedAt = profile.mfa_verified_at ? new Date(profile.mfa_verified_at).getTime() : 0;
          const sessionStart = new Date(session.user.last_sign_in_at || session.user.created_at).getTime();
          
          // MFA must be verified after the session started
          if (mfaVerifiedAt < sessionStart) {
            const mfaUrl = new URL(MFA_VERIFY_ROUTE, request.url);
            mfaUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(mfaUrl);
          }
        } else {
          // MFA not enabled - prompt to set up (for admins, MFA should be required)
          // Uncomment below to enforce MFA setup for all admins
          // return NextResponse.redirect(new URL(MFA_SETUP_ROUTE, request.url));
        }
      }

      // Add admin info to headers for downstream use
      response.headers.set('x-admin-id', session.user.id);
      response.headers.set('x-admin-role', profile.role);
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to login for security
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'Authentication error. Please sign in again.');
      return NextResponse.redirect(loginUrl);
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
