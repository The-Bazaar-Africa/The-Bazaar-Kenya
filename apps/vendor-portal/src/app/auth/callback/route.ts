/**
 * Vendor Portal OAuth Callback Handler
 * ======================================
 * Handles OAuth redirects from Supabase Auth.
 * Exchanges auth code for session and redirects to appropriate page.
 *
 * @see ADR-001: Backend Authority
 * @see ADR-004: Domain & Cookie Strategy
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

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
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
      // Check if user has vendor role or needs to complete registration
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, vendor_id')
        .eq('id', data.user.id)
        .single();

      // If user doesn't have a profile or role, set them as vendor
      if (!profile || !profile.role) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            role: 'vendor',
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            email: data.user.email,
          });

        // New user - redirect to business registration
        return NextResponse.redirect(`${origin}/auth/register?step=business`);
      }

      // Check if user is a vendor
      if (profile.role !== 'vendor' && profile.role !== 'admin' && profile.role !== 'super_admin') {
        // Not a vendor - redirect to login with error
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent('Access denied. This portal is for registered vendors only.')}`
        );
      }

      // Check if vendor profile is complete
      if (!profile.vendor_id) {
        return NextResponse.redirect(`${origin}/auth/register?step=business`);
      }

      // Check vendor approval status
      const { data: vendor } = await supabase
        .from('vendors')
        .select('status')
        .eq('id', profile.vendor_id)
        .single();

      if (vendor?.status === 'pending') {
        return NextResponse.redirect(`${origin}/pending-approval`);
      }

      if (vendor?.status === 'rejected' || vendor?.status === 'suspended') {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent('Your vendor account has been suspended. Please contact support.')}`
        );
      }
    }

    // Successful authentication - redirect to intended destination
    return NextResponse.redirect(`${origin}${redirect}`);
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`);
  }
}
