'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Unlock,
  RotateCcw,
  Eye,
  ChevronLeft,
  ShoppingBag,
  User,
  Store,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Label,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import Link from 'next/link';
import {
  adminGetEscrowAccounts,
  adminReleaseEscrow,
  adminRefundEscrow,
  type EscrowAccount,
  type EscrowFilters,
} from '@tbk/api-client';

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadge(status: EscrowAccount['status']) {
  const styles: Record<EscrowAccount['status'], string> = {
    held: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    released: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    disputed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  };

  const icons: Record<EscrowAccount['status'], React.ReactNode> = {
    held: <Clock className="h-3 w-3" />,
    released: <CheckCircle className="h-3 w-3" />,
    disputed: <AlertTriangle className="h-3 w-3" />,
    refunded: <RotateCcw className="h-3 w-3" />,
  };

  return (
    <Badge className={`${styles[status]} flex items-center gap-1`} variant="secondary">
      {icons[status]}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function getReleaseConditionLabel(condition: EscrowAccount['releaseCondition']): string {
  const labels: Record<EscrowAccount['releaseCondition'], string> = {
    delivery_confirmed: 'On Delivery Confirmation',
    time_elapsed: 'After Time Period',
    manual_release: 'Manual Release',
  };
  return labels[condition] || condition;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockEscrowAccounts: EscrowAccount[] = [
  {
    id: 'esc_001',
    orderId: 'order_001',
    orderNumber: 'ORD-2024-001234',
    vendorId: 'vendor_001',
    vendorName: 'TechGadgets Store',
    buyerId: 'buyer_001',
    buyerName: 'John Smith',
    amount: 450.00,
    status: 'held',
    heldAt: new Date(Date.now() - 172800000).toISOString(),
    releaseCondition: 'delivery_confirmed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'esc_002',
    orderId: 'order_002',
    orderNumber: 'ORD-2024-001235',
    vendorId: 'vendor_002',
    vendorName: 'Fashion Forward',
    buyerId: 'buyer_002',
    buyerName: 'Jane Doe',
    amount: 280.50,
    status: 'held',
    heldAt: new Date(Date.now() - 86400000).toISOString(),
    releaseCondition: 'time_elapsed',
    releaseDate: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'esc_003',
    orderId: 'order_003',
    orderNumber: 'ORD-2024-001200',
    vendorId: 'vendor_003',
    vendorName: 'Home & Living Co',
    buyerId: 'buyer_003',
    buyerName: 'Bob Johnson',
    amount: 1200.00,
    status: 'disputed',
    heldAt: new Date(Date.now() - 604800000).toISOString(),
    releaseCondition: 'delivery_confirmed',
    disputeReason: 'Item not as described',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'esc_004',
    orderId: 'order_004',
    orderNumber: 'ORD-2024-001150',
    vendorId: 'vendor_001',
    vendorName: 'TechGadgets Store',
    buyerId: 'buyer_004',
    buyerName: 'Alice Williams',
    amount: 320.00,
    status: 'released',
    heldAt: new Date(Date.now() - 864000000).toISOString(),
    releaseCondition: 'delivery_confirmed',
    releaseDate: new Date(Date.now() - 259200000).toISOString(),
    releasedBy: 'System (Auto)',
    createdAt: new Date(Date.now() - 864000000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'esc_005',
    orderId: 'order_005',
    orderNumber: 'ORD-2024-001100',
    vendorId: 'vendor_004',
    vendorName: 'Sports Unlimited',
    buyerId: 'buyer_005',
    buyerName: 'Charlie Brown',
    amount: 89.99,
    status: 'refunded',
    heldAt: new Date(Date.now() - 1209600000).toISOString(),
    releaseCondition: 'manual_release',
    disputeReason: 'Order cancelled by buyer',
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    updatedAt: new Date(Date.now() - 1036800000).toISOString(),
  },
];

const mockSummary = {
  totalHeld: 1930.50,
  heldCount: 3,
  disputedCount: 1,
  disputedAmount: 1200.00,
  releasedThisMonth: 320.00,
  refundedThisMonth: 89.99,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EscrowPage() {
  // State
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EscrowFilters>({
    page: 1,
    limit: 10,
    status: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [summary, setSummary] = useState(mockSummary);

  // Dialog states
  const [selectedAccount, setSelectedAccount] = useState<EscrowAccount | null>(null);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // In production:
        // const response = await adminGetEscrowAccounts(filters);
        // setEscrowAccounts(response.data.escrowAccounts);
        // setTotalAccounts(response.data.pagination.total);
        // setSummary(response.data.summary);

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter mock data
        let filtered = [...mockEscrowAccounts];
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(e => e.status === filters.status);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(e =>
            e.orderNumber.toLowerCase().includes(q) ||
            e.vendorName.toLowerCase().includes(q) ||
            e.buyerName.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q)
          );
        }
        
        setEscrowAccounts(filtered);
        setTotalAccounts(filtered.length);
      } catch (error) {
        console.error('Failed to fetch escrow accounts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [filters, searchQuery]);

  // Handlers
  const handleRelease = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);
    try {
      // await adminReleaseEscrow(selectedAccount.id, releaseNotes);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEscrowAccounts(prev =>
        prev.map(e =>
          e.id === selectedAccount.id
            ? {
                ...e,
                status: 'released' as const,
                releaseDate: new Date().toISOString(),
                releasedBy: 'Admin (Manual)',
              }
            : e
        )
      );
      setIsReleaseDialogOpen(false);
      setSelectedAccount(null);
      setReleaseNotes('');
    } catch (error) {
      console.error('Failed to release escrow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);
    try {
      // await adminRefundEscrow(selectedAccount.id, refundReason);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEscrowAccounts(prev =>
        prev.map(e =>
          e.id === selectedAccount.id
            ? {
                ...e,
                status: 'refunded' as const,
                disputeReason: refundReason,
              }
            : e
        )
      );
      setIsRefundDialogOpen(false);
      setSelectedAccount(null);
      setRefundReason('');
    } catch (error) {
      console.error('Failed to refund escrow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: EscrowFilters) => ({ ...prev, page: 1 }));
  };

  // Table columns
  const columns: DataTableColumn<EscrowAccount>[] = [
    {
      key: 'orderNumber',
      header: 'Order',
      cell: (account: EscrowAccount) => (
        <div>
          <Link
            href={`/dashboard/main-app/orders/${account.orderId}`}
            className="font-medium hover:underline"
          >
            {account.orderNumber}
          </Link>
          <p className="text-xs text-muted-foreground font-mono">{account.id}</p>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      cell: (account: EscrowAccount) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <Link
            href={`/dashboard/main-app/vendors/${account.vendorId}`}
            className="hover:underline"
          >
            {account.vendorName}
          </Link>
        </div>
      ),
    },
    {
      key: 'buyerName',
      header: 'Buyer',
      cell: (account: EscrowAccount) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Link
            href={`/dashboard/main-app/users/${account.buyerId}`}
            className="hover:underline"
          >
            {account.buyerName}
          </Link>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (account: EscrowAccount) => (
        <span className="font-bold">{formatCurrency(account.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (account: EscrowAccount) => getStatusBadge(account.status),
    },
    {
      key: 'releaseCondition',
      header: 'Release Condition',
      cell: (account: EscrowAccount) => (
        <span className="text-sm text-muted-foreground">
          {getReleaseConditionLabel(account.releaseCondition)}
        </span>
      ),
    },
    {
      key: 'heldAt',
      header: 'Held Since',
      cell: (account: EscrowAccount) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(account.heldAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (account: EscrowAccount) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAccount(account);
              setIsDetailDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(account.status === 'held' || account.status === 'disputed') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={() => {
                  setSelectedAccount(account);
                  setIsReleaseDialogOpen(true);
                }}
              >
                <Unlock className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
                onClick={() => {
                  setSelectedAccount(account);
                  setIsRefundDialogOpen(true);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/main-app/finances">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Finances
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Escrow Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage funds held in escrow for orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Held</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalHeld)}</p>
                <p className="text-xs text-muted-foreground">{summary.heldCount} accounts</p>
              </div>
              <Wallet className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disputed</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.disputedAmount)}</p>
                <p className="text-xs text-muted-foreground">{summary.disputedCount} accounts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Released (Month)</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.releasedThisMonth)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refunded (Month)</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.refundedThisMonth)}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Escrow Accounts</CardTitle>
              <CardDescription>View and manage escrow held funds</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order, vendor..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              </form>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value: string) =>
                  setFilters((prev: EscrowFilters) => ({ ...prev, status: value as EscrowFilters['status'], page: 1 }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="held">Held</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={escrowAccounts}
            isLoading={isLoading}
            onPageChange={(page: number) => setFilters((prev: EscrowFilters) => ({ ...prev, page }))}
          />
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <span>Showing {escrowAccounts.length} of {totalAccounts} accounts</span>
        </CardFooter>
      </Card>

      {/* Release Escrow Dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Escrow</DialogTitle>
            <DialogDescription>
              Release {selectedAccount && formatCurrency(selectedAccount.amount)} to vendor{' '}
              {selectedAccount?.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order</span>
                    <span className="font-medium">{selectedAccount?.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buyer</span>
                    <span>{selectedAccount?.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">{selectedAccount && formatCurrency(selectedAccount.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <Label htmlFor="releaseNotes">Notes (Optional)</Label>
              <Textarea
                id="releaseNotes"
                placeholder="Add notes about this release..."
                value={releaseNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReleaseNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRelease} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Release to Vendor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Escrow Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund to Buyer</DialogTitle>
            <DialogDescription>
              Refund {selectedAccount && formatCurrency(selectedAccount.amount)} to buyer{' '}
              {selectedAccount?.buyerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order</span>
                    <span className="font-medium">{selectedAccount?.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor</span>
                    <span>{selectedAccount?.vendorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold">{selectedAccount && formatCurrency(selectedAccount.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Textarea
                id="refundReason"
                placeholder="Provide a reason for this refund..."
                value={refundReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRefundReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={isSubmitting || !refundReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refund to Buyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escrow Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escrow Details</DialogTitle>
            <DialogDescription>
              {selectedAccount?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(selectedAccount.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order</span>
                <Link
                  href={`/dashboard/main-app/orders/${selectedAccount.orderId}`}
                  className="font-medium hover:underline"
                >
                  {selectedAccount.orderNumber}
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">{formatCurrency(selectedAccount.amount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Store className="h-3 w-3" /> Vendor
                  </p>
                  <Link
                    href={`/dashboard/main-app/vendors/${selectedAccount.vendorId}`}
                    className="font-medium hover:underline text-sm"
                  >
                    {selectedAccount.vendorName}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Buyer
                  </p>
                  <Link
                    href={`/dashboard/main-app/users/${selectedAccount.buyerId}`}
                    className="font-medium hover:underline text-sm"
                  >
                    {selectedAccount.buyerName}
                  </Link>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Release Condition</span>
                <span className="text-sm">{getReleaseConditionLabel(selectedAccount.releaseCondition)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Held Since</span>
                <span>{formatDateTime(selectedAccount.heldAt)}</span>
              </div>
              {selectedAccount.releaseDate && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {selectedAccount.status === 'released' ? 'Released On' : 'Scheduled Release'}
                  </span>
                  <span>{formatDateTime(selectedAccount.releaseDate)}</span>
                </div>
              )}
              {selectedAccount.releasedBy && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Released By</span>
                  <span>{selectedAccount.releasedBy}</span>
                </div>
              )}
              {selectedAccount.disputeReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {selectedAccount.status === 'disputed' ? 'Dispute Reason' : 'Refund Reason'}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {selectedAccount.disputeReason}
                  </p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Created: {formatDateTime(selectedAccount.createdAt)}
                {selectedAccount.updatedAt !== selectedAccount.createdAt && (
                  <> • Updated: {formatDateTime(selectedAccount.updatedAt)}</>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedAccount && (selectedAccount.status === 'held' || selectedAccount.status === 'disputed') && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsRefundDialogOpen(true);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refund
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsReleaseDialogOpen(true);
                  }}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Release
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
