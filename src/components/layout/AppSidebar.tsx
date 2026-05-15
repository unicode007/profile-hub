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
    ],
  },
  {
    label: "Rooms & Pricing",
    items: [
      { title: "Room Types", url: "/app/room-types", icon: Layers },
      { title: "Physical Rooms", url: "/app/physical-rooms", icon: BedDouble },
      { title: "Inventory Master", url: "/app/inventory-master", icon: ClipboardList },
      { title: "Dynamic Pricing", url: "/dynamic-pricing", icon: Sparkles },
      { title: "Policies", url: "/policy-demo", icon: Settings2 },
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
    ],
  },
  {
    label: "F&B",
    items: [
      { title: "Restaurant POS", url: "/app/restaurant", icon: Utensils },
      { title: "Kitchen Display", url: "/app/kds", icon: ChefHat },
    ],
  },
  {
    label: "Guests & Staff",
    items: [
      { title: "Guest Communication", url: "/app/guest-comms", icon: MessageSquare },
      { title: "Reviews & Ratings", url: "/app/reviews", icon: Star },
      { title: "Staff", url: "/app/staff", icon: Users },
      { title: "Staff Login", url: "/app/staff-login", icon: Users },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "Night Audit", url: "/app/night-audit", icon: MoonStar },
      { title: "Data Table Demo", url: "/data-table-demo", icon: FileText },
    ],
  },
  {
    label: "Setup",
    items: [
      { title: "Hotel Onboarding", url: "/app/onboarding", icon: Building2 },
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