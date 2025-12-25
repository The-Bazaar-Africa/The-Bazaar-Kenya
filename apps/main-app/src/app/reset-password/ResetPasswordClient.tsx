'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@tbk/ui';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@tbk/auth';
import { AuthLayout, PasswordInput } from '@/components/auth';

type ResetState = 'loading' | 'form' | 'success' | 'error';

/**
 * Reset Password Client Component
 * 
 * Features:
 * - Password reset form with validation
 * - Password strength indicator
 * - Token verification
 * - Success/Error states
 */
export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<ResetState>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Verify the reset token on mount
   */
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const supabase = createBrowserClient();
        
        // Check if we have a valid session from the reset link
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setErrorMessage('Invalid or expired reset link. Please request a new one.');
          setState('error');
          return;
        }

        // If there's a session, the user can reset their password
        if (session) {
          setState('form');
        } else {
          // Check for error in URL (Supabase redirects with error params)
          const errorDescription = searchParams.get('error_description');
          if (errorDescription) {
            setErrorMessage(errorDescription);
            setState('error');
          } else {
            // No session and no error - might be a direct visit
            setErrorMessage('Invalid or expired reset link. Please request a new one.');
            setState('error');
          }
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setErrorMessage('An error occurred. Please try again.');
        setState('error');
      }
    };

    verifyToken();
  }, [searchParams]);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password. Please try again.');
        return;
      }

      // Sign out after password reset for security
      await supabase.auth.signOut();
      
      setState('success');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (field: 'password' | 'confirmPassword', value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Loading state
  if (state === 'loading') {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Verifying your reset link..."
        showBackToHome={false}
      >
        <div className="flex justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-netflix-red"
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
        </div>
      </AuthLayout>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <AuthLayout
        title="Reset Failed"
        subtitle="Unable to reset your password"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>

          {/* Error Message */}
          <p className="text-gray-300">{errorMessage}</p>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Link href="/forgot-password" className="block">
              <Button className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white">
                Request New Reset Link
              </Button>
            </Link>
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

  // Success state
  if (state === 'success') {
    return (
      <AuthLayout
        title="Password Reset"
        subtitle="Your password has been updated"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <p className="text-gray-300">
              Your password has been successfully reset.
            </p>
            <p className="text-sm text-gray-400">
              You can now sign in with your new password.
            </p>
          </div>

          {/* Sign In Button */}
          <div className="pt-4">
            <Link href="/login" className="block">
              <Button className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white">
                Sign In
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
      title="Reset Password"
      subtitle="Create a new password for your account"
      showBackToHome={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Field */}
        <PasswordInput
          id="password"
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          disabled={isSubmitting}
          autoComplete="new-password"
          showStrengthIndicator
          autoFocus
        />

        {/* Confirm Password Field */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
        >
          {isSubmitting ? (
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
              Resetting...
            </span>
          ) : (
            'Reset Password'
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
