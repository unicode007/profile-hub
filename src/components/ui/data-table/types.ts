import { ColumnDef, Row } from "@tanstack/react-table";
import { ReactNode } from "react";

export type DataTableFilterType = "text" | "select" | "date" | "number";

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface DataTableColumnMeta {
  filterType?: DataTableFilterType;
  filterOptions?: DataTableFilterOption[];
  align?: "left" | "center" | "right";
  sticky?: boolean;
  hidden?: boolean;
  minWidth?: number;
  maxWidth?: number;
  enableGrouping?: boolean;
  cellClassName?: string;
  headerClassName?: string;
  exportable?: boolean;
  exportLabel?: string;
  renderExport?: (value: any) => string;
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
  // Config
  pagination?: DataTablePaginationConfig;
  actions?: DataTableAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];
  // Callbacks
  onRefresh?: () => void;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (rows: TData[]) => void;
  // Styling
  title?: string;
  description?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
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
