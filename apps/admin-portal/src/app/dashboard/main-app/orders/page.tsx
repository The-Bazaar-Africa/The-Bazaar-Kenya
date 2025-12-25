'use client';

/**
 * Admin Orders List Page
 * ======================
 * 
 * Full-featured order management page using:
 * - DataTable from @tbk/ui
 * - Admin Orders API from @tbk/api-client
 * - Bulk operations and filters
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  XCircle,
  RefreshCw,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  User,
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
  Checkbox,
  toast,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import {
  adminGetOrders,
  adminBulkOrderAction,
  adminExportOrders,
  type AdminOrder,
  type AdminOrderFilters,
  type OrderSummary,
} from '@tbk/api-client';

// =============================================================================
// Types
// =============================================================================

interface OrdersPageState {
  orders: AdminOrder[];
  summary: OrderSummary | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
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

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    partially_refunded: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusIcon(status: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    confirmed: <CheckCircle className="h-3 w-3" />,
    processing: <Package className="h-3 w-3" />,
    shipped: <Truck className="h-3 w-3" />,
    delivered: <CheckCircle className="h-3 w-3" />,
    cancelled: <XCircle className="h-3 w-3" />,
    refunded: <DollarSign className="h-3 w-3" />,
  };
  return icons[status] || <Clock className="h-3 w-3" />;
}

// =============================================================================
// Component
// =============================================================================

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [state, setState] = useState<OrdersPageState>({
    orders: [],
    summary: null,
    loading: true,
    error: null,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    total: 0,
    totalPages: 0,
    selectedIds: [],
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('payment') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // Dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  // Build filters object
  const filters = useMemo((): AdminOrderFilters => ({
    page: state.page,
    limit: state.limit,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter as AdminOrderFilters['status'] : undefined,
    paymentStatus: paymentFilter !== 'all' ? paymentFilter as AdminOrderFilters['paymentStatus'] : undefined,
    createdAfter: dateFrom || undefined,
    createdBefore: dateTo || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }), [state.page, state.limit, searchQuery, statusFilter, paymentFilter, dateFrom, dateTo]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminGetOrders(filters);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          orders: response.data!.orders,
          summary: response.data!.summary,
          total: response.data!.pagination.total,
          totalPages: response.data!.pagination.totalPages,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch orders',
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch orders',
      }));
    }
  }, [filters]);

  // Fetch on mount and filter change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (state.page > 1) params.set('page', state.page.toString());
    if (state.limit !== 20) params.set('limit', state.limit.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (paymentFilter !== 'all') params.set('payment', paymentFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [state.page, state.limit, searchQuery, statusFilter, paymentFilter, dateFrom, dateTo]);

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePaymentFilter = useCallback((value: string) => {
    setPaymentFilter(value);
    setState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const handleRowSelect = useCallback((orderId: string, selected: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedIds: selected
        ? [...prev.selectedIds, orderId]
        : prev.selectedIds.filter((id) => id !== orderId),
    }));
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedIds: selected ? prev.orders.map((o) => o.id) : [],
    }));
  }, []);

  const handleBulkCancel = async () => {
    try {
      await adminBulkOrderAction({
        orderIds: state.selectedIds,
        action: 'cancel',
      });
      toast(`${state.selectedIds.length} orders cancelled`);
      setState((prev) => ({ ...prev, selectedIds: [] }));
      fetchOrders();
    } catch {
      toast('Failed to cancel orders');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      await adminBulkOrderAction({
        orderIds: [cancelOrderId],
        action: 'cancel',
      });
      toast('Order cancelled');
      fetchOrders();
    } catch {
      toast('Failed to cancel order');
    }
    setCancelDialogOpen(false);
    setCancelOrderId(null);
  };

  const handleExport = async () => {
    try {
      const response = await adminExportOrders({
        status: statusFilter !== 'all' ? statusFilter as AdminOrderFilters['status'] : undefined,
        paymentStatus: paymentFilter !== 'all' ? paymentFilter as AdminOrderFilters['paymentStatus'] : undefined,
        createdAfter: dateFrom || undefined,
        createdBefore: dateTo || undefined,
      }, 'csv');
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
        toast('Export started');
      }
    } catch {
      toast('Failed to export orders');
    }
  };

  // Table columns
  const columns: DataTableColumn<AdminOrder>[] = useMemo(
    () => [
      {
        key: 'select',
        header: '',
        headerCell: () => (
          <Checkbox
            checked={state.selectedIds.length === state.orders.length && state.orders.length > 0}
            onCheckedChange={handleSelectAll}
          />
        ),
        cell: (row) => (
          <Checkbox
            checked={state.selectedIds.includes(row.id)}
            onCheckedChange={(checked) => handleRowSelect(row.id, !!checked)}
          />
        ),
        width: '40px',
      },
      {
        key: 'orderNumber',
        header: 'Order',
        cell: (row) => (
          <div>
            <Link
              href={`/dashboard/main-app/orders/${row.id}`}
              className="font-medium text-primary hover:underline"
            >
              #{row.orderNumber}
            </Link>
            <p className="text-xs text-muted-foreground">{formatDateTime(row.createdAt)}</p>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'customer',
        header: 'Customer',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{row.buyer?.fullName || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{row.buyer?.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'total',
        header: 'Total',
        cell: (row) => (
          <div>
            <p className="font-semibold">{formatCurrency(row.total)}</p>
            <p className="text-xs text-muted-foreground">{row.items?.length || 0} items</p>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <Badge className={getStatusColor(row.status)}>
            {getStatusIcon(row.status)}
            <span className="ml-1 capitalize">{row.status}</span>
          </Badge>
        ),
        sortable: true,
      },
      {
        key: 'paymentStatus',
        header: 'Payment',
        cell: (row) => (
          <Badge className={getPaymentStatusColor(row.paymentStatus)}>
            <span className="capitalize">{row.paymentStatus.replace('_', ' ')}</span>
          </Badge>
        ),
        sortable: true,
      },
      {
        key: 'actions',
        header: '',
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/main-app/orders/${row.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/main-app/orders/${row.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setCancelOrderId(row.id);
                  setCancelDialogOpen(true);
                }}
                disabled={row.status === 'cancelled' || row.status === 'delivered'}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        width: '50px',
      },
    ],
    [state.selectedIds, state.orders.length, handleSelectAll, handleRowSelect]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {state.summary && (
        <StatCardGroup>
          <StatCard
            title="Total Orders"
            value={state.summary.totalOrders}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatCard
            title="Pending"
            value={state.summary.pendingOrders}
            icon={<Clock className="h-4 w-4" />}
            variant="warning"
          />
          <StatCard
            title="Processing"
            value={state.summary.processingOrders}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(state.summary.totalRevenue)}
            icon={<DollarSign className="h-4 w-4" />}
            variant="success"
          />
        </StatCardGroup>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={handlePaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px]"
            />
            <Input
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {state.selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {state.selectedIds.length} order(s) selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState((prev) => ({ ...prev, selectedIds: [] }))}
          >
            Clear Selection
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkCancel}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Selected
          </Button>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {state.loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : state.error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-medium">{state.error}</p>
              <Button variant="outline" onClick={fetchOrders} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={state.orders}
              pagination={{
                page: state.page,
                pageSize: state.limit,
                total: state.total,
                totalPages: state.totalPages,
              }}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground">
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
