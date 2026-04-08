import { useState, useCallback } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DataTableGlobalFilterConfig, DataTableFilterOption } from "./types";

interface Props<TData> {
  table: Table<TData>;
  filters: DataTableGlobalFilterConfig[];
  filterValues: Record<string, any>;
  onFilterChange: (id: string, value: any) => void;
  onReset: () => void;
}

export function GlobalFilterPanel<TData>({
  table,
  filters,
  filterValues,
  onFilterChange,
  onReset,
}: Props<TData>) {
  const [isOpen, setIsOpen] = useState(true);
  const activeCount = Object.values(filterValues).filter(
    (v) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2 mb-1">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
            <Filter className="h-3.5 w-3.5" />
            Advanced Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 p-0 flex items-center justify-center text-[10px] rounded-full ml-1">
                {activeCount}
              </Badge>
            )}
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onReset}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>
      <CollapsibleContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3 bg-muted/30 rounded-lg border">
          {filters.map((filter) => (
            <GlobalFilterField
              key={filter.id}
              filter={filter}
              value={filterValues[filter.id]}
              onChange={(v) => onFilterChange(filter.id, v)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function GlobalFilterField({
  filter,
  value,
  onChange,
}: {
  filter: DataTableGlobalFilterConfig;
  value: any;
  onChange: (v: any) => void;
}) {
  switch (filter.type) {
    case "text":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <Input
            placeholder={filter.placeholder || `Filter ${filter.label}...`}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="h-8 text-xs"
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <Select value={value ?? ""} onValueChange={(v) => onChange(v === "__all__" ? undefined : v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={filter.placeholder || `All ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {filter.label}</SelectItem>
              {filter.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.icon && <span className="mr-1">{opt.icon}</span>}
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <CheckboxFilterGroup options={filter.options || []} value={value ?? []} onChange={onChange} />
        </div>
      );

    case "treeSelect":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <TreeSelectFilter options={filter.options || []} value={value ?? []} onChange={onChange} label={filter.label} />
        </div>
      );

    case "date":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <DateFilter value={value} onChange={onChange} label={filter.label} />
        </div>
      );

    case "dateRange":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <DateRangeFilter value={value} onChange={onChange} label={filter.label} />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{filter.label}</label>
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Min"
              value={value?.[0] ?? ""}
              onChange={(e) => onChange([e.target.value ? Number(e.target.value) : undefined, value?.[1]])}
              className="h-8 text-xs"
            />
            <Input
              type="number"
              placeholder="Max"
              value={value?.[1] ?? ""}
              onChange={(e) => onChange([value?.[0], e.target.value ? Number(e.target.value) : undefined])}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

function CheckboxFilterGroup({
  options,
  value,
  onChange,
}: {
  options: DataTableFilterOption[];
  value: string[];
  onChange: (v: string[] | undefined) => void;
}) {
  const allSelected = value.length === options.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-between">
          <span className="truncate">
            {value.length === 0 ? "Select..." : `${value.length} selected`}
          </span>
          {value.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-full ml-1">{value.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="flex gap-1 mb-2">
          <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => onChange(options.map((o) => o.value))}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => onChange(undefined)}>
            Clear
          </Button>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-xs px-1 py-0.5 rounded hover:bg-muted cursor-pointer">
              <Checkbox
                checked={value.includes(opt.value)}
                onCheckedChange={(checked) => {
                  const next = checked ? [...value, opt.value] : value.filter((v) => v !== opt.value);
                  onChange(next.length > 0 ? next : undefined);
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

function TreeSelectFilter({
  options,
  value,
  onChange,
  label,
}: {
  options: DataTableFilterOption[];
  value: string[];
  onChange: (v: string[] | undefined) => void;
  label: string;
}) {
  const getAllValues = useCallback((opts: DataTableFilterOption[]): string[] => {
    return opts.flatMap((o) => [o.value, ...(o.children ? getAllValues(o.children) : [])]);
  }, []);

  const allValues = getAllValues(options);
  const allSelected = allValues.every((v) => value.includes(v));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs w-full justify-between">
          <span className="truncate">
            {value.length === 0 ? "Select..." : `${value.length} selected`}
          </span>
          {value.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] rounded-full ml-1">{value.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex gap-1 mb-2">
          <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => onChange(allValues)}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] flex-1" onClick={() => onChange(undefined)}>
            Clear
          </Button>
        </div>
        <div className="space-y-0.5 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <TreeNode key={opt.value} option={opt} selectedValues={value} onChange={onChange} getAllValues={getAllValues} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TreeNode({
  option,
  selectedValues,
  onChange,
  getAllValues,
  depth = 0,
}: {
  option: DataTableFilterOption;
  selectedValues: string[];
  onChange: (v: string[] | undefined) => void;
  getAllValues: (opts: DataTableFilterOption[]) => string[];
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = option.children && option.children.length > 0;
  const childValues = hasChildren ? getAllValues(option.children!) : [];
  const allChildSelected = childValues.every((v) => selectedValues.includes(v));
  const someChildSelected = childValues.some((v) => selectedValues.includes(v));
  const isChecked = selectedValues.includes(option.value);

  const handleToggle = (checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...new Set([...selectedValues, option.value, ...childValues])];
    } else {
      const removeSet = new Set([option.value, ...childValues]);
      next = selectedValues.filter((v) => !removeSet.has(v));
    }
    onChange(next.length > 0 ? next : undefined);
  };

  return (
    <div>
      <div className="flex items-center gap-1 py-0.5 rounded hover:bg-muted" style={{ paddingLeft: depth * 16 + 4 }}>
        {hasChildren && (
          <button onClick={() => setIsOpen(!isOpen)} className="p-0.5 hover:bg-muted rounded flex-shrink-0">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <label className="flex items-center gap-1.5 text-xs cursor-pointer flex-1 min-w-0">
          <Checkbox
            checked={hasChildren ? (allChildSelected && isChecked ? true : someChildSelected || isChecked ? "indeterminate" : false) : isChecked}
            onCheckedChange={(v) => handleToggle(!!v)}
            className="h-3.5 w-3.5 flex-shrink-0"
          />
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <span className="truncate">{option.label}</span>
        </label>
      </div>
      {hasChildren && isOpen && option.children!.map((child) => (
        <TreeNode key={child.value} option={child} selectedValues={selectedValues} onChange={onChange} getAllValues={getAllValues} depth={depth + 1} />
      ))}
    </div>
  );
}

function DateFilter({ value, onChange, label }: { value: Date | undefined; onChange: (v: Date | undefined) => void; label: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 text-xs w-full justify-start gap-1", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
          {value ? format(value, "PP") : `Select ${label}`}
          {value && (
            <X className="h-3 w-3 ml-auto flex-shrink-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onChange(undefined); }} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={(d) => onChange(d ?? undefined)} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

function DateRangeFilter({ value, onChange, label }: { value: { from?: Date; to?: Date } | undefined; onChange: (v: any) => void; label: string }) {
  return (
    <div className="flex gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-8 text-xs flex-1 justify-start gap-1", !value?.from && "text-muted-foreground")}>
            <CalendarIcon className="h-3 w-3" />
            {value?.from ? format(value.from, "MMM dd") : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value?.from} onSelect={(d) => onChange({ ...value, from: d ?? undefined })} initialFocus />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-8 text-xs flex-1 justify-start gap-1", !value?.to && "text-muted-foreground")}>
            <CalendarIcon className="h-3 w-3" />
            {value?.to ? format(value.to, "MMM dd") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value?.to} onSelect={(d) => onChange({ ...value, to: d ?? undefined })} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}
