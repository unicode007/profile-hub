import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  User,
  UserPlus,
  Search,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  Sparkles,
  Wrench,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  LogIn,
  Key,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "housekeeping" | "maintenance" | "front-desk" | "manager" | "supervisor";
  department: "housekeeping" | "maintenance" | "front-office" | "management";
  status: "available" | "busy" | "break" | "off-duty";
  hotelId?: string;
  hotelName?: string;
  shift: "morning" | "afternoon" | "night";
  joinedAt: Date;
  completedTasksToday: number;
  avgTaskTime: number;
  lastActive?: Date;
}

const roleConfig = {
  housekeeping: { label: "Housekeeping", icon: Sparkles, color: "text-blue-600" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "text-orange-600" },
  "front-desk": { label: "Front Desk", icon: User, color: "text-green-600" },
  manager: { label: "Manager", icon: Shield, color: "text-purple-600" },
  supervisor: { label: "Supervisor", icon: Shield, color: "text-indigo-600" },
};

const statusConfig = {
  available: { label: "Available", color: "bg-green-500", textColor: "text-green-600" },
  busy: { label: "Busy", color: "bg-yellow-500", textColor: "text-yellow-600" },
  break: { label: "On Break", color: "bg-orange-500", textColor: "text-orange-600" },
  "off-duty": { label: "Off Duty", color: "bg-gray-500", textColor: "text-gray-600" },
};

const shiftConfig = {
  morning: { label: "Morning (6AM - 2PM)", time: "06:00 - 14:00" },
  afternoon: { label: "Afternoon (2PM - 10PM)", time: "14:00 - 22:00" },
  night: { label: "Night (10PM - 6AM)", time: "22:00 - 06:00" },
};

// Demo staff data
const demoStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Rajesh Kumar",
    email: "rajesh@hotel.com",
    phone: "+91 9876543210",
    role: "housekeeping",
    department: "housekeeping",
    status: "available",
    shift: "morning",
    joinedAt: new Date("2023-06-15"),
    completedTasksToday: 5,
    avgTaskTime: 32,
    lastActive: new Date(),
  },
  {
    id: "staff-2",
    name: "Priya Sharma",
    email: "priya@hotel.com",
    phone: "+91 9876543211",
    role: "housekeeping",
    department: "housekeeping",
    status: "busy",
    shift: "morning",
    joinedAt: new Date("2023-08-20"),
    completedTasksToday: 4,
    avgTaskTime: 28,
    lastActive: new Date(),
  },
  {
    id: "staff-3",
    name: "Amit Patel",
    email: "amit@hotel.com",
    phone: "+91 9876543212",
    role: "maintenance",
    department: "maintenance",
    status: "available",
    shift: "morning",
    joinedAt: new Date("2022-11-10"),
    completedTasksToday: 3,
    avgTaskTime: 45,
    lastActive: new Date(),
  },
  {
    id: "staff-4",
    name: "Sunita Devi",
    email: "sunita@hotel.com",
    phone: "+91 9876543213",
    role: "housekeeping",
    department: "housekeeping",
    status: "break",
    shift: "afternoon",
    joinedAt: new Date("2024-01-05"),
    completedTasksToday: 2,
    avgTaskTime: 35,
    lastActive: new Date(),
  },
  {
    id: "staff-5",
    name: "Vikram Singh",
    email: "vikram@hotel.com",
    phone: "+91 9876543214",
    role: "supervisor",
    department: "housekeeping",
    status: "available",
    shift: "morning",
    joinedAt: new Date("2021-03-18"),
    completedTasksToday: 0,
    avgTaskTime: 0,
    lastActive: new Date(),
  },
  {
    id: "staff-6",
    name: "Meera Reddy",
    email: "meera@hotel.com",
    phone: "+91 9876543215",
    role: "front-desk",
    department: "front-office",
    status: "busy",
    shift: "morning",
    joinedAt: new Date("2023-09-12"),
    completedTasksToday: 8,
    avgTaskTime: 15,
    lastActive: new Date(),
  },
  {
    id: "staff-7",
    name: "Arjun Nair",
    email: "arjun@hotel.com",
    phone: "+91 9876543216",
    role: "maintenance",
    department: "maintenance",
    status: "off-duty",
    shift: "night",
    joinedAt: new Date("2022-07-22"),
    completedTasksToday: 0,
    avgTaskTime: 50,
  },
  {
    id: "staff-8",
    name: "Kavitha Menon",
    email: "kavitha@hotel.com",
    phone: "+91 9876543217",
    role: "manager",
    department: "management",
    status: "available",
    shift: "morning",
    joinedAt: new Date("2020-01-10"),
    completedTasksToday: 0,
    avgTaskTime: 0,
    lastActive: new Date(),
  },
];

interface StaffManagerProps {
  onStaffLogin?: (staff: StaffMember) => void;
}

