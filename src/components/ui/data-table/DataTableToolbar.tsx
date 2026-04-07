import { Table, Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  Columns3,
  Download,
  Trash2,
  Filter,
  X,
  Maximize2,
  Minimize2,
  AlignJustify,
  AlignCenter,
  AlignLeft,
  CalendarIcon,
  CheckSquare,
  Square,
} from "lucide-react";
import { DataTableBulkAction, DataTableConfig, DataTableColumnMeta, DataTableFilterOption } from "./types";
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props<TData> {
  table: Table<TData>;
  config: DataTableConfig<TData>;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  density: "compact" | "normal" | "comfortable";
  setDensity: (v: "compact" | "normal" | "comfortable") => void;
}

export function DataTableToolbar<TData>({
  table,
  config,
  globalFilter,
  setGlobalFilter,
  isFullscreen,
  setIsFullscreen,
  density,
  setDensity,
}: Props<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  const hasSelection = selectedRows.length > 0;
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(globalFilter);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search for server-side
  const debounceMs = config.serverSide?.debounceMs ?? 300;
  
  useEffect(() => {
    setLocalSearch(globalFilter);
  }, [globalFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setGlobalFilter(value);
      config.serverSide?.onGlobalFilterChange?.(value);
    }, config.serverSide?.enabled ? debounceMs : 0);
  }, [setGlobalFilter, config.serverSide, debounceMs]);

  const activeFilterCount = table.getState().columnFilters.length;

  const handleExportCSV = () => {
    const visibleColumns = table.getVisibleFlatColumns().filter((c) => c.id !== "select" && c.id !== "actions");
    const headers = visibleColumns.map((c) => {
      const meta = c.columnDef.meta as any;
      return meta?.exportLabel || (typeof c.columnDef.header === "string" ? c.columnDef.header : c.id);
    });
    const rows = table.getFilteredRowModel().rows.map((row) =>
      visibleColumns.map((col) => {
        const meta = col.columnDef.meta as any;
        const val = row.getValue(col.id);
        if (meta?.renderExport) return meta.renderExport(val);
        return val != null ? String(val) : "";
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.title || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectAllColumns = (visible: boolean) => {
    table.getAllColumns().filter((c) => c.getCanHide()).forEach((col) => col.toggleVisibility(visible));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {/* Search */}
        {config.enableGlobalFilter !== false && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {localSearch && (
              <Button variant="ghost" size="icon" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => handleSearchChange("")}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Bulk actions */}
        {hasSelection && config.bulkActions?.map((action) => (
          <BulkActionButton key={action.id} action={action} selectedRows={selectedRows} />
        ))}

        <div className="flex items-center gap-1 ml-auto flex-wrap">
          {config.enableFiltering !== false && (
            <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="h-8 text-xs gap-1" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full ml-0.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
          {config.enableRefresh && config.onRefresh && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={config.onRefresh} title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {config.enableColumnVisibility !== false && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Columns3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-80 overflow-y-auto">
                <DropdownMenuLabel className="text-xs">Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex gap-1 px-2 py-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => handleSelectAllColumns(true)}>
                    <CheckSquare className="h-3 w-3 mr-1" /> All
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => handleSelectAllColumns(false)}>
                    <Square className="h-3 w-3 mr-1" /> None
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    className="text-xs capitalize"
                  >
                    {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id.replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {config.enableDensityToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" title="Density">
                  {density === "compact" ? <AlignJustify className="h-3.5 w-3.5" /> : density === "comfortable" ? <AlignLeft className="h-3.5 w-3.5" /> : <AlignCenter className="h-3.5 w-3.5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["compact", "normal", "comfortable"] as const).map((d) => (
                  <DropdownMenuCheckboxItem key={d} checked={density === d} onCheckedChange={() => setDensity(d)} className="text-xs capitalize">{d}</DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {config.enableExport && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          {config.enableFullscreen && (
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Advanced column filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-2.5 bg-muted/30 rounded-lg border">
          {table.getAllColumns().filter((c) => c.getCanFilter() && c.id !== "select" && c.id !== "actions").map((col) => {
            const meta = col.columnDef.meta as DataTableColumnMeta | undefined;
            const filterType = meta?.filterType || "text";
            return (
              <div key={col.id} className="flex-shrink-0">
                <ColumnFilter column={col} filterType={filterType} options={meta?.filterOptions} />
              </div>
            );
          })}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { table.resetColumnFilters(); setShowFilters(false); }}>
            <X className="h-3 w-3 mr-1" /> Clear All
          </Button>
        </div>
      )}
    </div>
  );
}

// Advanced column filter component
function ColumnFilter<TData>({ column, filterType, options }: { 
  column: Column<TData, unknown>;
  filterType: string;
  options?: DataTableFilterOption[];
}) {
  const colName = typeof column.columnDef.header === "string" ? column.columnDef.header : column.id.replace(/_/g, " ");

  if (filterType === "select" && options) {
    return (
      <Select
        value={(column.getFilterValue() as string) ?? ""}
        onValueChange={(v) => column.setFilterValue(v === "__all__" ? undefined : v)}
      >
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder={colName} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All {colName}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.icon && <span className="mr-1">{opt.icon}</span>}
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (filterType === "checkbox" && options) {
    const currentFilter = (column.getFilterValue() as string[]) ?? [];
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 min-w-[120px]">
            {colName}
            {currentFilter.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-full">{currentFilter.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="flex gap-1 mb-2">
            <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => column.setFilterValue(options.map(o => o.value))}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => column.setFilterValue(undefined)}>
              Clear
            </Button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-xs px-1 py-0.5 rounded hover:bg-muted cursor-pointer">
                <Checkbox
                  checked={currentFilter.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const next = checked ? [...currentFilter, opt.value] : currentFilter.filter(v => v !== opt.value);
                    column.setFilterValue(next.length > 0 ? next : undefined);
                  }}
                  className="h-3.5 w-3.5"
                />
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (filterType === "date") {
    const dateVal = column.getFilterValue() as Date | undefined;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-7 text-xs gap-1 min-w-[130px]", !dateVal && "text-muted-foreground")}>
            <CalendarIcon className="h-3 w-3" />
            {dateVal ? format(dateVal, "PP") : colName}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateVal}
            onSelect={(date) => column.setFilterValue(date ?? undefined)}
            initialFocus
          />
          {dateVal && (
            <div className="p-2 pt-0">
              <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => column.setFilterValue(undefined)}>Clear</Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  if (filterType === "number") {
    return (
      <div className="flex gap-1">
        <Input
          type="number"
          placeholder={`Min ${colName}`}
          value={(column.getFilterValue() as [number, number])?.[0] ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            column.setFilterValue((old: [number, number]) => [val ? Number(val) : undefined, old?.[1]]);
          }}
          className="h-7 w-20 text-xs"
        />
        <Input
          type="number"
          placeholder={`Max`}
          value={(column.getFilterValue() as [number, number])?.[1] ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            column.setFilterValue((old: [number, number]) => [old?.[0], val ? Number(val) : undefined]);
          }}
          className="h-7 w-20 text-xs"
        />
      </div>
    );
  }

  // Default text filter
  return (
    <Input
      placeholder={`${colName}...`}
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      className="h-7 w-32 text-xs"
    />
  );
}

function BulkActionButton<TData>({ action, selectedRows }: { action: DataTableBulkAction<TData>; selectedRows: TData[] }) {
  if (action.confirmMessage) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={action.variant as any || "destructive"} size="sm" className="h-8 text-xs gap-1">
            {action.icon || <Trash2 className="h-3.5 w-3.5" />}
            {action.label} ({selectedRows.length})
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{action.confirmMessage.replace("{count}", String(selectedRows.length))}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => action.onClick(selectedRows)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  return (
    <Button variant={action.variant as any || "default"} size="sm" className="h-8 text-xs gap-1" onClick={() => action.onClick(selectedRows)}>
      {action.icon} {action.label} ({selectedRows.length})
    </Button>
  );
}
