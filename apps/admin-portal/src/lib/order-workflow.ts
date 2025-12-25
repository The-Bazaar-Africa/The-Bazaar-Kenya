/**
 * Order Status Workflow / State Machine
 * Defines valid transitions, actions, and metadata for order statuses
 */

import type { OrderStatus, PaymentStatus } from '@tbk/types';

// Status metadata with colors, labels, and descriptions
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: string; // Lucide icon name
  }
> = {
  pending: {
    label: 'Pending',
    description: 'Order placed, awaiting confirmation',
    color: 'text-yellow-600 bg-yellow-50',
    badgeVariant: 'secondary',
    icon: 'Clock',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Order confirmed, awaiting processing',
    color: 'text-blue-600 bg-blue-50',
    badgeVariant: 'default',
    icon: 'CheckCircle',
  },
  processing: {
    label: 'Processing',
    description: 'Order is being prepared',
    color: 'text-purple-600 bg-purple-50',
    badgeVariant: 'default',
    icon: 'Package',
  },
  shipped: {
    label: 'Shipped',
    description: 'Order has been shipped',
    color: 'text-indigo-600 bg-indigo-50',
    badgeVariant: 'default',
    icon: 'Truck',
  },
  delivered: {
    label: 'Delivered',
    description: 'Order has been delivered',
    color: 'text-green-600 bg-green-50',
    badgeVariant: 'default',
    icon: 'CheckCircle2',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    color: 'text-red-600 bg-red-50',
    badgeVariant: 'destructive',
    icon: 'XCircle',
  },
  refunded: {
    label: 'Refunded',
    description: 'Order has been refunded',
    color: 'text-gray-600 bg-gray-50',
    badgeVariant: 'outline',
    icon: 'RotateCcw',
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    description: string;
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: {
    label: 'Pending',
    description: 'Payment is pending',
    color: 'text-yellow-600 bg-yellow-50',
    badgeVariant: 'secondary',
  },
  paid: {
    label: 'Paid',
    description: 'Payment received',
    color: 'text-green-600 bg-green-50',
    badgeVariant: 'default',
  },
  failed: {
    label: 'Failed',
    description: 'Payment failed',
    color: 'text-red-600 bg-red-50',
    badgeVariant: 'destructive',
  },
  refunded: {
    label: 'Refunded',
    description: 'Payment refunded',
    color: 'text-gray-600 bg-gray-50',
    badgeVariant: 'outline',
  },
};

// Valid status transitions (state machine)
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [], // Terminal state
  refunded: [], // Terminal state
};

// Actions available for each status
export interface StatusAction {
  status: OrderStatus;
  label: string;
  description: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export function getAvailableStatusActions(currentStatus: OrderStatus): StatusAction[] {
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
  
  return validTransitions.map((status) => {
    const config = ORDER_STATUS_CONFIG[status];
    
    // Special handling for destructive actions
    const isDestructive = status === 'cancelled' || status === 'refunded';
    
    return {
      status,
      label: `Mark as ${config.label}`,
      description: config.description,
      variant: isDestructive ? 'destructive' : 'default',
      requiresConfirmation: isDestructive,
      confirmationMessage: isDestructive
        ? `Are you sure you want to ${status === 'cancelled' ? 'cancel' : 'refund'} this order? This action cannot be undone.`
        : undefined,
    } as StatusAction;
  });
}

// Check if a status transition is valid
export function isValidTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}

// Check if order can be cancelled
export function canCancelOrder(status: OrderStatus): boolean {
  return ['pending', 'confirmed', 'processing', 'shipped'].includes(status);
}

// Check if order can be refunded
export function canRefundOrder(status: OrderStatus, paymentStatus: PaymentStatus): boolean {
  // Can only refund delivered orders that were paid
  return status === 'delivered' && paymentStatus === 'paid';
}

// Check if order is in a terminal state
export function isTerminalStatus(status: OrderStatus): boolean {
  return status === 'cancelled' || status === 'refunded';
}

// Check if order is active (not cancelled or refunded)
export function isActiveOrder(status: OrderStatus): boolean {
  return !isTerminalStatus(status);
}

// Get the next logical status in the workflow
export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const progressionMap: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'confirmed',
    confirmed: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
  };
  
  return progressionMap[currentStatus] || null;
}

// Get the progress percentage based on status
export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 10,
    confirmed: 25,
    processing: 50,
    shipped: 75,
    delivered: 100,
    cancelled: 0,
    refunded: 0,
  };
  
  return progressMap[status];
}

// Order status timeline for display
export interface StatusTimelineStep {
  status: OrderStatus;
  label: string;
  completed: boolean;
  current: boolean;
  skipped: boolean;
}

export function getStatusTimeline(
  currentStatus: OrderStatus
): StatusTimelineStep[] {
  const normalFlow: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
  ];
  
  // Handle terminal states
  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    const currentIndex = normalFlow.indexOf(currentStatus);
    return normalFlow.map((status, index) => ({
      status,
      label: ORDER_STATUS_CONFIG[status].label,
      completed: false,
      current: false,
      skipped: true,
    })).concat([{
      status: currentStatus,
      label: ORDER_STATUS_CONFIG[currentStatus].label,
      completed: true,
      current: true,
      skipped: false,
    }]);
  }
  
  const currentIndex = normalFlow.indexOf(currentStatus);
  
  return normalFlow.map((status, index) => ({
    status,
    label: ORDER_STATUS_CONFIG[status].label,
    completed: index < currentIndex,
    current: index === currentIndex,
    skipped: false,
  }));
}

// Validation rules for status transitions
export interface TransitionValidation {
  valid: boolean;
  reason?: string;
}

export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  paymentStatus: PaymentStatus
): TransitionValidation {
  // Check if transition is allowed
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      reason: `Cannot transition from "${ORDER_STATUS_CONFIG[currentStatus].label}" to "${ORDER_STATUS_CONFIG[newStatus].label}"`,
    };
  }
  
  // Special validations
  if (newStatus === 'refunded' && paymentStatus !== 'paid') {
    return {
      valid: false,
      reason: 'Cannot refund an order that has not been paid',
    };
  }
  
  if (newStatus === 'shipped' && paymentStatus !== 'paid') {
    return {
      valid: false,
      reason: 'Cannot ship an order that has not been paid',
    };
  }
  
  return { valid: true };
}

// Bulk action support
export interface BulkActionResult {
  success: string[];
  failed: { id: string; reason: string }[];
}

export function canBulkTransition(
  orders: Array<{ id: string; status: OrderStatus; paymentStatus: PaymentStatus }>,
  newStatus: OrderStatus
): { canTransition: string[]; cannotTransition: { id: string; reason: string }[] } {
  const canTransition: string[] = [];
  const cannotTransition: { id: string; reason: string }[] = [];
  
  for (const order of orders) {
    const validation = validateStatusTransition(order.status, newStatus, order.paymentStatus);
    
    if (validation.valid) {
      canTransition.push(order.id);
    } else {
      cannotTransition.push({
        id: order.id,
        reason: validation.reason || 'Invalid transition',
      });
    }
  }
  
  return { canTransition, cannotTransition };
}

// Status-based filtering helpers
export function getActiveStatuses(): OrderStatus[] {
  return ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
}

export function getTerminalStatuses(): OrderStatus[] {
  return ['cancelled', 'refunded'];
}

export function getFulfillmentStatuses(): OrderStatus[] {
  return ['processing', 'shipped', 'delivered'];
}

// Export all statuses for iteration
export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export const ALL_PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'paid',
  'failed',
  'refunded',
];
