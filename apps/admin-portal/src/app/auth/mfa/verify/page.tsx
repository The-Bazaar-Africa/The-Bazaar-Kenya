'use client';

/**
 * MFA Verification Page
 * ======================
 * Handles MFA verification during login flow.
 * Supports both TOTP and WebAuthn verification.
 *
 * @see ADR-001: Backend Authority
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Shield,
  Smartphone,
  Fingerprint,
  AlertCircle,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function MFAVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'webauthn' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkMFAFactors();
  }, []);

  const checkMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) throw error;

      // Find verified TOTP factor
      const totpFactor = data.totp.find((f) => f.status === 'verified');
      
      if (totpFactor) {
        setMfaMethod('totp');
        setFactorId(totpFactor.id);
      } else {
        // Check for WebAuthn (stored in profile)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('mfa_method')
            .eq('id', user.id)
            .single();

          if (profile?.mfa_method === 'webauthn') {
            setMfaMethod('webauthn');
          }
        }
      }
    } catch (err: any) {
      console.error('Error checking MFA factors:', err);
      setError('Failed to load MFA settings');
    }
  };

  const handleTOTPVerify = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) throw challengeError;

      // Verify
      const { data: verifyData, error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code: verificationCode,
        });

      if (verifyError) throw verifyError;

      // Log successful MFA verification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'MFA_VERIFIED',
          details: {
            method: 'totp',
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Redirect to dashboard or original destination
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAuthnVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get stored credential from database
      const response = await fetch('/api/admin/mfa/webauthn/challenge', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get challenge');
      }

      const { challenge, credentialId, allowCredentials } = await response.json();

      // Create assertion options
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0)),
        rpId: window.location.hostname,
        allowCredentials: allowCredentials.map((cred: any) => ({
          id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
          type: 'public-key',
          transports: cred.transports || ['internal'],
        })),
        userVerification: 'required',
        timeout: 60000,
      };

      // Get assertion
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Authentication cancelled');

      // Verify assertion
      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const verifyResponse = await fetch('/api/admin/mfa/webauthn/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.authenticatorData))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.clientDataJSON))),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.signature))),
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.error || 'Verification failed');
      }

      // Log successful MFA verification
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'MFA_VERIFIED',
        details: {
          method: 'webauthn',
          timestamp: new Date().toISOString(),
        },
      });

      // Redirect
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err: any) {
      console.error('WebAuthn error:', err);
      setError(err.message || 'Biometric verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-slate-400">
            Verify your identity to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* TOTP Verification */}
        {mfaMethod === 'totp' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Authenticator App</h3>
                <p className="text-sm text-slate-400">
                  Enter the code from your authenticator app
                </p>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="w-full px-4 py-4 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-3xl tracking-[0.5em] font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={handleTOTPVerify}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        )}

        {/* WebAuthn Verification */}
        {mfaMethod === 'webauthn' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Fingerprint className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Biometric Authentication</h3>
                <p className="text-sm text-slate-400">
                  Use your fingerprint or face to verify
                </p>
              </div>
            </div>

            <button
              onClick={handleWebAuthnVerify}
              disabled={isLoading}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Verifying...'
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Verify with Biometrics
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {!mfaMethod && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto mb-4" />
              <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto" />
            </div>
          </div>
        )}

        {/* Sign Out Option */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
