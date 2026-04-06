import { useState, useMemo, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnDef,
  Header,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2,
  Inbox,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableConfig, DataTableAction, DataTableColumnMeta } from "./types";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export function DataTable<TData extends Record<string, any>>({
  columns: userColumns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enableGlobalFilter = true,
  enableColumnResizing = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enablePagination = true,
  enableColumnVisibility = true,
  enableExport = false,
  enableRefresh = false,
  enableDensityToggle = false,
  enableFullscreen = false,
  pagination,
  actions,
  bulkActions,
  onRefresh,
  onRowClick,
  onSelectionChange,
  title,
  description,
  emptyMessage = "No results found.",
  emptyIcon,
  loading = false,
  className,
  headerClassName,
  rowClassName,
  striped = false,
  bordered = false,
  compact = false,
  stickyHeader = true,
  maxHeight,
  isRowDisabled,
  getRowId,
}: DataTableConfig<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">(compact ? "compact" : "normal");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [columnSizing, setColumnSizing] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Build columns with select and actions
  const finalColumns = useMemo(() => {
    const cols: ColumnDef<TData, any>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            disabled={isRowDisabled?.(row.original)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
      });
    }

    cols.push(...userColumns);

    if (actions && actions.length > 0) {
      cols.push({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        size: 80,
        cell: ({ row }) => {
          const visibleActions = actions.filter((a) => !a.hidden?.(row.original));
          if (visibleActions.length === 0) return null;
          // If 1-2 actions, show inline
          if (visibleActions.length <= 2) {
            return (
              <div className="flex items-center gap-1">
                {visibleActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant as any || "ghost"}
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={(e) => { e.stopPropagation(); action.onClick(row.original); }}
                    disabled={action.disabled?.(row.original)}
                  >
                    {typeof action.icon === "function" ? action.icon(row.original) : action.icon}
                    {typeof action.label === "function" ? action.label(row.original) : action.label}
                  </Button>
                ))}
              </div>
            );
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {visibleActions.map((action, i) => (
                  <span key={action.id}>
                    {action.separator && i > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); action.onClick(row.original); }}
                      disabled={action.disabled?.(row.original)}
                      className={cn(action.variant === "destructive" && "text-destructive focus:text-destructive")}
                    >
                      {typeof action.icon === "function" ? action.icon(row.original) : action.icon}
                      <span className="ml-2">{typeof action.label === "function" ? action.label(row.original) : action.label}</span>
                    </DropdownMenuItem>
                  </span>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      });
    }

    return cols;
  }, [userColumns, actions, enableRowSelection, isRowDisabled]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection, columnSizing },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      if (onSelectionChange) {
        const selectedIndices = Object.keys(newSelection).filter((k) => newSelection[k]);
        const selectedData = selectedIndices.map((i) => data[Number(i)]).filter(Boolean);
        onSelectionChange(selectedData);
      }
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering || enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableColumnResizing,
    columnResizeMode: "onChange",
    enableRowSelection: enableRowSelection ? (row) => !(isRowDisabled?.(row.original)) : false,
    enableMultiRowSelection,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    initialState: {
      pagination: { pageSize: pagination?.defaultPageSize || 20 },
    },
  });

  const densityPadding = density === "compact" ? "px-2 py-1" : density === "comfortable" ? "px-4 py-3" : "px-3 py-2";

  const SortIcon = ({ header }: { header: Header<TData, unknown> }) => {
    if (!header.column.getCanSort()) return null;
    const sorted = header.column.getIsSorted();
    if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
    if (sorted === "desc") return <ArrowDown className="ml-1 h-3 w-3" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "space-y-2",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4 overflow-auto",
        className
      )}
    >
      {/* Header */}
      {(title || description) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        config={{
          columns: userColumns, data, enableGlobalFilter, enableFiltering, enableColumnVisibility,
          enableExport, enableRefresh, enableDensityToggle, enableFullscreen, bulkActions,
          onRefresh, title,
        }}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        density={density}
        setDensity={setDensity}
      />

      {/* Top pagination */}
      {enablePagination && (pagination?.position === "top" || pagination?.position === "both") && (
        <DataTablePagination table={table} config={pagination} />
      )}

      {/* Table */}
      <div
        className={cn(
          "rounded-lg border overflow-auto",
          bordered && "border-2",
          maxHeight && "overflow-y-auto"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-muted/95 backdrop-blur-sm", headerClassName)}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        densityPadding,
                        "text-xs font-semibold select-none whitespace-nowrap relative group",
                        header.column.getCanSort() && "cursor-pointer",
                        meta?.align === "center" && "text-center",
                        meta?.align === "right" && "text-right",
                        meta?.headerClassName
                      )}
                      style={{ width: header.getSize(), minWidth: meta?.minWidth, maxWidth: meta?.maxWidth }}
                      onClick={header.column.getToggleSortingHandler()}
                      colSpan={header.colSpan}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon header={header} />
                      </div>
                      {/* Resize handle */}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100 bg-primary/30 hover:bg-primary/60 transition-opacity",
                            header.column.getIsResizing() && "opacity-100 bg-primary"
                          )}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {finalColumns.map((_, j) => (
                    <TableCell key={j} className={densityPadding}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, idx) => {
                const disabled = isRowDisabled?.(row.original);
                const customRowClass = typeof rowClassName === "function" ? rowClassName(row.original, idx) : rowClassName;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      onRowClick && !disabled && "cursor-pointer",
                      disabled && "opacity-50 pointer-events-none",
                      striped && idx % 2 === 1 && "bg-muted/20",
                      customRowClass
                    )}
                    onClick={() => !disabled && onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            densityPadding,
                            "text-xs",
                            meta?.align === "center" && "text-center",
                            meta?.align === "right" && "text-right",
                            meta?.cellClassName
                          )}
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={finalColumns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {emptyIcon || <Inbox className="h-8 w-8" />}
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom pagination */}
      {enablePagination && (pagination?.position !== "top") && (
        <DataTablePagination table={table} config={pagination} />
      )}
    </div>
  );
}
