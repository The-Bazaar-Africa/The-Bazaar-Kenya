/**
 * WebAuthn Challenge API
 * =======================
 * Generates a challenge for WebAuthn authentication.
 *
 * @see ADR-001: Backend Authority
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Create client with user's session
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    // Verify user is authenticated
    const { data: { session } } = await supabaseUser.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get stored credentials for user
    const { data: credentials, error: fetchError } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('credential_id, transports')
      .eq('user_id', session.user.id);

    if (fetchError || !credentials || credentials.length === 0) {
      return NextResponse.json(
        { error: 'No WebAuthn credentials found' },
        { status: 404 }
      );
    }

    // Generate challenge
    const challenge = crypto.randomBytes(32).toString('base64');

    // Store challenge temporarily (expires in 5 minutes)
    const { error: challengeError } = await supabaseAdmin
      .from('webauthn_challenges')
      .upsert({
        user_id: session.user.id,
        challenge,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (challengeError) {
      console.error('Challenge storage error:', challengeError);
    }

    return NextResponse.json({
      challenge,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credential_id,
        transports: cred.transports,
      })),
    });
  } catch (error: any) {
    console.error('WebAuthn challenge error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
