import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageShell, KpiGrid, Toolbar, PrimaryAction, SimpleTable, StatusBadge, InfoCard, RowActions } from "./ModuleKit";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Users, Building2,
  CreditCard, Bed, Wrench, Sparkles, Wine, Shirt, DoorOpen, DoorClosed, Phone, Mail, Printer,
  Bell, ShieldCheck, FileText, Receipt, Banknote, Globe, Plug, Languages, KeyRound,
} from "lucide-react";

// ============ MASTER PLATFORM ============

export function MasterDashboard() {
  return (
    <PageShell title="Master Dashboard" description="Platform-wide KPIs and SaaS controls.">
      <KpiGrid kpis={[
        { label: "Total Tenants", value: 248, sub: "+12 this month", tone: "info" },
        { label: "Active Subscriptions", value: 192, sub: "77% retention", tone: "success" },
        { label: "MRR", value: "$48,210", sub: "+8.4% MoM", tone: "success" },
        { label: "Trial Tenants", value: 34, sub: "Convert by Day 14", tone: "warning" },
        { label: "Pending Approvals", value: 7, sub: "Hotels in queue", tone: "warning" },
        { label: "Churned (30d)", value: 9, sub: "3.6% churn", tone: "danger" },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Plan Distribution" description="Active tenants by plan tier">
          {[
            { p: "Starter", c: 92, pct: 48 },
            { p: "Pro", c: 78, pct: 41 },
            { p: "Enterprise", c: 22, pct: 11 },
          ].map((r) => (
            <div key={r.p} className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span>{r.p}</span><span className="text-muted-foreground">{r.c} tenants</span></div>
              <Progress value={r.pct} />
            </div>
          ))}
        </InfoCard>
        <InfoCard title="Recent Platform Activity" description="System-wide events">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> New tenant signup: <b>Sunrise Resorts</b></li>
            <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-600" /> Plan upgraded: Marriott Lite → Pro</li>
            <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-sky-600" /> Hotel submitted for approval: Ocean Breeze</li>
            <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Payment failed: Greenwood Inn</li>
          </ul>
        </InfoCard>
      </div>
    </PageShell>
  );
}

export function SubscriptionPlans() {
  const plans = [
    { name: "Starter", price: 29, hotels: 1, rooms: 25, staff: 5, features: ["Basic PMS", "1 Hotel", "Email Support"], popular: false },
    { name: "Pro", price: 79, hotels: 5, rooms: 150, staff: 25, features: ["Channel Manager", "Analytics", "Priority Support", "POS"], popular: true },
    { name: "Enterprise", price: 199, hotels: 999, rooms: 9999, staff: 999, features: ["Unlimited", "Custom Integrations", "Dedicated CSM", "SLA"], popular: false },
  ];
  return (
    <PageShell title="Subscription Plans" description="Create & manage SaaS plans, pricing, and feature limits." action={<PrimaryAction label="New Plan" />}>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.name} className={p.popular ? "border-primary shadow-md" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                {p.popular && <Badge>Popular</Badge>}
              </div>
              <div className="text-3xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <div>Hotels: <b>{p.hotels === 999 ? "Unlimited" : p.hotels}</b></div>
                <div>Rooms: <b>{p.rooms === 9999 ? "Unlimited" : p.rooms}</b></div>
                <div>Staff: <b>{p.staff === 999 ? "Unlimited" : p.staff}</b></div>
              </div>
              <Separator />
              <ul className="space-y-1.5 text-sm">
                {p.features.map(f => <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{f}</li>)}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                <Button size="sm" variant="outline" className="flex-1">Deactivate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function TenantSubscriptions() {
  const rows = [
    { tenant: "Sunrise Resorts", plan: "Pro", status: "active", renewal: "2026-06-15", mrr: "$79" },
    { tenant: "Marriott Lite", plan: "Enterprise", status: "active", renewal: "2026-08-02", mrr: "$199" },
    { tenant: "Greenwood Inn", plan: "Starter", status: "past_due", renewal: "2026-05-10", mrr: "$29" },
    { tenant: "Ocean Breeze", plan: "Pro", status: "trial", renewal: "2026-05-30", mrr: "$0" },
    { tenant: "Hilltop Stay", plan: "Starter", status: "cancelled", renewal: "—", mrr: "$0" },
  ];
  return (
    <PageShell title="Tenant Subscriptions" description="All active and expired tenant subscriptions.">
      <KpiGrid kpis={[
        { label: "Active", value: 192, tone: "success" },
        { label: "Trial", value: 34, tone: "info" },
        { label: "Past Due", value: 11, tone: "warning" },
        { label: "Cancelled (30d)", value: 9, tone: "danger" },
      ]} />
      <Toolbar placeholder="Search tenants…" />
      <SimpleTable
        columns={[
          { key: "tenant", label: "Tenant" },
          { key: "plan", label: "Plan", render: r => <Badge variant="outline">{r.plan}</Badge> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "renewal", label: "Renewal" },
          { key: "mrr", label: "MRR" },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function TenantsAdmins() {
  const rows = [
    { name: "Sunrise Resorts", owner: "Aman Verma", email: "aman@sunrise.com", hotels: 3, plan: "Pro", status: "active" },
    { name: "Marriott Lite", owner: "Priya Shah", email: "priya@mlite.com", hotels: 12, plan: "Enterprise", status: "active" },
    { name: "Greenwood Inn", owner: "Rajesh K", email: "raj@greenwood.in", hotels: 1, plan: "Starter", status: "suspended" },
    { name: "Ocean Breeze", owner: "Nina P", email: "nina@oceanbreeze.io", hotels: 1, plan: "Pro", status: "active" },
  ];
  return (
    <PageShell title="Tenants & Admins" description="Manage all signed-up admin workspaces." action={<PrimaryAction label="Invite Tenant" />}>
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "name", label: "Tenant" },
          { key: "owner", label: "Owner" },
          { key: "email", label: "Email" },
          { key: "hotels", label: "Hotels" },
          { key: "plan", label: "Plan" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost">Impersonate</Button>
            <Button size="sm" variant="ghost">Suspend</Button>
          </div>
        )}
      />
    </PageShell>
  );
}

export function HotelApprovals() {
  const rows = [
    { hotel: "Ocean Breeze Resort", tenant: "Ocean Breeze", city: "Goa", submitted: "2 hrs ago", docs: "Complete", status: "pending" },
    { hotel: "Skyline Suites", tenant: "Sunrise Resorts", city: "Mumbai", submitted: "1 day ago", docs: "Complete", status: "pending" },
    { hotel: "Riverside Lodge", tenant: "Hilltop Stay", city: "Manali", submitted: "3 days ago", docs: "Missing GST", status: "pending" },
  ];
  return (
    <PageShell title="Hotel Approvals" description="Review and approve new hotel listings.">
      <KpiGrid kpis={[
        { label: "Pending", value: 7, tone: "warning" },
        { label: "Approved (7d)", value: 23, tone: "success" },
        { label: "Rejected (7d)", value: 2, tone: "danger" },
        { label: "Avg Review Time", value: "4.2h", tone: "info" },
      ]} />
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "hotel", label: "Hotel" },
          { key: "tenant", label: "Tenant" },
          { key: "city", label: "City" },
          { key: "submitted", label: "Submitted" },
          { key: "docs", label: "Documents", render: r => <Badge variant={r.docs === "Complete" ? "default" : "destructive"}>{r.docs}</Badge> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="default"><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
            <Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-1" />Reject</Button>
          </div>
        )}
      />
    </PageShell>
  );
}

export function FeatureFlags() {
  const flags = [
    { key: "channel_manager", label: "Channel Manager", desc: "OTA two-way sync", enabled: true, plan: "Pro+" },
    { key: "pos_restaurant", label: "Restaurant POS", desc: "F&B billing & KDS", enabled: true, plan: "Pro+" },
    { key: "dynamic_pricing", label: "Dynamic Pricing", desc: "AI-driven rate engine", enabled: false, plan: "Enterprise" },
    { key: "whatsapp_comms", label: "WhatsApp Comms", desc: "Guest WhatsApp messaging", enabled: true, plan: "All" },
    { key: "loyalty_program", label: "Loyalty Program", desc: "Points & tiers", enabled: false, plan: "Enterprise" },
  ];
  return (
    <PageShell title="Feature Flags" description="Global capability toggles per plan or tenant." action={<PrimaryAction label="New Flag" />}>
      <div className="grid gap-3">
        {flags.map(f => (
          <Card key={f.key}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{f.label}</div>
                <div className="text-sm text-muted-foreground">{f.desc} • <Badge variant="outline" className="ml-1">{f.plan}</Badge></div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={f.enabled ? "default" : "secondary"}>{f.enabled ? "Enabled" : "Disabled"}</Badge>
                <Switch defaultChecked={f.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function RoutesMenus() {
  const rows = [
    { route: "/app/dashboard", menu: "Front Desk", icon: "Layout", plan: "All", active: true },
    { route: "/app/restaurant", menu: "Restaurant POS", icon: "Utensils", plan: "Pro+", active: true },
    { route: "/app/channel-manager", menu: "Channel Manager", icon: "Plug", plan: "Pro+", active: true },
    { route: "/app/dynamic-pricing", menu: "Dynamic Pricing", icon: "Sparkles", plan: "Enterprise", active: false },
  ];
  return (
    <PageShell title="Routes & Menus" description="Define which routes and menus are available platform-wide." action={<PrimaryAction label="New Route" />}>
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "route", label: "Route" },
          { key: "menu", label: "Menu Label" },
          { key: "icon", label: "Icon" },
          { key: "plan", label: "Plan", render: r => <Badge variant="outline">{r.plan}</Badge> },
          { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function GlobalAmenities() {
  const cats = [
    { name: "Basic Facilities", items: ["Free Wi-Fi", "Parking", "Power Backup", "Elevator"] },
    { name: "Room Amenities", items: ["AC", "TV", "Mini Fridge", "Safe", "Iron"] },
    { name: "Food & Drinks", items: ["Restaurant", "Bar", "Room Service", "Breakfast"] },
    { name: "Wellness", items: ["Pool", "Spa", "Gym", "Sauna"] },
    { name: "Business", items: ["Meeting Room", "Conference Hall", "Business Center"] },
    { name: "Safety", items: ["CCTV", "Fire Alarm", "First Aid", "Security 24x7"] },
  ];
  return (
    <PageShell title="Global Amenities" description="Master catalog of amenities hotels can pick from." action={<PrimaryAction label="New Amenity" />}>
      <Toolbar />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => (
          <Card key={c.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{c.name}</CardTitle>
              <CardDescription>{c.items.length} amenities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {c.items.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1">Manage</Button>
                <Button size="sm" variant="ghost">+ Add</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function GlobalPolicies() {
  const policies = [
    { name: "Standard Cancellation", region: "Global", type: "Cancellation", tiers: "Free <48h, 50% <24h, No refund <12h", active: true },
    { name: "Child Policy (India)", region: "India", type: "Child", tiers: "<5 free, 6-12 half rate", active: true },
    { name: "GST (India)", region: "India", type: "Tax", tiers: "12% < ₹7500, 18% ≥ ₹7500", active: true },
    { name: "Pet Policy", region: "Global", type: "Pet", tiers: "Allowed with ₹500/night deposit", active: false },
  ];
  return (
    <PageShell title="Global Policies" description="Default cancellation, child, pet, and tax policies." action={<PrimaryAction label="New Policy" />}>
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "name", label: "Policy" },
          { key: "type", label: "Type", render: r => <Badge variant="outline">{r.type}</Badge> },
          { key: "region", label: "Region" },
          { key: "tiers", label: "Rules" },
          { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={policies}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function PlatformRevenue() {
  return (
    <PageShell title="Platform Revenue" description="SaaS revenue, MRR/ARR, churn and forecasting.">
      <KpiGrid kpis={[
        { label: "MRR", value: "$48,210", sub: "+8.4%", tone: "success" },
        { label: "ARR", value: "$578K", sub: "Projected", tone: "info" },
        { label: "Churn", value: "3.6%", sub: "-0.4% MoM", tone: "success" },
        { label: "ARPU", value: "$251", sub: "+$12", tone: "info" },
        { label: "Failed Payments", value: 11, tone: "danger" },
        { label: "Refunds (30d)", value: "$1,420", tone: "warning" },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Revenue by Plan">
          {[{ p: "Starter", v: 8200, pct: 17 }, { p: "Pro", v: 22810, pct: 47 }, { p: "Enterprise", v: 17200, pct: 36 }].map(r => (
            <div key={r.p} className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span>{r.p}</span><span className="text-muted-foreground">${r.v.toLocaleString()}</span></div>
              <Progress value={r.pct} />
            </div>
          ))}
        </InfoCard>
        <InfoCard title="Recent Transactions">
          <ul className="space-y-2 text-sm">
            {[
              { t: "Marriott Lite", a: "+$199", s: "success" },
              { t: "Sunrise Resorts", a: "+$79", s: "success" },
              { t: "Greenwood Inn", a: "-$29", s: "failed" },
              { t: "Hilltop Stay", a: "Refund -$29", s: "refund" },
            ].map((x, i) => (
              <li key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                <span>{x.t}</span>
                <span className={x.s === "success" ? "text-emerald-600" : x.s === "failed" ? "text-rose-600" : "text-amber-600"}>{x.a}</span>
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </PageShell>
  );
}

// ============ ADMIN / TENANT ============

export function AdminDashboard() {
  return (
    <PageShell title="Admin Dashboard" description="Tenant-level KPIs across all your hotels.">
      <KpiGrid kpis={[
        { label: "Bookings Today", value: 24, sub: "8 check-ins • 6 check-outs", tone: "info" },
        { label: "Bookings This Week", value: 142, sub: "+12% vs last week", tone: "success" },
        { label: "Bookings This Month", value: 612, sub: "Target: 700", tone: "info", progress: 87 },
        { label: "Occupancy", value: "78%", sub: "↑ 4% MoM", tone: "success" },
        { label: "ADR", value: "₹4,250", sub: "Avg Daily Rate", tone: "info" },
        { label: "RevPAR", value: "₹3,315", sub: "Revenue per room", tone: "info" },
        { label: "Pending Payments", value: "₹1.2L", sub: "8 invoices", tone: "warning" },
        { label: "Housekeeping Load", value: "32", sub: "Dirty + In-progress", tone: "warning" },
        { label: "Maintenance Open", value: 5, sub: "2 high priority", tone: "danger" },
        { label: "Staff Online", value: "24/38", sub: "63% active", tone: "info" },
        { label: "Plan Usage", value: "4/5 hotels", sub: "Pro plan", tone: "info", progress: 80 },
        { label: "Reviews (7d)", value: "4.7★", sub: "18 new reviews", tone: "success" },
      ]} />
      <div className="grid lg:grid-cols-3 gap-4">
        <InfoCard title="Today's Schedule" description="Arrivals & departures">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Arrivals</span><b>8</b></li>
            <li className="flex justify-between"><span>Departures</span><b>6</b></li>
            <li className="flex justify-between"><span>In-house</span><b>78</b></li>
            <li className="flex justify-between text-amber-600"><span>Walk-ins</span><b>3</b></li>
            <li className="flex justify-between text-rose-600"><span>No-shows</span><b>1</b></li>
          </ul>
        </InfoCard>
        <InfoCard title="Revenue Today">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Rooms</span><b>₹84,200</b></li>
            <li className="flex justify-between"><span>F&B</span><b>₹22,150</b></li>
            <li className="flex justify-between"><span>Other</span><b>₹6,400</b></li>
            <Separator className="my-1" />
            <li className="flex justify-between font-semibold"><span>Total</span><span>₹1,12,750</span></li>
          </ul>
        </InfoCard>
        <InfoCard title="Alerts">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-rose-600"><AlertTriangle className="h-4 w-4" /> Overbooking: Deluxe x 2</li>
            <li className="flex items-center gap-2 text-amber-600"><Clock className="h-4 w-4" /> 3 late check-ins pending</li>
            <li className="flex items-center gap-2 text-amber-600"><Wrench className="h-4 w-4" /> AC repair: Room 302</li>
            <li className="flex items-center gap-2 text-sky-600"><Bell className="h-4 w-4" /> 5 wake-up calls scheduled</li>
          </ul>
        </InfoCard>
      </div>
    </PageShell>
  );
}

// ============ FRONT DESK ============

export function FDDashboard() {
  return (
    <PageShell title="Front Desk Dashboard" description="Operational hub for today's reception activity.">
      <KpiGrid kpis={[
        { label: "Arrivals Today", value: 8, tone: "info" },
        { label: "Departures Today", value: 6, tone: "info" },
        { label: "In-House", value: 78, tone: "success" },
        { label: "Available Rooms", value: 22, tone: "success" },
        { label: "Dirty Rooms", value: 12, tone: "warning" },
        { label: "OOO", value: 2, tone: "danger" },
        { label: "Pending Advance", value: "₹38,500", tone: "warning" },
        { label: "Open Requests", value: 14, tone: "info" },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline"><DoorOpen className="h-4 w-4 mr-2" />Check-in</Button>
            <Button variant="outline"><DoorClosed className="h-4 w-4 mr-2" />Checkout</Button>
            <Button variant="outline"><Users className="h-4 w-4 mr-2" />Walk-in</Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Print Reg Card</Button>
            <Button variant="outline"><Phone className="h-4 w-4 mr-2" />Wake-up Call</Button>
            <Button variant="outline"><Bed className="h-4 w-4 mr-2" />Room Change</Button>
          </div>
        </InfoCard>
        <InfoCard title="Live Floor Status">
          {["Floor 1", "Floor 2", "Floor 3"].map((f, i) => (
            <div key={f} className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span>{f}</span><span className="text-muted-foreground">{18-i*2}/24 occupied</span></div>
              <Progress value={[75, 68, 58][i]} />
            </div>
          ))}
        </InfoCard>
      </div>
    </PageShell>
  );
}

const arrivalRows = [
  { id: "BK-1024", guest: "Anita Rao", rt: "Deluxe", eta: "14:00", advance: "Paid", room: "201", req: "Late check-in", status: "confirmed" },
  { id: "BK-1025", guest: "John Miller", rt: "Suite", eta: "16:30", advance: "₹5,000 due", room: "—", req: "Airport pickup", status: "confirmed" },
  { id: "BK-1026", guest: "S. Iyer", rt: "Standard", eta: "18:00", advance: "Paid", room: "104", req: "Quiet floor", status: "confirmed" },
];
export function ArrivalsToday() {
  return (
    <PageShell title="Arrivals Today" description="Confirmed bookings expected to check in today.">
      <KpiGrid kpis={[
        { label: "Total Arrivals", value: 8, tone: "info" },
        { label: "Checked-in", value: 3, tone: "success" },
        { label: "Pending", value: 5, tone: "warning" },
        { label: "Advance Due", value: "₹12,500", tone: "danger" },
      ]} />
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "id", label: "Booking" },
          { key: "guest", label: "Guest" },
          { key: "rt", label: "Room Type" },
          { key: "eta", label: "ETA" },
          { key: "advance", label: "Advance" },
          { key: "room", label: "Room" },
          { key: "req", label: "Special Req" },
        ]}
        rows={arrivalRows}
        renderActions={() => (
          <div className="flex justify-end gap-1">
            <Button size="sm"><DoorOpen className="h-4 w-4 mr-1" />Check-in</Button>
            <Button size="sm" variant="outline"><Printer className="h-4 w-4" /></Button>
          </div>
        )}
      />
    </PageShell>
  );
}

export function DeparturesToday() {
  const rows = [
    { id: "BK-0998", guest: "M. Chen", room: "305", folio: "₹14,200", balance: "₹0", late: "No" },
    { id: "BK-1001", guest: "R. Khanna", room: "210", folio: "₹22,400", balance: "₹3,200", late: "Yes (+₹500)" },
    { id: "BK-1003", guest: "L. Garcia", room: "402", folio: "₹9,800", balance: "₹0", late: "No" },
  ];
  return (
    <PageShell title="Departures Today" description="In-house guests scheduled to check out today.">
      <KpiGrid kpis={[
        { label: "Total Departures", value: 6, tone: "info" },
        { label: "Checked-out", value: 2, tone: "success" },
        { label: "Pending", value: 4, tone: "warning" },
        { label: "Outstanding", value: "₹3,200", tone: "danger" },
      ]} />
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "id", label: "Booking" },
          { key: "guest", label: "Guest" },
          { key: "room", label: "Room" },
          { key: "folio", label: "Folio" },
          { key: "balance", label: "Balance" },
          { key: "late", label: "Late Checkout" },
        ]}
        rows={rows}
        renderActions={() => (
          <div className="flex justify-end gap-1">
            <Button size="sm"><DoorClosed className="h-4 w-4 mr-1" />Checkout</Button>
            <Button size="sm" variant="outline"><Receipt className="h-4 w-4" /></Button>
          </div>
        )}
      />
    </PageShell>
  );
}

export function InHouseGuests() {
  const rows = [
    { room: "201", guest: "Anita Rao", checkIn: "May 15", checkOut: "May 19", folio: "₹14,800", status: "occupied" },
    { room: "305", guest: "M. Chen", checkIn: "May 13", checkOut: "May 18", folio: "₹22,150", status: "occupied" },
    { room: "402", guest: "L. Garcia", checkIn: "May 16", checkOut: "May 18", folio: "₹9,800", status: "occupied" },
  ];
  return (
    <PageShell title="In-House Guests" description="All currently staying guests across rooms.">
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "room", label: "Room" },
          { key: "guest", label: "Guest" },
          { key: "checkIn", label: "Check-in" },
          { key: "checkOut", label: "Check-out" },
          { key: "folio", label: "Folio" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function WalkInBooking() {
  return (
    <PageShell title="Walk-in Booking" description="Create booking + check-in in a single flow.">
      <Card>
        <CardContent className="p-6 grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Guest Name</Label><Input placeholder="Full name" /></div>
          <div className="space-y-2"><Label>Mobile</Label><Input placeholder="+91…" /></div>
          <div className="space-y-2"><Label>Check-in</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Check-out</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Room Type</Label><Input placeholder="Deluxe / Suite…" /></div>
          <div className="space-y-2"><Label>Rate Plan</Label><Input placeholder="BB / Room Only…" /></div>
          <div className="space-y-2"><Label>Adults</Label><Input type="number" defaultValue={2} /></div>
          <div className="space-y-2"><Label>Advance Collected</Label><Input placeholder="₹" /></div>
        </CardContent>
      </Card>
      <InfoCard title="Live Availability">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[{n:"Standard",a:6,p:2200},{n:"Deluxe",a:3,p:3400},{n:"Suite",a:1,p:5800},{n:"Family",a:2,p:4800}].map(r => (
            <div key={r.n} className="border rounded-md p-3"><div className="font-semibold">{r.n}</div><div className="text-muted-foreground text-xs">{r.a} available</div><div className="mt-1">₹{r.p}/night</div></div>
          ))}
        </div>
      </InfoCard>
      <div className="flex justify-end gap-2"><Button variant="outline">Save Draft</Button><Button>Create & Check-in</Button></div>
    </PageShell>
  );
}

export function RoomRack() {
  const rooms = Array.from({ length: 36 }, (_, i) => {
    const num = 101 + (Math.floor(i / 12) * 100) + (i % 12);
    const statuses = ["available", "occupied", "dirty", "ooo", "blocked"];
    const s = statuses[i % 5];
    return { num, s };
  });
  const color: Record<string, string> = {
    available: "bg-emerald-100 border-emerald-300 text-emerald-800",
    occupied: "bg-sky-100 border-sky-300 text-sky-800",
    dirty: "bg-amber-100 border-amber-300 text-amber-800",
    ooo: "bg-rose-100 border-rose-300 text-rose-800",
    blocked: "bg-slate-100 border-slate-300 text-slate-700",
  };
  return (
    <PageShell title="Room Rack" description="Real-time grid of every physical room and its status.">
      <div className="flex gap-3 flex-wrap text-xs">
        {Object.entries(color).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5"><span className={`inline-block w-3 h-3 rounded ${v.split(" ")[0]}`} /><span className="capitalize">{k}</span></div>
        ))}
      </div>
      {[1,2,3].map(floor => (
        <div key={floor}>
          <h3 className="text-sm font-semibold mb-2">Floor {floor}</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {rooms.filter(r => Math.floor(r.num/100) === floor).map(r => (
              <div key={r.num} className={`border rounded-md p-2 text-center text-xs font-medium cursor-pointer hover:shadow ${color[r.s]}`}>
                <div className="font-bold">{r.num}</div>
                <div className="capitalize opacity-80">{r.s}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}

export function RoomAllocation() {
  const rows = [
    { id: "BK-1024", guest: "Anita Rao", rt: "Deluxe", suggested: "201", upgrade: "—" },
    { id: "BK-1025", guest: "John Miller", rt: "Suite", suggested: "501", upgrade: "—" },
    { id: "BK-1026", guest: "S. Iyer", rt: "Standard", suggested: "104", upgrade: "Deluxe 202 (+₹1200)" },
  ];
  return (
    <PageShell title="Room Allocation" description="Assign physical rooms to confirmed bookings.">
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "id", label: "Booking" },
          { key: "guest", label: "Guest" },
          { key: "rt", label: "Booked Type" },
          { key: "suggested", label: "Suggested Room" },
          { key: "upgrade", label: "Upgrade Offer" },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Assign</Button><Button size="sm" variant="outline">Change</Button></div>}
      />
    </PageShell>
  );
}

export function CheckInScreen() {
  return (
    <PageShell title="Check-in" description="Convert a confirmed booking into an active stay.">
      <Card><CardContent className="p-4"><Input placeholder="Search by booking #, guest name, mobile, or OTA reference…" /></CardContent></Card>
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard title="Booking">
          <div className="text-sm space-y-1">
            <div><b>BK-1024</b> · Confirmed</div>
            <div>Anita Rao · 2 adults</div>
            <div>15 May → 19 May (4 nights)</div>
            <div>Deluxe · BB plan</div>
          </div>
        </InfoCard>
        <InfoCard title="KYC & ID">
          <div className="space-y-2"><Label>ID Type</Label><Input placeholder="Aadhar / Passport…" /><Label>ID Number</Label><Input placeholder="XXXX-XXXX" /><Button size="sm" variant="outline" className="w-full mt-1">Upload Scan</Button></div>
        </InfoCard>
        <InfoCard title="Collection">
          <div className="space-y-2"><Label>Advance Paid</Label><Input value="₹5,000" readOnly /><Label>Balance Due</Label><Input value="₹12,800" readOnly /><Label>Collect Now</Label><Input placeholder="₹" /></div>
        </InfoCard>
      </div>
      <div className="flex justify-end gap-2"><Button variant="outline">Save</Button><Button>Assign Room & Check-in</Button></div>
    </PageShell>
  );
}

export function EarlyCheckin() {
  const rows = [
    { id: "BK-1027", guest: "P. Sharma", eta: "10:00", std: "14:00", fee: "₹500", policy: "Half rate <4h" },
    { id: "BK-1028", guest: "K. Tan", eta: "08:30", std: "14:00", fee: "₹1,200", policy: "Full night charge" },
  ];
  return (
    <PageShell title="Early Check-in" description="Handle guests arriving before standard check-in time.">
      <SimpleTable
        columns={[
          { key: "id", label: "Booking" }, { key: "guest", label: "Guest" }, { key: "eta", label: "Arrival" },
          { key: "std", label: "Std Check-in" }, { key: "fee", label: "Auto Fee" }, { key: "policy", label: "Policy" },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Apply Fee</Button><Button size="sm" variant="outline">Waive</Button></div>}
      />
    </PageShell>
  );
}

export function CheckoutScreen() {
  return (
    <PageShell title="Checkout" description="Final billing, payment, invoice and housekeeping trigger.">
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">Folio Summary — Room 305 · M. Chen</CardTitle></CardHeader><CardContent>
          <SimpleTable columns={[{key:"d",label:"Date"},{key:"desc",label:"Description"},{key:"amt",label:"Amount",className:"text-right"}]} rows={[
            { d: "May 13", desc: "Room (Deluxe)", amt: "₹3,400" },
            { d: "May 14", desc: "Room (Deluxe)", amt: "₹3,400" },
            { d: "May 14", desc: "Restaurant", amt: "₹1,250" },
            { d: "May 15", desc: "Room (Deluxe)", amt: "₹3,400" },
            { d: "May 16", desc: "Minibar", amt: "₹450" },
          ]} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Settlement</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><b>₹11,900</b></div>
          <div className="flex justify-between"><span>Tax (12%)</span><b>₹1,428</b></div>
          <div className="flex justify-between"><span>Discount</span><b>-₹500</b></div>
          <Separator />
          <div className="flex justify-between text-base"><span>Total</span><b>₹12,828</b></div>
          <div className="flex justify-between"><span>Paid</span><b>₹10,000</b></div>
          <div className="flex justify-between text-rose-600"><span>Balance</span><b>₹2,828</b></div>
          <Button className="w-full mt-3">Collect & Checkout</Button>
          <Button variant="outline" className="w-full"><Printer className="h-4 w-4 mr-1" />Print Invoice</Button>
        </CardContent></Card>
      </div>
    </PageShell>
  );
}

export function LateCheckout() {
  const rows = [
    { room: "210", guest: "R. Khanna", planned: "11:00", actual: "13:30", fee: "₹500 (hourly)", status: "applied" },
    { room: "405", guest: "T. Wong", planned: "11:00", actual: "16:00", fee: "₹1,500 (half-day)", status: "pending" },
  ];
  return (
    <PageShell title="Late Checkout" description="Apply late-checkout charges per hotel policy.">
      <SimpleTable
        columns={[
          { key: "room", label: "Room" }, { key: "guest", label: "Guest" }, { key: "planned", label: "Planned" },
          { key: "actual", label: "Actual" }, { key: "fee", label: "Auto Fee" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Apply</Button><Button size="sm" variant="outline">Waive</Button></div>}
      />
    </PageShell>
  );
}

export function RoomChangeScreen() {
  const rows = [
    { from: "201 (Deluxe)", to: "302 (Suite)", guest: "Anita Rao", reason: "Upgrade request", diff: "+₹1,400/night" },
    { from: "104 (Std)", to: "108 (Std)", guest: "S. Iyer", reason: "AC fault", diff: "—" },
  ];
  return (
    <PageShell title="Room Change" description="Move an in-house guest to another room.">
      <SimpleTable
        columns={[
          { key: "from", label: "From" }, { key: "to", label: "To" }, { key: "guest", label: "Guest" },
          { key: "reason", label: "Reason" }, { key: "diff", label: "Rate Diff" },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Approve</Button><Button size="sm" variant="outline">Cancel</Button></div>}
      />
    </PageShell>
  );
}

export function ExtendStay() {
  const rows = [
    { room: "305", guest: "M. Chen", current: "May 18", requested: "May 20", nights: "+2", inv: "Available", amt: "₹6,800" },
    { room: "210", guest: "R. Khanna", current: "May 18", requested: "May 22", nights: "+4", inv: "Blocked May 21", amt: "Needs room change" },
  ];
  return (
    <PageShell title="Extend Stay" description="Extend an in-house booking by additional nights.">
      <SimpleTable
        columns={[
          { key: "room", label: "Room" }, { key: "guest", label: "Guest" }, { key: "current", label: "Current Out" },
          { key: "requested", label: "New Out" }, { key: "nights", label: "Nights" },
          { key: "inv", label: "Inventory" }, { key: "amt", label: "Charge" },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Extend</Button></div>}
      />
    </PageShell>
  );
}

export function GuestRequests() {
  const rows = [
    { id: "GR-201", room: "201", req: "Extra towels", dept: "Housekeeping", priority: "Low", status: "in-progress", time: "5 min ago" },
    { id: "GR-202", room: "305", req: "Taxi to airport 8pm", dept: "Concierge", priority: "Medium", status: "scheduled", time: "12 min ago" },
    { id: "GR-203", room: "402", req: "AC not cooling", dept: "Maintenance", priority: "High", status: "pending", time: "2 min ago" },
  ];
  return (
    <PageShell title="Guest Requests" description="Track service requests from in-house guests." action={<PrimaryAction label="New Request" />}>
      <KpiGrid kpis={[
        { label: "Open", value: 14, tone: "warning" }, { label: "In Progress", value: 6, tone: "info" },
        { label: "Done (24h)", value: 42, tone: "success" }, { label: "SLA Breached", value: 1, tone: "danger" },
      ]} />
      <SimpleTable
        columns={[
          { key: "id", label: "ID" }, { key: "room", label: "Room" }, { key: "req", label: "Request" },
          { key: "dept", label: "Dept" }, { key: "priority", label: "Priority", render: r => <Badge variant={r.priority === "High" ? "destructive" : "outline"}>{r.priority}</Badge> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> }, { key: "time", label: "Logged" },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function Complaints() {
  const rows = [
    { id: "C-101", guest: "M. Chen / 305", cat: "Cleanliness", sev: "Medium", status: "in-progress", owner: "HK Manager" },
    { id: "C-102", guest: "R. Khanna / 210", cat: "Noise", sev: "Low", status: "pending", owner: "FOM" },
    { id: "C-103", guest: "L. Garcia / 402", cat: "Billing", sev: "High", status: "escalated", owner: "GM" },
  ];
  return (
    <PageShell title="Complaints" description="Log and resolve guest complaints with escalation." action={<PrimaryAction label="New Complaint" />}>
      <SimpleTable
        columns={[
          { key: "id", label: "ID" }, { key: "guest", label: "Guest / Room" }, { key: "cat", label: "Category" },
          { key: "sev", label: "Severity", render: r => <Badge variant={r.sev === "High" ? "destructive" : "outline"}>{r.sev}</Badge> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> }, { key: "owner", label: "Owner" },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function WakeupCalls() {
  const rows = [
    { room: "201", guest: "Anita Rao", time: "06:30", recur: "Daily", status: "pending" },
    { room: "305", guest: "M. Chen", time: "05:00", recur: "Once", status: "done" },
    { room: "402", guest: "L. Garcia", time: "07:15", recur: "Once", status: "missed" },
  ];
  return (
    <PageShell title="Wake-up Calls" description="Schedule and track guest wake-up calls." action={<PrimaryAction label="Schedule Call" />}>
      <SimpleTable
        columns={[
          { key: "room", label: "Room" }, { key: "guest", label: "Guest" }, { key: "time", label: "Time" },
          { key: "recur", label: "Recurrence" }, { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline">Snooze</Button><Button size="sm">Mark Done</Button></div>}
      />
    </PageShell>
  );
}

export function Cashier() {
  return (
    <PageShell title="Cashier / Collection" description="Daily payment collection and drawer reconciliation.">
      <KpiGrid kpis={[
        { label: "Cash Collected", value: "₹38,200", tone: "success" }, { label: "Card", value: "₹52,400", tone: "info" },
        { label: "UPI", value: "₹18,700", tone: "info" }, { label: "Pending", value: "₹3,200", tone: "warning" },
        { label: "Refunds", value: "₹1,200", tone: "danger" }, { label: "Drawer Balance", value: "₹38,200", tone: "success" },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Pending Collections">
          <SimpleTable columns={[{key:"r",label:"Room"},{key:"g",label:"Guest"},{key:"a",label:"Amount"}]} rows={[
            { r: "210", g: "R. Khanna", a: "₹3,200" },
          ]} renderActions={() => <Button size="sm">Collect</Button>} />
        </InfoCard>
        <InfoCard title="Shift Close">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Opening Cash</span><b>₹2,000</b></div>
            <div className="flex justify-between"><span>+ Collections</span><b>₹38,200</b></div>
            <div className="flex justify-between"><span>− Payouts</span><b>₹1,500</b></div>
            <Separator />
            <div className="flex justify-between"><span>Expected Cash</span><b>₹38,700</b></div>
            <Label>Actual Cash</Label><Input placeholder="₹" />
            <Button className="w-full">Close Shift</Button>
          </div>
        </InfoCard>
      </div>
    </PageShell>
  );
}

export function PrintCenter() {
  const docs = ["Invoice", "Receipt", "Folio", "Registration Card", "GRC", "ID Copy"];
  return (
    <PageShell title="Print Center" description="Reprint invoices, folios, receipts and reg cards.">
      <Card><CardContent className="p-4 flex gap-2"><Input placeholder="Search booking # / guest / mobile…" /><Button>Search</Button></CardContent></Card>
      <div className="grid md:grid-cols-3 gap-3">
        {docs.map(d => (
          <Card key={d}><CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><span className="font-medium">{d}</span></div>
            <div className="flex gap-1"><Button size="sm" variant="outline"><Printer className="h-4 w-4" /></Button><Button size="sm" variant="outline"><Mail className="h-4 w-4" /></Button></div>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  );
}

export function Switchboard() {
  const rows = [
    { room: "201", ext: "2201", dnd: false, last: "Outgoing 14:02" },
    { room: "305", ext: "2305", dnd: true, last: "Incoming 10:18" },
    { room: "402", ext: "2402", dnd: false, last: "—" },
  ];
  return (
    <PageShell title="Reception Switchboard" description="Inbound call routing and guest line directory.">
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "room", label: "Room" }, { key: "ext", label: "Extension" },
          { key: "dnd", label: "DND", render: r => r.dnd ? <Badge variant="destructive">DND</Badge> : <Badge variant="outline">Off</Badge> },
          { key: "last", label: "Last Call" },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-1" />Call</Button><Button size="sm" variant="outline">Message</Button></div>}
      />
    </PageShell>
  );
}

export function Concierge() {
  const rows = [
    { id: "S-501", room: "201", svc: "Airport pickup", time: "20:00", vendor: "City Cabs", status: "scheduled" },
    { id: "S-502", room: "305", svc: "Local sightseeing", time: "Tomorrow 09:00", vendor: "Goa Tours", status: "pending" },
    { id: "S-503", room: "402", svc: "Restaurant booking", time: "Today 19:30", vendor: "Sea Breeze", status: "confirmed" },
  ];
  return (
    <PageShell title="Concierge Desk" description="Coordinate guest services, transport and local bookings." action={<PrimaryAction label="New Service" />}>
      <SimpleTable
        columns={[
          { key: "id", label: "ID" }, { key: "room", label: "Room" }, { key: "svc", label: "Service" },
          { key: "time", label: "When" }, { key: "vendor", label: "Vendor" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

// ============ ADMIN MODULES ============

export function Cancellations() {
  const rows = [
    { id: "BK-0902", guest: "P. Singh", reason: "Plan changed", amt: "₹8,400", refund: "₹4,200 (50%)", status: "pending" },
    { id: "BK-0911", guest: "A. Khan", reason: "No-show", amt: "₹6,200", refund: "₹0 (forfeit)", status: "approved" },
    { id: "BK-0917", guest: "K. Mehta", reason: "Health", amt: "₹12,000", refund: "₹12,000 (full)", status: "pending" },
  ];
  return (
    <PageShell title="Cancellations & No-show" description="Policy-driven cancellation and refund workflow.">
      <KpiGrid kpis={[
        { label: "Cancellations (30d)", value: 18, tone: "warning" }, { label: "No-shows (30d)", value: 6, tone: "danger" },
        { label: "Refunded", value: "₹42,400", tone: "info" }, { label: "Lost Revenue", value: "₹68,900", tone: "danger" },
      ]} />
      <SimpleTable
        columns={[
          { key: "id", label: "Booking" }, { key: "guest", label: "Guest" }, { key: "reason", label: "Reason" },
          { key: "amt", label: "Booking" }, { key: "refund", label: "Refund" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Approve</Button><Button size="sm" variant="outline">Reject</Button></div>}
      />
    </PageShell>
  );
}

export function RatePlans() {
  const rows = [
    { name: "Room Only", rt: "All", incl: "—", price: "Base", refund: "Yes", active: true },
    { name: "Bed & Breakfast", rt: "All", incl: "Breakfast", price: "+₹400", refund: "Yes", active: true },
    { name: "Half Board", rt: "Suite, Deluxe", incl: "Breakfast + Dinner", price: "+₹1,200", refund: "Yes", active: true },
    { name: "Non-Refundable", rt: "All", incl: "—", price: "-10%", refund: "No", active: true },
    { name: "Corporate", rt: "All", incl: "Wi-Fi+Bfast", price: "-15%", refund: "Yes", active: false },
  ];
  return (
    <PageShell title="Rate Plans" description="Room Only, BB, HB, Non-refundable, corporate, seasonal." action={<PrimaryAction label="New Plan" />}>
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "name", label: "Plan" }, { key: "rt", label: "Room Types" }, { key: "incl", label: "Inclusions" },
          { key: "price", label: "Pricing" }, { key: "refund", label: "Refundable" },
          { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={rows}
        renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function ChannelManager() {
  const channels = [
    { name: "Booking.com", status: "connected", inv: "Synced", rate: "Parity OK", bookings: 142 },
    { name: "Expedia", status: "connected", inv: "Synced", rate: "Parity OK", bookings: 86 },
    { name: "Agoda", status: "connected", inv: "2 min behind", rate: "Parity OK", bookings: 54 },
    { name: "MakeMyTrip", status: "error", inv: "Sync failed", rate: "—", bookings: 0 },
  ];
  return (
    <PageShell title="Channel Manager" description="OTA inventory and rate distribution." action={<PrimaryAction label="Connect Channel" />}>
      <KpiGrid kpis={[
        { label: "Connected", value: 3, tone: "success" }, { label: "Errors", value: 1, tone: "danger" },
        { label: "OTA Bookings (30d)", value: 282, tone: "info" }, { label: "Direct vs OTA", value: "38/62", tone: "info" },
      ]} />
      <div className="grid md:grid-cols-2 gap-3">
        {channels.map(c => (
          <Card key={c.name}><CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2"><Plug className="h-4 w-4" />{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.inv} · {c.rate}</div>
              <div className="text-xs text-muted-foreground">{c.bookings} bookings / 30d</div>
            </div>
            <StatusBadge status={c.status} />
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  );
}

export function Suppliers() {
  const rows = [
    { name: "FreshFarms Pvt Ltd", cat: "Produce", terms: "Net 15", rating: "4.6★", balance: "₹12,400" },
    { name: "Linen World", cat: "Linen", terms: "Net 30", rating: "4.8★", balance: "₹0" },
    { name: "ChemiClean", cat: "Cleaning", terms: "COD", rating: "4.2★", balance: "₹2,200" },
  ];
  return (
    <PageShell title="Suppliers" description="Vendor master with contacts, terms, and ratings." action={<PrimaryAction label="New Supplier" />}>
      <Toolbar />
      <SimpleTable
        columns={[{key:"name",label:"Supplier"},{key:"cat",label:"Category"},{key:"terms",label:"Terms"},{key:"rating",label:"Rating"},{key:"balance",label:"Outstanding"}]}
        rows={rows} renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function InventoryItems() {
  const rows = [
    { sku: "LIN-001", item: "King Bedsheet", cat: "Linen", stock: 84, reorder: 20, abc: "A" },
    { sku: "AMN-014", item: "Shampoo 30ml", cat: "Amenity", stock: 12, reorder: 50, abc: "B" },
    { sku: "CHM-002", item: "Floor Cleaner 5L", cat: "Cleaning", stock: 8, reorder: 10, abc: "C" },
  ];
  return (
    <PageShell title="Inventory Items" description="Material master with stock, reorder, and ABC class." action={<PrimaryAction label="New Item" />}>
      <KpiGrid kpis={[
        { label: "SKUs", value: 248, tone: "info" }, { label: "Low Stock", value: 12, tone: "warning" },
        { label: "Out of Stock", value: 3, tone: "danger" }, { label: "Stock Value", value: "₹4.8L", tone: "info" },
      ]} />
      <SimpleTable
        columns={[
          { key: "sku", label: "SKU" }, { key: "item", label: "Item" }, { key: "cat", label: "Category" },
          { key: "stock", label: "Stock", render: r => <span className={r.stock < r.reorder ? "text-rose-600 font-semibold" : ""}>{r.stock}</span> },
          { key: "reorder", label: "Reorder At" }, { key: "abc", label: "ABC", render: r => <Badge variant="outline">{r.abc}</Badge> },
        ]}
        rows={rows} renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function MenuManager() {
  const cats = [
    { name: "Breakfast", items: 18, active: true },
    { name: "Main Course", items: 32, active: true },
    { name: "Beverages", items: 24, active: true },
    { name: "Desserts", items: 12, active: true },
    { name: "Combos", items: 6, active: false },
  ];
  return (
    <PageShell title="Menu Manager" description="F&B menu, categories, modifiers and availability." action={<PrimaryAction label="New Item" />}>
      <div className="grid md:grid-cols-3 gap-3">
        {cats.map(c => (
          <Card key={c.name}><CardContent className="p-4 flex items-center justify-between">
            <div><div className="font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">{c.items} items</div></div>
            <Switch defaultChecked={c.active} />
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  );
}

export function TablesModule() {
  const tables = Array.from({ length: 16 }, (_, i) => ({ n: `T${i+1}`, cap: [2,4,6,8][i%4], s: ["free","occupied","reserved","cleaning"][i%4] }));
  const color: Record<string,string> = { free: "bg-emerald-100 border-emerald-300", occupied: "bg-sky-100 border-sky-300", reserved: "bg-amber-100 border-amber-300", cleaning: "bg-slate-100 border-slate-300" };
  return (
    <PageShell title="Tables" description="Restaurant floor plan and table states.">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {tables.map(t => (
          <div key={t.n} className={`border rounded-lg p-3 text-center cursor-pointer ${color[t.s]}`}>
            <div className="font-bold">{t.n}</div>
            <div className="text-xs">{t.cap} seats</div>
            <div className="text-[10px] capitalize mt-1">{t.s}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function GuestsCRM() {
  const rows = [
    { name: "Anita Rao", stays: 6, last: "May 15", spend: "₹84,200", tier: "Gold", phone: "+91 98xxx" },
    { name: "M. Chen", stays: 3, last: "May 13", spend: "₹52,150", tier: "Silver", phone: "+86 13xxx" },
    { name: "L. Garcia", stays: 1, last: "May 16", spend: "₹9,800", tier: "—", phone: "+34 6xxx" },
  ];
  return (
    <PageShell title="Guests CRM" description="Unified guest profile across bookings." action={<PrimaryAction label="New Guest" />}>
      <KpiGrid kpis={[
        { label: "Total Guests", value: 4218, tone: "info" }, { label: "Repeat Rate", value: "38%", tone: "success" },
        { label: "Gold Tier", value: 142, tone: "warning" }, { label: "VIP", value: 18, tone: "info" },
      ]} />
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "name", label: "Guest" }, { key: "phone", label: "Phone" }, { key: "stays", label: "Stays" },
          { key: "last", label: "Last Stay" }, { key: "spend", label: "Lifetime Spend" },
          { key: "tier", label: "Tier", render: r => <Badge variant="outline">{r.tier}</Badge> },
        ]}
        rows={rows} renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function Notifications() {
  const rows = [
    { event: "Booking Confirmed", channels: "Email, SMS, WA", template: "booking_confirm_v2", active: true, sent: 412 },
    { event: "Pre-arrival (24h)", channels: "Email, WA", template: "pre_arrival_v1", active: true, sent: 286 },
    { event: "Checkout Invoice", channels: "Email", template: "invoice_email_v3", active: true, sent: 184 },
    { event: "Birthday Wish", channels: "WA", template: "birthday_v1", active: false, sent: 0 },
  ];
  return (
    <PageShell title="Notifications" description="System and guest notification center." action={<PrimaryAction label="New Trigger" />}>
      <SimpleTable
        columns={[
          { key: "event", label: "Trigger" }, { key: "channels", label: "Channels" }, { key: "template", label: "Template" },
          { key: "sent", label: "Sent (30d)" }, { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={rows} renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline">Test Send</Button><Button size="sm" variant="ghost">Edit</Button></div>}
      />
    </PageShell>
  );
}

export function Campaigns() {
  const rows = [
    { name: "Monsoon Getaway", segment: "Past 6 months", channel: "WA + Email", sent: 2400, opens: "32%", conv: "4.2%", status: "active" },
    { name: "Weekend Flash", segment: "VIP + Gold", channel: "WA", sent: 142, opens: "61%", conv: "12%", status: "completed" },
    { name: "Birthday Offer", segment: "Birthdays", channel: "Email", sent: 48, opens: "44%", conv: "8%", status: "scheduled" },
  ];
  return (
    <PageShell title="Campaigns" description="Marketing campaigns to past and future guests." action={<PrimaryAction label="New Campaign" />}>
      <SimpleTable
        columns={[
          { key: "name", label: "Campaign" }, { key: "segment", label: "Segment" }, { key: "channel", label: "Channel" },
          { key: "sent", label: "Sent" }, { key: "opens", label: "Open Rate" }, { key: "conv", label: "Conversion" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows} renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function RolesPermissions() {
  const roles = [
    { name: "General Manager", users: 2, perms: "All modules" },
    { name: "Front Office Manager", users: 4, perms: "FD + Reservations + Reports" },
    { name: "Receptionist", users: 8, perms: "FD only (no delete)" },
    { name: "Housekeeping Supervisor", users: 3, perms: "Housekeeping + Maintenance" },
    { name: "F&B Manager", users: 2, perms: "POS + Menu + KDS" },
  ];
  return (
    <PageShell title="Roles & Permissions" description="Per-hotel role matrix with granular actions." action={<PrimaryAction label="New Role" />}>
      <SimpleTable
        columns={[{key:"name",label:"Role"},{key:"users",label:"Users"},{key:"perms",label:"Permissions"}]}
        rows={roles} renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline">Permissions</Button><Button size="sm" variant="ghost">Edit</Button></div>}
      />
    </PageShell>
  );
}

export function AccessLogs() {
  const rows = [
    { user: "aman@sunrise.com", action: "Login", ip: "103.21.x.x", device: "Chrome / Mac", time: "2 min ago", status: "success" },
    { user: "priya@mlite.com", action: "Folio edit", ip: "59.144.x.x", device: "Edge / Win", time: "12 min ago", status: "success" },
    { user: "unknown@x.com", action: "Login", ip: "45.9.x.x", device: "—", time: "1 hr ago", status: "failed" },
  ];
  return (
    <PageShell title="Access Logs" description="Who logged in, from where, and what they accessed.">
      <Toolbar />
      <SimpleTable
        columns={[
          { key: "user", label: "User" }, { key: "action", label: "Action" }, { key: "ip", label: "IP" },
          { key: "device", label: "Device" }, { key: "time", label: "When" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
      />
    </PageShell>
  );
}

// ============ FINANCE ============

export function Invoices() {
  const rows = [
    { no: "INV-2026-0421", guest: "Anita Rao", date: "May 17", amt: "₹14,800", tax: "₹1,776", status: "paid" },
    { no: "INV-2026-0420", guest: "M. Chen", date: "May 17", amt: "₹22,150", tax: "₹2,658", status: "paid" },
    { no: "INV-2026-0419", guest: "R. Khanna", date: "May 16", amt: "₹18,400", tax: "₹2,208", status: "overdue" },
  ];
  return (
    <PageShell title="Invoices" description="GST-compliant invoices with print & email." action={<PrimaryAction label="New Invoice" />}>
      <KpiGrid kpis={[
        { label: "Issued (30d)", value: 184, tone: "info" }, { label: "Paid", value: 162, tone: "success" },
        { label: "Pending", value: 18, tone: "warning" }, { label: "Overdue", value: 4, tone: "danger" },
      ]} />
      <SimpleTable
        columns={[
          { key: "no", label: "Invoice #" }, { key: "guest", label: "Guest" }, { key: "date", label: "Date" },
          { key: "amt", label: "Amount" }, { key: "tax", label: "Tax" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline"><Printer className="h-4 w-4" /></Button><Button size="sm" variant="outline"><Mail className="h-4 w-4" /></Button></div>}
      />
    </PageShell>
  );
}

export function Payments() {
  const rows = [
    { id: "PAY-0921", inv: "INV-2026-0421", mode: "Card", amt: "₹14,800", date: "May 17 14:02", status: "success" },
    { id: "PAY-0920", inv: "INV-2026-0420", mode: "UPI", amt: "₹22,150", date: "May 17 11:18", status: "success" },
    { id: "PAY-0919", inv: "INV-2026-0418", mode: "Cash", amt: "₹4,800", date: "May 17 09:30", status: "success" },
    { id: "PAY-0918", inv: "INV-2026-0417", mode: "Card", amt: "₹6,200", date: "May 17 08:12", status: "failed" },
  ];
  return (
    <PageShell title="Payments" description="All collected payments across modes.">
      <KpiGrid kpis={[
        { label: "Today", value: "₹1,12,750", tone: "success" }, { label: "Cash", value: "₹38,200", tone: "info" },
        { label: "Card", value: "₹52,400", tone: "info" }, { label: "UPI", value: "₹22,150", tone: "info" },
        { label: "Failed", value: 3, tone: "danger" }, { label: "Refunded", value: "₹1,200", tone: "warning" },
      ]} />
      <SimpleTable
        columns={[
          { key: "id", label: "Payment #" }, { key: "inv", label: "Invoice" }, { key: "mode", label: "Mode" },
          { key: "amt", label: "Amount" }, { key: "date", label: "Date" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows} renderActions={() => <RowActions />}
      />
    </PageShell>
  );
}

export function Refunds() {
  const rows = [
    { id: "RF-201", inv: "INV-2026-0410", guest: "P. Singh", amt: "₹4,200", reason: "Cancellation 50%", status: "pending" },
    { id: "RF-202", inv: "INV-2026-0405", guest: "K. Mehta", amt: "₹12,000", reason: "Health, full refund", status: "approved" },
  ];
  return (
    <PageShell title="Refunds" description="Refund queue with policy enforcement.">
      <SimpleTable
        columns={[
          { key: "id", label: "Refund #" }, { key: "inv", label: "Invoice" }, { key: "guest", label: "Guest" },
          { key: "amt", label: "Amount" }, { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm">Approve</Button><Button size="sm" variant="outline">Reject</Button></div>}
      />
    </PageShell>
  );
}

export function Folios() {
  const rows = [
    { room: "201", guest: "Anita Rao", room_chg: "₹13,600", extras: "₹1,200", tax: "₹1,776", total: "₹16,576" },
    { room: "305", guest: "M. Chen", room_chg: "₹17,000", extras: "₹3,150", tax: "₹2,418", total: "₹22,568" },
    { room: "402", guest: "L. Garcia", room_chg: "₹6,800", extras: "₹800", tax: "₹912", total: "₹8,512" },
  ];
  return (
    <PageShell title="Folios" description="Live guest folios during stay.">
      <Toolbar />
      <SimpleTable
        columns={[{key:"room",label:"Room"},{key:"guest",label:"Guest"},{key:"room_chg",label:"Room"},{key:"extras",label:"Extras"},{key:"tax",label:"Tax"},{key:"total",label:"Total"}]}
        rows={rows} renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline">View</Button><Button size="sm" variant="outline">Add Charge</Button></div>}
      />
    </PageShell>
  );
}

export function TaxGST() {
  const rows = [
    { name: "GST 12%", hsn: "996311", range: "< ₹7,500", incl: "Exclusive", active: true },
    { name: "GST 18%", hsn: "996311", range: "≥ ₹7,500", incl: "Exclusive", active: true },
    { name: "Service Charge 5%", hsn: "—", range: "All F&B", incl: "Inclusive", active: false },
  ];
  return (
    <PageShell title="Tax & GST" description="Tax configuration and filings." action={<PrimaryAction label="New Tax" />}>
      <SimpleTable
        columns={[
          { key: "name", label: "Tax" }, { key: "hsn", label: "HSN/SAC" }, { key: "range", label: "Applies To" },
          { key: "incl", label: "Type" }, { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={rows} renderActions={() => <RowActions />}
      />
      <InfoCard title="GST Returns" description="Generate GSTR-1 & GSTR-3B exports">
        <div className="flex gap-2"><Button variant="outline">GSTR-1 Export</Button><Button variant="outline">GSTR-3B Export</Button></div>
      </InfoCard>
    </PageShell>
  );
}

// ============ REPORTS ============

export function ReportOccupancy() {
  return (
    <PageShell title="Occupancy Report" description="Daily/weekly/monthly occupancy trends.">
      <KpiGrid kpis={[
        { label: "Today", value: "78%", tone: "success" }, { label: "MTD", value: "72%", tone: "info" },
        { label: "YTD", value: "68%", tone: "info" }, { label: "Forecast (30d)", value: "74%", tone: "success" },
      ]} />
      <InfoCard title="By Room Type">
        {[{n:"Standard",p:82},{n:"Deluxe",p:76},{n:"Suite",p:58},{n:"Family",p:68}].map(r => (
          <div key={r.n} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{r.n}</span><span>{r.p}%</span></div><Progress value={r.p} /></div>
        ))}
      </InfoCard>
    </PageShell>
  );
}

export function ReportRevenue() {
  return (
    <PageShell title="Revenue Report" description="Revenue by source, segment, channel and rate plan.">
      <KpiGrid kpis={[
        { label: "Total (MTD)", value: "₹28.4L", tone: "success" }, { label: "Rooms", value: "₹21.2L", tone: "info" },
        { label: "F&B", value: "₹5.8L", tone: "info" }, { label: "Other", value: "₹1.4L", tone: "info" },
      ]} />
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="By Channel">
          {[{n:"Direct",p:38},{n:"Booking.com",p:28},{n:"Expedia",p:18},{n:"Agoda",p:10},{n:"Walk-in",p:6}].map(r => (
            <div key={r.n} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{r.n}</span><span>{r.p}%</span></div><Progress value={r.p} /></div>
          ))}
        </InfoCard>
        <InfoCard title="By Rate Plan">
          {[{n:"BB",p:48},{n:"Room Only",p:24},{n:"HB",p:14},{n:"Non-Ref",p:10},{n:"Corporate",p:4}].map(r => (
            <div key={r.n} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{r.n}</span><span>{r.p}%</span></div><Progress value={r.p} /></div>
          ))}
        </InfoCard>
      </div>
    </PageShell>
  );
}

export function ReportStaff() {
  const rows = [
    { name: "Rohit (Recep)", dept: "Front Office", tasks: 42, sla: "98%", rating: "4.8★" },
    { name: "Meena (HK)", dept: "Housekeeping", tasks: 36, sla: "95%", rating: "4.6★" },
    { name: "Suresh (Maint)", dept: "Maintenance", tasks: 14, sla: "88%", rating: "4.2★" },
  ];
  return (
    <PageShell title="Staff Productivity" description="Per-staff and per-department performance.">
      <SimpleTable
        columns={[{key:"name",label:"Staff"},{key:"dept",label:"Department"},{key:"tasks",label:"Tasks (7d)"},{key:"sla",label:"SLA"},{key:"rating",label:"Rating"}]}
        rows={rows}
      />
    </PageShell>
  );
}

export function AuditLogs() {
  const rows = [
    { ts: "May 17 14:02", user: "aman@sunrise.com", module: "Folio", action: "Edit", target: "BK-1024", diff: "amount 12000 → 12500" },
    { ts: "May 17 13:48", user: "priya@mlite.com", module: "Booking", action: "Cancel", target: "BK-0998", diff: "status confirmed → cancelled" },
    { ts: "May 17 11:11", user: "raj@greenwood.in", module: "Room", action: "Status", target: "Room 305", diff: "dirty → clean" },
  ];
  return (
    <PageShell title="Audit Logs" description="Immutable trail of all critical actions.">
      <Toolbar />
      <SimpleTable
        columns={[{key:"ts",label:"When"},{key:"user",label:"User"},{key:"module",label:"Module"},{key:"action",label:"Action"},{key:"target",label:"Target"},{key:"diff",label:"Change"}]}
        rows={rows}
      />
    </PageShell>
  );
}

// ============ SETUP ============

export function HotelProfile() {
  return (
    <PageShell title="Hotel Profile" description="Hotel branding, contact and business details." action={<Button>Save Changes</Button>}>
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Branding">
          <div className="space-y-2"><Label>Hotel Name</Label><Input defaultValue="Sunrise Resort" /><Label>Tagline</Label><Input defaultValue="Where every sunrise tells a story" /><Label>Logo</Label><Button variant="outline" size="sm">Upload Logo</Button></div>
        </InfoCard>
        <InfoCard title="Contact">
          <div className="space-y-2"><Label>Address</Label><Input defaultValue="Beach Rd, Goa 403001" /><Label>Phone</Label><Input defaultValue="+91 832 222 3344" /><Label>Email</Label><Input defaultValue="hello@sunrise.com" /></div>
        </InfoCard>
        <InfoCard title="Business">
          <div className="space-y-2"><Label>GSTIN</Label><Input defaultValue="29AAACS1234A1Z5" /><Label>PAN</Label><Input defaultValue="AAACS1234A" /><Label>Bank A/c</Label><Input defaultValue="HDFC ****4421" /></div>
        </InfoCard>
        <InfoCard title="Check-in / Check-out">
          <div className="space-y-2"><Label>Check-in Time</Label><Input defaultValue="14:00" /><Label>Check-out Time</Label><Input defaultValue="11:00" /><Label>Timezone</Label><Input defaultValue="Asia/Kolkata" /></div>
        </InfoCard>
      </div>
    </PageShell>
  );
}

export function HotelPolicies() {
  const policies = [
    { n: "Cancellation", v: "Free <48h, 50% <24h, No refund <12h" },
    { n: "Child Policy", v: "<5 free, 6-12 half rate" },
    { n: "Pet Policy", v: "Not allowed" },
    { n: "Smoking", v: "Designated areas only" },
    { n: "ID Proof", v: "Mandatory: Aadhar / Passport" },
    { n: "Late Checkout", v: "₹500/hr (max ₹2000)" },
  ];
  return (
    <PageShell title="Hotel Policies" description="Per-hotel policy overrides." action={<Button>Save</Button>}>
      <div className="grid md:grid-cols-2 gap-3">
        {policies.map(p => (
          <Card key={p.n}><CardContent className="p-4">
            <div className="text-sm font-semibold">{p.n}</div>
            <Input defaultValue={p.v} className="mt-2" />
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  );
}

export function PublicListing() {
  return (
    <PageShell title="Public Listing & SEO" description="Control public visibility and search metadata." action={<Button>Save</Button>}>
      <InfoCard title="Visibility" action={<Switch defaultChecked />}>
        <p className="text-sm text-muted-foreground">Show this hotel on the public discover page and search engines.</p>
      </InfoCard>
      <InfoCard title="SEO Metadata">
        <div className="space-y-2"><Label>URL Slug</Label><Input defaultValue="sunrise-resort-goa" /><Label>Title (&lt;60)</Label><Input defaultValue="Sunrise Resort Goa | Beachfront Stay" /><Label>Description (&lt;160)</Label><Input defaultValue="Beachfront resort in Goa with sea-view rooms, pool, spa & in-house dining. Book direct for best rates." /><Label>Keywords</Label><Input defaultValue="goa hotel, beach resort, sea view" /></div>
      </InfoCard>
    </PageShell>
  );
}

export function EmailTemplates() {
  const tpls = [
    { n: "Booking Confirmation", subj: "Your booking #{{id}} is confirmed", active: true },
    { n: "Pre-arrival", subj: "We're excited to host you at {{hotel}}", active: true },
    { n: "Checkout Invoice", subj: "Invoice for your stay at {{hotel}}", active: true },
    { n: "OTP Verification", subj: "Your OTP is {{otp}}", active: true },
    { n: "Cancellation", subj: "Booking #{{id}} cancelled", active: false },
  ];
  return (
    <PageShell title="Email Templates" description="Branded transactional email templates." action={<PrimaryAction label="New Template" />}>
      <SimpleTable
        columns={[
          { key: "n", label: "Template" }, { key: "subj", label: "Subject" },
          { key: "active", label: "Active", render: r => <Switch defaultChecked={r.active} /> },
        ]}
        rows={tpls}
        renderActions={() => <div className="flex justify-end gap-1"><Button size="sm" variant="outline">Preview</Button><Button size="sm" variant="outline">Test Send</Button></div>}
      />
    </PageShell>
  );
}

export function Localization() {
  const langs = [
    { code: "en", name: "English", default: true, active: true },
    { code: "hi", name: "Hindi", default: false, active: true },
    { code: "es", name: "Spanish", default: false, active: false },
    { code: "fr", name: "French", default: false, active: false },
  ];
  return (
    <PageShell title="Localization" description="Languages, currencies, and regional formats." action={<Button>Save</Button>}>
      <div className="grid lg:grid-cols-2 gap-4">
        <InfoCard title="Currency & Formats">
          <div className="space-y-2"><Label>Default Currency</Label><Input defaultValue="INR (₹)" /><Label>Date Format</Label><Input defaultValue="DD MMM YYYY" /><Label>Number Format</Label><Input defaultValue="1,23,456.78 (Indian)" /></div>
        </InfoCard>
        <InfoCard title="Languages">
          {langs.map(l => (
            <div key={l.code} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><span className="font-medium">{l.name}</span> <span className="text-muted-foreground text-xs ml-2">{l.code}</span>{l.default && <Badge className="ml-2" variant="secondary">Default</Badge>}</div>
              <Switch defaultChecked={l.active} />
            </div>
          ))}
        </InfoCard>
      </div>
    </PageShell>
  );
}

export function Integrations() {
  const integ = [
    { n: "Razorpay", cat: "Payments", status: "connected" },
    { n: "Stripe", cat: "Payments", status: "disconnected" },
    { n: "Booking.com", cat: "OTA", status: "connected" },
    { n: "Tally", cat: "Accounting", status: "disconnected" },
    { n: "WhatsApp Business", cat: "Messaging", status: "connected" },
    { n: "Zapier", cat: "Webhooks", status: "disconnected" },
  ];
  return (
    <PageShell title="Integrations" description="Connect payment, OTA, accounting, and messaging tools.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {integ.map(i => (
          <Card key={i.n}><CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2"><Plug className="h-4 w-4" />{i.n}</div>
              <div className="text-xs text-muted-foreground">{i.cat}</div>
            </div>
            <Button size="sm" variant={i.status === "connected" ? "outline" : "default"}>
              {i.status === "connected" ? "Disconnect" : "Connect"}
            </Button>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  );
}

// ============ Amenities (admin picker) ============
export function AdminAmenities() {
  const cats = [
    { name: "Basic Facilities", items: [["Free Wi-Fi", true], ["Parking", true], ["Power Backup", true], ["Elevator", false]] },
    { name: "Room", items: [["AC", true], ["TV", true], ["Mini Fridge", true], ["Safe", false]] },
    { name: "Wellness", items: [["Pool", true], ["Spa", false], ["Gym", true]] },
    { name: "F&B", items: [["Restaurant", true], ["Bar", false], ["Room Service", true]] },
  ];
  return (
    <PageShell title="Amenities" description="Pick from master amenities for this hotel." action={<Button>Save</Button>}>
      <div className="grid md:grid-cols-2 gap-4">
        {cats.map(c => (
          <InfoCard key={c.name} title={c.name}>
            <div className="space-y-2">
              {c.items.map(([n, en]) => (
                <div key={String(n)} className="flex items-center justify-between">
                  <span className="text-sm">{n}</span>
                  <Switch defaultChecked={Boolean(en)} />
                </div>
              ))}
            </div>
          </InfoCard>
        ))}
      </div>
    </PageShell>
  );
}