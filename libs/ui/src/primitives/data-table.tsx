'use client';

/**
 * DataTable Component
 * ====================
 * A powerful, reusable data table component for admin and vendor portals.
 * 
 * Features:
 * - Column sorting (client & server-side)
 * - Pagination (client & server-side)
 * - Row selection (single & multi)
 * - Column visibility toggle
 * - Search/filtering
 * - Loading states
 * - Empty states
 * - Bulk actions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * import { DataTable } from '@tbk/ui';
 * 
 * const columns = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'email', header: 'Email' },
 *   { key: 'status', header: 'Status', cell: (row) => <Badge>{row.status}</Badge> },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   onRowClick={(row) => router.push(`/users/${row.id}`)}
 *   selectable
 *   onSelectionChange={setSelectedIds}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../utils/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { Input } from './input';
import { Skeleton } from './skeleton';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

// =============================================================================
// TYPES
// =============================================================================

export interface DataTableColumn<T> {
  /** Unique key for the column (used for sorting/visibility) */
  key: string;
  /** Column header text */
  header: string | React.ReactNode;
  /** Accessor function or key path to get cell value */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell renderer */
  cell?: (row: T, index: number) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is visible by default */
  defaultVisible?: boolean;
  /** Column width (CSS value) */
  width?: string;
  /** Column min width (CSS value) */
  minWidth?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column can be hidden */
  hideable?: boolean;
  /** Custom header cell renderer */
  headerCell?: () => React.ReactNode;
  /** Pin column to left or right */
  pin?: 'left' | 'right';
}

