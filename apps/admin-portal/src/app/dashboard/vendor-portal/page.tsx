'use client';

/**
 * Vendor Portal Control Console - Overview
 * ==========================================
 * Dashboard for managing the vendor ecosystem:
 * - Vendor accounts and KYC
 * - Applications and approvals
 * - Subscriptions and promotions
 * - Disputes and support
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
  Store,
  ClipboardList,
  CheckSquare,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Wallet,
  Activity,
} from 'lucide-react';

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  pendingApplications: number;
  pendingKYC: number;
  activeSubscriptions: number;
  openDisputes: number;
  totalPayables: number;
}

export default function VendorPortalOverviewPage() {
  const [stats, setStats] = useState<VendorStats>({
    totalVendors: 0,
    activeVendors: 0,
    pendingApplications: 0,
    pendingKYC: 0,
    activeSubscriptions: 0,
    openDisputes: 0,
    totalPayables: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'api' } }
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total vendors
        const { count: vendorsCount } = await supabase
          .from('vendors')
          .select('*', { count: 'exact', head: true });

        // Fetch active vendors
        const { count: activeVendorsCount } = await supabase
          .from('vendors')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch pending applications
        const { count: pendingCount } = await supabase
          .from('vendors')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch open disputes
        const { count: disputesCount } = await supabase
          .from('disputes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        setStats({
          totalVendors: vendorsCount || 0,
          activeVendors: activeVendorsCount || 0,
          pendingApplications: pendingCount || 0,
          pendingKYC: Math.floor((pendingCount || 0) * 0.5),
          activeSubscriptions: activeVendorsCount || 0,
          openDisputes: disputesCount || 0,
          totalPayables: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    href,
    alert,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    href?: string;
    alert?: boolean;
  }) => {
    const content = (
      <div className={`bg-white rounded-xl p-6 shadow-sm border ${alert ? 'border-amber-300' : 'border-slate-100'} hover:shadow-md transition-all`}>
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {alert && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              Action Required
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500 mt-1">{title}</p>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-xl" />
              <div className="mt-4 space-y-2">
                <div className="h-8 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Portal Control</h1>
        <p className="text-slate-600 mt-1">
          Manage vendors, applications, KYC verification, and vendor support.
        </p>
      </div>

      {/* Alert Cards */}
      {(stats.pendingApplications > 0 || stats.openDisputes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingApplications > 0 && (
            <Link
              href="/dashboard/vendor-portal/applications"
              className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  {stats.pendingApplications} Pending Application{stats.pendingApplications > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700">Awaiting review and approval</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-600" />
            </Link>
          )}
          {stats.openDisputes > 0 && (
            <Link
              href="/dashboard/vendor-portal/disputes"
              className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
            >
              <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  {stats.openDisputes} Open Dispute{stats.openDisputes > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-700">Requires immediate attention</p>
              </div>
              <ArrowRight className="w-5 h-5 text-red-600" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors.toLocaleString()}
          icon={Store}
          color="bg-purple-500"
          href="/dashboard/vendor-portal/vendors"
        />
        <StatCard
          title="Active Vendors"
          value={stats.activeVendors.toLocaleString()}
          icon={UserCheck}
          color="bg-green-500"
          href="/dashboard/vendor-portal/vendors?status=active"
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications.toLocaleString()}
          icon={ClipboardList}
          color="bg-amber-500"
          href="/dashboard/vendor-portal/applications"
          alert={stats.pendingApplications > 0}
        />
        <StatCard
          title="Pending KYC"
          value={stats.pendingKYC.toLocaleString()}
          icon={CheckSquare}
          color="bg-blue-500"
          href="/dashboard/vendor-portal/kyc"
          alert={stats.pendingKYC > 0}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/vendor-portal/applications"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Review Applications</p>
            <p className="text-sm text-slate-500">Approve or reject vendor applications</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>

        <Link
          href="/dashboard/vendor-portal/kyc"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">KYC Verification</p>
            <p className="text-sm text-slate-500">Verify vendor documents</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>

        <Link
          href="/dashboard/vendor-portal/payables"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Vendor Payables</p>
            <p className="text-sm text-slate-500">Manage vendor payments</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>
      </div>

      {/* Vendor Performance */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Vendor Activity</h2>
          <Link href="/dashboard/vendor-portal/vendors" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { icon: CheckCircle, color: 'text-green-500', title: 'Fashion Hub Kenya approved', time: '10 min ago' },
            { icon: ClipboardList, color: 'text-purple-500', title: 'New application from Tech Gadgets', time: '25 min ago' },
            { icon: Activity, color: 'text-blue-500', title: 'Electronics Plus subscription renewed', time: '1 hour ago' },
            { icon: AlertTriangle, color: 'text-amber-500', title: 'Dispute opened for Home Essentials', time: '2 hours ago' },
            { icon: XCircle, color: 'text-red-500', title: 'Quick Mart application rejected', time: '3 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
              </div>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
