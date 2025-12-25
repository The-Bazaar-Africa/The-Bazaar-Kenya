'use client';

import { cn, Badge } from '@tbk/ui';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@tbk/types';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getStatusTimeline,
  getOrderProgress,
} from '@/lib/order-workflow';

// Icon mapping
const STATUS_ICONS: Record<string, React.ReactNode> = {
  Clock: <Clock className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  XCircle: <XCircle className="h-4 w-4" />,
  RotateCcw: <RotateCcw className="h-4 w-4" />,
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OrderStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className,
}: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  const icon = STATUS_ICONS[config.icon];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        config.color,
        sizeClasses[size],
        'inline-flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && icon}
      {config.label}
    </Badge>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PaymentStatusBadge({
  status,
  size = 'md',
  className,
}: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(config.color, sizeClasses[size], className)}
    >
      {config.label}
    </Badge>
  );
}

interface OrderProgressBarProps {
  status: OrderStatus;
  showLabels?: boolean;
  className?: string;
}

export function OrderProgressBar({
  status,
  showLabels = false,
  className,
}: OrderProgressBarProps) {
  const progress = getOrderProgress(status);
  const config = ORDER_STATUS_CONFIG[status];

  // Handle terminal states
  const isTerminal = status === 'cancelled' || status === 'refunded';

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
            isTerminal ? 'bg-gray-400' : 'bg-green-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Order Placed</span>
          <span className={cn('text-xs', config.color)}>{config.label}</span>
          <span className="text-xs text-muted-foreground">Delivered</span>
        </div>
      )}
    </div>
  );
}

interface OrderStatusTimelineProps {
  status: OrderStatus;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
  className?: string;
}

export function OrderStatusTimeline({
  status,
  orientation = 'horizontal',
  compact = false,
  className,
}: OrderStatusTimelineProps) {
  const timeline = getStatusTimeline(status);

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {timeline.map((step, index) => (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  step.completed && 'bg-green-500 border-green-500 text-white',
                  step.current && 'bg-blue-500 border-blue-500 text-white',
                  step.skipped && 'bg-gray-100 border-gray-300 text-gray-400',
                  !step.completed && !step.current && !step.skipped && 'bg-white border-gray-300 text-gray-400'
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.current ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              {index < timeline.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-8',
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            <div className={cn('pt-1', compact ? 'pb-4' : 'pb-6')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.current && 'text-blue-600',
                  step.completed && 'text-green-600',
                  step.skipped && 'text-gray-400 line-through'
                )}
              >
                {step.label}
              </p>
              {!compact && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ORDER_STATUS_CONFIG[step.status].description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal timeline
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {timeline.map((step, index) => (
        <div key={step.status} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                step.completed && 'bg-green-500 border-green-500 text-white',
                step.current && 'bg-blue-500 border-blue-500 text-white',
                step.skipped && 'bg-gray-100 border-gray-300 text-gray-400',
                !step.completed && !step.current && !step.skipped && 'bg-white border-gray-300 text-gray-400'
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : step.current ? (
                <div className="w-2 h-2 bg-white rounded-full" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            {!compact && (
              <span
                className={cn(
                  'mt-2 text-xs text-center',
                  step.current && 'font-medium text-blue-600',
                  step.completed && 'text-green-600',
                  step.skipped && 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            )}
          </div>
          {index < timeline.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2',
                step.completed ? 'bg-green-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface StatusChangeIndicatorProps {
  from: OrderStatus;
  to: OrderStatus;
  className?: string;
}

export function StatusChangeIndicator({
  from,
  to,
  className,
}: StatusChangeIndicatorProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <OrderStatusBadge status={from} size="sm" showIcon={false} />
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <OrderStatusBadge status={to} size="sm" showIcon={false} />
    </div>
  );
}
