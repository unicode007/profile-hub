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
  ColumnOrderState,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2,
  Inbox,
  GripVertical,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableConfig, DataTableAction, DataTableColumnMeta } from "./types";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { GlobalFilterPanel } from "./GlobalFilterPanel";
import { toast } from "sonner";

// Cell with truncation and tooltip
function TruncatedCell({ value, maxLength = 40, copyable, enableGlobalCopy }: { value: any; maxLength?: number; copyable?: boolean; enableGlobalCopy?: boolean }) {
  const [copied, setCopied] = useState(false);
  const strVal = value != null ? String(value) : "";
  const shouldTruncate = strVal.length > maxLength;
  const showCopy = copyable || enableGlobalCopy;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(strVal).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (!shouldTruncate && !showCopy) {
    return <span>{strVal}</span>;
  }

  return (
    <div className="flex items-center gap-1 group/cell min-w-0">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate block cursor-default">
              {shouldTruncate ? strVal.slice(0, maxLength) + "…" : strVal}
            </span>
          </TooltipTrigger>
          {shouldTruncate && (
            <TooltipContent side="top" className="max-w-xs break-words text-xs">
              {strVal}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      {showCopy && strVal && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded hover:bg-muted"
          title="Copy"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
        </button>
      )}
    </div>
  );
}

// Drag handle for column reorder
function DragHandle({ onDragStart, onDragOver, onDrop, columnId }: { 
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  columnId: string;
}) {
  return (
    <span
      draggable
      onDragStart={(e) => onDragStart(e, columnId)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, columnId)}
      className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity mr-1"
    >
      <GripVertical className="h-3 w-3" />
    </span>
  );
}

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
  enableColumnDragDrop = false,
  enableCellCopy = false,
  pagination,
  actions,
  bulkActions,
  serverSide,
  globalFilters,
  onRefresh,
  onRowClick,
  onSelectionChange,
  title,
  description,
  emptyMessage = "No results found.",
  emptyIcon,
  emptyDescription,
  loading = false,
  loadingStyle = "skeleton",
  loadingRows = 5,
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
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [globalFilterValues, setGlobalFilterValues] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    globalFilters?.forEach((f) => { if (f.defaultValue !== undefined) defaults[f.id] = f.defaultValue; });
    return defaults;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle global filter panel changes - apply to column filters
  const handleGlobalFilterChange = useCallback((id: string, value: any) => {
    setGlobalFilterValues((prev) => ({ ...prev, [id]: value }));
    const filterConfig = globalFilters?.find((f) => f.id === id);
    if (filterConfig?.columnId) {
      setColumnFilters((prev) => {
        const filtered = prev.filter((f) => f.id !== filterConfig.columnId);
        if (value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          filtered.push({ id: filterConfig.columnId!, value });
        }
        return filtered;
      });
    }
  }, [globalFilters]);

  const handleResetGlobalFilters = useCallback(() => {
    setGlobalFilterValues({});
    if (globalFilters) {
      const columnIds = globalFilters.filter((f) => f.columnId).map((f) => f.columnId!);
      setColumnFilters((prev) => prev.filter((f) => !columnIds.includes(f.id)));
    }
  }, [globalFilters]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetId) return;
    
    setColumnOrder((old) => {
      const currentOrder = old.length > 0 ? old : finalColumns.map(c => c.id!).filter(Boolean);
      const fromIndex = currentOrder.indexOf(draggedColumn);
      const toIndex = currentOrder.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return old;
      const newOrder = [...currentOrder];
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedColumn);
      return newOrder;
    });
    setDraggedColumn(null);
  }, [draggedColumn]);

  // Build columns with select and actions
  const finalColumns = useMemo(() => {
    const cols: ColumnDef<TData, any>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
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
        enableResizing: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
        meta: { sticky: "left" as const },
      });
    }

    cols.push(...userColumns);

    if (actions && actions.length > 0) {
      cols.push({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 80,
        meta: { sticky: "right" as const },
        cell: ({ row }) => {
          const visibleActions = actions.filter((a) => !a.hidden?.(row.original));
          if (visibleActions.length === 0) return null;
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
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      columnSizing,
      ...(columnOrder.length > 0 ? { columnOrder } : {}),
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      serverSide?.onSortingChange?.(newSorting.map(s => ({ id: s.id, desc: s.desc })));
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      serverSide?.onFilterChange?.(newFilters.map(f => ({ id: f.id, value: f.value })));
    },
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
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting && !serverSide?.enabled ? getSortedRowModel() : undefined,
    getFilteredRowModel: (enableFiltering || enableGlobalFilter) && !serverSide?.enabled ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination && !serverSide?.enabled ? getPaginationRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableColumnResizing,
    columnResizeMode: "onChange",
    enableRowSelection: enableRowSelection ? (row) => !(isRowDisabled?.(row.original)) : false,
    enableMultiRowSelection,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    manualPagination: serverSide?.enabled,
    manualSorting: serverSide?.enabled,
    manualFiltering: serverSide?.enabled,
    pageCount: serverSide?.enabled ? Math.ceil(serverSide.totalRows / serverSide.pageSize) : undefined,
    initialState: {
      pagination: {
        pageSize: serverSide?.pageSize || pagination?.defaultPageSize || 20,
        pageIndex: serverSide?.pageIndex || 0,
      },
    },
  });

  const densityPadding = density === "compact" ? "px-2 py-1" : density === "comfortable" ? "px-4 py-3" : "px-3 py-2";

  const SortIcon = ({ header }: { header: Header<TData, unknown> }) => {
    if (!header.column.getCanSort()) return null;
    const sorted = header.column.getIsSorted();
    if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3 text-primary" />;
    if (sorted === "desc") return <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  };

  // Compute sticky column styles
  const getStickyStyles = (meta: DataTableColumnMeta | undefined, colIndex: number, isHeader: boolean): React.CSSProperties => {
    if (!meta?.sticky) return {};
    const style: React.CSSProperties = {
      position: "sticky",
      zIndex: isHeader ? 20 : 10,
    };
    if (meta.sticky === "left") {
      // Calculate left offset based on previous sticky-left columns
      let left = 0;
      const headers = table.getHeaderGroups()[0]?.headers || [];
      for (let i = 0; i < colIndex; i++) {
        const prevMeta = headers[i]?.column.columnDef.meta as DataTableColumnMeta | undefined;
        if (prevMeta?.sticky === "left") {
          left += headers[i].getSize();
        }
      }
      style.left = left;
    }
    if (meta.sticky === "right") {
      style.right = 0;
    }
    return style;
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
          onRefresh, title, serverSide,
        }}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        density={density}
        setDensity={setDensity}
      />

      {/* Global Filter Panel */}
      {globalFilters && globalFilters.length > 0 && (
        <GlobalFilterPanel
          table={table}
          filters={globalFilters}
          filterValues={globalFilterValues}
          onFilterChange={handleGlobalFilterChange}
          onReset={handleResetGlobalFilters}
        />
      )}

      {/* Top pagination */}
      {enablePagination && (pagination?.position === "top" || pagination?.position === "both") && (
        <DataTablePagination table={table} config={pagination} serverSide={serverSide} />
      )}

      {/* Table - fixed header, scrollable body only */}
      <div
        className={cn(
          "rounded-lg border relative overflow-auto",
          bordered && "border-2",
        )}
        style={{ maxHeight: maxHeight || "70vh" }}
      >
        {/* Overlay spinner loading */}
        {loading && loadingStyle === "overlay" && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          </div>
        )}

        {/* Spinner loading (replaces table) */}
        {loading && loadingStyle === "spinner" ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader className={cn("sticky top-0 z-20 bg-muted/95 backdrop-blur-sm", headerClassName)}>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header, colIndex) => {
                    const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                    const stickyStyles = getStickyStyles(meta, colIndex, true);
                    const isSticky = !!meta?.sticky;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          densityPadding,
                          "text-xs font-semibold select-none whitespace-nowrap relative group",
                          header.column.getCanSort() && "cursor-pointer",
                          meta?.align === "center" && "text-center",
                          meta?.align === "right" && "text-right",
                          meta?.headerClassName,
                          isSticky && "bg-muted/95 backdrop-blur-sm",
                          draggedColumn === header.id && "opacity-50",
                        )}
                        style={{
                          width: header.getSize(),
                          minWidth: meta?.minWidth,
                          maxWidth: meta?.maxWidth,
                          ...stickyStyles,
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                        colSpan={header.colSpan}
                      >
                        <div className={cn(
                          "flex items-center",
                          meta?.align === "center" && "justify-center",
                          meta?.align === "right" && "justify-end",
                        )}>
                          {enableColumnDragDrop && header.id !== "select" && header.id !== "actions" && (
                            <DragHandle
                              columnId={header.id}
                              onDragStart={handleDragStart}
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                            />
                          )}
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
              {loading && loadingStyle === "skeleton" ? (
                Array.from({ length: loadingRows }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {table.getVisibleFlatColumns().map((col, j) => (
                      <TableCell key={j} className={densityPadding}>
                        <Skeleton className={cn("h-4", j === 0 ? "w-10" : j === 1 ? "w-32" : "w-full")} />
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
                      {row.getVisibleCells().map((cell, colIndex) => {
                        const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                        const stickyStyles = getStickyStyles(meta, colIndex, false);
                        const isSticky = !!meta?.sticky;
                        const shouldTruncate = meta?.truncate !== false; // default true
                        const truncateLength = meta?.truncateLength || 40;
                        const isCopyable = meta?.copyable || enableCellCopy;
                        const cellValue = cell.getValue();

                        // For custom cell renderers, render as-is
                        const hasCustomCell = cell.column.columnDef.cell && typeof cell.column.columnDef.cell !== "string";
                        const isSpecialColumn = cell.column.id === "select" || cell.column.id === "actions";

                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              densityPadding,
                              "text-xs",
                              meta?.align === "center" && "text-center",
                              meta?.align === "right" && "text-right",
                              meta?.cellClassName,
                              meta?.nowrap && "whitespace-nowrap",
                              isSticky && "bg-background",
                            )}
                            style={{
                              width: cell.column.getSize(),
                              maxWidth: meta?.maxWidth || cell.column.getSize(),
                              ...stickyStyles,
                            }}
                          >
                            {isSpecialColumn ? (
                              flexRender(cell.column.columnDef.cell, cell.getContext())
                            ) : hasCustomCell ? (
                              <div className="min-w-0 truncate">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ) : (
                              <TruncatedCell
                                value={cellValue}
                                maxLength={truncateLength}
                                copyable={isCopyable}
                                enableGlobalCopy={enableCellCopy}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-8">
                      {emptyIcon || <Inbox className="h-12 w-12 opacity-40" />}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{emptyMessage}</p>
                        {emptyDescription && <p className="text-xs">{emptyDescription}</p>}
                      </div>
                      {globalFilter && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setGlobalFilter("")}>
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        )}
      </div>

      {/* Bottom pagination */}
      {enablePagination && (pagination?.position !== "top") && (
        <DataTablePagination table={table} config={pagination} serverSide={serverSide} />
      )}
    </div>
  );
}
