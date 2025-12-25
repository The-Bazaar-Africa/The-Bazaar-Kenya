'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Play,
  Ban,
  RotateCcw,
  Eye,
  ChevronLeft,
  Building,
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
  adminGetPayouts,
  adminProcessPayout,
  adminCancelPayout,
  adminRetryPayout,
  type Payout,
  type PayoutFilters,
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

function getStatusBadge(status: Payout['status']) {
  const styles: Record<Payout['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  };

  const icons: Record<Payout['status'], React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    processing: <RefreshCw className="h-3 w-3 animate-spin" />,
    completed: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
    cancelled: <Ban className="h-3 w-3" />,
  };

  return (
    <Badge className={`${styles[status]} flex items-center gap-1`} variant="secondary">
      {icons[status]}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function getMethodLabel(method: Payout['method']): string {
  const labels: Record<Payout['method'], string> = {
    bank_transfer: 'Bank Transfer',
    paypal: 'PayPal',
    stripe: 'Stripe',
    manual: 'Manual',
  };
  return labels[method] || method;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockPayouts: Payout[] = [
  {
    id: 'pay_001',
    vendorId: 'vendor_001',
    vendorName: 'TechGadgets Store',
    amount: 2500.00,
    fee: 25.00,
    netAmount: 2475.00,
    status: 'pending',
    method: 'bank_transfer',
    bankDetails: {
      accountName: 'TechGadgets LLC',
      accountNumber: '****4567',
      bankName: 'Chase Bank',
      routingNumber: '****1234',
    },
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay_002',
    vendorId: 'vendor_002',
    vendorName: 'Fashion Forward',
    amount: 1850.50,
    fee: 18.51,
    netAmount: 1831.99,
    status: 'processing',
    method: 'stripe',
    reference: 'po_1234567890',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pay_003',
    vendorId: 'vendor_003',
    vendorName: 'Home & Living Co',
    amount: 3200.00,
    fee: 32.00,
    netAmount: 3168.00,
    status: 'completed',
    method: 'bank_transfer',
    bankDetails: {
      accountName: 'Home Living Inc',
      accountNumber: '****7890',
      bankName: 'Bank of America',
    },
    reference: 'ACH_987654321',
    processedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'pay_004',
    vendorId: 'vendor_004',
    vendorName: 'Sports Unlimited',
    amount: 950.75,
    fee: 9.51,
    netAmount: 941.24,
    status: 'failed',
    method: 'paypal',
    failureReason: 'PayPal account not verified',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'pay_005',
    vendorId: 'vendor_005',
    vendorName: 'Books & Beyond',
    amount: 450.00,
    fee: 4.50,
    netAmount: 445.50,
    status: 'cancelled',
    method: 'manual',
    notes: 'Cancelled at vendor request',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'pay_006',
    vendorId: 'vendor_001',
    vendorName: 'TechGadgets Store',
    amount: 1500.00,
    fee: 15.00,
    netAmount: 1485.00,
    status: 'completed',
    method: 'bank_transfer',
    bankDetails: {
      accountName: 'TechGadgets LLC',
      accountNumber: '****4567',
      bankName: 'Chase Bank',
    },
    reference: 'ACH_112233445',
    processedAt: new Date(Date.now() - 604800000).toISOString(),
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

const mockSummary = {
  pending: 2500.00,
  processing: 1850.50,
  completed: 4700.00,
  total: 9050.50,
  pendingCount: 1,
  processingCount: 1,
  completedCount: 2,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PayoutsPage() {
  // State
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PayoutFilters>({
    page: 1,
    limit: 10,
    status: 'all',
    method: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [summary, setSummary] = useState(mockSummary);

  // Dialog states
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [processReference, setProcessReference] = useState('');
  const [processNotes, setProcessNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // In production:
        // const response = await adminGetPayouts(filters);
        // setPayouts(response.data.payouts);
        // setTotalPayouts(response.data.pagination.total);
        // setSummary(response.data.summary);

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter mock data
        let filtered = [...mockPayouts];
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.method && filters.method !== 'all') {
          filtered = filtered.filter(p => p.method === filters.method);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(p =>
            p.vendorName.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            (p.reference && p.reference.toLowerCase().includes(q))
          );
        }
        
        setPayouts(filtered);
        setTotalPayouts(filtered.length);
      } catch (error) {
        console.error('Failed to fetch payouts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [filters, searchQuery]);

  // Handlers
  const handleProcess = async () => {
    if (!selectedPayout) return;
    setIsSubmitting(true);
    try {
      // await adminProcessPayout(selectedPayout.id, { reference: processReference, notes: processNotes });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayouts(prev =>
        prev.map(p =>
          p.id === selectedPayout.id
            ? { ...p, status: 'processing' as const, reference: processReference }
            : p
        )
      );
      setIsProcessDialogOpen(false);
      setSelectedPayout(null);
      setProcessReference('');
      setProcessNotes('');
    } catch (error) {
      console.error('Failed to process payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedPayout) return;
    setIsSubmitting(true);
    try {
      // await adminCancelPayout(selectedPayout.id, cancelReason);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayouts(prev =>
        prev.map(p =>
          p.id === selectedPayout.id
            ? { ...p, status: 'cancelled' as const, notes: cancelReason }
            : p
        )
      );
      setIsCancelDialogOpen(false);
      setSelectedPayout(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (payout: Payout) => {
    try {
      // await adminRetryPayout(payout.id);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPayouts(prev =>
        prev.map(p =>
          p.id === payout.id ? { ...p, status: 'pending' as const, failureReason: undefined } : p
        )
      );
    } catch (error) {
      console.error('Failed to retry payout:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: PayoutFilters) => ({ ...prev, page: 1 }));
  };

  // Table columns
  const columns: DataTableColumn<Payout>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      cell: (payout: Payout) => (
        <span className="font-mono text-sm">{payout.id}</span>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      cell: (payout: Payout) => (
        <div>
          <Link
            href={`/dashboard/main-app/vendors/${payout.vendorId}`}
            className="font-medium hover:underline"
          >
            {payout.vendorName}
          </Link>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payout: Payout) => (
        <div>
          <p className="font-bold">{formatCurrency(payout.amount)}</p>
          <p className="text-xs text-muted-foreground">
            Fee: {formatCurrency(payout.fee)}
          </p>
        </div>
      ),
    },
    {
      key: 'netAmount',
      header: 'Net Amount',
      cell: (payout: Payout) => (
        <span className="font-medium text-green-600">
          {formatCurrency(payout.netAmount)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      cell: (payout: Payout) => (
        <Badge variant="outline">{getMethodLabel(payout.method)}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payout: Payout) => getStatusBadge(payout.status),
    },
    {
      key: 'scheduledFor',
      header: 'Scheduled',
      cell: (payout: Payout) => (
        <span className="text-sm text-muted-foreground">
          {payout.scheduledFor
            ? formatDate(payout.scheduledFor)
            : payout.processedAt
            ? `Processed ${formatDate(payout.processedAt)}`
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (payout: Payout) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPayout(payout);
              setIsDetailDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {payout.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={() => {
                  setSelectedPayout(payout);
                  setIsProcessDialogOpen(true);
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => {
                  setSelectedPayout(payout);
                  setIsCancelDialogOpen(true);
                }}
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          )}
          {payout.status === 'failed' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => handleRetry(payout)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground mt-1">
            Process and manage vendor payouts
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.pending)}</p>
                <p className="text-xs text-muted-foreground">{summary.pendingCount} payouts</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.processing)}</p>
                <p className="text-xs text-muted-foreground">{summary.processingCount} payouts</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed (This Month)</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.completed)}</p>
                <p className="text-xs text-muted-foreground">{summary.completedCount} payouts</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Payouts</CardTitle>
              <CardDescription>View and manage all vendor payout requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by vendor or ID..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              </form>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value: string) =>
                  setFilters((prev: PayoutFilters) => ({ ...prev, status: value as PayoutFilters['status'], page: 1 }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.method || 'all'}
                onValueChange={(value: string) =>
                  setFilters((prev: PayoutFilters) => ({ ...prev, method: value as PayoutFilters['method'], page: 1 }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payouts}
            isLoading={isLoading}
            onPageChange={(page: number) => setFilters((prev: PayoutFilters) => ({ ...prev, page }))}
          />
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <span>Showing {payouts.length} of {totalPayouts} payouts</span>
        </CardFooter>
      </Card>

      {/* Process Payout Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Process payout of {selectedPayout && formatCurrency(selectedPayout.amount)} to{' '}
              {selectedPayout?.vendorName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="Enter transaction reference"
                value={processReference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProcessReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payout..."
                value={processNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProcessNotes(e.target.value)}
              />
            </div>
            {selectedPayout?.bankDetails && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bank Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Account: </span>
                      {selectedPayout.bankDetails.accountName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Bank: </span>
                      {selectedPayout.bankDetails.bankName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Account #: </span>
                      {selectedPayout.bankDetails.accountNumber}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcess} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Payout Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Payout</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this payout of{' '}
              {selectedPayout && formatCurrency(selectedPayout.amount)} to {selectedPayout?.vendorName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for Cancellation</Label>
              <Textarea
                id="cancelReason"
                placeholder="Provide a reason for cancelling this payout..."
                value={cancelReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Payout
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting || !cancelReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Payout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              {selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                {getStatusBadge(selectedPayout.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vendor</span>
                <Link
                  href={`/dashboard/main-app/vendors/${selectedPayout.vendorId}`}
                  className="font-medium hover:underline"
                >
                  {selectedPayout.vendorName}
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">{formatCurrency(selectedPayout.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fee</span>
                <span>{formatCurrency(selectedPayout.fee)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Net Amount</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(selectedPayout.netAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Method</span>
                <Badge variant="outline">{getMethodLabel(selectedPayout.method)}</Badge>
              </div>
              {selectedPayout.reference && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-sm">{selectedPayout.reference}</span>
                </div>
              )}
              {selectedPayout.scheduledFor && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Scheduled For</span>
                  <span>{formatDateTime(selectedPayout.scheduledFor)}</span>
                </div>
              )}
              {selectedPayout.processedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processed At</span>
                  <span>{formatDateTime(selectedPayout.processedAt)}</span>
                </div>
              )}
              {selectedPayout.failureReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Failure Reason
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {selectedPayout.failureReason}
                  </p>
                </div>
              )}
              {selectedPayout.bankDetails && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Bank Details
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Account: </span>
                        {selectedPayout.bankDetails.accountName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bank: </span>
                        {selectedPayout.bankDetails.bankName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Account #: </span>
                        {selectedPayout.bankDetails.accountNumber}
                      </p>
                      {selectedPayout.bankDetails.routingNumber && (
                        <p>
                          <span className="text-muted-foreground">Routing #: </span>
                          {selectedPayout.bankDetails.routingNumber}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="text-xs text-muted-foreground">
                Created: {formatDateTime(selectedPayout.createdAt)}
                {selectedPayout.updatedAt !== selectedPayout.createdAt && (
                  <> • Updated: {formatDateTime(selectedPayout.updatedAt)}</>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedPayout?.status === 'pending' && (
              <Button
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  setIsProcessDialogOpen(true);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Process
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
