'use client';

import { Separator } from '@tbk/ui';

interface AuthDividerProps {
  text?: string;
}

/**
 * Divider component for auth pages
 * Shows "or continue with" style separator
 */
export function AuthDivider({ text = 'or continue with' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full bg-netflix-medium-gray" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-netflix-dark-gray px-2 text-gray-400">{text}</span>
      </div>
    </div>
  );
}
