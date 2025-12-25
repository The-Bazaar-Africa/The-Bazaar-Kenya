'use client';

/**
 * Placeholder Page Component
 * ===========================
 * Reusable component for pages under construction.
 * Shows a professional "coming soon" message with context.
 */

import Link from 'next/link';
import { Construction, ArrowLeft, Clock } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  console: 'main-app' | 'vendor-portal' | 'admin-portal' | 'service-providers';
  features?: string[];
  backHref?: string;
}

const consoleColors = {
  'main-app': 'bg-blue-500',
  'vendor-portal': 'bg-purple-500',
  'admin-portal': 'bg-red-500',
  'service-providers': 'bg-emerald-500',
};

const consoleNames = {
  'main-app': 'Main App Control',
  'vendor-portal': 'Vendor Portal Control',
  'admin-portal': 'Admin Portal Control',
  'service-providers': 'Service Providers Control',
};

export default function PlaceholderPage({
  title,
  description,
  console,
  features = [],
  backHref,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Back Link */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {consoleNames[console]}
        </Link>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-1">{description}</p>
      </div>

      {/* Under Construction Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`${consoleColors[console]} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <Construction className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">Page Under Development</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">Coming Soon</h3>
              <p className="text-slate-600 mb-4">
                This page is currently being developed as part of the enterprise admin portal.
                Full functionality will be available in the next release.
              </p>
              
              {features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Planned Features:</p>
                  <ul className="space-y-1">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className={`w-1.5 h-1.5 ${consoleColors[console]} rounded-full`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/dashboard/${console}`}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all"
        >
          <div className={`w-10 h-10 ${consoleColors[console]} rounded-lg flex items-center justify-center`}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">Return to Overview</p>
            <p className="text-sm text-slate-500">Go back to {consoleNames[console]}</p>
          </div>
        </Link>
        
        <Link
          href="/dashboard/admin-portal/audit-logs"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-slate-500 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">View Activity</p>
            <p className="text-sm text-slate-500">Check recent system activity</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
