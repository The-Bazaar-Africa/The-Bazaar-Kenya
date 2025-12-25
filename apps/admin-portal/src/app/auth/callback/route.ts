/**
 * Admin Portal Auth Callback Handler
 * ====================================
 * Handles password reset redirects from Supabase Auth.
 * Note: OAuth is NOT supported for admin accounts.
 *
 * @see ADR-001: Backend Authority
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=No authorization code provided`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
            });
          } catch (error) {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    if (data.user) {
      // Verify admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Check if user is admin
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent('Access denied. This portal is for administrators only.')}`
        );
      }

      // Log the callback access for audit
      await supabase.from('admin_audit_logs').insert({
        admin_id: data.user.id,
        action: 'PASSWORD_RESET_CALLBACK',
        details: { email: data.user.email },
      });
    }

    // Redirect to intended destination (usually password reset page)
    return NextResponse.redirect(`${origin}${redirect}`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`);
  }
}
