'use client';

import { useState, forwardRef } from 'react';
import { Input, Label } from '@tbk/ui';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showStrengthIndicator?: boolean;
}

/**
 * Password input component with visibility toggle
 * Optionally shows password strength indicator
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = 'Password', error, showStrengthIndicator = false, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState(0);

    const calculateStrength = (password: string): number => {
      let score = 0;
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^a-zA-Z0-9]/.test(password)) score++;
      return Math.min(score, 5);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthIndicator) {
        setStrength(calculateStrength(e.target.value));
      }
      props.onChange?.(e);
    };

    const getStrengthColor = (level: number): string => {
      if (strength === 0) return 'bg-gray-600';
      if (level <= strength) {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
      }
      return 'bg-gray-600';
    };

    const getStrengthText = (): string => {
      if (strength === 0) return '';
      if (strength <= 2) return 'Weak';
      if (strength <= 3) return 'Fair';
      if (strength <= 4) return 'Good';
      return 'Strong';
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-white">
            {label}
          </Label>
        )}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`pl-10 pr-10 bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-gray-500 ${
              error ? 'border-red-500' : ''
            } ${className}`}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && props.value && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${getStrengthColor(level)}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Password strength: <span className="font-medium">{getStrengthText()}</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
