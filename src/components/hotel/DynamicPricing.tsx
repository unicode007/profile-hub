import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  PartyPopper,
  Clock,
  Bed,
  Users,
  Plus,
  Trash2,
  Info,
  Calculator,
  Settings,
  BarChart3,
  Percent,
  IndianRupee,
  ArrowUpDown,
  Copy,
  Power,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { format, isWeekend, differenceInDays, differenceInHours } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────
export interface DateRule {
  id: string;
  name: string;
  type: "weekday" | "weekend" | "season" | "custom_range";
  days?: string[];
  startDate?: string;
  endDate?: string;
  adjustType: "percentage" | "fixed";
  adjustValue: number;
  enabled: boolean;
}

export interface DemandRule {
  id: string;
  name: string;
  minOccupancy: number;
  maxOccupancy: number;
  adjustType: "percentage" | "fixed";
  adjustValue: number;
  enabled: boolean;
}

export interface EventRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  adjustType: "percentage" | "fixed";
  adjustValue: number;
  enabled: boolean;
  priority: number;
}

export interface LastMinuteRule {
  id: string;
  name: string;
  hoursBeforeCheckIn: number;
  adjustType: "percentage" | "fixed";
  adjustValue: number;
  direction: "increase" | "decrease";
  enabled: boolean;
}

export interface RoomTypeRule {
  id: string;
  roomType: string;
  multiplier: number;
  enabled: boolean;
}

export interface GuestCountRule {
  id: string;
  name: string;
  minGuests: number;
  maxGuests: number;
  extraChargePerGuest: number;
  enabled: boolean;
}

export interface PricingConfig {
  basePrice: number;
  currency: string;
  dateRules: DateRule[];
  demandRules: DemandRule[];
  eventRules: EventRule[];
  lastMinuteRules: LastMinuteRule[];
  roomTypeRules: RoomTypeRule[];
  guestCountRules: GuestCountRule[];
}

// ─── Defaults ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: PricingConfig = {
  basePrice: 3000,
  currency: "₹",
  dateRules: [
    { id: "dr1", name: "Weekend Surge", type: "weekend", adjustType: "percentage", adjustValue: 25, enabled: true },
    { id: "dr2", name: "Summer Season", type: "season", startDate: "2026-04-01", endDate: "2026-06-30", adjustType: "percentage", adjustValue: 15, enabled: true },
    { id: "dr3", name: "Winter Peak", type: "season", startDate: "2026-12-01", endDate: "2027-01-15", adjustType: "percentage", adjustValue: 30, enabled: true },
  ],
  demandRules: [
    { id: "dem1", name: "Low Occupancy Discount", minOccupancy: 0, maxOccupancy: 30, adjustType: "percentage", adjustValue: -15, enabled: true },
    { id: "dem2", name: "Medium Demand", minOccupancy: 30, maxOccupancy: 70, adjustType: "percentage", adjustValue: 0, enabled: true },
    { id: "dem3", name: "High Demand Surge", minOccupancy: 70, maxOccupancy: 90, adjustType: "percentage", adjustValue: 20, enabled: true },
    { id: "dem4", name: "Peak Demand Premium", minOccupancy: 90, maxOccupancy: 100, adjustType: "percentage", adjustValue: 40, enabled: true },
  ],
  eventRules: [
    { id: "ev1", name: "New Year", startDate: "2026-12-31", endDate: "2027-01-02", adjustType: "percentage", adjustValue: 60, enabled: true, priority: 1 },
    { id: "ev2", name: "Diwali", startDate: "2026-10-20", endDate: "2026-10-25", adjustType: "percentage", adjustValue: 50, enabled: true, priority: 2 },
    { id: "ev3", name: "Holi", startDate: "2027-03-13", endDate: "2027-03-15", adjustType: "percentage", adjustValue: 35, enabled: true, priority: 3 },
  ],
  lastMinuteRules: [
    { id: "lm1", name: "Last 6 Hours Deal", hoursBeforeCheckIn: 6, adjustType: "percentage", adjustValue: 20, direction: "decrease", enabled: true },
    { id: "lm2", name: "Last 24 Hours", hoursBeforeCheckIn: 24, adjustType: "percentage", adjustValue: 10, direction: "decrease", enabled: false },
    { id: "lm3", name: "Same Day Premium", hoursBeforeCheckIn: 12, adjustType: "percentage", adjustValue: 15, direction: "increase", enabled: false },
  ],
  roomTypeRules: [
    { id: "rt1", roomType: "Standard", multiplier: 1.0, enabled: true },
    { id: "rt2", roomType: "Deluxe", multiplier: 1.5, enabled: true },
    { id: "rt3", roomType: "Suite", multiplier: 2.2, enabled: true },
    { id: "rt4", roomType: "Presidential Suite", multiplier: 3.5, enabled: true },
  ],
  guestCountRules: [
    { id: "gc1", name: "Single Occupancy Discount", minGuests: 1, maxGuests: 1, extraChargePerGuest: -200, enabled: true },
    { id: "gc2", name: "Double Occupancy (Base)", minGuests: 2, maxGuests: 2, extraChargePerGuest: 0, enabled: true },
    { id: "gc3", name: "Extra Adult Charge", minGuests: 3, maxGuests: 4, extraChargePerGuest: 500, enabled: true },
    { id: "gc4", name: "Group Surcharge", minGuests: 5, maxGuests: 10, extraChargePerGuest: 800, enabled: true },
  ],
};