export interface DataTablePagination {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableSort {
  /** Column key being sorted */
  column: string;
  /** Sort direction */
  direction: SortDirection;
}

export interface DataTableProps<T extends { id: string | number }> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row IDs */
  selectedIds?: (string | number)[];
  /** Selection change handler */
  onSelectionChange?: (ids: (string | number)[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Enable search */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search value (controlled) */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search columns (keys to search in) */
  searchColumns?: string[];
  /** Pagination config */
  pagination?: DataTablePagination;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Current sort state */
  sort?: DataTableSort;
  /** Sort change handler */
  onSortChange?: (sort: DataTableSort) => void;
  /** Enable column visibility toggle */
  columnVisibility?: boolean;
  /** Visible column keys (controlled) */
  visibleColumns?: string[];
  /** Column visibility change handler */
  onColumnVisibilityChange?: (columns: string[]) => void;
  /** Bulk action buttons (shown when rows selected) */
  bulkActions?: React.ReactNode;
  /** Table toolbar (shown above table) */
  toolbar?: React.ReactNode;
  /** Row ID accessor */
  getRowId?: (row: T) => string | number;
  /** Row class name */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Table class name */
  className?: string;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Max height for scrollable body */
  maxHeight?: string;
}

// =============================================================================
// ICONS (inline SVG to avoid external dependencies)
// =============================================================================

const ChevronUpIcon = () => (
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
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const ChevronDownIcon = () => (
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
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronsUpDownIcon = () => (
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
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const ColumnsIcon = () => (
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
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="12" x2="12" y1="3" y2="21" />
  </svg>
);

const SearchIcon = () => (
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
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// =============================================================================
// COMPONENT
// =============================================================================

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  emptyComponent,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  searchColumns,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  sort,
  onSortChange,
  columnVisibility = false,
  visibleColumns: controlledVisibleColumns,
  onColumnVisibilityChange,
  bulkActions,
  toolbar,
  getRowId = (row) => row.id,
  rowClassName,
  className,
  stickyHeader = false,
  maxHeight,
}: DataTableProps<T>) {
  // ==========================================================================
  // STATE
  // ==========================================================================

  // Internal search state (if not controlled)
  const [internalSearch, setInternalSearch] = React.useState('');
  const searchText = searchValue || internalSearch;

  // Internal column visibility state (if not controlled)
  const [internalVisibleColumns, setInternalVisibleColumns] = React.useState<string[]>(
    () => columns.filter((col) => col.defaultVisible !== false).map((col) => col.key)
  );
  const visibleColumnKeys = controlledVisibleColumns || internalVisibleColumns;

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  const handleColumnVisibilityChange = (columnKey: string, visible: boolean) => {
    const newColumns = visible
      ? [...visibleColumnKeys, columnKey]
      : visibleColumnKeys.filter((key) => key !== columnKey);

    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(newColumns);
    } else {
      setInternalVisibleColumns(newColumns);
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    let newDirection: SortDirection = 'asc';
    if (sort?.column === columnKey) {
      if (sort.direction === 'asc') newDirection = 'desc';
      else if (sort.direction === 'desc') newDirection = null;
    }

    onSortChange({
      column: columnKey,
      direction: newDirection,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(data.map(getRowId));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  // ==========================================================================
  // COMPUTED
  // ==========================================================================

  // Filter visible columns
  const visibleColumnsData = columns.filter((col) =>
    visibleColumnKeys.includes(col.key)
  );

  // Filter data by search (client-side)
  const filteredData = React.useMemo(() => {
    if (!searchText || !searchable || onSearchChange) return data;

    const searchLower = searchText.toLowerCase();
    const columnsToSearch = searchColumns || columns.map((col) => col.key);

    return data.filter((row) =>
      columnsToSearch.some((key) => {
        const col = columns.find((c) => c.key === key);
        let value: unknown;

        if (col?.accessor) {
          value =
            typeof col.accessor === 'function'
              ? col.accessor(row)
              : row[col.accessor];
        } else {
          value = (row as Record<string, unknown>)[key];
        }

        return String(value || '').toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchText, searchable, searchColumns, columns, onSearchChange]);

  // Check selection state
  const allSelected =
    data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getCellValue = (row: T, column: DataTableColumn<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row, data.indexOf(row));
    }

    let value: unknown;
    if (column.accessor) {
      value =
        typeof column.accessor === 'function'
          ? column.accessor(row)
          : row[column.accessor];
    } else {
      value = (row as Record<string, unknown>)[column.key];
    }

    return value as React.ReactNode;
  };

  const getSortIcon = (columnKey: string) => {
    if (sort?.column !== columnKey || !sort.direction) {
      return <ChevronsUpDownIcon />;
    }
    return sort.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />;
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <SearchIcon />
              <Input
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          )}

          {/* Bulk actions (shown when rows selected) */}
          {selectable && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
              {bulkActions}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom toolbar */}
          {toolbar}

          {/* Column visibility toggle */}
          {columnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ColumnsIcon />
                  <span className="ml-2">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns
                  .filter((col) => col.hideable !== false)
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumnKeys.includes(column.key)}
                      onCheckedChange={(checked) =>
                        handleColumnVisibilityChange(column.key, checked)
                      }
                    >
                      {typeof column.header === 'string' ? column.header : column.key}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          'rounded-md border',
          maxHeight && 'overflow-auto'
        )}
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
            <TableRow>
              {/* Selection checkbox column */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={someSelected ? 'indeterminate' : allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}

              {/* Data columns */}
              {visibleColumnsData.map((column) => (
                <TableHead
                  key={column.key}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    textAlign: column.align,
                  }}
                >
                  {column.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.headerCell ? column.headerCell() : column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : column.headerCell ? (
                    column.headerCell()
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading state */}
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {selectable && (
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                    )}
                    {visibleColumnsData.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsData.length + (selectable ? 1 : 0)}
                  className="text-center py-8"
                >
                  <div className="text-destructive">
                    Error: {error.message}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsData.length + (selectable ? 1 : 0)}
                  className="text-center py-8"
                >
                  {emptyComponent || (
                    <div className="text-muted-foreground">{emptyMessage}</div>
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              !error &&
              filteredData.map((row, index) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);
                const rowClass =
                  typeof rowClassName === 'function'
                    ? rowClassName(row, index)
                    : rowClassName;

                return (
                  <TableRow
                    key={rowId}
                    data-state={isSelected ? 'selected' : undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      rowClass
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(rowId, !!checked)
                          }
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumnsData.map((column) => (
                      <TableCell
                        key={column.key}
                        style={{ textAlign: column.align }}
                      >
                        {getCellValue(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            {onPageSizeChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="h-8 rounded-md border px-2 text-sm"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={pagination.page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="px-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
