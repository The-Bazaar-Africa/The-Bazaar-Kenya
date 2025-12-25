/**
 * Create Admin Staff API Route
 * ==============================
 * Server-side endpoint for creating admin staff accounts.
 * Only accessible by super_admin users.
 *
 * Security:
 * - Validates super_admin role before proceeding
 * - Uses service role key for user creation
 * - Sets must_change_password flag
 * - Creates audit log entry
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

    // Create client with user's session to verify permissions
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Not needed for this operation
          },
        },
      }
    );

    // Verify the requesting user is a super_admin
    const { data: { session } } = await supabaseUser.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: No session' },
        { status: 401 }
      );
    }

    const { data: requestingUser } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only super admins can create admin staff' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password, fullName, phone, title, role } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, fullName' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or super_admin' },
        { status: 400 }
      );
    }

    // Create admin client with service role key
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

    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin accounts
      user_metadata: {
        full_name: fullName,
        phone,
        title,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Wait for trigger to create profile, then update it
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile with admin role and force password change
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role,
        full_name: fullName,
        phone,
        title,
        must_change_password: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile error:', profileError);
      // Don't fail the request, but log the error
    }

    // Create audit log entry
    await supabaseAdmin.from('admin_audit_logs').insert({
      admin_id: session.user.id,
      action: 'ADMIN_STAFF_CREATED',
      details: {
        created_user_id: authData.user.id,
        created_user_email: email,
        created_user_role: role,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
