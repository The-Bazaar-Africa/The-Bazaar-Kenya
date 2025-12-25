'use client';

/**
 * Admin Order Detail Page
 * =======================
 * 
 * Detailed order view with:
 * - Order information
 * - Timeline/activity log
 * - Status management
 * - Customer & shipping info
 * - Order items
 * - Notes & flags
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  Truck,
  XCircle,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  MessageSquare,
  Flag,
  RefreshCw,
  Copy,
  ExternalLink,
  Printer,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@tbk/ui';
import {
  adminGetOrder,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminAddOrderNote,
  adminRefundOrder,
  adminAddShippingInfo,
  type AdminOrder,
  type OrderTimelineEvent,
  type OrderStatus,
} from '@tbk/api-client';

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
    pending: <Clock className="h-4 w-4" />,
    confirmed: <CheckCircle className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
    refunded: <DollarSign className="h-4 w-4" />,
  };
  return icons[status] || <Clock className="h-4 w-4" />;
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

// =============================================================================
// Component
// =============================================================================

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  // State
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Dialog states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch order
  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      setError(null);

      try {
        const response = await adminGetOrder(id);
        if (response.success && response.data) {
          setOrder(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  // Handlers
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(id);
    toast('Order ID copied to clipboard');
  };

  const handleCopyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      toast('Order number copied to clipboard');
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setActionLoading(true);
    try {
      await adminUpdateOrderStatus(id, { status: newStatus as OrderStatus });
      toast('Order status updated');
      // Refetch order
      const response = await adminGetOrder(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch {
      toast('Failed to update status');
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
      setNewStatus('');
    }
  };

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      await adminCancelOrder(id, 'Cancelled by admin');
      toast('Order cancelled');
      // Refetch order
      const response = await adminGetOrder(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch {
      toast('Failed to cancel order');
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setActionLoading(true);
    try {
      await adminAddOrderNote(id, newNote, true);
      toast('Note added');
      // Refetch order
      const response = await adminGetOrder(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch {
      toast('Failed to add note');
    } finally {
      setActionLoading(false);
      setNoteDialogOpen(false);
      setNewNote('');
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) return;
    setActionLoading(true);
    try {
      await adminRefundOrder(id, {
        amount: parseFloat(refundAmount),
        reason: refundReason,
      });
      toast('Refund processed');
      // Refetch order
      const response = await adminGetOrder(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch {
      toast('Failed to process refund');
    } finally {
      setActionLoading(false);
      setRefundDialogOpen(false);
      setRefundAmount('');
      setRefundReason('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Order Not Found</h2>
        <p className="text-muted-foreground">{error || 'The order you are looking for does not exist.'}</p>
        <Button asChild>
          <Link href="/dashboard/main-app/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const availableTransitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/main-app/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <Badge className={`text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              <span>{formatDateTime(order.createdAt)}</span>
              <button
                onClick={handleCopyOrderId}
                className="flex items-center gap-1 text-sm hover:text-foreground transition-colors"
              >
                ID: {order.id.slice(0, 8)}...
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {availableTransitions.length > 0 && (
            <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items?.length || 0} item(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product?.name || 'Product'}
                          width={64}
                          height={64}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <Package className="h-full w-full p-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {item.productId.slice(0, 8)}... • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Order history and updates</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setNoteDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline?.map((event: OrderTimelineEvent, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        event.type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'note' ? 'bg-gray-100 text-gray-600' :
                        event.type === 'payment' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {event.type === 'status_change' ? <RefreshCw className="h-4 w-4" /> :
                         event.type === 'note' ? <MessageSquare className="h-4 w-4" /> :
                         event.type === 'payment' ? <DollarSign className="h-4 w-4" /> :
                         <Clock className="h-4 w-4" />}
                      </div>
                      {index < (order.timeline?.length || 0) - 1 && (
                        <div className="absolute top-8 left-1/2 w-px h-full -translate-x-1/2 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{event.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(event.createdAt)}
                        {event.createdBy && ` • ${event.createdBy.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.buyer?.fullName || 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{order.buyer?.email}</span>
              </div>
              {order.buyer?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{order.buyer.phone}</span>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link href={`/dashboard/main-app/users/${order.buyerId}`}>
                  View Customer
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address provided</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setRefundDialogOpen(true)}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Refund
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.internalNotes && order.internalNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.internalNotes.map((note, index) => (
                    <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                      <p>{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(note.createdAt)} • {note.createdBy.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Update Status Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new status for this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <span className="capitalize">{status}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus} disabled={actionLoading || !newStatus}>
              {actionLoading ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogCancel disabled={actionLoading}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Note Dialog */}
      <AlertDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Note</AlertDialogTitle>
            <AlertDialogDescription>
              Add an internal note to this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddNote} disabled={actionLoading || !newNote.trim()}>
              {actionLoading ? 'Adding...' : 'Add Note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the refund amount and reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  step="0.01"
                  max={order.total}
                  placeholder="0.00"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full pl-7 pr-4 py-2 border rounded-md"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Max: {formatCurrency(order.total)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Enter refund reason..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={actionLoading || !refundAmount || !refundReason}
            >
              {actionLoading ? 'Processing...' : 'Process Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
