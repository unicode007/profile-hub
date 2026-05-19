import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import {
  Home, LayoutDashboard, CalendarDays, KanbanSquare, BedDouble, Building2,
  Sparkles, Wrench, Wine, Shirt, Utensils, ChefHat, MessageSquare, MoonStar,
  Search, BarChart3, ShoppingCart, Layers, AlertTriangle, Users, Star,
  FileText, Settings2, Package, ClipboardList, CalendarRange,
  Crown, CreditCard, ShieldCheck, Route as RouteIcon, ListChecks, Gauge,
  Receipt, BookOpen, Tag, UserCog, KeyRound, History, Globe, Megaphone,
  PieChart, Boxes, FileSpreadsheet, Mail, Truck, Building, BadgePercent,
  CircleDollarSign, FileCheck2, BellRing, Plug, Languages,
  LogIn, LogOut, DoorOpen, DoorClosed, UserPlus, ConciergeBell, Bell,
  Hotel as HotelIcon, ArrowLeftRight, Clock, Banknote, Printer,
  PhoneCall, Headphones, ShieldAlert, Repeat, Timer,
} from "lucide-react";

type Item = { title: string; url: string; icon: any };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Overview",
    items: [
      { title: "Discover Hotels", url: "/", icon: Home },
      { title: "Front Desk", url: "/app/dashboard", icon: LayoutDashboard },
      { title: "Revenue Analytics", url: "/app/analytics", icon: BarChart3 },
      { title: "Admin Dashboard", url: "/app/admin-dashboard", icon: Gauge },
    ],
  },
  {
    label: "Master Platform",
    items: [
      { title: "Master Dashboard", url: "/app/master", icon: Crown },
      { title: "Subscription Plans", url: "/app/plans", icon: BadgePercent },
      { title: "Tenant Subscriptions", url: "/app/subscriptions", icon: CreditCard },
      { title: "Tenants / Admins", url: "/app/tenants", icon: Building },
      { title: "Hotel Approvals", url: "/app/hotel-approvals", icon: FileCheck2 },
      { title: "Feature Flags", url: "/app/features", icon: ShieldCheck },
      { title: "Routes & Menus", url: "/app/routes-menus", icon: RouteIcon },
      { title: "Global Amenities", url: "/app/global-amenities", icon: Sparkles },
      { title: "Global Policies", url: "/app/global-policies", icon: BookOpen },
      { title: "Platform Revenue", url: "/app/platform-revenue", icon: CircleDollarSign },
      { title: "Access Control (ACL)", url: "/app/acl", icon: ShieldCheck },
    ],
  },
  {
    label: "Front Desk Operations",
    items: [
      { title: "FD Dashboard", url: "/app/fd-dashboard", icon: LayoutDashboard },
      { title: "Arrivals Today", url: "/app/arrivals", icon: LogIn },
      { title: "Departures Today", url: "/app/departures", icon: LogOut },
      { title: "In-House Guests", url: "/app/in-house", icon: Users },
      { title: "Walk-in Booking", url: "/app/walk-in", icon: UserPlus },
      { title: "Room Rack", url: "/app/room-rack", icon: HotelIcon },
      { title: "Room Allocation", url: "/app/room-allocation", icon: DoorOpen },
      { title: "Check-in", url: "/app/check-in", icon: DoorOpen },
      { title: "Early Check-in", url: "/app/early-checkin", icon: Timer },
      { title: "Checkout", url: "/app/check-out", icon: DoorClosed },
      { title: "Late Checkout", url: "/app/late-checkout", icon: Clock },
      { title: "Room Change", url: "/app/room-change", icon: ArrowLeftRight },
      { title: "Extend Stay", url: "/app/extend-stay", icon: Repeat },
      { title: "Guest Requests", url: "/app/guest-requests", icon: ConciergeBell },
      { title: "Complaints", url: "/app/complaints", icon: ShieldAlert },
      { title: "Wake-up Calls", url: "/app/wakeup-calls", icon: Bell },
      { title: "Cashier / Collection", url: "/app/cashier", icon: Banknote },
      { title: "Print Center", url: "/app/print-center", icon: Printer },
      { title: "Reception Switchboard", url: "/app/switchboard", icon: PhoneCall },
      { title: "Concierge Desk", url: "/app/concierge", icon: Headphones },
    ],
  },
  {
    label: "Reservations",
    items: [
      { title: "Booking Calendar", url: "/app/calendar", icon: CalendarDays },
      { title: "Room Type Calendar", url: "/app/room-calendar", icon: CalendarRange },
      { title: "Physical Room Calendar", url: "/app/physical-calendar", icon: BedDouble },
      { title: "Date Availability", url: "/app/availability", icon: Search },
      { title: "Booking Kanban", url: "/app/kanban", icon: KanbanSquare },
      { title: "Overbooking", url: "/app/overbooking", icon: AlertTriangle },
      { title: "Cancellations & No-show", url: "/app/cancellations", icon: AlertTriangle },
    ],
  },
  {
    label: "Rooms & Pricing",
    items: [
      { title: "Room Types", url: "/app/room-types", icon: Layers },
      { title: "Physical Rooms", url: "/app/physical-rooms", icon: BedDouble },
      { title: "Inventory Master", url: "/app/inventory-master", icon: ClipboardList },
      { title: "Rate Plans", url: "/app/rate-plans", icon: Tag },
      { title: "Dynamic Pricing", url: "/dynamic-pricing", icon: Sparkles },
      { title: "Policies", url: "/policy-demo", icon: Settings2 },
      { title: "Channel Manager", url: "/app/channel-manager", icon: Plug },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Housekeeping", url: "/app/housekeeping", icon: Sparkles },
      { title: "Maintenance", url: "/app/maintenance", icon: Wrench },
      { title: "Minibar", url: "/app/minibar", icon: Wine },
      { title: "Laundry", url: "/app/laundry", icon: Shirt },
      { title: "Lost & Found", url: "/app/lost-found", icon: Package },
      { title: "Procurement", url: "/app/procurement", icon: ShoppingCart },
      { title: "Suppliers", url: "/app/suppliers", icon: Truck },
      { title: "Inventory Items", url: "/app/inventory-items", icon: Boxes },
    ],
  },
  {
    label: "F&B",
    items: [
      { title: "Restaurant POS", url: "/app/restaurant", icon: Utensils },
      { title: "Kitchen Display", url: "/app/kds", icon: ChefHat },
      { title: "Menu Manager", url: "/app/menu-manager", icon: BookOpen },
      { title: "Tables", url: "/app/tables", icon: Layers },
    ],
  },
  {
    label: "Guests & Staff",
    items: [
      { title: "Guests CRM", url: "/app/guests", icon: Users },
      { title: "Guest Communication", url: "/app/guest-comms", icon: MessageSquare },
      { title: "Notifications", url: "/app/notifications", icon: BellRing },
      { title: "Campaigns", url: "/app/campaigns", icon: Megaphone },
      { title: "Reviews & Ratings", url: "/app/reviews", icon: Star },
      { title: "Staff", url: "/app/staff", icon: Users },
      { title: "Staff Login", url: "/app/staff-login", icon: Users },
      { title: "Roles & Permissions", url: "/app/roles-permissions", icon: UserCog },
      { title: "Access Logs", url: "/app/access-logs", icon: KeyRound },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Invoices", url: "/app/invoices", icon: Receipt },
      { title: "Payments", url: "/app/payments", icon: CircleDollarSign },
      { title: "Refunds", url: "/app/refunds", icon: CreditCard },
      { title: "Folios", url: "/app/folios", icon: FileSpreadsheet },
      { title: "Tax & GST", url: "/app/tax", icon: PieChart },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "Night Audit", url: "/app/night-audit", icon: MoonStar },
      { title: "Occupancy Report", url: "/app/report-occupancy", icon: PieChart },
      { title: "Revenue Report", url: "/app/report-revenue", icon: BarChart3 },
      { title: "Staff Productivity", url: "/app/report-staff", icon: ListChecks },
      { title: "Audit Logs", url: "/app/audit-logs", icon: History },
      { title: "Data Table Demo", url: "/data-table-demo", icon: FileText },
    ],
  },
  {
    label: "Setup",
    items: [
      { title: "Hotel Onboarding", url: "/app/onboarding", icon: Building2 },
      { title: "Hotel Profile", url: "/app/hotel-profile", icon: Building2 },
      { title: "Hotel Policies", url: "/app/hotel-policies", icon: BookOpen },
      { title: "Amenities", url: "/app/amenities", icon: Sparkles },
      { title: "Public Listing & SEO", url: "/app/public-listing", icon: Globe },
      { title: "Email Templates", url: "/app/email-templates", icon: Mail },
      { title: "Localization", url: "/app/localization", icon: Languages },
      { title: "Integrations", url: "/app/integrations", icon: Plug },
      { title: "Tenant Signup", url: "/signup", icon: Users },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
            H
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-sm">Hotelier OS</div>
              <div className="text-[10px] text-muted-foreground">Property Management</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => {
                  const active = pathname === it.url;
                  return (
                    <SidebarMenuItem key={it.url + it.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={it.title}>
                        <NavLink to={it.url} className="flex items-center gap-2">
                          <it.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{it.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}