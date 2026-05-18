import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Download, Filter, MoreHorizontal } from "lucide-react";

export function PageShell({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export type KPI = { label: string; value: string | number; sub?: string; tone?: "default" | "success" | "warning" | "danger" | "info"; progress?: number };

const toneClass: Record<string, string> = {
  default: "text-foreground",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-rose-600",
  info: "text-sky-600",
};

export function KpiGrid({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {kpis.map((k) => (
        <Card key={k.label} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className={`text-2xl font-bold mt-1 ${toneClass[k.tone ?? "default"]}`}>{k.value}</div>
            {k.sub && <div className="text-[11px] text-muted-foreground mt-1">{k.sub}</div>}
            {typeof k.progress === "number" && <Progress value={k.progress} className="h-1.5 mt-2" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function Toolbar({ placeholder = "Search…", right }: { placeholder?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={placeholder} className="pl-8 h-9" />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline"><Filter className="h-4 w-4 mr-1" />Filter</Button>
        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Export</Button>
        {right}
      </div>
    </div>
  );
}

export function PrimaryAction({ label = "New", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <Button size="sm" onClick={onClick}><Plus className="h-4 w-4 mr-1" />{label}</Button>
  );
}

export function SimpleTable<T extends Record<string, any>>({
  columns, rows, renderActions,
}: {
  columns: { key: keyof T | string; label: string; render?: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  renderActions?: (row: T) => ReactNode;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => <TableHead key={String(c.key)} className={c.className}>{c.label}</TableHead>)}
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center text-muted-foreground py-8">No records</TableCell></TableRow>
            )}
            {rows.map((r, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={String(c.key)} className={c.className}>
                    {c.render ? c.render(r) : (r as any)[c.key]}
                  </TableCell>
                ))}
                {renderActions && <TableCell className="text-right">{renderActions(r)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const variant: any =
    ["active", "approved", "paid", "completed", "done", "success", "checked-in", "occupied"].includes(s) ? "default" :
    ["pending", "trial", "in-progress", "in_progress", "scheduled", "hold"].includes(s) ? "secondary" :
    ["expired", "rejected", "failed", "cancelled", "no-show", "overdue", "dirty"].includes(s) ? "destructive" :
    "outline";
  return <Badge variant={variant} className="capitalize">{status.replace(/[_-]/g, " ")}</Badge>;
}

export function InfoCard({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function RowActions() {
  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost">View</Button>
      <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
    </div>
  );
}