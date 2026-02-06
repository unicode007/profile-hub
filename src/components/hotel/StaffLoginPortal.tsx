import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  LogIn,
  User,
  Shield,
  Sparkles,
  Wrench,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  UserCircle,
  Building,
  Clock,
  LogOut,
} from "lucide-react";
import { format } from "date-fns";

// Define staff types for different departments
export interface DemoStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "supervisor" | "staff";
  department: "housekeeping" | "maintenance" | "front-desk" | "management";
  shift: "morning" | "afternoon" | "night";
  permissions: string[];
}

// Demo staff data for login
const demoStaffUsers: DemoStaffUser[] = [
  // Housekeeping
  {
    id: "hk-sup-1",
    name: "Vikram Singh",
    email: "vikram@hotel.com",
    phone: "+91 9876543214",
    role: "supervisor",
    department: "housekeeping",
    shift: "morning",
    permissions: ["view-tasks", "create-tasks", "assign-tasks", "verify-tasks", "manage-staff"],
  },
  {
    id: "hk-staff-1",
    name: "Rajesh Kumar",
    email: "rajesh@hotel.com",
    phone: "+91 9876543210",
    role: "staff",
    department: "housekeeping",
    shift: "morning",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  {
    id: "hk-staff-2",
    name: "Priya Sharma",
    email: "priya@hotel.com",
    phone: "+91 9876543211",
    role: "staff",
    department: "housekeeping",
    shift: "morning",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  {
    id: "hk-staff-3",
    name: "Sunita Devi",
    email: "sunita@hotel.com",
    phone: "+91 9876543213",
    role: "staff",
    department: "housekeeping",
    shift: "afternoon",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  // Maintenance
  {
    id: "maint-sup-1",
    name: "Suresh Verma",
    email: "suresh@hotel.com",
    phone: "+91 9876543220",
    role: "supervisor",
    department: "maintenance",
    shift: "morning",
    permissions: ["view-tasks", "create-tasks", "assign-tasks", "verify-tasks", "manage-staff", "escalate"],
  },
  {
    id: "maint-staff-1",
    name: "Ravi Shankar",
    email: "ravi@hotel.com",
    phone: "+91 9876543221",
    role: "staff",
    department: "maintenance",
    shift: "morning",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  {
    id: "maint-staff-2",
    name: "Gopal Krishna",
    email: "gopal@hotel.com",
    phone: "+91 9876543222",
    role: "staff",
    department: "maintenance",
    shift: "morning",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  {
    id: "maint-staff-3",
    name: "Anand Rao",
    email: "anand@hotel.com",
    phone: "+91 9876543223",
    role: "staff",
    department: "maintenance",
    shift: "afternoon",
    permissions: ["view-tasks", "start-tasks", "complete-tasks"],
  },
  // Front Desk
  {
    id: "fd-sup-1",
    name: "Meera Reddy",
    email: "meera@hotel.com",
    phone: "+91 9876543215",
    role: "supervisor",
    department: "front-desk",
    shift: "morning",
    permissions: ["view-bookings", "check-in", "check-out", "manage-reservations", "manage-staff"],
  },
  {
    id: "fd-staff-1",
    name: "Arun Menon",
    email: "arun@hotel.com",
    phone: "+91 9876543225",
    role: "staff",
    department: "front-desk",
    shift: "morning",
    permissions: ["view-bookings", "check-in", "check-out"],
  },
  // Management
  {
    id: "mgmt-1",
    name: "Kavitha Menon",
    email: "kavitha@hotel.com",
    phone: "+91 9876543217",
    role: "supervisor",
    department: "management",
    shift: "morning",
    permissions: ["all"],
  },
];

const departmentConfig = {
  housekeeping: { label: "Housekeeping", icon: Sparkles, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  maintenance: { label: "Maintenance", icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  "front-desk": { label: "Front Desk", icon: Building, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  management: { label: "Management", icon: Shield, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
};

const roleConfig = {
  supervisor: { label: "Supervisor", color: "text-indigo-600", bgColor: "bg-indigo-100" },
  staff: { label: "Staff", color: "text-gray-600", bgColor: "bg-gray-100" },
};

const shiftConfig = {
  morning: { label: "Morning", time: "6:00 AM - 2:00 PM" },
  afternoon: { label: "Afternoon", time: "2:00 PM - 10:00 PM" },
  night: { label: "Night", time: "10:00 PM - 6:00 AM" },
};

interface StaffLoginPortalProps {
  currentUser?: DemoStaffUser | null;
  onLogin: (user: DemoStaffUser) => void;
  onLogout: () => void;
}

export const StaffLoginPortal = ({
  currentUser,
  onLogin,
  onLogout,
}: StaffLoginPortalProps) => {
  const [activeTab, setActiveTab] = useState<string>("housekeeping");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DemoStaffUser | null>(null);
  const [demoPassword, setDemoPassword] = useState("");

  const filteredStaff = demoStaffUsers.filter((s) => s.department === activeTab);

  const handleSelectUser = (user: DemoStaffUser) => {
    setSelectedUser(user);
    setDemoPassword("");
    setIsLoginDialogOpen(true);
  };

  const handleLogin = () => {
    if (!selectedUser) return;

    // Demo login - accept any password
    if (demoPassword.length < 1) {
      toast.error("Please enter a password (demo: any password works)");
      return;
    }

    onLogin(selectedUser);
    toast.success(`Welcome, ${selectedUser.name}!`);
    setIsLoginDialogOpen(false);
    setSelectedUser(null);
    setDemoPassword("");
  };

  const handleLogout = () => {
    onLogout();
    toast.success("Logged out successfully");
  };

  // If user is logged in, show their dashboard
  if (currentUser) {
    const deptInfo = departmentConfig[currentUser.department];
    const DeptIcon = deptInfo.icon;
    const roleInfo = roleConfig[currentUser.role];
    const shiftInfo = shiftConfig[currentUser.shift];

    return (
      <div className="space-y-6">
        {/* Current User Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${roleInfo.bgColor} ${roleInfo.color}`}>
                      {roleInfo.label}
                    </Badge>
                    <Badge className={`${deptInfo.bgColor} ${deptInfo.color}`}>
                      <DeptIcon className="h-3 w-3 mr-1" />
                      {deptInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {shiftInfo.label} Shift ({shiftInfo.time})
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{currentUser.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Staff ID</p>
                  <p className="font-medium">{currentUser.id.toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Permissions</p>
                  <p className="font-medium">{currentUser.permissions.length} granted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>Actions you can perform in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentUser.permissions.map((perm) => (
                <Badge key={perm} variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {perm.replace("-", " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions based on role */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {currentUser.department === "housekeeping" && (
                <>
                  <Button variant="outline" className="justify-start gap-2">
                    <Sparkles className="h-4 w-4" />
                    View My Tasks
                  </Button>
                  {currentUser.role === "supervisor" && (
                    <Button variant="outline" className="justify-start gap-2">
                      <User className="h-4 w-4" />
                      Assign Tasks
                    </Button>
                  )}
                </>
              )}
              {currentUser.department === "maintenance" && (
                <>
                  <Button variant="outline" className="justify-start gap-2">
                    <Wrench className="h-4 w-4" />
                    View Repairs
                  </Button>
                  {currentUser.role === "supervisor" && (
                    <Button variant="outline" className="justify-start gap-2">
                      <User className="h-4 w-4" />
                      Assign Technicians
                    </Button>
                  )}
                </>
              )}
              {currentUser.department === "front-desk" && (
                <>
                  <Button variant="outline" className="justify-start gap-2">
                    <Building className="h-4 w-4" />
                    Today's Check-ins
                  </Button>
                  <Button variant="outline" className="justify-start gap-2">
                    <Building className="h-4 w-4" />
                    Today's Check-outs
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Portal View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold mb-2">Staff Login Portal</h1>
        <p className="text-muted-foreground">
          Select your department and login to access the staff dashboard
        </p>
      </div>

      {/* Department Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          {Object.entries(departmentConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="hidden md:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(departmentConfig).map((dept) => (
          <TabsContent key={dept} value={dept} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {demoStaffUsers
                .filter((s) => s.department === dept)
                .map((staff) => {
                  const deptInfo = departmentConfig[staff.department];
                  const DeptIcon = deptInfo.icon;
                  const roleInfo = roleConfig[staff.role];
                  const shiftInfo = shiftConfig[staff.shift];

                  return (
                    <Card key={staff.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectUser(staff)}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className={`${deptInfo.bgColor} ${deptInfo.color}`}>
                              {staff.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{staff.name}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge className={`${roleInfo.bgColor} ${roleInfo.color} text-xs`}>
                                {roleInfo.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {shiftInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {staff.email}
                            </div>
                          </div>
                        </div>
                        <Button className="w-full mt-4 gap-2">
                          <LogIn className="h-4 w-4" />
                          Login as {staff.name.split(" ")[0]}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Demo Staff Login</DialogTitle>
            <DialogDescription>
              Enter any password to login as the selected staff member
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedUser.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedUser.role} • {selectedUser.department.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={selectedUser.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter any password (demo)"
                    value={demoPassword}
                    onChange={(e) => setDemoPassword(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 This is a demo - any password will work
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="bg-muted/30 max-w-2xl mx-auto">
        <CardContent className="py-4 px-5 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> Select any staff member to login. Supervisors can assign tasks,
            while staff members can view and complete their assigned tasks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