// ─── Price Calculator ────────────────────────────────────────────────────
export function calculateDynamicPrice(
  config: PricingConfig,
  params: {
    checkInDate: Date;
    bookingDate?: Date;
    occupancyPercent: number;
    roomType: string;
    guestCount: number;
  }
): { finalPrice: number; basePrice: number; adjustments: { label: string; amount: number; type: string }[] } {
  const { checkInDate, bookingDate = new Date(), occupancyPercent, roomType, guestCount } = params;
  let price = config.basePrice;
  const adjustments: { label: string; amount: number; type: string }[] = [];

  // Room type multiplier
  const rtRule = config.roomTypeRules.find((r) => r.roomType === roomType && r.enabled);
  if (rtRule && rtRule.multiplier !== 1) {
    const diff = price * rtRule.multiplier - price;
    price *= rtRule.multiplier;
    adjustments.push({ label: `${roomType} Room`, amount: diff, type: "room" });
  }

  // Date rules
  config.dateRules.filter((r) => r.enabled).forEach((rule) => {
    let applies = false;
    if (rule.type === "weekend" && isWeekend(checkInDate)) applies = true;
    if ((rule.type === "season" || rule.type === "custom_range") && rule.startDate && rule.endDate) {
      const s = new Date(rule.startDate);
      const e = new Date(rule.endDate);
      if (checkInDate >= s && checkInDate <= e) applies = true;
    }
    if (applies) {
      const amt = rule.adjustType === "percentage" ? price * (rule.adjustValue / 100) : rule.adjustValue;
      price += amt;
      adjustments.push({ label: rule.name, amount: amt, type: "date" });
    }
  });

  // Demand rules
  config.demandRules.filter((r) => r.enabled).forEach((rule) => {
    if (occupancyPercent >= rule.minOccupancy && occupancyPercent < rule.maxOccupancy) {
      const amt = rule.adjustType === "percentage" ? price * (rule.adjustValue / 100) : rule.adjustValue;
      if (amt !== 0) {
        price += amt;
        adjustments.push({ label: rule.name, amount: amt, type: "demand" });
      }
    }
  });

  // Event rules
  config.eventRules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority)
    .forEach((rule) => {
      const s = new Date(rule.startDate);
      const e = new Date(rule.endDate);
      if (checkInDate >= s && checkInDate <= e) {
        const amt = rule.adjustType === "percentage" ? price * (rule.adjustValue / 100) : rule.adjustValue;
        price += amt;
        adjustments.push({ label: `🎉 ${rule.name}`, amount: amt, type: "event" });
      }
    });

  // Last-minute rules
  const hoursUntilCheckIn = differenceInHours(checkInDate, bookingDate);
  if (hoursUntilCheckIn >= 0) {
    config.lastMinuteRules
      .filter((r) => r.enabled && hoursUntilCheckIn <= r.hoursBeforeCheckIn)
      .forEach((rule) => {
        let amt = rule.adjustType === "percentage" ? price * (rule.adjustValue / 100) : rule.adjustValue;
        if (rule.direction === "decrease") amt = -amt;
        price += amt;
        adjustments.push({ label: rule.name, amount: amt, type: "lastminute" });
      });
  }

  // Guest count
  config.guestCountRules.filter((r) => r.enabled).forEach((rule) => {
    if (guestCount >= rule.minGuests && guestCount <= rule.maxGuests && rule.extraChargePerGuest !== 0) {
      const extra = rule.extraChargePerGuest * (guestCount > 2 ? guestCount - 2 : 1);
      price += extra;
      adjustments.push({ label: rule.name, amount: extra, type: "guest" });
    }
  });

  return { finalPrice: Math.max(0, Math.round(price)), basePrice: config.basePrice, adjustments };
}

