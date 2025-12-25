'use client';

/**
 * Admin Users List Page
 * =====================
 * 
 * Full-featured user management page using:
 * - DataTable from @tbk/ui
 * - Admin Users API from @tbk/api-client
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  ShieldCheck,
  ShieldX,
  Mail,
  Key,
  UserX,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  DataTable,
  StatCard,
  StatCardGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Skeleton,
  toast,
  Textarea,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import {
  adminGetUsers,
  adminSuspendUser,
  adminUnsuspendUser,
  adminBanUser,
  adminUnbanUser,
  adminBulkUserAction,
  adminSendPasswordReset,
  adminVerifyEmail,
  type AdminUser,
  type AdminUserFilters,
  type UserSummary,
  type UserStatus,
} from '@tbk/api-client';

// =============================================================================
// Types
// =============================================================================

interface UsersPageState {
  users: AdminUser[];
  summary: UserSummary | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
}

type StatusFilter = 'all' | UserStatus;
type RoleFilter = 'all' | 'user' | 'vendor' | 'vendor_staff' | 'admin' | 'super_admin';

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
  const config: Record<UserStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    active: { label: 'Active', variant: 'default', className: 'bg-green-500' },
    suspended: { label: 'Suspended', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
    banned: { label: 'Banned', variant: 'destructive' },
    pending_verification: { label: 'Pending', variant: 'secondary' },
  };

  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
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

// =============================================================================
// Component
// =============================================================================

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [state, setState] = useState<UsersPageState>({
    users: [],
    summary: null,
    loading: true,
    error: null,
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    selectedIds: [],
  });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'all'
  );
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(
    (searchParams.get('role') as RoleFilter) || 'all'
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  // Action dialogs
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<AdminUser | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const filters: AdminUserFilters = {
        page: state.page,
        limit: state.limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        sortBy: sortBy as AdminUserFilters['sortBy'],
        sortOrder,
      };

      const response = await adminGetUsers(filters);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          users: response.data.users,
          summary: response.data.summary,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      }));
    }
  }, [state.page, state.limit, search, statusFilter, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [search, statusFilter, roleFilter, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handleRoleFilter = (value: RoleFilter) => {
    setRoleFilter(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
  };

  const handleSuspend = async () => {
    if (!userToAction || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminSuspendUser(userToAction.id, actionReason);
      toast('User suspended');
      setSuspendDialogOpen(false);
      setUserToAction(null);
      setActionReason('');
      fetchUsers();
    } catch {
      toast('Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (user: AdminUser) => {
    try {
      await adminUnsuspendUser(user.id);
      toast('User unsuspended');
      fetchUsers();
    } catch {
      toast('Failed to unsuspend user');
    }
  };

  const handleBan = async () => {
    if (!userToAction || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminBanUser(userToAction.id, actionReason);
      toast('User banned');
      setBanDialogOpen(false);
      setUserToAction(null);
      setActionReason('');
      fetchUsers();
    } catch {
      toast('Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async (user: AdminUser) => {
    try {
      await adminUnbanUser(user.id);
      toast('User unbanned');
      fetchUsers();
    } catch {
      toast('Failed to unban user');
    }
  };

  const handleSendPasswordReset = async (user: AdminUser) => {
    try {
      await adminSendPasswordReset(user.id);
      toast('Password reset email sent');
    } catch {
      toast('Failed to send password reset');
    }
  };

  const handleVerifyEmail = async (user: AdminUser) => {
    try {
      await adminVerifyEmail(user.id);
      toast('Email verified');
      fetchUsers();
    } catch {
      toast('Failed to verify email');
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'verify_email') => {
    try {
      await adminBulkUserAction({
        userIds: state.selectedIds,
        action,
        reason: action === 'suspend' || action === 'ban' ? 'Bulk action' : undefined,
      });
      const actionLabels = {
        suspend: 'suspended',
        unsuspend: 'unsuspended',
        ban: 'banned',
        unban: 'unbanned',
        verify_email: 'verified',
      };
      toast(`${state.selectedIds.length} users ${actionLabels[action]}`);
      setState(prev => ({ ...prev, selectedIds: [] }));
      fetchUsers();
    } catch {
      toast('Failed to perform bulk action');
    }
  };

  // Table columns
  const columns: DataTableColumn<AdminUser>[] = useMemo(() => [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      cell: (user: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{user.name || 'No name'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: AdminUser) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(user.status)}
          {!user.emailVerified && (
            <Badge variant="outline" className="w-fit text-xs border-yellow-500 text-yellow-600">
              Email unverified
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user: AdminUser) => getRoleBadge(user.role),
    },
    {
      key: 'orderCount',
      header: 'Orders',
      sortable: true,
      align: 'right',
      cell: (user: AdminUser) => (
        <div className="text-right">
          <div className="font-medium">{formatNumber(user.orderCount)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(user.totalSpent)}
          </div>
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      sortable: true,
      cell: (user: AdminUser) => (
        <div className="text-sm text-muted-foreground">
          {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      cell: (user: AdminUser) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (user: AdminUser) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/main-app/users/${user.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendPasswordReset(user)}>
              <Key className="mr-2 h-4 w-4" />
              Send Password Reset
            </DropdownMenuItem>
            {!user.emailVerified && (
              <DropdownMenuItem onClick={() => handleVerifyEmail(user)}>
                <Mail className="mr-2 h-4 w-4" />
                Verify Email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {user.status === 'active' && (
              <DropdownMenuItem
                className="text-yellow-600"
                onClick={() => {
                  setUserToAction(user);
                  setSuspendDialogOpen(true);
                }}
              >
                <ShieldX className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
            )}
            {user.status === 'suspended' && (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => handleUnsuspend(user)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Unsuspend User
              </DropdownMenuItem>
            )}
            {user.status !== 'banned' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setUserToAction(user);
                  setBanDialogOpen(true);
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </DropdownMenuItem>
            )}
            {user.status === 'banned' && (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => handleUnban(user)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Unban User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  // Summary stats
  const summaryStats = state.summary ? [
    {
      title: 'Total Users',
      value: formatNumber(state.summary.totalUsers),
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Active',
      value: formatNumber(state.summary.activeUsers),
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'success' as const,
    },
    {
      title: 'Suspended',
      value: formatNumber(state.summary.suspendedUsers),
      icon: <Clock className="h-4 w-4" />,
      variant: 'warning' as const,
    },
    {
      title: 'New This Month',
      value: formatNumber(state.summary.newUsersThisMonth),
      icon: <Plus className="h-4 w-4" />,
    },
  ] : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">
              Manage customer and user accounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      {state.loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatCardGroup>
          {summaryStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
        </StatCardGroup>
      )}

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => handleStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="pending_verification">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(v) => handleRoleFilter(v as RoleFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Customer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="vendor_staff">Vendor Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {state.selectedIds.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {state.selectedIds.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('verify_email')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Verify Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>
                  <ShieldX className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('unsuspend')}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Unsuspend
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('ban')}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Ban
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={state.users}
            columns={columns}
            isLoading={state.loading}
            selectable
            selectedIds={state.selectedIds}
            onSelectionChange={(ids) => setState(prev => ({ ...prev, selectedIds: ids as string[] }))}
            getRowId={(row) => row.id}
            pagination={{
              page: state.page,
              pageSize: state.limit,
              total: state.total,
              totalPages: state.totalPages,
            }}
            onPageChange={handlePageChange}
            sort={{
              column: sortBy,
              direction: sortOrder,
            }}
            onSortChange={(sort) => handleSort(sort.column, sort.direction as 'asc' | 'desc')}
            emptyMessage={search
              ? 'No users found. Try adjusting your search or filters.'
              : 'No users found.'
            }
          />
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{userToAction?.name || userToAction?.email}"?
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
              Are you sure you want to permanently ban "{userToAction?.name || userToAction?.email}"?
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
