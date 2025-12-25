'use client';

/**
 * Vendor Pending Approval Page
 * =============================
 * Shown to vendors who have completed registration but are awaiting admin approval.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Clock, CheckCircle, Mail, Phone, LogOut, RefreshCw } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vendorName, setVendorName] = useState<string>('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchVendorInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('vendor_id')
        .eq('id', session.user.id)
        .single();

      if (profile?.vendor_id) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('business_name, status')
          .eq('id', profile.vendor_id)
          .single();

        if (vendor) {
          setVendorName(vendor.business_name);

          // If already approved, redirect to dashboard
          if (vendor.status === 'approved' || vendor.status === 'active') {
            router.push('/dashboard');
          }
        }
      }
    };

    fetchVendorInfo();
  }, [supabase, router]);

  const handleCheckStatus = async () => {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('vendor_id')
      .eq('id', session.user.id)
      .single();

    if (profile?.vendor_id) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('status')
        .eq('id', profile.vendor_id)
        .single();

      if (vendor?.status === 'approved' || vendor?.status === 'active') {
        router.push('/dashboard');
        return;
      }
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Status Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h1>
          {vendorName && (
            <p className="text-lg text-gray-600 mb-4">{vendorName}</p>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Thank you for registering as a vendor on The Bazaar! Our team is reviewing your application.
            This usually takes 1-2 business days.
          </p>

          {/* Status Steps */}
          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Account created</p>
                <p className="text-sm text-gray-500">Your account has been successfully created</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Business information submitted</p>
                <p className="text-sm text-gray-500">Your business details are on file</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pending verification</p>
                <p className="text-sm text-gray-500">Our team is reviewing your application</p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-gray-500">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Start selling</p>
                <p className="text-sm text-gray-500">List your products and start earning</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Check Status
                </>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Need help? Contact our vendor support team:</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:vendors@thebazaar.co.ke"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                vendors@thebazaar.co.ke
              </a>
              <a
                href="tel:+254700000000"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                +254 700 000 000
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} The Bazaar. All rights reserved.
        </p>
      </div>
    </div>
  );
}
