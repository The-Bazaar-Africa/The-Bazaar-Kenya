/**
 * Order Workflow Tests
 * 
 * Tests for the order status state machine and workflow utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  VALID_STATUS_TRANSITIONS,
  getAvailableStatusActions,
  isValidTransition,
  canCancelOrder,
  canRefundOrder,
  isTerminalStatus,
  isActiveOrder,
  getNextStatus,
  getOrderProgress,
  getStatusTimeline,
  validateStatusTransition,
  canBulkTransition,
  getActiveStatuses,
  getTerminalStatuses,
  getFulfillmentStatuses,
  ALL_ORDER_STATUSES,
  ALL_PAYMENT_STATUSES,
} from '../lib/order-workflow';
import type { OrderStatus, PaymentStatus } from '@tbk/types';

describe('Order Workflow', () => {
  // ==========================================================================
  // Status Configuration
  // ==========================================================================
  describe('ORDER_STATUS_CONFIG', () => {
    it('should have config for all order statuses', () => {
      const statuses: OrderStatus[] = [
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
      ];
      
      for (const status of statuses) {
        expect(ORDER_STATUS_CONFIG[status]).toBeDefined();
        expect(ORDER_STATUS_CONFIG[status].label).toBeTruthy();
        expect(ORDER_STATUS_CONFIG[status].description).toBeTruthy();
        expect(ORDER_STATUS_CONFIG[status].color).toBeTruthy();
        expect(ORDER_STATUS_CONFIG[status].badgeVariant).toBeTruthy();
        expect(ORDER_STATUS_CONFIG[status].icon).toBeTruthy();
      }
    });
  });

  describe('PAYMENT_STATUS_CONFIG', () => {
    it('should have config for all payment statuses', () => {
      const statuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];
      
      for (const status of statuses) {
        expect(PAYMENT_STATUS_CONFIG[status]).toBeDefined();
        expect(PAYMENT_STATUS_CONFIG[status].label).toBeTruthy();
      }
    });
  });

  // ==========================================================================
  // State Machine Transitions
  // ==========================================================================
  describe('VALID_STATUS_TRANSITIONS', () => {
    it('pending can transition to confirmed or cancelled', () => {
      expect(VALID_STATUS_TRANSITIONS.pending).toContain('confirmed');
      expect(VALID_STATUS_TRANSITIONS.pending).toContain('cancelled');
      expect(VALID_STATUS_TRANSITIONS.pending).not.toContain('delivered');
    });

    it('confirmed can transition to processing or cancelled', () => {
      expect(VALID_STATUS_TRANSITIONS.confirmed).toContain('processing');
      expect(VALID_STATUS_TRANSITIONS.confirmed).toContain('cancelled');
    });

    it('processing can transition to shipped or cancelled', () => {
      expect(VALID_STATUS_TRANSITIONS.processing).toContain('shipped');
      expect(VALID_STATUS_TRANSITIONS.processing).toContain('cancelled');
    });

    it('shipped can transition to delivered or cancelled', () => {
      expect(VALID_STATUS_TRANSITIONS.shipped).toContain('delivered');
      expect(VALID_STATUS_TRANSITIONS.shipped).toContain('cancelled');
    });

    it('delivered can only transition to refunded', () => {
      expect(VALID_STATUS_TRANSITIONS.delivered).toEqual(['refunded']);
    });

    it('cancelled is a terminal state', () => {
      expect(VALID_STATUS_TRANSITIONS.cancelled).toEqual([]);
    });

    it('refunded is a terminal state', () => {
      expect(VALID_STATUS_TRANSITIONS.refunded).toEqual([]);
    });
  });

  // ==========================================================================
  // isValidTransition
  // ==========================================================================
  describe('isValidTransition()', () => {
    it('should return true for valid transitions', () => {
      expect(isValidTransition('pending', 'confirmed')).toBe(true);
      expect(isValidTransition('confirmed', 'processing')).toBe(true);
      expect(isValidTransition('processing', 'shipped')).toBe(true);
      expect(isValidTransition('shipped', 'delivered')).toBe(true);
      expect(isValidTransition('delivered', 'refunded')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition('pending', 'delivered')).toBe(false);
      expect(isValidTransition('pending', 'shipped')).toBe(false);
      expect(isValidTransition('confirmed', 'delivered')).toBe(false);
      expect(isValidTransition('cancelled', 'pending')).toBe(false);
      expect(isValidTransition('refunded', 'delivered')).toBe(false);
    });

    it('should allow cancellation from active states', () => {
      expect(isValidTransition('pending', 'cancelled')).toBe(true);
      expect(isValidTransition('confirmed', 'cancelled')).toBe(true);
      expect(isValidTransition('processing', 'cancelled')).toBe(true);
      expect(isValidTransition('shipped', 'cancelled')).toBe(true);
    });
  });

  // ==========================================================================
  // getAvailableStatusActions
  // ==========================================================================
  describe('getAvailableStatusActions()', () => {
    it('should return correct actions for pending status', () => {
      const actions = getAvailableStatusActions('pending');
      
      expect(actions).toHaveLength(2);
      expect(actions.map(a => a.status)).toContain('confirmed');
      expect(actions.map(a => a.status)).toContain('cancelled');
    });

    it('should mark destructive actions as requiring confirmation', () => {
      const actions = getAvailableStatusActions('pending');
      const cancelAction = actions.find(a => a.status === 'cancelled');
      
      expect(cancelAction?.requiresConfirmation).toBe(true);
      expect(cancelAction?.variant).toBe('destructive');
      expect(cancelAction?.confirmationMessage).toBeTruthy();
    });

    it('should return empty array for terminal states', () => {
      expect(getAvailableStatusActions('cancelled')).toEqual([]);
      expect(getAvailableStatusActions('refunded')).toEqual([]);
    });
  });

  // ==========================================================================
  // canCancelOrder
  // ==========================================================================
  describe('canCancelOrder()', () => {
    it('should allow cancellation for active orders', () => {
      expect(canCancelOrder('pending')).toBe(true);
      expect(canCancelOrder('confirmed')).toBe(true);
      expect(canCancelOrder('processing')).toBe(true);
      expect(canCancelOrder('shipped')).toBe(true);
    });

    it('should not allow cancellation for terminal states', () => {
      expect(canCancelOrder('delivered')).toBe(false);
      expect(canCancelOrder('cancelled')).toBe(false);
      expect(canCancelOrder('refunded')).toBe(false);
    });
  });

  // ==========================================================================
  // canRefundOrder
  // ==========================================================================
  describe('canRefundOrder()', () => {
    it('should allow refund for delivered and paid orders', () => {
      expect(canRefundOrder('delivered', 'paid')).toBe(true);
    });

    it('should not allow refund for non-delivered orders', () => {
      expect(canRefundOrder('pending', 'paid')).toBe(false);
      expect(canRefundOrder('confirmed', 'paid')).toBe(false);
      expect(canRefundOrder('processing', 'paid')).toBe(false);
      expect(canRefundOrder('shipped', 'paid')).toBe(false);
    });

    it('should not allow refund for unpaid orders', () => {
      expect(canRefundOrder('delivered', 'pending')).toBe(false);
      expect(canRefundOrder('delivered', 'failed')).toBe(false);
    });
  });

  // ==========================================================================
  // isTerminalStatus
  // ==========================================================================
  describe('isTerminalStatus()', () => {
    it('should identify terminal states', () => {
      expect(isTerminalStatus('cancelled')).toBe(true);
      expect(isTerminalStatus('refunded')).toBe(true);
    });

    it('should return false for non-terminal states', () => {
      expect(isTerminalStatus('pending')).toBe(false);
      expect(isTerminalStatus('confirmed')).toBe(false);
      expect(isTerminalStatus('processing')).toBe(false);
      expect(isTerminalStatus('shipped')).toBe(false);
      expect(isTerminalStatus('delivered')).toBe(false);
    });
  });

  // ==========================================================================
  // isActiveOrder
  // ==========================================================================
  describe('isActiveOrder()', () => {
    it('should return true for active orders', () => {
      expect(isActiveOrder('pending')).toBe(true);
      expect(isActiveOrder('confirmed')).toBe(true);
      expect(isActiveOrder('processing')).toBe(true);
      expect(isActiveOrder('shipped')).toBe(true);
      expect(isActiveOrder('delivered')).toBe(true);
    });

    it('should return false for terminal states', () => {
      expect(isActiveOrder('cancelled')).toBe(false);
      expect(isActiveOrder('refunded')).toBe(false);
    });
  });

  // ==========================================================================
  // getNextStatus
  // ==========================================================================
  describe('getNextStatus()', () => {
    it('should return the next logical status', () => {
      expect(getNextStatus('pending')).toBe('confirmed');
      expect(getNextStatus('confirmed')).toBe('processing');
      expect(getNextStatus('processing')).toBe('shipped');
      expect(getNextStatus('shipped')).toBe('delivered');
    });

    it('should return null for terminal or final states', () => {
      expect(getNextStatus('delivered')).toBeNull();
      expect(getNextStatus('cancelled')).toBeNull();
      expect(getNextStatus('refunded')).toBeNull();
    });
  });

  // ==========================================================================
  // getOrderProgress
  // ==========================================================================
  describe('getOrderProgress()', () => {
    it('should return correct progress percentages', () => {
      expect(getOrderProgress('pending')).toBe(10);
      expect(getOrderProgress('confirmed')).toBe(25);
      expect(getOrderProgress('processing')).toBe(50);
      expect(getOrderProgress('shipped')).toBe(75);
      expect(getOrderProgress('delivered')).toBe(100);
    });

    it('should return 0 for terminal states', () => {
      expect(getOrderProgress('cancelled')).toBe(0);
      expect(getOrderProgress('refunded')).toBe(0);
    });
  });

  // ==========================================================================
  // getStatusTimeline
  // ==========================================================================
  describe('getStatusTimeline()', () => {
    it('should return correct timeline for pending order', () => {
      const timeline = getStatusTimeline('pending');
      
      expect(timeline).toHaveLength(5);
      expect(timeline[0].status).toBe('pending');
      expect(timeline[0].current).toBe(true);
      expect(timeline[0].completed).toBe(false);
      expect(timeline[1].completed).toBe(false);
    });

    it('should mark previous steps as completed', () => {
      const timeline = getStatusTimeline('processing');
      
      expect(timeline[0].completed).toBe(true); // pending
      expect(timeline[1].completed).toBe(true); // confirmed
      expect(timeline[2].current).toBe(true);   // processing
      expect(timeline[2].completed).toBe(false);
    });

    it('should handle terminal states', () => {
      const cancelledTimeline = getStatusTimeline('cancelled');
      
      // Should have normal flow + cancelled status
      expect(cancelledTimeline.some(s => s.status === 'cancelled')).toBe(true);
      expect(cancelledTimeline.some(s => s.skipped)).toBe(true);
    });
  });

  // ==========================================================================
  // validateStatusTransition
  // ==========================================================================
  describe('validateStatusTransition()', () => {
    it('should validate normal transitions', () => {
      const result = validateStatusTransition('pending', 'confirmed', 'pending');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid transitions', () => {
      const result = validateStatusTransition('pending', 'delivered', 'pending');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeTruthy();
    });

    it('should reject refund for unpaid orders', () => {
      const result = validateStatusTransition('delivered', 'refunded', 'pending');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not been paid');
    });

    it('should reject shipping for unpaid orders', () => {
      const result = validateStatusTransition('processing', 'shipped', 'pending');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not been paid');
    });

    it('should allow shipping for paid orders', () => {
      const result = validateStatusTransition('processing', 'shipped', 'paid');
      expect(result.valid).toBe(true);
    });
  });

  // ==========================================================================
  // canBulkTransition
  // ==========================================================================
  describe('canBulkTransition()', () => {
    it('should identify which orders can transition', () => {
      const orders = [
        { id: 'order-1', status: 'pending' as OrderStatus, paymentStatus: 'paid' as PaymentStatus },
        { id: 'order-2', status: 'confirmed' as OrderStatus, paymentStatus: 'paid' as PaymentStatus },
        { id: 'order-3', status: 'cancelled' as OrderStatus, paymentStatus: 'paid' as PaymentStatus },
      ];

      const result = canBulkTransition(orders, 'cancelled');

      expect(result.canTransition).toContain('order-1');
      expect(result.canTransition).toContain('order-2');
      expect(result.cannotTransition.map(o => o.id)).toContain('order-3');
    });

    it('should provide reasons for failed transitions', () => {
      const orders = [
        { id: 'order-1', status: 'delivered' as OrderStatus, paymentStatus: 'pending' as PaymentStatus },
      ];

      const result = canBulkTransition(orders, 'refunded');

      expect(result.cannotTransition[0].reason).toBeTruthy();
    });
  });

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  describe('getActiveStatuses()', () => {
    it('should return all active statuses', () => {
      const active = getActiveStatuses();
      
      expect(active).toContain('pending');
      expect(active).toContain('confirmed');
      expect(active).toContain('processing');
      expect(active).toContain('shipped');
      expect(active).toContain('delivered');
      expect(active).not.toContain('cancelled');
      expect(active).not.toContain('refunded');
    });
  });

  describe('getTerminalStatuses()', () => {
    it('should return terminal statuses', () => {
      const terminal = getTerminalStatuses();
      
      expect(terminal).toEqual(['cancelled', 'refunded']);
    });
  });

  describe('getFulfillmentStatuses()', () => {
    it('should return fulfillment statuses', () => {
      const fulfillment = getFulfillmentStatuses();
      
      expect(fulfillment).toEqual(['processing', 'shipped', 'delivered']);
    });
  });

  // ==========================================================================
  // Constants
  // ==========================================================================
  describe('ALL_ORDER_STATUSES', () => {
    it('should contain all 7 order statuses', () => {
      expect(ALL_ORDER_STATUSES).toHaveLength(7);
      expect(ALL_ORDER_STATUSES).toContain('pending');
      expect(ALL_ORDER_STATUSES).toContain('confirmed');
      expect(ALL_ORDER_STATUSES).toContain('processing');
      expect(ALL_ORDER_STATUSES).toContain('shipped');
      expect(ALL_ORDER_STATUSES).toContain('delivered');
      expect(ALL_ORDER_STATUSES).toContain('cancelled');
      expect(ALL_ORDER_STATUSES).toContain('refunded');
    });
  });

  describe('ALL_PAYMENT_STATUSES', () => {
    it('should contain all 4 payment statuses', () => {
      expect(ALL_PAYMENT_STATUSES).toHaveLength(4);
      expect(ALL_PAYMENT_STATUSES).toContain('pending');
      expect(ALL_PAYMENT_STATUSES).toContain('paid');
      expect(ALL_PAYMENT_STATUSES).toContain('failed');
      expect(ALL_PAYMENT_STATUSES).toContain('refunded');
    });
  });
});
