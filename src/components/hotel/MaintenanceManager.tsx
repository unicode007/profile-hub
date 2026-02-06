import { useState } from "react";
import { PhysicalRoom } from "./PhysicalRoomManager";
import { Hotel } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Wrench,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Timer,
  DoorClosed,
  Calendar,
  Flag,
  ClipboardList,
  PlayCircle,
  MoreVertical,
  Trash2,
  Edit,
  Zap,
  Droplets,
  Wind,
  Tv,
  Lock,
  Flame,
  Shield,
  LogIn,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInMinutes, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MaintenanceTask {
  id: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  hotelId: string;
  hotelName: string;
  status: "pending" | "assigned" | "in-progress" | "completed" | "verified" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  category: "electrical" | "plumbing" | "hvac" | "appliance" | "structural" | "security" | "other";
  title: string;
  description: string;
  assignedTo?: string;
  assignedBy?: string;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
  partsUsed?: { name: string; quantity: number; cost: number }[];
  notes?: string;
  images?: string[];
  createdAt: Date;
  reportedBy: string;
}

export interface MaintenanceStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "supervisor" | "technician";
  specialization: string[];
  status: "available" | "busy" | "break" | "off-duty";
  currentTaskId?: string;
  completedToday: number;
  avgRepairTime: number;
  shift: "morning" | "afternoon" | "night";
}

