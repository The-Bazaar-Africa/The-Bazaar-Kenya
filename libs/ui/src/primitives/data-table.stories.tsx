import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, DataTableColumn } from './data-table';
import { Badge } from './badge';
import { Button } from './button';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  createdAt: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'active', role: 'Admin', createdAt: '2025-01-15' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', status: 'active', role: 'User', createdAt: '2025-01-14' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', role: 'User', createdAt: '2025-01-13' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', status: 'pending', role: 'Editor', createdAt: '2025-01-12' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', status: 'active', role: 'User', createdAt: '2025-01-11' },
];

const columns: DataTableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    cell: (user) => {
      const variants: Record<User['status'], 'default' | 'secondary' | 'destructive'> = {
        active: 'default',
        inactive: 'secondary',
        pending: 'destructive',
      };
      return <Badge variant={variants[user.status]}>{user.status}</Badge>;
    },
  },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'createdAt', header: 'Created', sortable: true },
  {
    key: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
      </div>
    ),
  },
];

const meta: Meta<typeof DataTable<User>> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A powerful, reusable data table component for admin and vendor portals with sorting, pagination, selection, and more.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable<User>>;

/**
 * Default DataTable with basic columns and data.
 */
export const Default: Story = {
  args: {
    data: mockUsers,
    columns: columns,
  },
};

/**
 * DataTable with loading state.
 */
export const Loading: Story = {
  args: {
    data: [],
    columns: columns,
    isLoading: true,
  },
};

/**
 * DataTable with empty state.
 */
export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'No users found. Try adjusting your search or filters.',
  },
};

/**
 * DataTable with selectable rows.
 */
export const Selectable: Story = {
  args: {
    data: mockUsers,
    columns: columns,
    selectable: true,
    onSelectionChange: (ids) => console.log('Selected:', ids),
  },
};

/**
 * DataTable with search enabled.
 */
export const WithSearch: Story = {
  args: {
    data: mockUsers,
    columns: columns,
    searchable: true,
    searchPlaceholder: 'Search users...',
  },
};

/**
 * DataTable with pagination.
 */
export const WithPagination: Story = {
  args: {
    data: mockUsers,
    columns: columns,
    pagination: {
      page: 1,
      pageSize: 2,
      total: 5,
      totalPages: 3,
    },
    onPageChange: (page) => console.log('Page:', page),
    onPageSizeChange: (size) => console.log('Page size:', size),
  },
};

/**
 * DataTable with row click handler.
 */
export const Clickable: Story = {
  args: {
    data: mockUsers,
    columns: columns,
    onRowClick: (user) => alert(`Clicked: ${user.name}`),
  },
};

/**
 * DataTable with column visibility toggle.
 */
export const WithColumnToggle: Story = {
  args: {
    data: mockUsers,
    columns: columns.map(c => ({ ...c, hideable: c.key !== 'name' })),
    columnVisibility: true,
  },
};

/**
 * DataTable with all features enabled.
 */
export const FullFeatured: Story = {
  args: {
    data: mockUsers,
    columns: columns.map(c => ({ ...c, hideable: c.key !== 'name' })),
    selectable: true,
    searchable: true,
    searchPlaceholder: 'Search users...',
    columnVisibility: true,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 50,
      totalPages: 5,
    },
    onSelectionChange: (ids) => console.log('Selected:', ids),
    onPageChange: (page) => console.log('Page:', page),
    onRowClick: (user) => console.log('Clicked:', user.name),
  },
};
