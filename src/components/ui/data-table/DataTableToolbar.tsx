import { Table } from "@tanstack/react-table";
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
} from "lucide-react";
import { DataTableBulkAction, DataTableConfig } from "./types";
import { useState } from "react";

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
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.title || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {globalFilter && (
              <Button variant="ghost" size="icon" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setGlobalFilter("")}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Bulk actions */}
        {hasSelection && config.bulkActions?.map((action) => (
          <BulkActionButton key={action.id} action={action} selectedRows={selectedRows} />
        ))}

        <div className="flex items-center gap-1 ml-auto">
          {config.enableFiltering !== false && (
            <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="h-8 text-xs gap-1" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
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

      {/* Column filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg border">
          {table.getAllColumns().filter((c) => c.getCanFilter()).map((col) => (
            <div key={col.id} className="flex-shrink-0">
              <Input
                placeholder={`${typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}...`}
                value={(col.getFilterValue() as string) ?? ""}
                onChange={(e) => col.setFilterValue(e.target.value)}
                className="h-7 w-32 text-xs"
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => table.resetColumnFilters()}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      )}
    </div>
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
