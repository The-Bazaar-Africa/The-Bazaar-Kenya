'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Label, Checkbox } from '@tbk/ui';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@tbk/auth';
import {
  AuthLayout,
  AuthDivider,
  GoogleOAuthButton,
  PasswordInput,
} from '@/components/auth';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Login Client Component
 * 
 * Features:
 * - Email/Password authentication
 * - Google OAuth
 * - Remember me functionality
 * - Redirect after login
 * - Form validation
 * - Error handling
 */
export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    setIsLoading(true);

    try {
      const supabase = createBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in.');
        } else {
          toast.error(error.message || 'Failed to sign in. Please try again.');
        }
        return;
      }

      if (data.user) {
        toast.success('Welcome back!');
        router.push(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue shopping"
      showBackToHome={false}
    >
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`pl-10 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                handleChange('rememberMe', checked as boolean)
              }
              className="border-netflix-medium-gray data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-gray-400 cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-netflix-red hover:underline"
          >
            Forgot password?
          </Link>
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
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* OAuth Divider */}
      <AuthDivider />

      {/* Google OAuth Button */}
      <GoogleOAuthButton redirectTo={redirectTo} />

      {/* Sign Up Link */}
      <div className="text-center text-sm">
        <span className="text-gray-400">Don&apos;t have an account? </span>
        <Link href="/register" className="text-netflix-red hover:underline font-medium">
          Sign up
        </Link>
      </div>

      {/* Vendor Registration Link */}
      <div className="text-center text-sm pt-4 border-t border-netflix-medium-gray">
        <span className="text-gray-400">Want to sell? </span>
        <Link
          href="/vendors/register"
          className="text-netflix-red hover:underline font-medium"
        >
          Become a vendor
        </Link>
      </div>
    </AuthLayout>
  );
}
