'use client';

/**
 * Main App Control Console - Overview
 * =====================================
 * Dashboard for managing the main e-commerce app:
 * - Customer/Buyer management
 * - Orders and transactions
 * - Product analytics
 * - Financial overview
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Activity,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface MainAppStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
  revenueChange: number;
  ordersChange: number;
}

export default function MainAppOverviewPage() {
  const [stats, setStats] = useState<MainAppStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    revenueChange: 12.5,
    ordersChange: 8.3,
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
        // Fetch user counts
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('role', ['customer', 'buyer']);

        // Fetch orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Fetch pending orders
        const { count: pendingOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('payment_status', 'paid');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        setStats({
          totalUsers: usersCount || 0,
          activeUsers: Math.floor((usersCount || 0) * 0.7),
          totalOrders: ordersCount || 0,
          pendingOrders: pendingOrdersCount || 0,
          totalProducts: productsCount || 0,
          totalRevenue,
          revenueChange: 12.5,
          ordersChange: 8.3,
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
    change,
    icon: Icon,
    color,
    href,
  }: {
    title: string;
    value: string | number;
    change?: number;
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
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
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

  const QuickAction = ({
    title,
    description,
    icon: Icon,
    href,
    color,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
  }) => (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
    </Link>
  );

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
        <h1 className="text-2xl font-bold text-slate-900">Main App Control</h1>
        <p className="text-slate-600 mt-1">
          Manage customers, orders, products, and platform analytics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          href="/dashboard/main-app/users"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={ShoppingCart}
          color="bg-green-500"
          href="/dashboard/main-app/orders"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-purple-500"
          href="/dashboard/main-app/products"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={DollarSign}
          color="bg-amber-500"
          href="/dashboard/main-app/finances"
        />
      </div>

      {/* Alerts */}
      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {stats.pendingOrders} Pending Order{stats.pendingOrders > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-amber-700">Orders awaiting processing</p>
          </div>
          <Link
            href="/dashboard/main-app/orders?status=pending"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            View Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Manage Users"
            description="View and manage customer accounts"
            icon={Users}
            href="/dashboard/main-app/users"
            color="bg-blue-500"
          />
          <QuickAction
            title="View Orders"
            description="Track and manage all orders"
            icon={ShoppingCart}
            href="/dashboard/main-app/orders"
            color="bg-green-500"
          />
          <QuickAction
            title="Product Catalog"
            description="Manage products and inventory"
            icon={Package}
            href="/dashboard/main-app/products"
            color="bg-purple-500"
          />
          <QuickAction
            title="Analytics"
            description="View platform performance metrics"
            icon={Activity}
            href="/dashboard/main-app/analytics"
            color="bg-indigo-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { icon: CheckCircle, color: 'text-green-500', title: 'Order #1234 completed', time: '5 min ago' },
            { icon: Users, color: 'text-blue-500', title: 'New user registered', time: '12 min ago' },
            { icon: ShoppingCart, color: 'text-purple-500', title: 'Order #1235 placed', time: '25 min ago' },
            { icon: AlertCircle, color: 'text-amber-500', title: 'Payment pending for Order #1230', time: '1 hour ago' },
            { icon: XCircle, color: 'text-red-500', title: 'Order #1228 cancelled', time: '2 hours ago' },
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
        <div className="px-6 py-4 border-t border-slate-100">
          <Link
            href="/dashboard/admin-portal/audit-logs"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all activity →
          </Link>
        </div>
      </div>
    </div>
  );
}
