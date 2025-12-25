'use client';

/**
 * StatCard Component
 * ===================
 * A card component for displaying statistics on admin/vendor dashboards.
 * 
 * @example
 * ```tsx
 * import { StatCard } from '@tbk/ui';
 * 
 * <StatCard
 *   title="Total Revenue"
 *   value="KES 1,234,567"
 *   description="+12.5% from last month"
 *   icon={<DollarSignIcon />}
 *   trend="up"
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './card';

// =============================================================================
// TYPES
// =============================================================================

export type StatCardTrend = 'up' | 'down' | 'neutral';
export type StatCardVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional description or subtitle */
  description?: string;
  /** Trend direction (affects color) */
  trend?: StatCardTrend;
  /** Trend value (e.g., "+12.5%") */
  trendValue?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Card variant (affects styling) */
  variant?: StatCardVariant;
  /** Loading state */
  isLoading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** Footer content */
  footer?: React.ReactNode;
}

// =============================================================================
// ICONS
// =============================================================================

const TrendUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-green-500"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-red-500"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

// =============================================================================
// COMPONENT
// =============================================================================

export function StatCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
  variant = 'default',
  isLoading = false,
  onClick,
  className,
  footer,
}: StatCardProps) {
  // Variant styles
  const variantStyles: Record<StatCardVariant, string> = {
    default: '',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  };

  // Trend styles
  const trendStyles: Record<StatCardTrend, string> = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  // Icon background styles by variant
  const iconBgStyles: Record<StatCardVariant, string> = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  };

  return (
    <Card
      className={cn(
        'transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div
            className={cn(
              'h-8 w-8 rounded-md flex items-center justify-center',
              iconBgStyles[variant]
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{value}</div>
              {trend && trendValue && (
                <div className={cn('flex items-center gap-1 text-sm', trendStyles[trend])}>
                  {trend === 'up' && <TrendUpIcon />}
                  {trend === 'down' && <TrendDownIcon />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {footer && <div className="mt-3 pt-3 border-t">{footer}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// STAT CARD GROUP
// =============================================================================

export interface StatCardGroupProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns (responsive) */
  columns?: 1 | 2 | 3 | 4;
}

export function StatCardGroup({
  children,
  className,
  columns = 4,
}: StatCardGroupProps) {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
