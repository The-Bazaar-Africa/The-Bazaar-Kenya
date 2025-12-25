/**
 * OAuth Callback Route Handler
 * 
 * This route handles the callback from OAuth providers (Google, etc.)
 * and email confirmation links from Supabase Auth.
 * 
 * Flow:
 * 1. User clicks OAuth button or email confirmation link
 * 2. Supabase redirects to this callback URL with auth code
 * 3. This handler exchanges the code for a session
 * 4. User is redirected to the intended destination
 * 
 * @module auth/callback
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // Get the auth code from the URL
  const code = searchParams.get('code');
  
  // Get the redirect destination (default to home)
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  // Get error parameters (if any)
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(errorUrl);
  }

  // If no code, redirect to login
  if (!code) {
    console.error('No auth code provided');
    return NextResponse.redirect(new URL('/login', origin));
  }

  // Create response to set cookies on
  const response = NextResponse.redirect(new URL(redirectTo, origin));

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
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(errorUrl);
    }

    // Log successful authentication (for debugging)
    if (data.user) {
      console.log('User authenticated:', data.user.email);
      
      // Check if this is a new user (first sign in)
      const isNewUser = data.user.created_at === data.user.last_sign_in_at;
      
      if (isNewUser) {
        // For new OAuth users, ensure profile is created
        // The database trigger should handle this, but we can add additional logic here
        console.log('New user registered via OAuth:', data.user.email);
      }
    }

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'Authentication failed. Please try again.');
    return NextResponse.redirect(errorUrl);
  }
}
