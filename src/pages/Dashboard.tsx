import { useState, useEffect } from "react";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useTableQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Hotel, LogOut, Users, BedDouble, CalendarCheck, Wrench, UtensilsCrossed,
  ShowerHead, Package, MessageSquare, Search, FileText, Shirt, Clock,
  LayoutDashboard, Settings, ChevronDown, Loader2
} from "lucide-react";

// Module components (lazy loaded concept - inline for now)
import { HousekeepingModule } from "@/components/modules/HousekeepingModule";
import { MaintenanceModule } from "@/components/modules/MaintenanceModule";
import { BookingsModule } from "@/components/modules/BookingsModule";
import { RoomsModule } from "@/components/modules/RoomsModule";
import { RestaurantModule } from "@/components/modules/RestaurantModule";
import { InventoryModule } from "@/components/modules/InventoryModule";
import { LaundryModule } from "@/components/modules/LaundryModule";
import { GuestCommModule } from "@/components/modules/GuestCommModule";
import { LostFoundModule } from "@/components/modules/LostFoundModule";
import { StaffModule } from "@/components/modules/StaffModule";
import { ReportsModule } from "@/components/modules/ReportsModule";
import { HotelSettingsModule } from "@/components/modules/HotelSettingsModule";

interface ModuleConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: AppRole[];
  component: React.ComponentType;
}

const MODULES: ModuleConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "front_desk"], component: () => <DashboardOverview /> },
  { id: "bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "front_desk"], component: BookingsModule },
  { id: "rooms", label: "Rooms", icon: <BedDouble className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "front_desk", "housekeeping"], component: RoomsModule },
  { id: "housekeeping", label: "Housekeeping", icon: <ShowerHead className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "housekeeping"], component: HousekeepingModule },
  { id: "maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "maintenance"], component: MaintenanceModule },
  { id: "restaurant", label: "Restaurant", icon: <UtensilsCrossed className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "restaurant"], component: RestaurantModule },
  { id: "inventory", label: "Inventory", icon: <Package className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "inventory"], component: InventoryModule },
  { id: "laundry", label: "Laundry", icon: <Shirt className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "laundry"], component: LaundryModule },
  { id: "guestcomm", label: "Guest Comm", icon: <MessageSquare className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "guest_comm", "front_desk"], component: GuestCommModule },
  { id: "lostfound", label: "Lost & Found", icon: <Search className="h-4 w-4" />, roles: ["super_admin", "hotel_admin", "lost_found", "front_desk"], component: LostFoundModule },
  { id: "staff", label: "Staff", icon: <Users className="h-4 w-4" />, roles: ["super_admin", "hotel_admin"], component: StaffModule },
  { id: "reports", label: "Reports", icon: <FileText className="h-4 w-4" />, roles: ["super_admin", "hotel_admin"], component: ReportsModule },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, roles: ["super_admin", "hotel_admin"], component: HotelSettingsModule },
];

function DashboardOverview() {
  const { currentHotelId } = useAuth();
  const { data: bookings } = useTableQuery("bookings");
  const { data: rooms } = useTableQuery("physical_rooms");
  const { data: tasks } = useTableQuery("housekeeping_tasks");
  const { data: maintenance } = useTableQuery("maintenance_tasks");

  const stats = {
    totalBookings: bookings?.length ?? 0,
    checkedIn: bookings?.filter(b => b.status === "checked_in").length ?? 0,
    totalRooms: rooms?.length ?? 0,
    availableRooms: rooms?.filter(r => r.status === "available").length ?? 0,
    pendingTasks: tasks?.filter(t => t.status === "pending").length ?? 0,
    pendingMaintenance: maintenance?.filter(t => t.status === "pending").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p><p className="text-sm text-muted-foreground">{stats.checkedIn} checked in</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Room Status</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{stats.availableRooms}/{stats.totalRooms}</p><p className="text-sm text-muted-foreground">rooms available</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Housekeeping</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{stats.pendingTasks}</p><p className="text-sm text-muted-foreground">pending tasks</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-foreground">{stats.pendingMaintenance}</p><p className="text-sm text-muted-foreground">open requests</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user, profile, roles, signOut, hasAnyRole, isAdmin, currentHotelId, setCurrentHotelId } = useAuth();
  const [activeModule, setActiveModule] = useState("dashboard");
  const { data: hotels, isLoading: hotelsLoading } = useTableQuery("hotels");

  // Filter modules by user's roles
  const accessibleModules = MODULES.filter(m => 
    isAdmin || hasAnyRole(m.roles)
  );

  // Default to first accessible module
  useEffect(() => {
    if (accessibleModules.length > 0 && !accessibleModules.find(m => m.id === activeModule)) {
      setActiveModule(accessibleModules[0].id);
    }
  }, [roles]);

  const ActiveComponent = accessibleModules.find(m => m.id === activeModule)?.component;

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (hotelsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col min-h-screen">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Hotel className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">HotelMS</span>
          </div>
        </div>

        {/* Hotel Selector */}
        {hotels && hotels.length > 0 && (
          <div className="p-3 border-b border-border">
            <Select value={currentHotelId ?? ""} onValueChange={setCurrentHotelId}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select Hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((h: any) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {accessibleModules.map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeModule === module.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {module.icon}
              {module.label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(profile?.full_name || user?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map((r, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{r.role.replace("_", " ")}</Badge>
                  ))}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { signOut(); toast.success("Signed out"); }}>
                <LogOut className="mr-2 h-4 w-4" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {!currentHotelId && hotels && hotels.length > 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-md w-full">
                <CardHeader><CardTitle>Select a Hotel</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Please select a hotel from the sidebar to get started.</p>
                </CardContent>
              </Card>
            </div>
          ) : !currentHotelId ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-md w-full">
                <CardHeader><CardTitle>No Hotels Found</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {isAdmin ? "Create your first hotel to get started." : "Contact your admin to assign you to a hotel."}
                  </p>
                  {isAdmin && (
                    <Button onClick={() => setActiveModule("settings")}>
                      <Hotel className="mr-2 h-4 w-4" />Create Hotel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : ActiveComponent ? (
            <ActiveComponent />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
