'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  User,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Activity,
  Globe,
  AlertCircle,
  FileWarning,
  UserX,
  LogIn,
  LogOut,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@tbk/ui';
import type { DataTableColumn } from '@tbk/ui';
import Link from 'next/link';

// =============================================================================
// TYPES
// =============================================================================

interface SecurityEvent {
  id: string;
  type: 'login_failed' | 'login_success' | 'password_reset' | 'account_locked' | 'suspicious_activity' | 'permission_change' | 'api_abuse' | '2fa_disabled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress: string;
  location?: string;
  userAgent?: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  lastActivity: string;
  createdAt: string;
}

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  expiresAt?: string;
  permanent: boolean;
}

interface SecurityMetric {
  title: string;
  value: string | number;
  change?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getSeverityBadge(severity: SecurityEvent['severity']) {
  const styles: Record<SecurityEvent['severity'], string> = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <Badge className={styles[severity]} variant="secondary">
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

function getEventTypeIcon(type: SecurityEvent['type']) {
  const icons: Record<SecurityEvent['type'], React.ReactNode> = {
    login_failed: <LogIn className="h-4 w-4 text-red-500" />,
    login_success: <LogIn className="h-4 w-4 text-green-500" />,
    password_reset: <Key className="h-4 w-4 text-blue-500" />,
    account_locked: <Lock className="h-4 w-4 text-orange-500" />,
    suspicious_activity: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    permission_change: <Shield className="h-4 w-4 text-purple-500" />,
    api_abuse: <Activity className="h-4 w-4 text-red-500" />,
    '2fa_disabled': <ShieldAlert className="h-4 w-4 text-orange-500" />,
  };
  return icons[type] || <AlertCircle className="h-4 w-4" />;
}

function getEventTypeLabel(type: SecurityEvent['type']): string {
  const labels: Record<SecurityEvent['type'], string> = {
    login_failed: 'Failed Login',
    login_success: 'Successful Login',
    password_reset: 'Password Reset',
    account_locked: 'Account Locked',
    suspicious_activity: 'Suspicious Activity',
    permission_change: 'Permission Change',
    api_abuse: 'API Abuse',
    '2fa_disabled': '2FA Disabled',
  };
  return labels[type] || type;
}

function getDeviceIcon(device: string) {
  if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
    return <Smartphone className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockSecurityMetrics: SecurityMetric[] = [
  {
    title: 'Security Score',
    value: '87/100',
    status: 'good',
    icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
  },
  {
    title: 'Failed Logins (24h)',
    value: 23,
    change: -15,
    status: 'good',
    icon: <LogIn className="h-6 w-6 text-blue-500" />,
  },
  {
    title: 'Active Threats',
    value: 2,
    status: 'warning',
    icon: <ShieldAlert className="h-6 w-6 text-orange-500" />,
  },
  {
    title: 'Blocked IPs',
    value: 156,
    change: 12,
    status: 'good',
    icon: <Ban className="h-6 w-6 text-red-500" />,
  },
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'evt_001',
    type: 'login_failed',
    severity: 'medium',
    userId: 'user_123',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    description: 'Failed login attempt - incorrect password (3rd attempt)',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'evt_002',
    type: 'suspicious_activity',
    severity: 'high',
    ipAddress: '45.33.32.156',
    location: 'Unknown',
    description: 'Multiple rapid requests from unrecognized IP - possible bot activity',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'evt_003',
    type: 'account_locked',
    severity: 'medium',
    userId: 'user_456',
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    ipAddress: '10.0.0.50',
    location: 'Los Angeles, US',
    description: 'Account locked after 5 failed login attempts',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'evt_004',
    type: 'api_abuse',
    severity: 'critical',
    ipAddress: '185.220.101.45',
    location: 'Unknown (Tor Exit Node)',
    description: 'Rate limit exceeded - 10,000+ requests in 1 minute',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'evt_005',
    type: 'permission_change',
    severity: 'low',
    userId: 'admin_001',
    userName: 'Admin User',
    userEmail: 'admin@thebazaar.com',
    ipAddress: '10.0.0.1',
    location: 'San Francisco, US',
    description: 'User role changed from "staff" to "manager" for user_789',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'evt_006',
    type: '2fa_disabled',
    severity: 'high',
    userId: 'user_890',
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    ipAddress: '172.16.0.100',
    location: 'Chicago, US',
    description: 'Two-factor authentication disabled by user',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'evt_007',
    type: 'password_reset',
    severity: 'low',
    userId: 'user_234',
    userName: 'Alice Williams',
    userEmail: 'alice@example.com',
    ipAddress: '192.168.2.50',
    location: 'Seattle, US',
    description: 'Password reset requested and completed',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
  },
];

const mockActiveSessions: ActiveSession[] = [
  {
    id: 'sess_001',
    userId: 'admin_001',
    userName: 'Admin User',
    userEmail: 'admin@thebazaar.com',
    userRole: 'super_admin',
    ipAddress: '10.0.0.1',
    location: 'San Francisco, US',
    device: 'Desktop',
    browser: 'Chrome 120',
    lastActivity: new Date(Date.now() - 120000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sess_002',
    userId: 'user_123',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    userRole: 'buyer',
    ipAddress: '192.168.1.100',
    location: 'New York, US',
    device: 'Mobile',
    browser: 'Safari 17',
    lastActivity: new Date(Date.now() - 600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sess_003',
    userId: 'vendor_001',
    userName: 'TechGadgets Store',
    userEmail: 'support@techgadgets.com',
    userRole: 'vendor',
    ipAddress: '172.16.0.50',
    location: 'Austin, US',
    device: 'Desktop',
    browser: 'Firefox 121',
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const mockBlockedIPs: BlockedIP[] = [
  {
    id: 'block_001',
    ipAddress: '185.220.101.45',
    reason: 'API abuse - rate limit violations',
    blockedAt: new Date(Date.now() - 3600000).toISOString(),
    blockedBy: 'System (Auto)',
    permanent: true,
  },
  {
    id: 'block_002',
    ipAddress: '45.33.32.156',
    reason: 'Suspicious bot activity',
    blockedAt: new Date(Date.now() - 7200000).toISOString(),
    blockedBy: 'System (Auto)',
    expiresAt: new Date(Date.now() + 82800000).toISOString(),
    permanent: false,
  },
  {
    id: 'block_003',
    ipAddress: '103.75.201.2',
    reason: 'Multiple failed login attempts',
    blockedAt: new Date(Date.now() - 86400000).toISOString(),
    blockedBy: 'System (Auto)',
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
    permanent: false,
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState<'all' | SecurityEvent['severity']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter events
  const filteredEvents = mockSecurityEvents.filter(event => {
    if (eventFilter !== 'all' && event.severity !== eventFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.description.toLowerCase().includes(q) ||
        event.ipAddress.includes(q) ||
        (event.userName && event.userName.toLowerCase().includes(q)) ||
        (event.userEmail && event.userEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Event columns
  const eventColumns: DataTableColumn<SecurityEvent>[] = [
    {
      key: 'type',
      header: 'Event',
      cell: (event: SecurityEvent) => (
        <div className="flex items-center gap-2">
          {getEventTypeIcon(event.type)}
          <span>{getEventTypeLabel(event.type)}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      cell: (event: SecurityEvent) => getSeverityBadge(event.severity),
    },
    {
      key: 'user',
      header: 'User',
      cell: (event: SecurityEvent) => (
        event.userName ? (
          <div>
            <p className="font-medium">{event.userName}</p>
            <p className="text-xs text-muted-foreground">{event.userEmail}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      cell: (event: SecurityEvent) => (
        <div>
          <p className="font-mono text-sm">{event.ipAddress}</p>
          {event.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      cell: (event: SecurityEvent) => (
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(event.timestamp)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (event: SecurityEvent) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedEvent(event);
            setIsEventDetailOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Session columns
  const sessionColumns: DataTableColumn<ActiveSession>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (session: ActiveSession) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>
          <div>
            <Link
              href={`/dashboard/main-app/users/${session.userId}`}
              className="font-medium hover:underline"
            >
              {session.userName}
            </Link>
            <p className="text-xs text-muted-foreground">{session.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (session: ActiveSession) => (
        <Badge variant="outline" className="capitalize">
          {session.userRole.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'device',
      header: 'Device',
      cell: (session: ActiveSession) => (
        <div className="flex items-center gap-2">
          {getDeviceIcon(session.device)}
          <div>
            <p className="text-sm">{session.device}</p>
            <p className="text-xs text-muted-foreground">{session.browser}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (session: ActiveSession) => (
        <div>
          <p className="font-mono text-sm">{session.ipAddress}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {session.location}
          </p>
        </div>
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Active',
      cell: (session: ActiveSession) => (
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(session.lastActivity)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (session: ActiveSession) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => {
            setSelectedSession(session);
            setIsTerminateDialogOpen(true);
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Blocked IP columns
  const blockedIPColumns: DataTableColumn<BlockedIP>[] = [
    {
      key: 'ipAddress',
      header: 'IP Address',
      cell: (ip: BlockedIP) => (
        <span className="font-mono">{ip.ipAddress}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (ip: BlockedIP) => (
        <span className="text-sm">{ip.reason}</span>
      ),
    },
    {
      key: 'blockedBy',
      header: 'Blocked By',
      cell: (ip: BlockedIP) => (
        <span className="text-sm text-muted-foreground">{ip.blockedBy}</span>
      ),
    },
    {
      key: 'blockedAt',
      header: 'Blocked At',
      cell: (ip: BlockedIP) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(ip.blockedAt)}
        </span>
      ),
    },
    {
      key: 'expires',
      header: 'Expires',
      cell: (ip: BlockedIP) => (
        ip.permanent ? (
          <Badge variant="destructive">Permanent</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            {ip.expiresAt ? formatDateTime(ip.expiresAt) : '-'}
          </span>
        )
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <Button variant="ghost" size="sm">
          <Unlock className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleTerminateSession = () => {
    // In production: API call to terminate session
    setIsTerminateDialogOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor security events and manage platform security
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockSecurityMetrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  {metric.change !== undefined && (
                    <p className={`text-xs ${metric.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% vs last week
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${
                  metric.status === 'good' ? 'bg-green-100 dark:bg-green-900/50' :
                  metric.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                  'bg-red-100 dark:bg-red-900/50'
                }`}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>Monitor login attempts, suspicious activities, and security alerts</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select
                    value={eventFilter}
                    onValueChange={(value: string) => setEventFilter(value as typeof eventFilter)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={eventColumns}
                data={filteredEvents}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Currently logged in users across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={sessionColumns}
                data={mockActiveSessions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blocked IP Addresses</CardTitle>
                  <CardDescription>IPs blocked due to suspicious activity or abuse</CardDescription>
                </div>
                <Button>
                  <Ban className="h-4 w-4 mr-2" />
                  Block IP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={blockedIPColumns}
                data={mockBlockedIPs}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailOpen} onOpenChange={setIsEventDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>{selectedEvent?.id}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getEventTypeIcon(selectedEvent.type)}
                <div>
                  <p className="font-medium">{getEventTypeLabel(selectedEvent.type)}</p>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>
              </div>
              <p className="text-sm">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground">IP Address</p>
                  <p className="font-mono">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{selectedEvent.location || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p>{formatDateTime(selectedEvent.timestamp)}</p>
                </div>
                {selectedEvent.userName && (
                  <div>
                    <p className="text-muted-foreground">User</p>
                    <p>{selectedEvent.userName}</p>
                  </div>
                )}
              </div>
              {selectedEvent.userAgent && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                  <p className="text-xs font-mono break-all">{selectedEvent.userAgent}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDetailOpen(false)}>
              Close
            </Button>
            {selectedEvent?.ipAddress && (
              <Button variant="destructive">
                <Ban className="h-4 w-4 mr-2" />
                Block IP
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Session Dialog */}
      <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session? The user will be logged out immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8" />
                <div>
                  <p className="font-medium">{selectedSession.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.userEmail}</p>
                </div>
              </div>
              <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Device: </span>
                  {selectedSession.device}
                </div>
                <div>
                  <span className="text-muted-foreground">IP: </span>
                  {selectedSession.ipAddress}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTerminateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminateSession}>
              <LogOut className="h-4 w-4 mr-2" />
              Terminate Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
