import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './stat-card';
import { DollarSign, Users, ShoppingCart, TrendingUp, Package, CreditCard } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying statistics on admin/vendor dashboards.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

/**
 * Default StatCard showing basic usage.
 */
export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: 'KES 1,234,567',
    description: 'Monthly revenue',
  },
};

/**
 * StatCard with positive trend.
 */
export const TrendUp: Story = {
  args: {
    title: 'Total Revenue',
    value: 'KES 1,234,567',
    trend: 'up',
    trendValue: '+12.5%',
    description: 'vs last month',
    icon: <DollarSign className="h-5 w-5" />,
  },
};

/**
 * StatCard with negative trend.
 */
export const TrendDown: Story = {
  args: {
    title: 'Orders',
    value: '1,234',
    trend: 'down',
    trendValue: '-8.2%',
    description: 'vs last month',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
};

/**
 * StatCard with neutral trend.
 */
export const TrendNeutral: Story = {
  args: {
    title: 'Active Users',
    value: '5,678',
    trend: 'neutral',
    trendValue: '0%',
    description: 'No change',
    icon: <Users className="h-5 w-5" />,
  },
};

/**
 * Success variant StatCard.
 */
export const VariantSuccess: Story = {
  args: {
    title: 'Completed Orders',
    value: '892',
    variant: 'success',
    icon: <Package className="h-5 w-5" />,
    description: 'This week',
  },
};

/**
 * Warning variant StatCard.
 */
export const VariantWarning: Story = {
  args: {
    title: 'Pending Reviews',
    value: '23',
    variant: 'warning',
    description: 'Requires attention',
  },
};

/**
 * Error variant StatCard.
 */
export const VariantError: Story = {
  args: {
    title: 'Failed Transactions',
    value: '12',
    variant: 'error',
    description: 'Last 24 hours',
  },
};

/**
 * Info variant StatCard.
 */
export const VariantInfo: Story = {
  args: {
    title: 'New Signups',
    value: '156',
    variant: 'info',
    icon: <TrendingUp className="h-5 w-5" />,
    description: 'This week',
  },
};

/**
 * StatCard in loading state.
 */
export const Loading: Story = {
  args: {
    title: 'Total Revenue',
    value: '',
    isLoading: true,
  },
};

/**
 * Clickable StatCard.
 */
export const Clickable: Story = {
  args: {
    title: 'View All Orders',
    value: '1,234',
    icon: <ShoppingCart className="h-5 w-5" />,
    onClick: () => alert('Navigating to orders...'),
  },
};

/**
 * StatCard with footer.
 */
export const WithFooter: Story = {
  args: {
    title: 'Total Sales',
    value: 'KES 2,345,678',
    icon: <CreditCard className="h-5 w-5" />,
    trend: 'up',
    trendValue: '+15.3%',
    footer: (
      <div className="text-xs text-muted-foreground">
        Updated 5 minutes ago
      </div>
    ),
  },
};

/**
 * Dashboard layout with multiple StatCards.
 */
export const DashboardLayout: Story = {
  decorators: [
    () => (
      <div className="grid grid-cols-2 gap-4 w-[640px]">
        <StatCard
          title="Total Revenue"
          value="KES 1,234,567"
          trend="up"
          trendValue="+12.5%"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Total Orders"
          value="5,678"
          trend="up"
          trendValue="+8.2%"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Active Users"
          value="12,345"
          trend="neutral"
          trendValue="0%"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Products"
          value="892"
          trend="down"
          trendValue="-2.1%"
          icon={<Package className="h-5 w-5" />}
        />
      </div>
    ),
  ],
};
