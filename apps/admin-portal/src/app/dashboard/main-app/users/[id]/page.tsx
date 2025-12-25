'use client';

/**
 * Admin User Detail Page
 * ======================
 * 
 * Detailed user profile view with:
 * - Profile information
 * - Order history
 * - Activity log
 * - Account flags
 * - Administrative actions
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShoppingBag,
  DollarSign,
  Shield,
  ShieldCheck,
  ShieldX,
  Ban,
  Key,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  Eye,
  Edit,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Flag,
  History,
  CreditCard,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  DataTable,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Textarea,
  toast,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import {
  adminGetUser,
  adminGetUserActivity,
  adminGetUserOrders,
  adminUpdateUser,
  adminSuspendUser,
  adminUnsuspendUser,
  adminBanUser,
  adminUnbanUser,
  adminSendPasswordReset,
  adminVerifyEmail,
  adminImpersonateUser,
  type AdminUser,
  type UserActivity,
  type UserFlag,
  type UserStatus,
} from '@tbk/api-client';

// =============================================================================
// Types
// =============================================================================

interface UserOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

interface UserPageState {
  user: AdminUser | null;
  orders: UserOrder[];
  activity: UserActivity[];
  loading: boolean;
  ordersLoading: boolean;
  activityLoading: boolean;
  error: string | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

function getStatusBadge(status: UserStatus) {
  const config: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string; icon?: React.ReactNode }> = {
    active: { label: 'Active', variant: 'default', className: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
    suspended: { label: 'Suspended', variant: 'outline', className: 'border-yellow-500 text-yellow-600', icon: <ShieldX className="h-3 w-3" /> },
    banned: { label: 'Banned', variant: 'destructive', icon: <Ban className="h-3 w-3" /> },
    pending_verification: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  };

  const { label, variant, className, icon } = config[status];
  return (
    <Badge variant={variant} className={className}>
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  );
}

function getRoleBadge(role: string) {
  const config: Record<string, { label: string; className: string }> = {
    user: { label: 'Customer', className: 'bg-blue-100 text-blue-700' },
    vendor: { label: 'Vendor', className: 'bg-purple-100 text-purple-700' },
    vendor_staff: { label: 'Vendor Staff', className: 'bg-indigo-100 text-indigo-700' },
    admin: { label: 'Admin', className: 'bg-orange-100 text-orange-700' },
    super_admin: { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
  };

  const { label, className } = config[role] || { label: role, className: 'bg-gray-100 text-gray-700' };
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function getOrderStatusBadge(status: string) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    pending: { variant: 'secondary' },
    processing: { variant: 'outline', className: 'border-blue-500 text-blue-600' },
    shipped: { variant: 'outline', className: 'border-purple-500 text-purple-600' },
    delivered: { variant: 'default', className: 'bg-green-500' },
    cancelled: { variant: 'destructive' },
    refunded: { variant: 'outline', className: 'border-red-500 text-red-600' },
  };

  const { variant, className } = config[status] || { variant: 'secondary' };
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

function getFlagSeverityColor(severity: UserFlag['severity']): string {
  switch (severity) {
    case 'info': return 'text-blue-600 bg-blue-50';
    case 'warning': return 'text-yellow-600 bg-yellow-50';
    case 'critical': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getActivityIcon(type: UserActivity['type']) {
  switch (type) {
    case 'login': return <User className="h-4 w-4" />;
    case 'logout': return <User className="h-4 w-4" />;
    case 'order_placed': return <ShoppingBag className="h-4 w-4" />;
    case 'profile_update': return <Edit className="h-4 w-4" />;
    case 'password_change': return <Key className="h-4 w-4" />;
    case 'review_posted': return <MessageSquare className="h-4 w-4" />;
    case 'support_ticket': return <FileText className="h-4 w-4" />;
    case 'address_added': return <MapPin className="h-4 w-4" />;
    case 'payment_method_added': return <CreditCard className="h-4 w-4" />;
    default: return <History className="h-4 w-4" />;
  }
}

// =============================================================================
// Component
// =============================================================================

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // State
  const [state, setState] = useState<UserPageState>({
    user: null,
    orders: [],
    activity: [],
    loading: true,
    ordersLoading: false,
    activityLoading: false,
    error: null,
  });

  // Action dialogs
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch user
  const fetchUser = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminGetUser(userId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          user: response.data,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      }));
    }
  }, [userId]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setState(prev => ({ ...prev, ordersLoading: true }));

    try {
      const response = await adminGetUserOrders(userId, { page: 1, limit: 10 });
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          orders: response.data.orders as UserOrder[],
          ordersLoading: false,
        }));
      }
    } catch {
      setState(prev => ({ ...prev, ordersLoading: false }));
    }
  }, [userId]);

  // Fetch activity
  const fetchActivity = useCallback(async () => {
    setState(prev => ({ ...prev, activityLoading: true }));

    try {
      const response = await adminGetUserActivity(userId, { page: 1, limit: 20 });
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          activity: response.data.activities,
          activityLoading: false,
        }));
      }
    } catch {
      setState(prev => ({ ...prev, activityLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    fetchOrders();
    fetchActivity();
  }, [fetchUser, fetchOrders, fetchActivity]);

  // Actions
  const handleSuspend = async () => {
    if (!state.user || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminSuspendUser(state.user.id, actionReason);
      toast('User suspended');
      setSuspendDialogOpen(false);
      setActionReason('');
      fetchUser();
      fetchActivity();
    } catch {
      toast('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!state.user) return;
    
    try {
      await adminUnsuspendUser(state.user.id);
      toast('User unsuspended');
      fetchUser();
      fetchActivity();
    } catch {
      toast('Failed to unsuspend user');
    }
  };

  const handleBan = async () => {
    if (!state.user || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminBanUser(state.user.id, actionReason);
      toast('User banned');
      setBanDialogOpen(false);
      setActionReason('');
      fetchUser();
      fetchActivity();
    } catch {
      toast('Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!state.user) return;
    
    try {
      await adminUnbanUser(state.user.id);
      toast('User unbanned');
      fetchUser();
      fetchActivity();
    } catch {
      toast('Failed to unban user');
    }
  };

  const handleSendPasswordReset = async () => {
    if (!state.user) return;
    
    try {
      await adminSendPasswordReset(state.user.id);
      toast('Password reset email sent');
    } catch {
      toast('Failed to send password reset');
    }
  };

  const handleVerifyEmail = async () => {
    if (!state.user) return;
    
    try {
      await adminVerifyEmail(state.user.id);
      toast('Email verified');
      fetchUser();
    } catch {
      toast('Failed to verify email');
    }
  };

  const handleImpersonate = async () => {
    if (!state.user) return;
    
    try {
      const response = await adminImpersonateUser(state.user.id);
      if (response.success && response.data) {
        // Store impersonation token and redirect
        // In a real app, this would set the token in localStorage/cookies
        // and redirect to the main app with the token
        const impersonateUrl = `/impersonate?token=${response.data.token}`;
        window.open(impersonateUrl, '_blank');
        toast('Impersonation session started');
      }
    } catch {
      toast('Failed to start impersonation');
    }
  };

  // Order columns
  const orderColumns: DataTableColumn<UserOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Order',
      cell: (order) => (
        <Link
          href={`/dashboard/main-app/orders/${order.id}`}
          className="font-medium text-primary hover:underline"
        >
          #{order.orderNumber}
        </Link>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (order) => getOrderStatusBadge(order.status),
    },
    {
      key: 'itemCount',
      header: 'Items',
      align: 'center',
      cell: (order) => order.itemCount,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      cell: (order) => formatCurrency(order.total),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (order) => formatDate(order.createdAt),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (order) => (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/main-app/orders/${order.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  // Loading state
  if (state.loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 col-span-2" />
        </div>
      </div>
    );
  }

  // Error state
  if (state.error || !state.user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground">{state.error || 'The requested user could not be found.'}</p>
        <Button asChild>
          <Link href="/dashboard/main-app/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  const { user } = state;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name || 'Unnamed User'}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{user.email}</span>
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImpersonate}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Impersonate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSendPasswordReset}>
                <Key className="mr-2 h-4 w-4" />
                Send Password Reset
              </DropdownMenuItem>
              {!user.emailVerified && (
                <DropdownMenuItem onClick={handleVerifyEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Verify Email
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {user.status === 'active' && (
                <DropdownMenuItem
                  className="text-yellow-600"
                  onClick={() => setSuspendDialogOpen(true)}
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              )}
              {user.status === 'suspended' && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={handleUnsuspend}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Unsuspend User
                </DropdownMenuItem>
              )}
              {user.status !== 'banned' && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setBanDialogOpen(true)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
              {user.status === 'banned' && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={handleUnban}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2">
                    {user.email}
                    {user.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div>{user.phone}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                  <div>{formatDate(user.createdAt)}</div>
                </div>
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Last Login</div>
                    <div>{formatRelativeTime(user.lastLoginAt)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span>Total Orders</span>
                </div>
                <span className="font-semibold">{formatNumber(user.orderCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Total Spent</span>
                </div>
                <span className="font-semibold">{formatCurrency(user.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Avg. Order</span>
                </div>
                <span className="font-semibold">
                  {user.orderCount > 0 ? formatCurrency(user.totalSpent / user.orderCount) : '$0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Flags Card */}
          {user.flags && user.flags.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  Account Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.flags.map((flag, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 rounded-lg p-3 ${getFlagSeverityColor(flag.severity)}`}
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{flag.label}</div>
                      {flag.note && (
                        <div className="text-sm opacity-80">{flag.note}</div>
                      )}
                      <div className="text-xs opacity-60">{formatRelativeTime(flag.addedAt)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order History</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchOrders}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    data={state.orders}
                    columns={orderColumns}
                    isLoading={state.ordersLoading}
                    emptyMessage="No orders found"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Activity Log</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchActivity}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {state.activityLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : state.activity.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No activity recorded
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.activity.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium capitalize">
                              {item.type.replace(/_/g, ' ')}
                            </div>
                            {item.metadata && (
                              <div className="text-sm text-muted-foreground">
                                {JSON.stringify(item.metadata)}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(item.createdAt)}
                              {item.ip && ` • ${item.ip}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{user.name || user.email}"?
              They will not be able to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter suspension reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={actionLoading || !actionReason}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {actionLoading ? 'Suspending...' : 'Suspend User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently ban "{user.name || user.email}"?
              This is a serious action and should only be used for policy violations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter ban reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={actionLoading || !actionReason}
              className="bg-destructive text-destructive-foreground"
            >
              {actionLoading ? 'Banning...' : 'Ban User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
