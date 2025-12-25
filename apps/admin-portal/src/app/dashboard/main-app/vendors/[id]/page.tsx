'use client';

/**
 * Admin Vendor Detail Page
 * ========================
 * 
 * Detailed vendor profile view with:
 * - Profile & verification information
 * - Performance metrics
 * - Product listings
 * - Payout history
 * - Documents review
 * - Administrative actions
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  DollarSign,
  Shield,
  ShieldCheck,
  ShieldX,
  Ban,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Star,
  TrendingUp,
  FileText,
  BadgeCheck,
  Download,
  CreditCard,
  Percent,
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
  Progress,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import {
  adminGetVendor,
  adminGetVendorPayouts,
  adminGetVendorPerformance,
  adminGetVendorDocuments,
  adminSuspendVendor,
  adminUnsuspendVendor,
  adminActivateVendor,
  adminVerifyVendor,
  adminReviewDocument,
  adminUpdateCommissionRate,
  adminNotifyVendor,
  type AdminVendor,
  type VendorPayout,
  type VendorPerformance,
  type VendorDocument,
  type AdminVendorStatus,
  type VerificationStatus,
} from '@tbk/api-client';

// Local type alias for convenience
type VendorStatus = AdminVendorStatus;

// =============================================================================
// Types
// =============================================================================

interface VendorPageState {
  vendor: AdminVendor | null;
  payouts: VendorPayout[];
  performance: VendorPerformance[];
  documents: VendorDocument[];
  loading: boolean;
  payoutsLoading: boolean;
  performanceLoading: boolean;
  documentsLoading: boolean;
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
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateString);
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

function getPayoutStatusBadge(status: VendorPayout['status']) {
  const config: Record<VendorPayout['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    pending: { variant: 'secondary' },
    processing: { variant: 'outline', className: 'border-blue-500 text-blue-600' },
    completed: { variant: 'default', className: 'bg-green-500' },
    failed: { variant: 'destructive' },
  };

  const { variant, className } = config[status];
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

function getDocumentStatusBadge(status: VendorDocument['status']) {
  const config: Record<VendorDocument['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    pending: { variant: 'secondary' },
    approved: { variant: 'default', className: 'bg-green-500' },
    rejected: { variant: 'destructive' },
  };

  const { variant, className } = config[status];
  return <Badge variant={variant} className={className}>{status}</Badge>;
}

// =============================================================================
// Component
// =============================================================================

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  // State
  const [state, setState] = useState<VendorPageState>({
    vendor: null,
    payouts: [],
    performance: [],
    documents: [],
    loading: true,
    payoutsLoading: false,
    performanceLoading: false,
    documentsLoading: false,
    error: null,
  });

  // Action dialogs
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch vendor
  const fetchVendor = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await adminGetVendor(vendorId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          vendor: response.data,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vendor',
      }));
    }
  }, [vendorId]);

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    setState(prev => ({ ...prev, payoutsLoading: true }));

    try {
      const response = await adminGetVendorPayouts(vendorId, { page: 1, limit: 10 });
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          payouts: response.data.payouts,
          payoutsLoading: false,
        }));
      }
    } catch {
      setState(prev => ({ ...prev, payoutsLoading: false }));
    }
  }, [vendorId]);

  // Fetch performance
  const fetchPerformance = useCallback(async () => {
    setState(prev => ({ ...prev, performanceLoading: true }));

    try {
      const response = await adminGetVendorPerformance(vendorId, { period: 'month' });
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          performance: response.data,
          performanceLoading: false,
        }));
      }
    } catch {
      setState(prev => ({ ...prev, performanceLoading: false }));
    }
  }, [vendorId]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setState(prev => ({ ...prev, documentsLoading: true }));

    try {
      const response = await adminGetVendorDocuments(vendorId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          documents: response.data,
          documentsLoading: false,
        }));
      }
    } catch {
      setState(prev => ({ ...prev, documentsLoading: false }));
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendor();
    fetchPayouts();
    fetchPerformance();
    fetchDocuments();
  }, [fetchVendor, fetchPayouts, fetchPerformance, fetchDocuments]);

  // Actions
  const handleSuspend = async () => {
    if (!state.vendor || !actionReason) return;
    setActionLoading(true);
    
    try {
      await adminSuspendVendor(state.vendor.id, actionReason);
      toast('Vendor suspended');
      setSuspendDialogOpen(false);
      setActionReason('');
      fetchVendor();
    } catch {
      toast('Failed to suspend vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!state.vendor) return;
    
    try {
      await adminUnsuspendVendor(state.vendor.id);
      toast('Vendor unsuspended');
      fetchVendor();
    } catch {
      toast('Failed to unsuspend vendor');
    }
  };

  const handleActivate = async () => {
    if (!state.vendor) return;
    
    try {
      await adminActivateVendor(state.vendor.id);
      toast('Vendor activated');
      fetchVendor();
    } catch {
      toast('Failed to activate vendor');
    }
  };

  const handleVerify = async (decision: 'approve' | 'reject') => {
    if (!state.vendor) return;
    setActionLoading(true);
    
    try {
      await adminVerifyVendor(state.vendor.id, {
        decision,
        reason: decision === 'reject' ? actionReason : undefined,
      });
      toast(decision === 'approve' ? 'Vendor verified' : 'Verification rejected');
      setVerifyDialogOpen(false);
      setActionReason('');
      fetchVendor();
    } catch {
      toast('Failed to process verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewDocument = async (doc: VendorDocument, decision: 'approved' | 'rejected', reason?: string) => {
    if (!state.vendor) return;
    
    try {
      await adminReviewDocument(state.vendor.id, doc.id, decision, reason);
      toast(`Document ${decision}`);
      fetchDocuments();
    } catch {
      toast('Failed to review document');
    }
  };

  const handleNotify = async () => {
    if (!state.vendor || !notifyMessage) return;
    setActionLoading(true);
    
    try {
      await adminNotifyVendor(state.vendor.id, notifyMessage);
      toast('Notification sent');
      setNotifyDialogOpen(false);
      setNotifyMessage('');
    } catch {
      toast('Failed to send notification');
    } finally {
      setActionLoading(false);
    }
  };

  // Payout columns
  const payoutColumns: DataTableColumn<VendorPayout>[] = [
    {
      key: 'createdAt',
      header: 'Date',
      cell: (payout) => formatDate(payout.createdAt),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (payout) => formatCurrency(payout.amount),
    },
    {
      key: 'fee',
      header: 'Fee',
      align: 'right',
      cell: (payout) => formatCurrency(payout.fee),
    },
    {
      key: 'netAmount',
      header: 'Net',
      align: 'right',
      cell: (payout) => formatCurrency(payout.netAmount),
    },
    {
      key: 'method',
      header: 'Method',
      cell: (payout) => <Badge variant="outline">{payout.method}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payout) => getPayoutStatusBadge(payout.status),
    },
  ];

  // Document columns
  const documentColumns: DataTableColumn<VendorDocument>[] = [
    {
      key: 'type',
      header: 'Type',
      cell: (doc) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{doc.type.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (doc) => doc.name,
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      cell: (doc) => formatDate(doc.uploadedAt),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (doc) => getDocumentStatusBadge(doc.status),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (doc) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a href={doc.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          {doc.status === 'pending' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => handleReviewDocument(doc, 'approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleReviewDocument(doc, 'rejected', 'Document not acceptable')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ];

  // Loading state
  if (state.loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
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
  if (state.error || !state.vendor) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Vendor not found</h2>
        <p className="text-muted-foreground">{state.error || 'The requested vendor could not be found.'}</p>
        <Button asChild>
          <Link href="/dashboard/main-app/vendors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Link>
        </Button>
      </div>
    );
  }

  const { vendor } = state;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app/vendors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted">
            {vendor.logo ? (
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{vendor.ownerEmail}</span>
              {getStatusBadge(vendor.status)}
              {getVerificationBadge(vendor.verificationStatus)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNotifyDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Message
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
              {vendor.verificationStatus === 'pending' && (
                <>
                  <DropdownMenuItem
                    className="text-green-600"
                    onClick={() => handleVerify('approve')}
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Approve Verification
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setVerifyDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Verification
                  </DropdownMenuItem>
                </>
              )}
              {vendor.status === 'pending' && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={handleActivate}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate Vendor
                </DropdownMenuItem>
              )}
              {vendor.status === 'active' && (
                <DropdownMenuItem
                  className="text-yellow-600"
                  onClick={() => setSuspendDialogOpen(true)}
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  Suspend Vendor
                </DropdownMenuItem>
              )}
              {vendor.status === 'suspended' && (
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={handleUnsuspend}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Unsuspend Vendor
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
              <CardTitle className="text-lg">Vendor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Owner Email</div>
                  <div>{vendor.ownerEmail}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Owner Name</div>
                  <div>{vendor.ownerName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                  <div>{formatDate(vendor.createdAt)}</div>
                </div>
              </div>
              {vendor.verificationDate && (
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                    <div>{formatDate(vendor.verificationDate)}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Commission Rate</div>
                  <div>{vendor.commissionRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Products</span>
                </div>
                <span className="font-semibold">
                  {formatNumber(vendor.activeProductCount)} / {formatNumber(vendor.productCount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Total Revenue</span>
                </div>
                <span className="font-semibold">{formatCurrency(vendor.totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Orders</span>
                </div>
                <span className="font-semibold">{formatNumber(vendor.orderCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({formatNumber(vendor.reviewCount)})</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Pending Payout</span>
                  <span className="font-semibold text-green-600">{formatCurrency(vendor.pendingPayout)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Paid Out</span>
                  <span className="font-semibold">{formatCurrency(vendor.totalPayout)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flags Card */}
          {vendor.flags && vendor.flags.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Vendor Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vendor.flags.map((flag, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 rounded-lg p-3 ${
                      flag.severity === 'critical' ? 'bg-red-50 text-red-600' :
                      flag.severity === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-blue-50 text-blue-600'
                    }`}
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
          <Tabs defaultValue="payouts">
            <TabsList>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="payouts" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Payout History</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchPayouts}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    data={state.payouts}
                    columns={payoutColumns}
                    isLoading={state.payoutsLoading}
                    emptyMessage="No payouts found"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Verification Documents</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchDocuments}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    data={state.documents}
                    columns={documentColumns}
                    isLoading={state.documentsLoading}
                    emptyMessage="No documents uploaded"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchPerformance}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {state.performanceLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : state.performance.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No performance data available
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {state.performance.map((perf, index) => (
                        <div key={index} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{perf.period}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatNumber(perf.orderCount)} orders
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Revenue</div>
                              <div className="text-lg font-semibold">{formatCurrency(perf.revenue)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Avg. Order Value</div>
                              <div className="text-lg font-semibold">{formatCurrency(perf.averageOrderValue)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Fulfillment Rate</div>
                              <div className="flex items-center gap-2">
                                <Progress value={perf.fulfillmentRate * 100} className="flex-1" />
                                <span className="text-sm font-medium">{(perf.fulfillmentRate * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Return Rate</div>
                              <div className="flex items-center gap-2">
                                <Progress value={perf.returnRate * 100} className="flex-1" />
                                <span className="text-sm font-medium">{(perf.returnRate * 100).toFixed(1)}%</span>
                              </div>
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
            <AlertDialogTitle>Suspend Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{vendor.name}"?
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

      {/* Verify Reject Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the verification for "{vendor.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter rejection reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleVerify('reject')}
              disabled={actionLoading || !actionReason}
              className="bg-destructive text-destructive-foreground"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Verification'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notify Dialog */}
      <AlertDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Message</AlertDialogTitle>
            <AlertDialogDescription>
              Send a notification message to "{vendor.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Enter your message..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNotify}
              disabled={actionLoading || !notifyMessage}
            >
              {actionLoading ? 'Sending...' : 'Send Message'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
