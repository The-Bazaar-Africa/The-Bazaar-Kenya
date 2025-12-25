'use client';

/**
 * Admin Portal Control Console - Overview
 * =========================================
 * Dashboard for managing admin operations:
 * - Staff members and roles
 * - Tasks and workflows
 * - System performance
 * - Audit and compliance
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
  UserCog,
  Lock,
  ClipboardList,
  Activity,
  Eye,
  Settings,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Server,
  Database,
  Cpu,
} from 'lucide-react';

interface AdminStats {
  totalStaff: number;
  activeStaff: number;
  pendingTasks: number;
  completedTasks: number;
  totalRoles: number;
  recentLogins: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminPortalOverviewPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalStaff: 0,
    activeStaff: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalRoles: 4,
    recentLogins: 0,
    systemHealth: 'healthy',
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
        // Fetch admin staff count
        const { count: staffCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('role', ['admin', 'super_admin']);

        setStats({
          totalStaff: staffCount || 0,
          activeStaff: staffCount || 0,
          pendingTasks: 5,
          completedTasks: 23,
          totalRoles: 4,
          recentLogins: staffCount || 0,
          systemHealth: 'healthy',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

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

  const SystemHealthIndicator = () => {
    const healthColors = {
      healthy: 'bg-green-500',
      warning: 'bg-amber-500',
      critical: 'bg-red-500',
    };

    const healthLabels = {
      healthy: 'All Systems Operational',
      warning: 'Some Issues Detected',
      critical: 'Critical Issues',
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">System Health</h3>
          <div className={`w-3 h-3 ${healthColors[stats.systemHealth]} rounded-full animate-pulse`} />
        </div>
        <p className="text-sm text-slate-600 mb-4">{healthLabels[stats.systemHealth]}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">API Server</span>
            </div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Database</span>
            </div>
            <span className="text-sm font-medium text-green-600">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">CPU Usage</span>
            </div>
            <span className="text-sm font-medium text-green-600">23%</span>
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
        <h1 className="text-2xl font-bold text-slate-900">Admin Portal Control</h1>
        <p className="text-slate-600 mt-1">
          Manage staff, roles, tasks, and system administration.
        </p>
      </div>

      {/* Super Admin Notice */}
      <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-700" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-900">Super Admin Console</p>
          <p className="text-sm text-red-700">
            Full access to all administrative functions. All actions are logged for audit compliance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Admin Staff"
          value={stats.totalStaff.toLocaleString()}
          icon={UserCog}
          color="bg-red-500"
          href="/dashboard/admin-portal/staff"
        />
        <StatCard
          title="Active Roles"
          value={stats.totalRoles.toLocaleString()}
          icon={Lock}
          color="bg-purple-500"
          href="/dashboard/admin-portal/roles"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toLocaleString()}
          icon={ClipboardList}
          color="bg-amber-500"
          href="/dashboard/admin-portal/tasks"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks.toLocaleString()}
          icon={CheckCircle}
          color="bg-green-500"
          href="/dashboard/admin-portal/tasks?status=completed"
        />
      </div>

      {/* Quick Actions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/admin-portal/staff"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <UserCog className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Manage Staff</p>
                <p className="text-sm text-slate-500">Add, edit, or remove admin staff</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </Link>

            <Link
              href="/dashboard/admin-portal/roles"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Roles & Permissions</p>
                <p className="text-sm text-slate-500">Configure access controls</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </Link>

            <Link
              href="/dashboard/admin-portal/audit-logs"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Audit Logs</p>
                <p className="text-sm text-slate-500">View all system activity</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </Link>

            <Link
              href="/dashboard/admin-portal/settings"
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">System Settings</p>
                <p className="text-sm text-slate-500">Configure platform settings</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </Link>
          </div>
        </div>

        <SystemHealthIndicator />
      </div>

      {/* Recent Admin Activity */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Admin Activity</h2>
          <Link href="/dashboard/admin-portal/audit-logs" className="text-sm text-red-600 hover:text-red-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { icon: CheckCircle, color: 'text-green-500', title: 'Super Admin logged in', user: 'principal@thebazaar.co.ke', time: 'Just now' },
            { icon: UserCog, color: 'text-blue-500', title: 'New admin staff created', user: 'System', time: '1 hour ago' },
            { icon: Lock, color: 'text-purple-500', title: 'Role permissions updated', user: 'Super Admin', time: '2 hours ago' },
            { icon: AlertTriangle, color: 'text-amber-500', title: 'Failed login attempt detected', user: 'Unknown', time: '3 hours ago' },
            { icon: Settings, color: 'text-slate-500', title: 'System settings modified', user: 'Super Admin', time: '5 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-4">
              <activity.icon className={`w-5 h-5 ${activity.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                <p className="text-xs text-slate-500">{activity.user}</p>
              </div>
              <span className="text-sm text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
