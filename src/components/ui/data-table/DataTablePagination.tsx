import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DataTablePaginationConfig, DataTableServerSideConfig } from "./types";
import { useState } from "react";

interface Props<TData> {
  table: Table<TData>;
  config?: DataTablePaginationConfig;
  serverSide?: DataTableServerSideConfig;
}

export function DataTablePagination<TData>({ table, config, serverSide }: Props<TData>) {
  const pageSizes = config?.pageSizes || [10, 20, 50, 100, 500];
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = serverSide?.enabled ? serverSide.totalRows : table.getFilteredRowModel().rows.length;
  const [goToPage, setGoToPage] = useState("");

  const handleGoToPage = () => {
    const page = Number(goToPage) - 1;
    if (page >= 0 && page < table.getPageCount()) {
      table.setPageIndex(page);
      serverSide?.onPaginationChange?.(page, table.getState().pagination.pageSize);
    }
    setGoToPage("");
  };

  const handlePageSizeChange = (size: string) => {
    const pageSize = Number(size);
    table.setPageSize(pageSize);
    serverSide?.onPaginationChange?.(0, pageSize);
  };

  const handlePrevPage = () => {
    table.previousPage();
    if (serverSide?.enabled) {
      serverSide.onPaginationChange?.(table.getState().pagination.pageIndex - 1, table.getState().pagination.pageSize);
    }
  };

  const handleNextPage = () => {
    table.nextPage();
    if (serverSide?.enabled) {
      serverSide.onPaginationChange?.(table.getState().pagination.pageIndex + 1, table.getState().pagination.pageSize);
    }
  };

  const handleFirstPage = () => {
    table.setPageIndex(0);
    serverSide?.onPaginationChange?.(0, table.getState().pagination.pageSize);
  };

  const handleLastPage = () => {
    const lastPage = table.getPageCount() - 1;
    table.setPageIndex(lastPage);
    serverSide?.onPaginationChange?.(lastPage, table.getState().pagination.pageSize);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-1">
      <div className="text-xs text-muted-foreground">
        {selectedCount > 0 && (
          <span className="font-medium">{selectedCount} of{" "}</span>
        )}
        {totalCount} row(s)
        {config?.showPageInfo !== false && (
          <span className="ml-2">
            | Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {config?.showGoToPage && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground hidden sm:inline">Go to:</span>
            <Input
              type="number"
              min={1}
              max={table.getPageCount()}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
              className="h-7 w-14 text-xs"
              placeholder="#"
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground hidden sm:inline">Rows:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-7 w-[60px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((s) => (
                <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleFirstPage} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevPage} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextPage} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleLastPage} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
