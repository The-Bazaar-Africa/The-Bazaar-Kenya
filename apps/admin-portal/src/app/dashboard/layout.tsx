'use client';

/**
 * Admin Dashboard Layout - 4 Control Consoles
 * =============================================
 * Enterprise-grade layout with 4 separate control consoles:
 * 1. Main App Control - Customer/Buyer management
 * 2. Vendor Portal Control - Vendor management
 * 3. Admin Portal Control - Staff & system management
 * 4. Service Providers Control - 3rd party integrations
 * 
 * @see Enterprise Specification Document
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  AlertTriangle,
  FileText,
  Tag,
  UserCog,
  Truck,
  Globe,
  Wallet,
  ClipboardList,
  MessageSquare,
  Activity,
  PieChart,
  Building2,
  Headphones,
  CheckSquare,
  Lock,
  Eye,
  Layers,
  ChevronRight,
} from 'lucide-react';

// Console types
type ConsoleType = 'main-app' | 'vendor-portal' | 'admin-portal' | 'service-providers';

interface ConsoleConfig {
  id: ConsoleType;
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

// Console configurations
const consoles: ConsoleConfig[] = [
  {
    id: 'main-app',
    name: 'Main App Control',
    shortName: 'Main App',
    icon: Globe,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'Manage customers, orders, analytics & finances',
  },
  {
    id: 'vendor-portal',
    name: 'Vendor Portal Control',
    shortName: 'Vendors',
    icon: Store,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    description: 'Manage vendors, KYC, subscriptions & disputes',
  },
  {
    id: 'admin-portal',
    name: 'Admin Portal Control',
    shortName: 'Admin',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    description: 'Manage staff, roles, tasks & audit logs',
  },
  {
    id: 'service-providers',
    name: 'Service Providers Control',
    shortName: 'Services',
    icon: Truck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    description: 'Manage logistics, payments & integrations',
  },
];

// Navigation items per console
const navigationByConsole: Record<ConsoleType, { name: string; href: string; icon: React.ElementType; badge?: string }[]> = {
  'main-app': [
    { name: 'Overview', href: '/dashboard/main-app', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/main-app/users', icon: Users },
    { name: 'Orders', href: '/dashboard/main-app/orders', icon: ShoppingCart },
    { name: 'Products', href: '/dashboard/main-app/products', icon: Package },
    { name: 'Categories', href: '/dashboard/main-app/categories', icon: Tag },
    { name: 'Analytics', href: '/dashboard/main-app/analytics', icon: BarChart3 },
    { name: 'Finances', href: '/dashboard/main-app/finances', icon: Wallet },
    { name: 'Reviews', href: '/dashboard/main-app/reviews', icon: MessageSquare },
  ],
  'vendor-portal': [
    { name: 'Overview', href: '/dashboard/vendor-portal', icon: LayoutDashboard },
    { name: 'Vendors', href: '/dashboard/vendor-portal/vendors', icon: Store },
    { name: 'Applications', href: '/dashboard/vendor-portal/applications', icon: ClipboardList, badge: 'pending' },
    { name: 'KYC Verification', href: '/dashboard/vendor-portal/kyc', icon: CheckSquare },
    { name: 'Subscriptions', href: '/dashboard/vendor-portal/subscriptions', icon: CreditCard },
    { name: 'Promotions & Ads', href: '/dashboard/vendor-portal/promotions', icon: Activity },
    { name: 'Payables', href: '/dashboard/vendor-portal/payables', icon: Wallet },
    { name: 'Disputes', href: '/dashboard/vendor-portal/disputes', icon: AlertTriangle },
    { name: 'Support', href: '/dashboard/vendor-portal/support', icon: Headphones },
  ],
  'admin-portal': [
    { name: 'Overview', href: '/dashboard/admin-portal', icon: LayoutDashboard },
    { name: 'Staff Members', href: '/dashboard/admin-portal/staff', icon: UserCog },
    { name: 'Roles & Permissions', href: '/dashboard/admin-portal/roles', icon: Lock },
    { name: 'Tasks', href: '/dashboard/admin-portal/tasks', icon: ClipboardList },
    { name: 'Performance', href: '/dashboard/admin-portal/performance', icon: PieChart },
    { name: 'Audit Logs', href: '/dashboard/admin-portal/audit-logs', icon: Eye },
    { name: 'System Health', href: '/dashboard/admin-portal/system', icon: Activity },
    { name: 'Settings', href: '/dashboard/admin-portal/settings', icon: Settings },
  ],
  'service-providers': [
    { name: 'Overview', href: '/dashboard/service-providers', icon: LayoutDashboard },
    { name: 'Logistics', href: '/dashboard/service-providers/logistics', icon: Truck },
    { name: 'Payment Gateways', href: '/dashboard/service-providers/payments', icon: CreditCard },
    { name: 'Integrations', href: '/dashboard/service-providers/integrations', icon: Layers },
    { name: 'Commissions', href: '/dashboard/service-providers/commissions', icon: Wallet },
    { name: 'Complaints', href: '/dashboard/service-providers/complaints', icon: AlertTriangle },
    { name: 'Reports', href: '/dashboard/service-providers/reports', icon: FileText },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  avatarUrl?: string;
}

// Context for console state
const ConsoleContext = createContext<{
  activeConsole: ConsoleType;
  setActiveConsole: (console: ConsoleType) => void;
}>({
  activeConsole: 'main-app',
  setActiveConsole: () => {},
});

export const useConsole = () => useContext(ConsoleContext);

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [consoleSwitcherOpen, setConsoleSwitcherOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  
  // Determine active console from URL
  const getActiveConsoleFromPath = (): ConsoleType => {
    if (pathname.includes('/dashboard/vendor-portal')) return 'vendor-portal';
    if (pathname.includes('/dashboard/admin-portal')) return 'admin-portal';
    if (pathname.includes('/dashboard/service-providers')) return 'service-providers';
    if (pathname.includes('/dashboard/main-app')) return 'main-app';
    // Default to main-app for /dashboard
    return 'main-app';
  };
  
  const [activeConsole, setActiveConsole] = useState<ConsoleType>(getActiveConsoleFromPath());

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: 'api' } }
  );

  useEffect(() => {
    setActiveConsole(getActiveConsoleFromPath());
  }, [pathname]);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setAdminInfo({
          id: session.user.id,
          name: profile.full_name || 'Administrator',
          email: session.user.email || '',
          role: profile.role as 'admin' | 'super_admin',
          avatarUrl: profile.avatar_url,
        });
      }
    };

    fetchAdminInfo();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleConsoleChange = (consoleId: ConsoleType) => {
    setActiveConsole(consoleId);
    setConsoleSwitcherOpen(false);
    router.push(`/dashboard/${consoleId}`);
  };

  const currentConsole = consoles.find(c => c.id === activeConsole) || consoles[0];
  const navigation = navigationByConsole[activeConsole];

  const isActive = (href: string) => {
    if (href === `/dashboard/${activeConsole}`) {
      return pathname === href || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isSuperAdmin = adminInfo?.role === 'super_admin';

  return (
    <ConsoleContext.Provider value={{ activeConsole, setActiveConsole }}>
      <div className="min-h-screen bg-slate-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">The Bazaar</span>
                  <span className="text-xs text-slate-400 block -mt-1">Admin Portal</span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Console Switcher */}
            <div className="px-3 py-3 border-b border-slate-800">
              <div className="relative">
                <button
                  onClick={() => setConsoleSwitcherOpen(!consoleSwitcherOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${currentConsole.bgColor} bg-opacity-10 hover:bg-opacity-20 transition-colors`}
                >
                  <div className={`w-8 h-8 ${currentConsole.bgColor} rounded-lg flex items-center justify-center`}>
                    <currentConsole.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{currentConsole.shortName}</p>
                    <p className="text-xs text-slate-400">Control Console</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${consoleSwitcherOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Console Dropdown */}
                {consoleSwitcherOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setConsoleSwitcherOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                      {consoles.map((console) => (
                        <button
                          key={console.id}
                          onClick={() => handleConsoleChange(console.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 transition-colors ${
                            activeConsole === console.id ? 'bg-slate-700' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 ${console.bgColor} rounded-lg flex items-center justify-center`}>
                            <console.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{console.name}</p>
                            <p className="text-xs text-slate-400">{console.description}</p>
                          </div>
                          {activeConsole === console.id && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Admin Info */}
            {adminInfo && (
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="font-semibold text-white truncate">{adminInfo.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    adminInfo.role === 'super_admin' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {adminInfo.role === 'super_admin' ? 'Super Admin' : 'Admin Staff'}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? `${currentConsole.bgColor} text-white`
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                        New
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Console Links (for Super Admin) */}
            {isSuperAdmin && (
              <div className="px-3 py-3 border-t border-slate-800">
                <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Switch
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {consoles.map((console) => (
                    <button
                      key={console.id}
                      onClick={() => handleConsoleChange(console.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        activeConsole === console.id
                          ? `${console.bgColor} bg-opacity-20`
                          : 'hover:bg-slate-800'
                      }`}
                      title={console.name}
                    >
                      <console.icon className={`w-5 h-5 mx-auto ${console.color}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sign Out */}
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="lg:pl-72">
          {/* Top header */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className={`font-medium ${currentConsole.color}`}>
                  {currentConsole.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {navigation.find((item) => isActive(item.href))?.name || 'Overview'}
                </span>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      {adminInfo?.avatarUrl ? (
                        <img
                          src={adminInfo.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-medium text-slate-900 truncate">
                            {adminInfo?.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{adminInfo?.email}</p>
                        </div>
                        <Link
                          href="/dashboard/admin-portal/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ConsoleContext.Provider>
  );
}