export const StaffManager = ({ onStaffLogin }: StaffManagerProps) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(demoStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginStaff, setLoginStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "housekeeping" | "maintenance" | "front-office">("all");

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "housekeeping" as StaffMember["role"],
    department: "housekeeping" as StaffMember["department"],
    shift: "morning" as StaffMember["shift"],
  });

  const getStats = () => {
    return {
      total: staffList.length,
      available: staffList.filter((s) => s.status === "available").length,
      busy: staffList.filter((s) => s.status === "busy").length,
      onBreak: staffList.filter((s) => s.status === "break").length,
      offDuty: staffList.filter((s) => s.status === "off-duty").length,
      housekeeping: staffList.filter((s) => s.department === "housekeeping").length,
      maintenance: staffList.filter((s) => s.department === "maintenance").length,
    };
  };

  const stats = getStats();

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      searchQuery === "" ||
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || staff.department === departmentFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "housekeeping" && staff.department === "housekeeping") ||
      (activeTab === "maintenance" && staff.department === "maintenance") ||
      (activeTab === "front-office" && staff.department === "front-office");

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment && matchesTab;
  });

  const handleCreateStaff = () => {
    if (!newStaff.name || !newStaff.email) {
      toast.error("Please fill in required fields");
      return;
    }

    const staff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      role: newStaff.role,
      department: newStaff.department,
      status: "available",
      shift: newStaff.shift,
      joinedAt: new Date(),
      completedTasksToday: 0,
      avgTaskTime: 0,
    };

    setStaffList([staff, ...staffList]);
    setIsCreateDialogOpen(false);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "housekeeping",
      department: "housekeeping",
      shift: "morning",
    });
    toast.success("Staff member added successfully!");
  };

  const handleUpdateStatus = (staffId: string, status: StaffMember["status"]) => {
    setStaffList(
      staffList.map((s) => (s.id === staffId ? { ...s, status, lastActive: new Date() } : s))
    );
    toast.success("Status updated!");
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffList(staffList.filter((s) => s.id !== staffId));
    toast.success("Staff member removed!");
  };

  const handleStaffLogin = (staff: StaffMember) => {
    setLoginStaff(staff);
    setIsLoginDialogOpen(true);
  };

  const confirmLogin = () => {
    if (loginStaff) {
      onStaffLogin?.(loginStaff);
      toast.success(`Logged in as ${loginStaff.name}`);
      setIsLoginDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Staff</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "available" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "available" ? "all" : "available")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-xl font-bold">{stats.available}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "busy" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "busy" ? "all" : "busy")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-xl font-bold">{stats.busy}</div>
                <div className="text-xs text-muted-foreground">Busy</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "break" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "break" ? "all" : "break")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-xl font-bold">{stats.onBreak}</div>
                <div className="text-xs text-muted-foreground">On Break</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "off-duty" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "off-duty" ? "all" : "off-duty")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <div>
                <div className="text-xl font-bold">{stats.offDuty}</div>
                <div className="text-xs text-muted-foreground">Off Duty</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{stats.housekeeping}</div>
                <div className="text-xs text-muted-foreground">Housekeeping</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-xl font-bold">{stats.maintenance}</div>
                <div className="text-xs text-muted-foreground">Maintenance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all">All Staff</TabsTrigger>
            <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="front-office">Front Office</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-8 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No staff members found
            </CardContent>
          </Card>
        ) : (
          filteredStaff.map((staff) => {
            const roleInfo = roleConfig[staff.role];
            const statusInfo = statusConfig[staff.status];
            const RoleIcon = roleInfo.icon;

            return (
              <Card key={staff.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {staff.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${statusInfo.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{staff.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <RoleIcon className={`h-3 w-3 ${roleInfo.color}`} />
                          <span>{roleInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStaffLogin(staff)}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Login as Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStaff(staff)}>
                          <Edit className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{shiftConfig[staff.shift].time}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="secondary" className={statusInfo.textColor}>
                      {statusInfo.label}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {staff.completedTasksToday} tasks today
                    </div>
                  </div>

                  {/* Quick Status Change */}
                  <div className="mt-3 flex gap-1">
                    <Button
                      variant={staff.status === "available" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleUpdateStatus(staff.id, "available")}
                    >
                      Available
                    </Button>
                    <Button
                      variant={staff.status === "break" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleUpdateStatus(staff.id, "break")}
                    >
                      Break
                    </Button>
                    <Button
                      variant={staff.status === "off-duty" ? "default" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleUpdateStatus(staff.id, "off-duty")}
                    >
                      Off
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Staff Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={newStaff.role}
                  onValueChange={(v) => setNewStaff({ ...newStaff, role: v as StaffMember["role"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select
                  value={newStaff.department}
                  onValueChange={(v) =>
                    setNewStaff({ ...newStaff, department: v as StaffMember["department"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="front-office">Front Office</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Shift</Label>
              <Select
                value={newStaff.shift}
                onValueChange={(v) => setNewStaff({ ...newStaff, shift: v as StaffMember["shift"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(shiftConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Staff Demo Login
            </DialogTitle>
            <DialogDescription>
              Login as a staff member to access their dashboard view.
            </DialogDescription>
          </DialogHeader>
          {loginStaff && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={loginStaff.avatar} />
                  <AvatarFallback className="bg-primary/10">
                    {loginStaff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{loginStaff.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {roleConfig[loginStaff.role].label}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                This will log you in as {loginStaff.name} to view their staff dashboard.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Detail Dialog */}
      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStaff.avatar} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {selectedStaff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStaff.name}</h3>
                  <Badge variant="secondary">
                    {roleConfig[selectedStaff.role].label}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{selectedStaff.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{selectedStaff.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="capitalize">{selectedStaff.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shift:</span>
                  <span>{shiftConfig[selectedStaff.shift].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{format(selectedStaff.joinedAt, "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks Today:</span>
                  <span>{selectedStaff.completedTasksToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Task Time:</span>
                  <span>{selectedStaff.avgTaskTime} mins</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