const priorityConfig = {
  low: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30", icon: Flag },
  medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Flag },
  high: { label: "High", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: Flag },
  critical: { label: "Critical", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
};

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  assigned: { label: "Assigned", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  "in-progress": { label: "In Progress", color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-900/30" },
  completed: { label: "Completed", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  verified: { label: "Verified", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  escalated: { label: "Escalated", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

const categoryConfig = {
  electrical: { label: "Electrical", icon: Zap, color: "text-yellow-600" },
  plumbing: { label: "Plumbing", icon: Droplets, color: "text-blue-600" },
  hvac: { label: "HVAC", icon: Wind, color: "text-cyan-600" },
  appliance: { label: "Appliance", icon: Tv, color: "text-purple-600" },
  structural: { label: "Structural", icon: DoorClosed, color: "text-gray-600" },
  security: { label: "Security", icon: Lock, color: "text-red-600" },
  other: { label: "Other", icon: Wrench, color: "text-orange-600" },
};

// Demo maintenance staff
const demoMaintenanceStaff: MaintenanceStaff[] = [
  {
    id: "maint-sup-1",
    name: "Suresh Verma",
    email: "suresh@hotel.com",
    phone: "+91 9876543220",
    role: "supervisor",
    specialization: ["electrical", "hvac", "plumbing"],
    status: "available",
    completedToday: 0,
    avgRepairTime: 0,
    shift: "morning",
  },
  {
    id: "maint-tech-1",
    name: "Ravi Shankar",
    email: "ravi@hotel.com",
    phone: "+91 9876543221",
    role: "technician",
    specialization: ["electrical", "appliance"],
    status: "available",
    completedToday: 3,
    avgRepairTime: 45,
    shift: "morning",
  },
  {
    id: "maint-tech-2",
    name: "Gopal Krishna",
    email: "gopal@hotel.com",
    phone: "+91 9876543222",
    role: "technician",
    specialization: ["plumbing", "hvac"],
    status: "busy",
    currentTaskId: "maint-task-1",
    completedToday: 2,
    avgRepairTime: 60,
    shift: "morning",
  },
  {
    id: "maint-tech-3",
    name: "Anand Rao",
    email: "anand@hotel.com",
    phone: "+91 9876543223",
    role: "technician",
    specialization: ["structural", "security"],
    status: "break",
    completedToday: 1,
    avgRepairTime: 90,
    shift: "afternoon",
  },
];

// Generate demo maintenance tasks
const generateDemoTasks = (hotels: Hotel[], rooms: PhysicalRoom[]): MaintenanceTask[] => {
  const tasks: MaintenanceTask[] = [];
  const categories: MaintenanceTask["category"][] = ["electrical", "plumbing", "hvac", "appliance", "structural", "security"];
  const priorities: MaintenanceTask["priority"][] = ["low", "medium", "high", "critical"];
  const statuses: MaintenanceTask["status"][] = ["pending", "assigned", "in-progress", "completed"];

  const issues = [
    { category: "electrical" as const, title: "Light not working", desc: "Ceiling light in bathroom not turning on" },
    { category: "plumbing" as const, title: "Leaking faucet", desc: "Bathroom sink faucet is dripping continuously" },
    { category: "hvac" as const, title: "AC not cooling", desc: "Air conditioner running but not cooling the room" },
    { category: "appliance" as const, title: "TV remote broken", desc: "TV remote not responding to any buttons" },
    { category: "structural" as const, title: "Door lock jammed", desc: "Main door lock is stuck and difficult to open" },
    { category: "security" as const, title: "Safe not working", desc: "Electronic safe in room not accepting code" },
  ];

  rooms.slice(0, 8).forEach((room, idx) => {
    const hotel = hotels.find((h) => h.roomTypes.some((rt) => rt.id === room.roomTypeId));
    if (!hotel) return;

    const issue = issues[idx % issues.length];
    const status = statuses[idx % statuses.length];
    const priority = priorities[idx % priorities.length];

    tasks.push({
      id: `maint-task-${idx + 1}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      hotelId: hotel.id,
      hotelName: hotel.name,
      status,
      priority,
      category: issue.category,
      title: issue.title,
      description: issue.desc,
      assignedTo: status !== "pending" ? demoMaintenanceStaff[idx % 3 + 1].id : undefined,
      assignedBy: status !== "pending" ? "maint-sup-1" : undefined,
      assignedAt: status !== "pending" ? new Date(Date.now() - (idx + 1) * 3600000) : undefined,
      startedAt: status === "in-progress" || status === "completed" ? new Date(Date.now() - idx * 1800000) : undefined,
      completedAt: status === "completed" ? new Date() : undefined,
      estimatedHours: 1 + (idx % 3),
      actualHours: status === "completed" ? 1 + (idx % 2) : undefined,
      createdAt: new Date(Date.now() - (idx + 1) * 7200000),
      reportedBy: "Front Desk",
    });
  });

  return tasks;
};

interface MaintenanceManagerProps {
  hotels: Hotel[];
  physicalRooms: PhysicalRoom[];
  onUpdateRoomStatus?: (roomId: string, status: PhysicalRoom["status"]) => void;
  currentUser?: MaintenanceStaff | null;
  onStaffLogin?: (staff: MaintenanceStaff) => void;
}

export const MaintenanceManager = ({
  hotels,
  physicalRooms,
  onUpdateRoomStatus,
  currentUser,
  onStaffLogin,
}: MaintenanceManagerProps) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => generateDemoTasks(hotels, physicalRooms));
  const [staff, setStaff] = useState<MaintenanceStaff[]>(demoMaintenanceStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<MaintenanceTask | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "staff" | "analytics">("tasks");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [loginStaff, setLoginStaff] = useState<MaintenanceStaff | null>(null);

  const [newTask, setNewTask] = useState({
    roomId: "",
    category: "electrical" as MaintenanceTask["category"],
    priority: "medium" as MaintenanceTask["priority"],
    title: "",
    description: "",
  });

  const isSupervisor = currentUser?.role === "supervisor";
  const isTechnician = currentUser?.role === "technician";

  const getTaskStats = () => {
    const todayTasks = tasks.filter((t) => isToday(t.createdAt));
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed" || t.status === "verified").length,
      escalated: tasks.filter((t) => t.status === "escalated").length,
      critical: tasks.filter((t) => t.priority === "critical" && t.status !== "completed").length,
    };
  };

  const stats = getTaskStats();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;

    // If technician, only show assigned tasks
    if (isTechnician && currentUser) {
      return task.assignedTo === currentUser.id && matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleAssignTask = (taskId: string, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "assigned" as const,
              assignedTo: staffId,
              assignedBy: currentUser?.id,
              assignedAt: new Date(),
            }
          : t
      )
    );
    setIsAssignDialogOpen(false);
    setTaskToAssign(null);
    toast.success(`Task assigned to ${staffMember?.name}`);
  };

  const handleStartTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "in-progress" as const, startedAt: new Date() }
          : t
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task?.assignedTo) {
      setStaff(
        staff.map((s) =>
          s.id === task.assignedTo ? { ...s, status: "busy" as const, currentTaskId: taskId } : s
        )
      );
    }
    toast.success("Task started!");
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const actualHours = task.startedAt
      ? differenceInMinutes(new Date(), task.startedAt) / 60
      : task.estimatedHours;

    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed" as const, completedAt: new Date(), actualHours: Math.round(actualHours * 10) / 10 }
          : t
      )
    );

    if (task.assignedTo) {
      setStaff(
        staff.map((s) =>
          s.id === task.assignedTo
            ? { ...s, status: "available" as const, currentTaskId: undefined, completedToday: s.completedToday + 1 }
            : s
        )
      );
    }

    onUpdateRoomStatus?.(task.roomId, "available");
    toast.success("Task completed!");
  };

  const handleVerifyTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: "verified" as const, verifiedAt: new Date() } : t
      )
    );
    toast.success("Task verified!");
  };

  const handleEscalateTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: "escalated" as const, priority: "critical" as const } : t
      )
    );
    toast.warning("Task escalated to management!");
  };

  const handleCreateTask = () => {
    const room = physicalRooms.find((r) => r.id === newTask.roomId);
    if (!room || !newTask.title) {
      toast.error("Please fill in required fields");
      return;
    }

    const hotel = hotels.find((h) => h.roomTypes.some((rt) => rt.id === room.roomTypeId));

    const task: MaintenanceTask = {
      id: `maint-task-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      hotelId: hotel?.id || "",
      hotelName: hotel?.name || "",
      status: "pending",
      priority: newTask.priority,
      category: newTask.category,
      title: newTask.title,
      description: newTask.description,
      estimatedHours: 2,
      createdAt: new Date(),
      reportedBy: currentUser?.name || "System",
    };

    setTasks([task, ...tasks]);
    setIsCreateDialogOpen(false);
    setNewTask({
      roomId: "",
      category: "electrical",
      priority: "medium",
      title: "",
      description: "",
    });
    toast.success("Maintenance request created!");
  };

  const handleStaffLogin = (staffMember: MaintenanceStaff) => {
    setLoginStaff(staffMember);
    setIsLoginDialogOpen(true);
  };

  const confirmLogin = () => {
    if (loginStaff) {
      onStaffLogin?.(loginStaff);
      toast.success(`Logged in as ${loginStaff.name} (${loginStaff.role})`);
      setIsLoginDialogOpen(false);
    }
  };

  const availableTechnicians = staff.filter((s) => s.role === "technician" && s.status === "available");

  return (
    <div className="space-y-6">
      {/* Current User Banner */}
      {currentUser && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{currentUser.role} • {currentUser.shift} shift</p>
                </div>
              </div>
              <Badge variant={isSupervisor ? "default" : "secondary"}>
                {isSupervisor ? "Supervisor Mode" : "Technician Mode"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setStatusFilter("all")}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Wrench className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${statusFilter === "assigned" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "assigned" ? "all" : "assigned")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.assigned}</div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${statusFilter === "in-progress" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "in-progress" ? "all" : "in-progress")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <PlayCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${statusFilter === "completed" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${statusFilter === "escalated" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "escalated" ? "all" : "escalated")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.escalated}</div>
                <div className="text-xs text-muted-foreground">Escalated</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-200 dark:bg-red-900/50">
                <Flame className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <User className="h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Timer className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {(isSupervisor || !currentUser) && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task List */}
          <div className="grid gap-3">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No maintenance tasks found
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const priorityInfo = priorityConfig[task.priority];
                const statusInfo = statusConfig[task.status];
                const categoryInfo = categoryConfig[task.category];
                const CategoryIcon = categoryInfo.icon;
                const assignedStaff = staff.find((s) => s.id === task.assignedTo);

                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${categoryInfo.color} bg-opacity-10`}>
                            <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge variant="outline" className={priorityInfo.bgColor}>
                                <Flag className={`h-3 w-3 mr-1 ${priorityInfo.color}`} />
                                {priorityInfo.label}
                              </Badge>
                              <Badge variant="outline" className={statusInfo.bgColor}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DoorClosed className="h-3 w-3" />
                                Room {task.roomNumber} • Floor {task.floor}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                              </span>
                              {assignedStaff && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {assignedStaff.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isSupervisor && task.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setTaskToAssign(task);
                                setIsAssignDialogOpen(true);
                              }}
                            >
                              Assign
                            </Button>
                          )}
                          {(isTechnician || isSupervisor) && task.status === "assigned" && task.assignedTo === currentUser?.id && (
                            <Button size="sm" onClick={() => handleStartTask(task.id)}>
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          )}
                          {task.status === "in-progress" && task.assignedTo === currentUser?.id && (
                            <Button size="sm" variant="default" onClick={() => handleCompleteTask(task.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {isSupervisor && task.status === "completed" && (
                            <Button size="sm" variant="outline" onClick={() => handleVerifyTask(task.id)}>
                              Verify
                            </Button>
                          )}
                          {isSupervisor && task.status !== "completed" && task.status !== "verified" && (
                            <Button size="sm" variant="destructive" onClick={() => handleEscalateTask(task.id)}>
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => {
              const statusColor = member.status === "available" ? "bg-green-500" :
                member.status === "busy" ? "bg-yellow-500" :
                member.status === "break" ? "bg-orange-500" : "bg-gray-500";

              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10">
                              {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${statusColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStaffLogin(member)}
                        className="gap-1"
                      >
                        <LogIn className="h-3 w-3" />
                        Login
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shift</span>
                        <span className="capitalize">{member.shift}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Today's Tasks</span>
                        <span>{member.completedToday}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs capitalize">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5 hrs</div>
                <p className="text-xs text-muted-foreground">-15% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">First Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18 min</div>
                <p className="text-xs text-muted-foreground">Target: 15 min</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <Progress value={94} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Staff Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <Progress value={78} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Room</Label>
              <Select value={newTask.roomId} onValueChange={(v) => setNewTask({ ...newTask, roomId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {physicalRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} - Floor {room.floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(v) => setNewTask({ ...newTask, category: v as MaintenanceTask["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v) => setNewTask({ ...newTask, priority: v as MaintenanceTask["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Issue Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., AC not working"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          {taskToAssign && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="py-3">
                  <p className="font-medium">{taskToAssign.title}</p>
                  <p className="text-sm text-muted-foreground">Room {taskToAssign.roomNumber}</p>
                </CardContent>
              </Card>
              <div>
                <Label className="mb-2 block">Available Technicians</Label>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {availableTechnicians.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No technicians available</p>
                    ) : (
                      availableTechnicians.map((tech) => (
                        <Card
                          key={tech.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleAssignTask(taskToAssign.id, tech.id)}
                        >
                          <CardContent className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {tech.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{tech.name}</p>
                                <div className="flex gap-1">
                                  {tech.specialization.slice(0, 2).map((s) => (
                                    <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Button size="sm">Assign</Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Confirmation Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Demo Login</DialogTitle>
          </DialogHeader>
          {loginStaff && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {loginStaff.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{loginStaff.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{loginStaff.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground">
                You will be logged in as <strong>{loginStaff.name}</strong> with <strong>{loginStaff.role}</strong> permissions.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Confirm Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
