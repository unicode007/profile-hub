import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PickerSize = "sm" | "md" | "lg";
export type ControlledPickerMode = "single" | "range" | "date-time" | "datetime-local" | "time" | "input";

export type ControlledPickerValue = Date | DateRange | string | undefined;

interface ControlledDatePickerProps {
  mode?: ControlledPickerMode;
  label?: string;
  placeholder?: string;
  value: ControlledPickerValue;
  onChange: (value: ControlledPickerValue) => void;
  error?: string;
  touched?: boolean;
  dateFormat?: string;
  inputFormat?: string;
  size?: PickerSize;
  disabledDates?: (Date | { from: Date; to: Date })[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const pickerSizeClass: Record<PickerSize, string> = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

export function ControlledDatePicker({
  mode = "single",
  label,
  placeholder,
  value,
  onChange,
  error,
  touched,
  dateFormat = "PPP",
  inputFormat = "dd/MM/yyyy",
  size = "md",
  disabledDates,
  minDate,
  maxDate,
  className,
}: ControlledDatePickerProps) {
  const [time, setTime] = useState("09:00");
  const displayError = touched ? error : undefined;

  const inputText = useMemo(() => {
    if (mode !== "input") return "";
    if (!(value instanceof Date)) return "";
    return format(value, inputFormat);
  }, [mode, value, inputFormat]);

  if (mode === "time") {
    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}</Label> : null}
        <Input
          type="time"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className={cn(pickerSizeClass[size], displayError && "border-destructive")}
        />
        {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      </div>
    );
  }

  if (mode === "datetime-local") {
    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}</Label> : null}
        <Input
          type="datetime-local"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          min={minDate ? format(minDate, "yyyy-MM-dd'T'HH:mm") : undefined}
          max={maxDate ? format(maxDate, "yyyy-MM-dd'T'HH:mm") : undefined}
          className={cn(pickerSizeClass[size], displayError && "border-destructive")}
        />
        {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      </div>
    );
  }

  if (mode === "input") {
    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}</Label> : null}
        <Input
          placeholder={placeholder ?? inputFormat}
          value={inputText}
          onChange={(event) => {
            const parsed = parse(event.target.value, inputFormat, new Date());
            if (isValid(parsed)) onChange(parsed);
            if (!event.target.value.trim()) onChange(undefined);
          }}
          className={cn(pickerSizeClass[size], displayError && "border-destructive")}
        />
        {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      </div>
    );
  }

  if (mode === "date-time") {
    const dateValue = value instanceof Date ? value : undefined;

    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}</Label> : null}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                pickerSizeClass[size],
                !dateValue && "text-muted-foreground",
                displayError && "border-destructive",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? `${format(dateValue, dateFormat)} ${time}` : placeholder ?? "Pick date & time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-2 p-3">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(selected) => {
                  if (!selected) return;
                  const [hours, minutes] = time.split(":").map(Number);
                  selected.setHours(hours || 0, minutes || 0, 0, 0);
                  onChange(new Date(selected));
                }}
                disabled={disabledDates}
                fromDate={minDate}
                toDate={maxDate}
                initialFocus
              />
              <Input
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value);
                  if (dateValue) {
                    const [hours, minutes] = event.target.value.split(":").map(Number);
                    const merged = new Date(dateValue);
                    merged.setHours(hours || 0, minutes || 0, 0, 0);
                    onChange(merged);
                  }
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
        {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      </div>
    );
  }

  if (mode === "range") {
    const range = value as DateRange | undefined;

    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}</Label> : null}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                pickerSizeClass[size],
                !range?.from && "text-muted-foreground",
                displayError && "border-destructive",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from
                ? range.to
                  ? `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`
                  : format(range.from, dateFormat)
                : placeholder ?? "Pick a date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={range} onSelect={(next) => onChange(next)} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
        {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
      </div>
    );
  }

  const selected = value instanceof Date ? value : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}</Label> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              pickerSizeClass[size],
              !selected && "text-muted-foreground",
              displayError && "border-destructive",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, dateFormat) : placeholder ?? "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(next) => onChange(next)}
            disabled={disabledDates}
            fromDate={minDate}
            toDate={maxDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {displayError ? <p className="text-sm text-destructive">{displayError}</p> : null}
    </div>
  );
}
