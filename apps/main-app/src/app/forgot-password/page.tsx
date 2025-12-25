'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@tbk/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@tbk/auth';
import { AuthLayout } from '@/components/auth';

/**
 * Forgot Password Page
 * 
 * Features:
 * - Email input for password reset
 * - Success state with instructions
 * - Rate limiting awareness
 * - Back to login link
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Validate email
   */
  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError('Invalid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Handle rate limiting
        if (error.message.includes('rate limit')) {
          toast.error('Too many requests. Please try again later.');
        } else {
          toast.error(error.message || 'Failed to send reset email. Please try again.');
        }
        return;
      }

      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle email change
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  // Success state
  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you a password reset link"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-gray-300">
              We sent a password reset link to:
            </p>
            <p className="font-medium text-white">{email}</p>
          </div>

          <div className="text-sm text-gray-400 space-y-2">
            <p>
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>
            <p>
              If you don&apos;t see the email, check your spam folder.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
            >
              Try a different email
            </Button>
            <Link href="/login" className="block">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      showBackToHome={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`pl-10 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-500 ${
                emailError ? 'border-red-500' : ''
              }`}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          {emailError && (
            <p className="text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </Button>

        {/* Back to Login */}
        <Link href="/login" className="block">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
