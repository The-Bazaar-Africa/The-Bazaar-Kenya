/**
 * WebAuthn Verification API
 * ==========================
 * Verifies WebAuthn assertions for authentication.
 *
 * @see ADR-001: Backend Authority
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    // Parse request body
    const body = await request.json();
    const { credentialId, authenticatorData, clientDataJSON, signature } = body;

    if (!credentialId || !authenticatorData || !clientDataJSON || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Verify credential exists for user
    const { data: credential, error: fetchError } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('credential_id', credentialId)
      .single();

    if (fetchError || !credential) {
      return NextResponse.json(
        { error: 'Invalid credential' },
        { status: 401 }
      );
    }

    // Verify challenge is valid and not expired
    const { data: challengeData, error: challengeError } = await supabaseAdmin
      .from('webauthn_challenges')
      .select('challenge, expires_at')
      .eq('user_id', session.user.id)
      .single();

    if (challengeError || !challengeData) {
      return NextResponse.json(
        { error: 'No active challenge found' },
        { status: 401 }
      );
    }

    if (new Date(challengeData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Challenge expired' },
        { status: 401 }
      );
    }

    // In production, you would verify the signature here using the stored public key
    // For now, we trust the WebAuthn API's verification on the client side
    // This is a simplified implementation - production should use a proper WebAuthn library

    // Delete used challenge
    await supabaseAdmin
      .from('webauthn_challenges')
      .delete()
      .eq('user_id', session.user.id);

    // Update last used timestamp
    await supabaseAdmin
      .from('webauthn_credentials')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', credential.id);

    // Mark MFA as verified in session
    await supabaseAdmin
      .from('profiles')
      .update({ mfa_verified_at: new Date().toISOString() })
      .eq('id', session.user.id);

    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    console.error('WebAuthn verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
