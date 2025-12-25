'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@tbk/auth';

/**
 * Root Providers Component
 * 
 * Wraps the application with all necessary providers:
 * - AuthProvider: Supabase authentication context
 * - QueryClientProvider: React Query for data fetching
 * - Toaster: Toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: 'bg-netflix-dark-gray border-netflix-medium-gray',
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}
