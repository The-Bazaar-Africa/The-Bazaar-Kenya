'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Percent,
  Wallet,
  Calendar,
  FileText,
  ArrowRight
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import Link from 'next/link';
import { 
  adminGetFinancialSummary,
  adminGetRevenueData,
  adminGetTransactions,
  type FinancialSummary,
  type RevenueDataPoint,
  type Transaction,
  type TransactionFilters
} from '@tbk/api-client';

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, changeLabel, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1 text-xs">
                {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
                {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MINI CHART COMPONENT
// =============================================================================

interface MiniChartProps {
  data: RevenueDataPoint[];
  dataKey: 'revenue' | 'netRevenue';
}

function MiniChart({ data, dataKey }: MiniChartProps) {
  if (!data || data.length === 0) return null;
  
  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  return (
    <div className="flex items-end h-16 gap-1">
      {data.slice(-14).map((point, i) => {
        const height = ((point[dataKey] - min) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
            style={{ height: `${Math.max(height, 5)}%` }}
            title={`${point.date}: ${formatCurrency(point[dataKey])}`}
          />
        );
      })}
    </div>
  );
}

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

function getTransactionTypeLabel(type: Transaction['type']): string {
  const labels: Record<Transaction['type'], string> = {
    order: 'Order Payment',
    payout: 'Vendor Payout',
    refund: 'Refund',
    commission: 'Commission',
    adjustment: 'Adjustment',
    escrow_release: 'Escrow Release',
    escrow_hold: 'Escrow Hold',
  };
  return labels[type] || type;
}

function getTransactionTypeColor(type: Transaction['type']): string {
  const colors: Record<Transaction['type'], string> = {
    order: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    payout: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    refund: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    commission: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    adjustment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    escrow_release: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    escrow_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

function getStatusIcon(status: Transaction['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-gray-500" />;
    default:
      return null;
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockSummary: FinancialSummary = {
  totalRevenue: 2456789.50,
  revenueGrowth: 12.5,
  totalCommissions: 245678.95,
  commissionGrowth: 15.2,
  totalPayouts: 1987654.32,
  pendingPayouts: 123456.78,
  escrowBalance: 345678.90,
  refundsTotal: 45678.90,
  averageOrderValue: 156.78,
  transactionCount: 15678,
};

const mockRevenueData: RevenueDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseRevenue = 80000 + Math.random() * 40000;
  return {
    date: date.toISOString().split('T')[0],
    revenue: baseRevenue,
    commissions: baseRevenue * 0.1,
    payouts: baseRevenue * 0.8,
    refunds: baseRevenue * 0.02,
    netRevenue: baseRevenue * 0.08,
  };
});

const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    type: 'order',
    status: 'completed',
    amount: 299.99,
    fee: 8.70,
    netAmount: 291.29,
    currency: 'USD',
    referenceId: 'ORD-2024-001234',
    referenceType: 'order',
    description: 'Payment for order #ORD-2024-001234',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'txn_002',
    type: 'payout',
    status: 'completed',
    amount: 1500.00,
    fee: 25.00,
    netAmount: 1475.00,
    currency: 'USD',
    referenceId: 'PAY-2024-000567',
    referenceType: 'payout',
    description: 'Weekly payout to TechGadgets Store',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'txn_003',
    type: 'refund',
    status: 'completed',
    amount: -89.99,
    fee: 0,
    netAmount: -89.99,
    currency: 'USD',
    referenceId: 'ORD-2024-001200',
    referenceType: 'order',
    description: 'Full refund for order #ORD-2024-001200',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'txn_004',
    type: 'commission',
    status: 'completed',
    amount: 30.00,
    fee: 0,
    netAmount: 30.00,
    currency: 'USD',
    referenceId: 'ORD-2024-001234',
    referenceType: 'order',
    description: 'Commission from order #ORD-2024-001234',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'txn_005',
    type: 'escrow_hold',
    status: 'pending',
    amount: 450.00,
    fee: 0,
    netAmount: 450.00,
    currency: 'USD',
    referenceId: 'ORD-2024-001245',
    referenceType: 'order',
    description: 'Escrow hold for order #ORD-2024-001245',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'txn_006',
    type: 'escrow_release',
    status: 'completed',
    amount: 320.00,
    fee: 0,
    netAmount: 320.00,
    currency: 'USD',
    referenceId: 'ORD-2024-001180',
    referenceType: 'order',
    description: 'Escrow release for order #ORD-2024-001180',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    completedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'txn_007',
    type: 'adjustment',
    status: 'completed',
    amount: -15.00,
    fee: 0,
    netAmount: -15.00,
    currency: 'USD',
    description: 'Manual adjustment - shipping credit',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    completedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function FinancesPage() {
  // State
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Transaction filters
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    type: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // In production, these would be real API calls
        // const [summaryRes, revenueRes, transactionsRes] = await Promise.all([
        //   adminGetFinancialSummary(period),
        //   adminGetRevenueData({ period }),
        //   adminGetTransactions(filters),
        // ]);

        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 500));
        setSummary(mockSummary);
        setRevenueData(mockRevenueData);
        setTransactions(mockTransactions);
        setTotalTransactions(mockTransactions.length);
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [period, filters]);

  // Table columns
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      cell: (txn: Transaction) => (
        <Badge className={getTransactionTypeColor(txn.type)} variant="secondary">
          {getTransactionTypeLabel(txn.type)}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (txn: Transaction) => (
        <div className="max-w-[300px]">
          <p className="text-sm font-medium truncate">{txn.description}</p>
          {txn.referenceId && (
            <p className="text-xs text-muted-foreground">{txn.referenceId}</p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (txn: Transaction) => (
        <span className={txn.amount < 0 ? 'text-red-600' : 'text-green-600'}>
          {formatCurrency(txn.amount)}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'Fee',
      cell: (txn: Transaction) => (
        <span className="text-muted-foreground">
          {txn.fee > 0 ? formatCurrency(txn.fee) : '-'}
        </span>
      ),
    },
    {
      key: 'netAmount',
      header: 'Net',
      cell: (txn: Transaction) => (
        <span className={txn.netAmount < 0 ? 'text-red-600 font-medium' : 'font-medium'}>
          {formatCurrency(txn.netAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (txn: Transaction) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(txn.status)}
          <span className="capitalize text-sm">{txn.status}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (txn: Transaction) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(txn.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    setFilters((prev: TransactionFilters) => ({ ...prev, page }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: TransactionFilters) => ({ ...prev, search: searchQuery, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform revenue, transactions, and financial health
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
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : '-'}
          change={summary?.revenueGrowth}
          changeLabel="vs last period"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          trend={summary && summary.revenueGrowth > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Commissions Earned"
          value={summary ? formatCurrency(summary.totalCommissions) : '-'}
          change={summary?.commissionGrowth}
          changeLabel="vs last period"
          icon={<Percent className="h-6 w-6 text-primary" />}
          trend={summary && summary.commissionGrowth > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Pending Payouts"
          value={summary ? formatCurrency(summary.pendingPayouts) : '-'}
          icon={<Clock className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Escrow Balance"
          value={summary ? formatCurrency(summary.escrowBalance) : '-'}
          icon={<Wallet className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniChart data={revenueData} dataKey="revenue" />
                <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                  <span>{revenueData[0]?.date ? formatDate(revenueData[0].date) : ''}</span>
                  <span>{revenueData[revenueData.length - 1]?.date ? formatDate(revenueData[revenueData.length - 1].date) : ''}</span>
                </div>
              </CardContent>
            </Card>

            {/* Net Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Net Revenue
                </CardTitle>
                <CardDescription>Revenue after payouts and fees</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniChart data={revenueData} dataKey="netRevenue" />
                <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                  <span>{revenueData[0]?.date ? formatDate(revenueData[0].date) : ''}</span>
                  <span>{revenueData[revenueData.length - 1]?.date ? formatDate(revenueData[revenueData.length - 1].date) : ''}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payouts</p>
                    <p className="text-xl font-bold">{summary ? formatCurrency(summary.totalPayouts) : '-'}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Refunds</p>
                    <p className="text-xl font-bold">{summary ? formatCurrency(summary.refundsTotal) : '-'}</p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <p className="text-xl font-bold">{summary ? formatCurrency(summary.averageOrderValue) : '-'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-xl font-bold">{summary?.transactionCount.toLocaleString() || '-'}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/main-app/finances/payouts">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Payout Management</h3>
                      <p className="text-sm text-muted-foreground">Process vendor payouts</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/main-app/finances/escrow">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                      <Wallet className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Escrow Accounts</h3>
                      <p className="text-sm text-muted-foreground">Manage held funds</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Financial Reports</h3>
                    <p className="text-sm text-muted-foreground">Generate & download reports</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All financial transactions on the platform</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px]"
                      />
                    </div>
                  </form>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value: string) => setFilters((prev: TransactionFilters) => ({ ...prev, type: value as TransactionFilters['type'], page: 1 }))}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="order">Orders</SelectItem>
                      <SelectItem value="payout">Payouts</SelectItem>
                      <SelectItem value="refund">Refunds</SelectItem>
                      <SelectItem value="commission">Commissions</SelectItem>
                      <SelectItem value="escrow_hold">Escrow Hold</SelectItem>
                      <SelectItem value="escrow_release">Escrow Release</SelectItem>
                      <SelectItem value="adjustment">Adjustments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value: string) => setFilters((prev: TransactionFilters) => ({ ...prev, status: value as TransactionFilters['status'], page: 1 }))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={transactionColumns}
                data={transactions}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <span>Showing {transactions.length} of {totalTransactions} transactions</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payouts Tab - Quick View */}
        <TabsContent value="payouts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Payouts</CardTitle>
                  <CardDescription>Latest vendor payout activities</CardDescription>
                </div>
                <Link href="/dashboard/main-app/finances/payouts">
                  <Button>
                    View All Payouts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions
                  .filter(t => t.type === 'payout')
                  .slice(0, 5)
                  .map(payout => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{payout.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(payout.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(payout.amount)}</p>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payout.status)}
                          <span className="text-sm capitalize">{payout.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escrow Tab - Quick View */}
        <TabsContent value="escrow" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Escrow Overview</CardTitle>
                  <CardDescription>Funds currently held in escrow</CardDescription>
                </div>
                <Link href="/dashboard/main-app/finances/escrow">
                  <Button>
                    Manage Escrow
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Held</p>
                    <p className="text-2xl font-bold">{summary ? formatCurrency(summary.escrowBalance) : '-'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Active Accounts</p>
                    <p className="text-2xl font-bold">23</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Pending Release</p>
                    <p className="text-2xl font-bold">8</p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                {mockTransactions
                  .filter(t => t.type === 'escrow_hold' || t.type === 'escrow_release')
                  .slice(0, 5)
                  .map(escrow => (
                    <div key={escrow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${escrow.type === 'escrow_hold' ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-teal-100 dark:bg-teal-900/50'}`}>
                          <Wallet className={`h-5 w-5 ${escrow.type === 'escrow_hold' ? 'text-orange-600' : 'text-teal-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{escrow.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDateTime(escrow.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(escrow.amount)}</p>
                        <Badge variant={escrow.type === 'escrow_hold' ? 'secondary' : 'outline'}>
                          {escrow.type === 'escrow_hold' ? 'Held' : 'Released'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
