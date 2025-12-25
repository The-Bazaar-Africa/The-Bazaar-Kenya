'use client';

/**
 * MFA Setup Page
 * ===============
 * Allows admins to set up Multi-Factor Authentication using:
 * - TOTP (Google Authenticator, Authy, etc.)
 * - WebAuthn (Fingerprint, Face ID, Windows Hello, Security Keys)
 *
 * @see ADR-001: Backend Authority
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Shield,
  Smartphone,
  Fingerprint,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  RefreshCw,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';

type MFAMethod = 'totp' | 'webauthn' | null;

export default function MFASetupPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // TOTP State
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // WebAuthn State
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check WebAuthn support
    setWebAuthnSupported(
      typeof window !== 'undefined' &&
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential === 'function'
    );
  }, []);

  const handleSelectTOTP = async () => {
    setSelectedMethod('totp');
    setIsLoading(true);
    setError(null);

    try {
      // Enroll TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) throw error;

      if (data) {
        setTotpFactorId(data.id);
        setTotpSecret(data.totp.secret);

        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(data.totp.uri);
        setTotpQrCode(qrCodeDataUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set up TOTP');
      setSelectedMethod(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!totpFactorId || verificationCode.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create a challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: totpFactorId,
        });

      if (challengeError) throw challengeError;

      // Verify the code
      const { data: verifyData, error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId: totpFactorId,
          challengeId: challengeData.id,
          code: verificationCode,
        });

      if (verifyError) throw verifyError;

      // Update profile to mark MFA as enabled
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          mfa_enabled: true,
          mfa_method: 'totp',
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);

        // Log the MFA setup
        await supabase.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'MFA_ENABLED',
          details: {
            method: 'totp',
            timestamp: new Date().toISOString(),
          },
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWebAuthn = async () => {
    setSelectedMethod('webauthn');
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create WebAuthn credential options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'The Bazaar Admin',
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(user.id, (c) => c.charCodeAt(0)),
          name: user.email || '',
          displayName: user.user_metadata?.full_name || user.email || '',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Failed to create credential');

      // Store credential info in database
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey()!)));

      // Save to database via API
      const saveResponse = await fetch('/api/admin/mfa/webauthn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId,
          publicKey,
          transports: response.getTransports?.() || [],
        }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json();
        throw new Error(data.error || 'Failed to save credential');
      }

      // Update profile
      await supabase.from('profiles').update({
        mfa_enabled: true,
        mfa_method: 'webauthn',
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      // Log the MFA setup
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'MFA_ENABLED',
        details: {
          method: 'webauthn',
          timestamp: new Date().toISOString(),
        },
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('WebAuthn error:', err);
      setError(err.message || 'Failed to set up biometric authentication');
      setSelectedMethod(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">MFA Enabled Successfully</h1>
          <p className="text-slate-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Set Up Two-Factor Authentication
          </h1>
          <p className="text-slate-400">
            Add an extra layer of security to your admin account
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

        {/* Method Selection */}
        {!selectedMethod && (
          <div className="space-y-4">
            {/* TOTP Option */}
            <button
              onClick={handleSelectTOTP}
              disabled={isLoading}
              className="w-full p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Smartphone className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Authenticator App
                  </h3>
                  <p className="text-sm text-slate-400">
                    Use Google Authenticator, Authy, or any TOTP-compatible app
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </button>

            {/* WebAuthn Option */}
            <button
              onClick={handleSelectWebAuthn}
              disabled={isLoading || !webAuthnSupported}
              className={`w-full p-6 bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors group ${
                webAuthnSupported
                  ? 'hover:bg-slate-700'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Fingerprint className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Device Biometrics
                  </h3>
                  <p className="text-sm text-slate-400">
                    {webAuthnSupported
                      ? 'Use fingerprint, Face ID, or Windows Hello'
                      : 'Not supported on this device/browser'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </button>
          </div>
        )}

        {/* TOTP Setup */}
        {selectedMethod === 'totp' && totpQrCode && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold text-white mb-4">
              Scan QR Code with Your Authenticator App
            </h3>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-lg">
                <img src={totpQrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="mb-6">
              <p className="text-sm text-slate-400 mb-2">
                Or enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-slate-700 rounded-lg text-amber-400 font-mono text-sm break-all">
                  {totpSecret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Verification */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter the 6-digit code from your app
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setTotpSecret(null);
                  setTotpQrCode(null);
                  setVerificationCode('');
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyTOTP}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {/* WebAuthn Setup Loading */}
        {selectedMethod === 'webauthn' && isLoading && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full mb-4 animate-pulse">
              <Fingerprint className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-semibold text-white mb-2">
              Setting Up Biometric Authentication
            </h3>
            <p className="text-slate-400 text-sm">
              Please follow the prompts on your device...
            </p>
          </div>
        )}

        {/* Skip Option */}
        {!selectedMethod && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip for now (not recommended)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
