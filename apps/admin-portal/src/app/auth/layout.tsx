/**
 * Admin Portal Auth Layout
 * =========================
 * Secure authentication layout for admin portal.
 * Email/Password ONLY - No OAuth for admin accounts.
 *
 * @see ADR-001: Backend Authority
 */

import { ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">The Bazaar</h1>
              <p className="text-slate-400 text-sm">Admin Control Center</p>
            </div>
          </div>
        </div>

        {/* Security Message */}
        <div className="relative z-10 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-4">
              Secure Administrative Access
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              This portal provides complete control over The Bazaar platform. 
              Access is restricted to authorized administrators only.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-red-400 font-semibold text-sm">User Management</p>
              <p className="text-slate-400 text-xs mt-1">Customers & Vendors</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-red-400 font-semibold text-sm">Platform Control</p>
              <p className="text-slate-400 text-xs mt-1">Settings & Config</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-red-400 font-semibold text-sm">Order Oversight</p>
              <p className="text-slate-400 text-xs mt-1">Disputes & Refunds</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <p className="text-red-400 font-semibold text-sm">Analytics</p>
              <p className="text-slate-400 text-xs mt-1">Reports & Insights</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>All sessions are monitored and logged for security</span>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">The Bazaar</h1>
              <p className="text-slate-400 text-xs">Admin Portal</p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-6">
            &copy; {new Date().getFullYear()} The Bazaar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
