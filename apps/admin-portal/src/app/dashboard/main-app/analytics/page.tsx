'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Store,
  Eye,
  Clock,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  UserPlus,
  Repeat,
  ShoppingBag,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from '@tbk/ui';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

interface TopItem {
  id: string;
  name: string;
  value: number;
  change?: number;
  subtitle?: string;
  imageUrl?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({ title, value, change, changeLabel, icon, trend }: MetricCard) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className="flex items-center mt-1 text-xs">
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
              <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
                {formatPercent(change)}
              </span>
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  showComparison?: boolean;
}

function SimpleBarChart({ data, height = 200, showComparison = false }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.previousValue || 0)));
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((point, i) => {
        const currentHeight = (point.value / maxValue) * 100;
        const prevHeight = point.previousValue ? (point.previousValue / maxValue) * 100 : 0;
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-1" style={{ height: height - 24 }}>
              {showComparison && point.previousValue !== undefined && (
                <div
                  className="w-3 bg-muted rounded-t transition-all"
                  style={{ height: `${prevHeight}%` }}
                  title={`Previous: ${formatNumber(point.previousValue)}`}
                />
              )}
              <div
                className="w-6 bg-primary rounded-t transition-all hover:bg-primary/80"
                style={{ height: `${Math.max(currentHeight, 2)}%` }}
                title={`${point.label}: ${formatNumber(point.value)}`}
              />
            </div>
            <span className="text-xs text-muted-foreground truncate w-full text-center">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

function SimpleDonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="-1.2 -1.2 2.4 2.4">
        {data.map((slice, i) => {
          const percent = slice.value / total;
          const startPercent = cumulativePercent;
          cumulativePercent += percent;
          
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;
          
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'L 0 0',
          ].join(' ');
          
          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              className="transition-opacity hover:opacity-80"
            />
          );
        })}
        <circle cx="0" cy="0" r="0.6" fill="var(--background)" />
      </svg>
      <div className="space-y-2">
        {data.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-muted-foreground">{slice.label}</span>
            <span className="font-medium">{((slice.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopItemsList({ items, valueLabel = 'Value', linkPrefix }: { items: TopItem[]; valueLabel?: string; linkPrefix?: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
          <div className="flex-1 min-w-0">
            {linkPrefix ? (
              <Link href={`${linkPrefix}/${item.id}`} className="font-medium hover:underline truncate block">
                {item.name}
              </Link>
            ) : (
              <p className="font-medium truncate">{item.name}</p>
            )}
            {item.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold">{typeof item.value === 'number' && item.value > 1000 ? formatCurrency(item.value) : formatNumber(item.value)}</p>
            {item.change !== undefined && (
              <p className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(item.change)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockOverviewMetrics: MetricCard[] = [
  {
    title: 'Total Revenue',
    value: '$2.45M',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: <DollarSign className="h-6 w-6 text-primary" />,
    trend: 'up',
  },
  {
    title: 'Total Orders',
    value: '15,678',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
    trend: 'up',
  },
  {
    title: 'Active Users',
    value: '45,231',
    change: 15.3,
    changeLabel: 'vs last month',
    icon: <Users className="h-6 w-6 text-primary" />,
    trend: 'up',
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: -0.5,
    changeLabel: 'vs last month',
    icon: <Target className="h-6 w-6 text-primary" />,
    trend: 'down',
  },
];

const mockRevenueData: ChartDataPoint[] = [
  { label: 'Jan', value: 180000, previousValue: 150000 },
  { label: 'Feb', value: 195000, previousValue: 165000 },
  { label: 'Mar', value: 210000, previousValue: 180000 },
  { label: 'Apr', value: 185000, previousValue: 175000 },
  { label: 'May', value: 225000, previousValue: 190000 },
  { label: 'Jun', value: 245000, previousValue: 200000 },
  { label: 'Jul', value: 260000, previousValue: 215000 },
  { label: 'Aug', value: 280000, previousValue: 230000 },
  { label: 'Sep', value: 295000, previousValue: 245000 },
  { label: 'Oct', value: 310000, previousValue: 260000 },
  { label: 'Nov', value: 340000, previousValue: 280000 },
  { label: 'Dec', value: 380000, previousValue: 300000 },
];

const mockOrdersData: ChartDataPoint[] = [
  { label: 'Mon', value: 450 },
  { label: 'Tue', value: 520 },
  { label: 'Wed', value: 480 },
  { label: 'Thu', value: 590 },
  { label: 'Fri', value: 680 },
  { label: 'Sat', value: 720 },
  { label: 'Sun', value: 550 },
];

const mockCategoryData = [
  { label: 'Electronics', value: 35, color: '#3b82f6' },
  { label: 'Fashion', value: 25, color: '#22c55e' },
  { label: 'Home & Living', value: 20, color: '#f59e0b' },
  { label: 'Sports', value: 12, color: '#ef4444' },
  { label: 'Other', value: 8, color: '#8b5cf6' },
];

const mockUserAcquisitionData = [
  { label: 'Direct', value: 40, color: '#3b82f6' },
  { label: 'Organic Search', value: 30, color: '#22c55e' },
  { label: 'Social Media', value: 15, color: '#f59e0b' },
  { label: 'Referral', value: 10, color: '#ef4444' },
  { label: 'Paid Ads', value: 5, color: '#8b5cf6' },
];

const mockTopProducts: TopItem[] = [
  { id: 'prod_001', name: 'Wireless Bluetooth Headphones', value: 45600, change: 23.5, subtitle: 'Electronics' },
  { id: 'prod_002', name: 'Premium Yoga Mat', value: 32400, change: 15.2, subtitle: 'Sports & Fitness' },
  { id: 'prod_003', name: 'Organic Cotton T-Shirt', value: 28900, change: 8.7, subtitle: 'Fashion' },
  { id: 'prod_004', name: 'Smart Home Hub', value: 24500, change: -2.3, subtitle: 'Electronics' },
  { id: 'prod_005', name: 'Ceramic Coffee Mug Set', value: 18700, change: 12.1, subtitle: 'Home & Kitchen' },
];

const mockTopVendors: TopItem[] = [
  { id: 'vendor_001', name: 'TechGadgets Store', value: 156000, change: 18.5, subtitle: '234 orders' },
  { id: 'vendor_002', name: 'Fashion Forward', value: 128000, change: 12.3, subtitle: '189 orders' },
  { id: 'vendor_003', name: 'Home & Living Co', value: 95000, change: 22.1, subtitle: '156 orders' },
  { id: 'vendor_004', name: 'Sports Unlimited', value: 78000, change: -5.2, subtitle: '134 orders' },
  { id: 'vendor_005', name: 'Books & Beyond', value: 45000, change: 8.9, subtitle: '98 orders' },
];

const mockRecentActivity = [
  { type: 'order', message: 'New order #ORD-2024-5678 placed', time: '2 min ago' },
  { type: 'user', message: 'New user registered: john@example.com', time: '5 min ago' },
  { type: 'vendor', message: 'Vendor "TechGadgets" updated inventory', time: '12 min ago' },
  { type: 'order', message: 'Order #ORD-2024-5672 shipped', time: '18 min ago' },
  { type: 'review', message: 'New 5-star review on "Wireless Headphones"', time: '25 min ago' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d' | '12m'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into platform performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: typeof period) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockOverviewMetrics.map((metric, i) => (
          <StatCard key={i} {...metric} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>Monthly revenue comparison (Current vs Previous Year)</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/50">
                    +18.5% YoY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={mockRevenueData} height={220} showComparison />
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Orders This Week
                </CardTitle>
                <CardDescription>Daily order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={mockOrdersData} height={220} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleDonutChart data={mockCategoryData} />
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Products
                </CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <TopItemsList
                  items={mockTopProducts}
                  valueLabel="Revenue"
                  linkPrefix="/dashboard/main-app/products"
                />
              </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Top Vendors
                </CardTitle>
                <CardDescription>By sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <TopItemsList
                  items={mockTopVendors}
                  valueLabel="Sales"
                  linkPrefix="/dashboard/main-app/vendors"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50' :
                      activity.type === 'user' ? 'bg-green-100 text-green-600 dark:bg-green-900/50' :
                      activity.type === 'vendor' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50' :
                      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50'
                    }`}>
                      {activity.type === 'order' ? <ShoppingCart className="h-4 w-4" /> :
                       activity.type === 'user' ? <UserPlus className="h-4 w-4" /> :
                       activity.type === 'vendor' ? <Store className="h-4 w-4" /> :
                       <Eye className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">$156.78</p>
                    <p className="text-xs text-green-600">+5.2% vs last period</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders Today</p>
                    <p className="text-2xl font-bold">234</p>
                    <p className="text-xs text-green-600">+12% vs yesterday</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Repeat Customers</p>
                    <p className="text-2xl font-bold">28%</p>
                    <p className="text-xs text-green-600">+3.2% vs last month</p>
                  </div>
                  <Repeat className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cart Abandonment</p>
                    <p className="text-2xl font-bold">68%</p>
                    <p className="text-xs text-red-600">-2.1% vs last month</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue over time with year-over-year comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={mockRevenueData} height={300} showComparison />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">45,231</p>
                    <p className="text-xs text-green-600">+1,234 this month</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users (30d)</p>
                    <p className="text-2xl font-bold">12,456</p>
                    <p className="text-xs text-green-600">+8.5% vs last month</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New Signups (Today)</p>
                    <p className="text-2xl font-bold">89</p>
                    <p className="text-xs text-green-600">+15% vs avg</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Session Duration</p>
                    <p className="text-2xl font-bold">4m 32s</p>
                    <p className="text-xs text-green-600">+12s vs last week</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Acquisition</CardTitle>
                <CardDescription>Where users come from</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleDonutChart data={mockUserAcquisitionData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={[
                    { label: 'Jan', value: 1200 },
                    { label: 'Feb', value: 1350 },
                    { label: 'Mar', value: 1500 },
                    { label: 'Apr', value: 1400 },
                    { label: 'May', value: 1650 },
                    { label: 'Jun', value: 1800 },
                    { label: 'Jul', value: 1950 },
                    { label: 'Aug', value: 2100 },
                    { label: 'Sep', value: 2250 },
                    { label: 'Oct', value: 2400 },
                    { label: 'Nov', value: 2600 },
                    { label: 'Dec', value: 2850 },
                  ]}
                  height={200}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">2,345</p>
                    <p className="text-xs text-green-600">+56 this month</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock</p>
                    <p className="text-2xl font-bold">34</p>
                    <p className="text-xs text-yellow-600">Needs attention</p>
                  </div>
                  <Package className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-red-600">Action required</p>
                  </div>
                  <Package className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">4.3</p>
                    <p className="text-xs text-green-600">+0.2 vs last month</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleDonutChart data={mockCategoryData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue this period</CardDescription>
              </CardHeader>
              <CardContent>
                <TopItemsList
                  items={mockTopProducts}
                  valueLabel="Revenue"
                  linkPrefix="/dashboard/main-app/products"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
