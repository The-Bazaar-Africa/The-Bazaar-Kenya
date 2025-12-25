'use client';

/**
 * Service Providers Control Console - Overview
 * ==============================================
 * Dashboard for managing 3rd party integrations:
 * - Logistics providers (Sendy, DHL, FedEx)
 * - Payment gateways (Paystack)
 * - Commissions and payables
 * - Service complaints
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  CreditCard,
  Layers,
  Wallet,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Activity,
  Globe,
  Package,
  DollarSign,
} from 'lucide-react';

interface ServiceStats {
  activeProviders: number;
  totalTransactions: number;
  pendingPayouts: number;
  openComplaints: number;
  totalCommissions: number;
}

export default function ServiceProvidersOverviewPage() {
  const [stats, setStats] = useState<ServiceStats>({
    activeProviders: 2,
    totalTransactions: 0,
    pendingPayouts: 0,
    openComplaints: 0,
    totalCommissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats({
        activeProviders: 2,
        totalTransactions: 156,
        pendingPayouts: 3,
        openComplaints: 1,
        totalCommissions: 45000,
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    href?: string;
  }) => {
    const content = (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500 mt-1">{title}</p>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  const ServiceProviderCard = ({
    name,
    type,
    status,
    logo,
    transactions,
    lastSync,
  }: {
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'pending';
    logo: string;
    transactions: number;
    lastSync: string;
  }) => {
    const statusColors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-slate-100 text-slate-700',
      pending: 'bg-amber-100 text-amber-700',
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
              {logo}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">{type}</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-sm text-slate-500">Transactions</p>
            <p className="font-semibold text-slate-900">{transactions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Last Sync</p>
            <p className="font-semibold text-slate-900">{lastSync}</p>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-slate-900">Service Providers Control</h1>
        <p className="text-slate-600 mt-1">
          Manage logistics, payment gateways, and third-party integrations.
        </p>
      </div>

      {/* MVP Notice */}
      <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
          <Globe className="w-6 h-6 text-emerald-700" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-emerald-900">MVP Phase - Local Operations</p>
          <p className="text-sm text-emerald-700">
            Currently integrated with Paystack for payments. Logistics (Sendy) and international shipping (DHL, FedEx) will be added in Phase 2.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Providers"
          value={stats.activeProviders}
          icon={Layers}
          color="bg-emerald-500"
          href="/dashboard/service-providers/integrations"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          icon={Activity}
          color="bg-blue-500"
          href="/dashboard/service-providers/payments"
        />
        <StatCard
          title="Pending Payouts"
          value={stats.pendingPayouts}
          icon={Clock}
          color="bg-amber-500"
          href="/dashboard/service-providers/commissions"
        />
        <StatCard
          title="Total Commissions"
          value={formatCurrency(stats.totalCommissions)}
          icon={DollarSign}
          color="bg-green-500"
          href="/dashboard/service-providers/commissions"
        />
      </div>

      {/* Active Service Providers */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ServiceProviderCard
            name="Paystack"
            type="Payment Gateway"
            status="active"
            logo="💳"
            transactions={156}
            lastSync="2 min ago"
          />
          <ServiceProviderCard
            name="Sendy"
            type="Logistics Provider"
            status="pending"
            logo="🚚"
            transactions={0}
            lastSync="Not connected"
          />
          <ServiceProviderCard
            name="DHL Express"
            type="International Shipping"
            status="inactive"
            logo="📦"
            transactions={0}
            lastSync="Phase 2"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/service-providers/payments"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Payment Transactions</p>
            <p className="text-sm text-slate-500">View all payment activity</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>

        <Link
          href="/dashboard/service-providers/logistics"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Logistics Overview</p>
            <p className="text-sm text-slate-500">Track deliveries and providers</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>

        <Link
          href="/dashboard/service-providers/reports"
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Generate Reports</p>
            <p className="text-sm text-slate-500">Export provider analytics</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
          <Link href="/dashboard/service-providers/payments" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { icon: CheckCircle, color: 'text-green-500', title: 'Payment received - KES 2,500', provider: 'Paystack', time: '5 min ago' },
            { icon: CheckCircle, color: 'text-green-500', title: 'Payment received - KES 8,750', provider: 'Paystack', time: '15 min ago' },
            { icon: CheckCircle, color: 'text-green-500', title: 'Payment received - KES 1,200', provider: 'Paystack', time: '32 min ago' },
            { icon: Clock, color: 'text-amber-500', title: 'Payment pending - KES 5,000', provider: 'Paystack', time: '1 hour ago' },
            { icon: CheckCircle, color: 'text-green-500', title: 'Payment received - KES 15,000', provider: 'Paystack', time: '2 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                <p className="text-xs text-slate-500">{activity.provider}</p>
              </div>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