// ─── Sub-components ──────────────────────────────────────────────────────

function RuleToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return <Switch checked={enabled} onCheckedChange={onToggle} />;
}

function AdjustBadge({ value, type }: { value: number; type: string }) {
  const isPositive = value > 0;
  return (
    <Badge variant={isPositive ? "destructive" : "secondary"} className="text-xs">
      {isPositive ? "+" : ""}
      {value}
      {type === "percentage" ? "%" : " ₹"}
    </Badge>
  );
}

// ─── Section: Date Rules ─────────────────────────────────────────────────

function DateRulesSection({
  rules,
  onChange,
}: {
  rules: DateRule[];
  onChange: (rules: DateRule[]) => void;
}) {
  const addRule = () => {
    onChange([
      ...rules,
      {
        id: `dr_${Date.now()}`,
        name: "New Date Rule",
        type: "custom_range",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        adjustType: "percentage",
        adjustValue: 10,
        enabled: true,
      },
    ]);
  };

  const update = (id: string, patch: Partial<DateRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Date-Based Rules</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              <TableHead className="min-w-[100px]">Type</TableHead>
              <TableHead className="min-w-[120px]">Start</TableHead>
              <TableHead className="min-w-[120px]">End</TableHead>
              <TableHead className="min-w-[100px]">Adjust</TableHead>
              <TableHead className="min-w-[80px]">Value</TableHead>
              <TableHead className="w-[60px]">On</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.enabled ? "opacity-50" : ""}>
                <TableCell>
                  <Input value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} className="h-8 text-sm" />
                </TableCell>
                <TableCell>
                  <Select value={rule.type} onValueChange={(v) => update(rule.id, { type: v as DateRule["type"] })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekend">Weekend</SelectItem>
                      <SelectItem value="weekday">Weekday</SelectItem>
                      <SelectItem value="season">Season</SelectItem>
                      <SelectItem value="custom_range">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {rule.type !== "weekend" && rule.type !== "weekday" ? (
                    <Input type="date" value={rule.startDate || ""} onChange={(e) => update(rule.id, { startDate: e.target.value })} className="h-8 text-xs" />
                  ) : <span className="text-xs text-muted-foreground">Auto</span>}
                </TableCell>
                <TableCell>
                  {rule.type !== "weekend" && rule.type !== "weekday" ? (
                    <Input type="date" value={rule.endDate || ""} onChange={(e) => update(rule.id, { endDate: e.target.value })} className="h-8 text-xs" />
                  ) : <span className="text-xs text-muted-foreground">Auto</span>}
                </TableCell>
                <TableCell>
                  <Select value={rule.adjustType} onValueChange={(v) => update(rule.id, { adjustType: v as "percentage" | "fixed" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">Fixed ₹</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input type="number" value={rule.adjustValue} onChange={(e) => update(rule.id, { adjustValue: Number(e.target.value) })} className="h-8 text-sm w-20" />
                </TableCell>
                <TableCell><RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Section: Demand Rules ───────────────────────────────────────────────

function DemandRulesSection({
  rules,
  onChange,
}: {
  rules: DemandRule[];
  onChange: (rules: DemandRule[]) => void;
}) {
  const addRule = () => {
    onChange([
      ...rules,
      { id: `dem_${Date.now()}`, name: "New Demand Rule", minOccupancy: 0, maxOccupancy: 100, adjustType: "percentage", adjustValue: 0, enabled: true },
    ]);
  };

  const update = (id: string, patch: Partial<DemandRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Demand-Based Rules</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Min Occ %</TableHead>
              <TableHead>Max Occ %</TableHead>
              <TableHead>Adjust</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[60px]">On</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.enabled ? "opacity-50" : ""}>
                <TableCell><Input value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} className="h-8 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.minOccupancy} onChange={(e) => update(rule.id, { minOccupancy: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.maxOccupancy} onChange={(e) => update(rule.id, { maxOccupancy: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell>
                  <Select value={rule.adjustType} onValueChange={(v) => update(rule.id, { adjustType: v as "percentage" | "fixed" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">Fixed ₹</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input type="number" value={rule.adjustValue} onChange={(e) => update(rule.id, { adjustValue: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Section: Event Rules ────────────────────────────────────────────────

function EventRulesSection({
  rules,
  onChange,
}: {
  rules: EventRule[];
  onChange: (rules: EventRule[]) => void;
}) {
  const addRule = () => {
    onChange([
      ...rules,
      { id: `ev_${Date.now()}`, name: "New Event", startDate: format(new Date(), "yyyy-MM-dd"), endDate: format(new Date(), "yyyy-MM-dd"), adjustType: "percentage", adjustValue: 20, enabled: true, priority: rules.length + 1 },
    ]);
  };

  const update = (id: string, patch: Partial<EventRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PartyPopper className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Event / Holiday Rules</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Event</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Adjust</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="w-[60px]">On</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.enabled ? "opacity-50" : ""}>
                <TableCell><Input value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} className="h-8 text-sm" /></TableCell>
                <TableCell><Input type="date" value={rule.startDate} onChange={(e) => update(rule.id, { startDate: e.target.value })} className="h-8 text-xs" /></TableCell>
                <TableCell><Input type="date" value={rule.endDate} onChange={(e) => update(rule.id, { endDate: e.target.value })} className="h-8 text-xs" /></TableCell>
                <TableCell>
                  <Select value={rule.adjustType} onValueChange={(v) => update(rule.id, { adjustType: v as "percentage" | "fixed" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed">Fixed ₹</SelectItem></SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input type="number" value={rule.adjustValue} onChange={(e) => update(rule.id, { adjustValue: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.priority} onChange={(e) => update(rule.id, { priority: Number(e.target.value) })} className="h-8 w-16 text-sm" /></TableCell>
                <TableCell><RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Section: Last Minute Rules ──────────────────────────────────────────

function LastMinuteRulesSection({
  rules,
  onChange,
}: {
  rules: LastMinuteRule[];
  onChange: (rules: LastMinuteRule[]) => void;
}) {
  const addRule = () => {
    onChange([
      ...rules,
      { id: `lm_${Date.now()}`, name: "New Last-Minute Rule", hoursBeforeCheckIn: 12, adjustType: "percentage", adjustValue: 10, direction: "decrease", enabled: true },
    ]);
  };

  const update = (id: string, patch: Partial<LastMinuteRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Last-Minute Booking Rules</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hours Before</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Adjust</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[60px]">On</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.enabled ? "opacity-50" : ""}>
                <TableCell><Input value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} className="h-8 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.hoursBeforeCheckIn} onChange={(e) => update(rule.id, { hoursBeforeCheckIn: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell>
                  <Select value={rule.direction} onValueChange={(v) => update(rule.id, { direction: v as "increase" | "decrease" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="increase">↑ Increase</SelectItem><SelectItem value="decrease">↓ Decrease</SelectItem></SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={rule.adjustType} onValueChange={(v) => update(rule.id, { adjustType: v as "percentage" | "fixed" })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed">Fixed ₹</SelectItem></SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input type="number" value={rule.adjustValue} onChange={(e) => update(rule.id, { adjustValue: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Section: Room Type Rules ────────────────────────────────────────────

function RoomTypeRulesSection({
  rules,
  onChange,
}: {
  rules: RoomTypeRule[];
  onChange: (rules: RoomTypeRule[]) => void;
}) {
  const addRule = () => {
    onChange([...rules, { id: `rt_${Date.now()}`, roomType: "New Room", multiplier: 1.0, enabled: true }]);
  };

  const update = (id: string, patch: Partial<RoomTypeRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Room Type Multipliers</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Room</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rules.map((rule) => (
          <Card key={rule.id} className={`relative ${!rule.enabled ? "opacity-50" : ""}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input value={rule.roomType} onChange={(e) => update(rule.id, { roomType: e.target.value })} className="h-8 text-sm font-medium" />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive ml-1" onClick={() => remove(rule.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Multiplier:</Label>
                <Input type="number" step="0.1" value={rule.multiplier} onChange={(e) => update(rule.id, { multiplier: Number(e.target.value) })} className="h-8 text-sm" />
                <span className="text-xs text-muted-foreground">×</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Enabled</span>
                <RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Guest Count Rules ──────────────────────────────────────────

function GuestCountRulesSection({
  rules,
  onChange,
}: {
  rules: GuestCountRule[];
  onChange: (rules: GuestCountRule[]) => void;
}) {
  const addRule = () => {
    onChange([...rules, { id: `gc_${Date.now()}`, name: "New Guest Rule", minGuests: 1, maxGuests: 2, extraChargePerGuest: 0, enabled: true }]);
  };

  const update = (id: string, patch: Partial<GuestCountRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Guest Count Rules</h3>
        </div>
        <Button size="sm" onClick={addRule} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Rule</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Min Guests</TableHead>
              <TableHead>Max Guests</TableHead>
              <TableHead>Extra ₹/Guest</TableHead>
              <TableHead className="w-[60px]">On</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className={!rule.enabled ? "opacity-50" : ""}>
                <TableCell><Input value={rule.name} onChange={(e) => update(rule.id, { name: e.target.value })} className="h-8 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.minGuests} onChange={(e) => update(rule.id, { minGuests: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.maxGuests} onChange={(e) => update(rule.id, { maxGuests: Number(e.target.value) })} className="h-8 w-20 text-sm" /></TableCell>
                <TableCell><Input type="number" value={rule.extraChargePerGuest} onChange={(e) => update(rule.id, { extraChargePerGuest: Number(e.target.value) })} className="h-8 w-24 text-sm" /></TableCell>
                <TableCell><RuleToggle enabled={rule.enabled} onToggle={() => update(rule.id, { enabled: !rule.enabled })} /></TableCell>
                <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Live Price Calculator ───────────────────────────────────────────────

function PriceCalculator({ config }: { config: PricingConfig }) {
  const [checkInDate, setCheckInDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [occupancy, setOccupancy] = useState(65);
  const [roomType, setRoomType] = useState("Standard");
  const [guestCount, setGuestCount] = useState(2);

  const result = useMemo(
    () =>
      calculateDynamicPrice(config, {
        checkInDate: new Date(checkInDate),
        occupancyPercent: occupancy,
        roomType,
        guestCount,
      }),
    [config, checkInDate, occupancy, roomType, guestCount]
  );

  const priceDiff = result.finalPrice - result.basePrice;
  const priceDiffPct = ((priceDiff / result.basePrice) * 100).toFixed(1);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Live Price Calculator
        </CardTitle>
        <CardDescription>Test your pricing rules with different scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-in Date</Label>
            <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Occupancy %</Label>
            <div className="flex items-center gap-2">
              <Input type="range" min={0} max={100} value={occupancy} onChange={(e) => setOccupancy(Number(e.target.value))} className="h-9 flex-1" />
              <Badge variant="outline" className="min-w-[40px] justify-center">{occupancy}%</Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Bed className="h-3 w-3" /> Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {config.roomTypeRules.map((rt) => (
                  <SelectItem key={rt.id} value={rt.roomType}>{rt.roomType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1"><Users className="h-3 w-3" /> Guests</Label>
            <Input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="h-9" />
          </div>
        </div>

        <Separator />

        {/* Price Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Base Price</p>
              <p className="text-xl font-bold">₹{result.basePrice.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Final Price</p>
              <p className="text-2xl font-bold text-primary">₹{result.finalPrice.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className={priceDiff >= 0 ? "bg-destructive/5" : "bg-green-500/5"}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Price Change</p>
              <p className={`text-xl font-bold ${priceDiff >= 0 ? "text-destructive" : "text-green-600"}`}>
                {priceDiff >= 0 ? "+" : ""}₹{priceDiff.toLocaleString()} ({priceDiff >= 0 ? "+" : ""}{priceDiffPct}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Adjustments Breakdown */}
        {result.adjustments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" /> Price Breakdown
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm py-1.5 px-3 rounded bg-muted/30">
                <span>Base Price</span>
                <span className="font-medium">₹{result.basePrice.toLocaleString()}</span>
              </div>
              {result.adjustments.map((adj, i) => (
                <div key={i} className={`flex justify-between text-sm py-1.5 px-3 rounded ${adj.amount >= 0 ? "bg-destructive/5" : "bg-green-500/5"}`}>
                  <span className="flex items-center gap-1.5">
                    {adj.type === "date" && <Calendar className="h-3 w-3" />}
                    {adj.type === "demand" && <TrendingUp className="h-3 w-3" />}
                    {adj.type === "event" && <PartyPopper className="h-3 w-3" />}
                    {adj.type === "lastminute" && <Clock className="h-3 w-3" />}
                    {adj.type === "room" && <Bed className="h-3 w-3" />}
                    {adj.type === "guest" && <Users className="h-3 w-3" />}
                    {adj.label}
                  </span>
                  <span className={`font-medium ${adj.amount >= 0 ? "text-destructive" : "text-green-600"}`}>
                    {adj.amount >= 0 ? "+" : ""}₹{Math.round(adj.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm font-bold py-2 px-3 rounded bg-primary/10">
                <span>Final Price</span>
                <span className="text-primary">₹{result.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function DynamicPricing({ initialConfig }: { initialConfig?: PricingConfig }) {
  const [config, setConfig] = useState<PricingConfig>(initialConfig || DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("calculator");

  const handleSave = () => {
    console.log("Saving pricing config:", JSON.stringify(config, null, 2));
    toast.success("Dynamic pricing rules saved successfully!");
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    toast.info("Pricing rules reset to defaults");
  };

  const totalRules =
    config.dateRules.length +
    config.demandRules.length +
    config.eventRules.length +
    config.lastMinuteRules.length +
    config.roomTypeRules.length +
    config.guestCountRules.length;

  const activeRules =
    config.dateRules.filter((r) => r.enabled).length +
    config.demandRules.filter((r) => r.enabled).length +
    config.eventRules.filter((r) => r.enabled).length +
    config.lastMinuteRules.filter((r) => r.enabled).length +
    config.roomTypeRules.filter((r) => r.enabled).length +
    config.guestCountRules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Dynamic Pricing Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure intelligent pricing rules • {activeRules}/{totalRules} rules active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 mr-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Base Price</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">₹</span>
                <Input
                  type="number"
                  value={config.basePrice}
                  onChange={(e) => setConfig({ ...config, basePrice: Number(e.target.value) })}
                  className="h-8 w-24 text-sm font-bold"
                />
              </div>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">Reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all pricing rules?</AlertDialogTitle>
                <AlertDialogDescription>This will restore all rules to their default values.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} className="gap-1.5">
            Save Rules
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 w-full h-auto">
          <TabsTrigger value="calculator" className="gap-1 text-xs"><Calculator className="h-3.5 w-3.5" /><span className="hidden sm:inline">Calculator</span></TabsTrigger>
          <TabsTrigger value="date" className="gap-1 text-xs"><Calendar className="h-3.5 w-3.5" /><span className="hidden sm:inline">Date</span></TabsTrigger>
          <TabsTrigger value="demand" className="gap-1 text-xs"><TrendingUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">Demand</span></TabsTrigger>
          <TabsTrigger value="events" className="gap-1 text-xs"><PartyPopper className="h-3.5 w-3.5" /><span className="hidden sm:inline">Events</span></TabsTrigger>
          <TabsTrigger value="lastminute" className="gap-1 text-xs"><Clock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Last-Min</span></TabsTrigger>
          <TabsTrigger value="roomtype" className="gap-1 text-xs"><Bed className="h-3.5 w-3.5" /><span className="hidden sm:inline">Room</span></TabsTrigger>
          <TabsTrigger value="guests" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /><span className="hidden sm:inline">Guests</span></TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-4">
          <PriceCalculator config={config} />
        </TabsContent>

        <TabsContent value="date" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <DateRulesSection rules={config.dateRules} onChange={(dateRules) => setConfig({ ...config, dateRules })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <DemandRulesSection rules={config.demandRules} onChange={(demandRules) => setConfig({ ...config, demandRules })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <EventRulesSection rules={config.eventRules} onChange={(eventRules) => setConfig({ ...config, eventRules })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lastminute" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <LastMinuteRulesSection rules={config.lastMinuteRules} onChange={(lastMinuteRules) => setConfig({ ...config, lastMinuteRules })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roomtype" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <RoomTypeRulesSection rules={config.roomTypeRules} onChange={(roomTypeRules) => setConfig({ ...config, roomTypeRules })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="mt-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <GuestCountRulesSection rules={config.guestCountRules} onChange={(guestCountRules) => setConfig({ ...config, guestCountRules })} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
