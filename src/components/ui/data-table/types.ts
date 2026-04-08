import { ColumnDef, Row } from "@tanstack/react-table";
import { ReactNode } from "react";

export type DataTableFilterType = "text" | "select" | "date" | "number" | "checkbox" | "dateRange" | "treeSelect";

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: ReactNode;
  children?: DataTableFilterOption[]; // tree-select support
}

export interface DataTableGlobalFilterConfig {
  id: string;
  label: string;
  type: DataTableFilterType;
  options?: DataTableFilterOption[];
  placeholder?: string;
  defaultValue?: any;
  columnId?: string; // maps to a column filter
}

export interface DataTableColumnMeta {
  filterType?: DataTableFilterType;
  filterOptions?: DataTableFilterOption[];
  align?: "left" | "center" | "right";
  sticky?: "left" | "right"; // sticky column
  hidden?: boolean;
  minWidth?: number;
  maxWidth?: number;
  enableGrouping?: boolean;
  cellClassName?: string;
  headerClassName?: string;
  exportable?: boolean;
  exportLabel?: string;
  renderExport?: (value: any) => string;
  truncate?: boolean; // enable text truncation with tooltip
  truncateLength?: number; // max chars before truncation (default 40)
  copyable?: boolean; // enable copy cell value
  autoWidth?: boolean; // auto-adjust width to content
  nowrap?: boolean; // prevent text wrapping
}

export interface DataTableAction<TData> {
  id: string;
  label: string | ((row: TData) => string);
  icon?: ReactNode | ((row: TData) => ReactNode);
  onClick: (row: TData) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  hidden?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  separator?: boolean;
}

export interface DataTableBulkAction<TData> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (rows: TData[]) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  confirmMessage?: string;
}

export interface DataTablePaginationConfig {
  position?: "top" | "bottom" | "both";
  pageSizes?: number[];
  defaultPageSize?: number;
  showPageInfo?: boolean;
  showGoToPage?: boolean;
}

export interface DataTableServerSideConfig {
  enabled: boolean;
  totalRows: number;
  pageIndex: number;
  pageSize: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
  onFilterChange?: (filters: { id: string; value: any }[]) => void;
  onGlobalFilterChange?: (value: string) => void;
  debounceMs?: number; // debounce for search/filter (default 300)
}

export interface DataTableConfig<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableRefresh?: boolean;
  enableDensityToggle?: boolean;
  enableFullscreen?: boolean;
  enableGrouping?: boolean;
  enablePinning?: boolean;
  enableColumnDragDrop?: boolean;
  enableCellCopy?: boolean;
  // Config
  pagination?: DataTablePaginationConfig;
  actions?: DataTableAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];
  serverSide?: DataTableServerSideConfig;
  globalFilters?: DataTableGlobalFilterConfig[]; // advanced global filter panel
  // Callbacks
  onRefresh?: () => void;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (rows: TData[]) => void;
  // Styling
  title?: string;
  description?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyDescription?: string;
  loading?: boolean;
  loadingStyle?: "skeleton" | "spinner" | "overlay";
  loadingRows?: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: TData, index: number) => string);
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  // Row state
  isRowDisabled?: (row: TData) => boolean;
  getRowId?: (row: TData) => string;
}
