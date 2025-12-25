import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataTable, DataTableColumn } from '../primitives/data-table';

interface TestItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

const mockData: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'pending' },
];

const columns: DataTableColumn<TestItem>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Status' },
];

describe('DataTable', () => {
  describe('rendering', () => {
    it('should render table headers', () => {
      render(<DataTable data={mockData} columns={columns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render table data', () => {
      render(<DataTable data={mockData} columns={columns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should render custom cell content', () => {
      const customColumns: DataTableColumn<TestItem>[] = [
        { key: 'name', header: 'Name' },
        {
          key: 'status',
          header: 'Status',
          cell: (row) => <span data-testid={`status-${row.id}`}>{row.status.toUpperCase()}</span>,
        },
      ];

      render(<DataTable data={mockData} columns={customColumns} />);

      expect(screen.getByTestId('status-1')).toHaveTextContent('ACTIVE');
      expect(screen.getByTestId('status-2')).toHaveTextContent('INACTIVE');
    });
  });

  describe('empty state', () => {
    it('should display empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={columns}
          emptyMessage="No items found"
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should display default empty message', () => {
      render(<DataTable data={[]} columns={columns} />);

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display loading skeletons when loading', () => {
      render(<DataTable data={[]} columns={columns} isLoading />);

      // Should not show empty message when loading
      expect(screen.queryByText(/no data/i)).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should render checkboxes when selectable', () => {
      render(<DataTable data={mockData} columns={columns} selectable />);

      // Header checkbox + one per row
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(mockData.length + 1);
    });

    it('should call onSelectionChange when row is selected', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={columns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First data row

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });
    });

    it('should select all when header checkbox is clicked', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={columns}
          selectable
          onSelectionChange={onSelectionChange}
        />
      );

      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(headerCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
      });
    });
  });

  describe('row click', () => {
    it('should call onRowClick when row is clicked', () => {
      const onRowClick = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={columns}
          onRowClick={onRowClick}
        />
      );

      const rows = screen.getAllByRole('row');
      fireEvent.click(rows[1]); // First data row (index 0 is header)

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('search', () => {
    it('should render search input when searchable', () => {
      render(
        <DataTable
          data={mockData}
          columns={columns}
          searchable
          searchPlaceholder="Search..."
        />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should filter data based on search query', async () => {
      render(
        <DataTable
          data={mockData}
          columns={columns}
          searchable
          searchPlaceholder="Search..."
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('pagination', () => {
    it('should display pagination when provided', () => {
      render(
        <DataTable
          data={mockData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 30,
            totalPages: 3,
          }}
        />
      );

      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    it('should call onPageChange when page changes', async () => {
      const onPageChange = vi.fn();
      render(
        <DataTable
          data={mockData}
          columns={columns}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 30,
            totalPages: 3,
          }}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });
});
