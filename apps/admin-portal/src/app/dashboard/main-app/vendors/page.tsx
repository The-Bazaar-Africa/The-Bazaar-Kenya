'use client';

/**
 * Admin Vendors List Page
 * =======================
 * 
 * Full-featured vendor management page using:
 * - DataTable from @tbk/ui
 * - Admin Vendors API from @tbk/api-client
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  BadgeCheck,
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
  adminGetVendors,
  adminSuspendVendor,
  adminUnsuspendVendor,
  adminActivateVendor,
  adminDeactivateVendor,
  adminVerifyVendor,
  adminBulkVendorAction,
  type AdminVendor,
  type AdminVendorFilters,
  type VendorListSummary,
  type AdminVendorStatus,
  type VerificationStatus,
} from '@tbk/api-client';

// Local type alias for convenience
type VendorStatus = AdminVendorStatus;

// =============================================================================
// Types
// =============================================================================

interface VendorsPageState {
  vendors: AdminVendor[];
  summary: VendorListSummary | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
}

type StatusFilter = 'all' | VendorStatus;
type VerificationFilter = 'all' | VerificationStatus;

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

function getStatusBadge(status: VendorStatus) {
  const config: Record<VendorStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    active: { label: 'Active', variant: 'default', className: 'bg-green-500' },
    pending: { label: 'Pending', variant: 'secondary' },
    suspended: { label: 'Suspended', variant: 'outline', className: 'border-yellow-500 text-yellow-600' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    deactivated: { label: 'Deactivated', variant: 'outline', className: 'border-gray-400 text-gray-500' },
    banned: { label: 'Banned', variant: 'destructive', className: 'bg-red-600' },
  };

  const { label, variant, className } = config[status];
  return <Badge variant={variant} className={className}>{label}</Badge>;
}

function getVerificationBadge(status: VerificationStatus) {
  const config: Record<VerificationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string; icon?: React.ReactNode }> = {
    verified: { label: 'Verified', variant: 'default', className: 'bg-blue-500', icon: <BadgeCheck className="h-3 w-3 mr-1" /> },
    pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
    unverified: { label: 'Unverified', variant: 'outline' },
    rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
  };

  const { label, variant, className, icon } = config[status];
  return (
    <Badge variant={variant} className={className}>
      {icon}{label}
    </Badge>
  );
}

// =============================================================================
// Component
// =============================================================================

export default function VendorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [state, setState] = useState<VendorsPageState>({
    vendors: [],
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
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>(
    (searchParams.get('verification') as VerificationFilter) || 'all'
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );

  // Action dialogs
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [vendorToAction, setVendorToAction] = useState<AdminVendor | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const filters: AdminVendorFilters = {
        page: state.page,
        limit: state.limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        verification: verificationFilter !== 'all' ? verificationFilter : undefined,
        sortBy: sortBy as AdminVendorFilters['sortBy'],
        sortOrder,
      };

      const response = await adminGetVendors(filters);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          vendors: response.data.vendors,
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
        error: error instanceof Error ? error.message : 'Failed to fetch vendors',
      }));
    }
  }, [state.page, state.limit, search, statusFilter, verificationFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (verificationFilter !== 'all') params.set('verification', verificationFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [search, statusFilter, verificationFilter, sortBy, sortOrder]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setState(prev => ({ ...prev, page: 1 }));
  };

  const handleVerificationFilter = (value: VerificationFilter) => {
    setVerificationFilter(value);
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
    if (!vendorToAction || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminSuspendVendor(vendorToAction.id, actionReason);
      toast('Vendor suspended');
      setSuspendDialogOpen(false);
      setVendorToAction(null);
      setActionReason('');
      fetchVendors();
    } catch {
      toast('Failed to suspend vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (vendor: AdminVendor) => {
    try {
      await adminUnsuspendVendor(vendor.id);
      toast('Vendor unsuspended');
      fetchVendors();
    } catch {
      toast('Failed to unsuspend vendor');
    }
  };

  const handleActivate = async (vendor: AdminVendor) => {
    try {
      await adminActivateVendor(vendor.id);
      toast('Vendor activated');
      fetchVendors();
    } catch {
      toast('Failed to activate vendor');
    }
  };

  const handleVerify = async (vendor: AdminVendor, decision: 'approve' | 'reject') => {
    try {
      await adminVerifyVendor(vendor.id, { decision });
      toast(decision === 'approve' ? 'Vendor verified' : 'Vendor verification rejected');
      fetchVendors();
    } catch {
      toast('Failed to process verification');
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'verify') => {
    try {
      await adminBulkVendorAction({
        vendorIds: state.selectedIds,
        action,
      });
      const actionLabels = {
        suspend: 'suspended',
        activate: 'activated',
        verify: 'verified',
      };
      toast(`${state.selectedIds.length} vendors ${actionLabels[action]}`);
      setState(prev => ({ ...prev, selectedIds: [] }));
      fetchVendors();
    } catch {
      toast('Failed to perform bulk action');
    }
  };

  // Table columns
  const columns: DataTableColumn<AdminVendor>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Vendor',
      sortable: true,
      cell: (vendor: AdminVendor) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
            {vendor.logo ? (
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Store className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{vendor.name}</div>
            <div className="text-sm text-muted-foreground">{vendor.ownerEmail}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (vendor: AdminVendor) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(vendor.status)}
          {getVerificationBadge(vendor.verificationStatus)}
        </div>
      ),
    },
    {
      key: 'productCount',
      header: 'Products',
      sortable: true,
      align: 'center',
      cell: (vendor: AdminVendor) => (
        <div className="text-center">
          <div className="font-medium">{formatNumber(vendor.activeProductCount)}</div>
          <div className="text-xs text-muted-foreground">
            of {formatNumber(vendor.productCount)}
          </div>
        </div>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      sortable: true,
      align: 'right',
      cell: (vendor: AdminVendor) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(vendor.totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(vendor.orderCount)} orders
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      align: 'center',
      cell: (vendor: AdminVendor) => (
        <div className="flex items-center justify-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{vendor.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">
            ({formatNumber(vendor.reviewCount)})
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      cell: (vendor: AdminVendor) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(vendor.createdAt)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (vendor: AdminVendor) => (
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
              <Link href={`/dashboard/main-app/vendors/${vendor.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {vendor.verificationStatus === 'pending' && (
              <>
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => handleVerify(vendor, 'approve')}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Approve Verification
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleVerify(vendor, 'reject')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Verification
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            {vendor.status === 'pending' && (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => handleActivate(vendor)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate Vendor
              </DropdownMenuItem>
            )}
            {vendor.status === 'active' && (
              <DropdownMenuItem
                className="text-yellow-600"
                onClick={() => {
                  setVendorToAction(vendor);
                  setSuspendDialogOpen(true);
                }}
              >
                <ShieldX className="mr-2 h-4 w-4" />
                Suspend Vendor
              </DropdownMenuItem>
            )}
            {vendor.status === 'suspended' && (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => handleUnsuspend(vendor)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Unsuspend Vendor
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
      title: 'Total Vendors',
      value: formatNumber(state.summary.totalVendors),
      icon: <Store className="h-4 w-4" />,
    },
    {
      title: 'Active',
      value: formatNumber(state.summary.activeVendors),
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'success' as const,
    },
    {
      title: 'Pending Verification',
      value: formatNumber(state.summary.pendingVerification),
      icon: <Clock className="h-4 w-4" />,
      variant: 'warning' as const,
    },
    {
      title: 'Pending Payouts',
      value: formatCurrency(state.summary.pendingPayouts),
      icon: <DollarSign className="h-4 w-4" />,
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
            <h1 className="text-2xl font-bold">Vendors</h1>
            <p className="text-muted-foreground">
              Manage vendor accounts and verification
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
                placeholder="Search vendors by name or email..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={(v) => handleVerificationFilter(v as VerificationFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchVendors}>
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
                {state.selectedIds.length} vendor(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('verify')}>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Verify
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('suspend')}
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  Suspend
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
            data={state.vendors}
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
              ? 'No vendors found. Try adjusting your search or filters.'
              : 'No vendors found.'
            }
          />
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{vendorToAction?.name}"?
              Their products will be hidden and they will not be able to receive orders.
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
              {actionLoading ? 'Suspending...' : 'Suspend Vendor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
