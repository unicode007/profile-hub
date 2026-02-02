import { useState } from "react";
import { PhysicalRoom } from "./PhysicalRoomManager";
import { Hotel, Booking } from "./types";
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
  Sparkles,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Timer,
  Bed,
  DoorClosed,
  ArrowRight,
  Calendar,
  Flag,
  ClipboardList,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInMinutes, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  status: "pending" | "in-progress" | "completed" | "verified" | "issue";
  priority: "low" | "medium" | "high" | "urgent";
  type: "checkout-clean" | "stay-over" | "deep-clean" | "turndown" | "inspection";
  assignedTo?: string;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
  estimatedMinutes: number;
  actualMinutes?: number;
  notes?: string;
  issues?: string[];
  checklistItems?: { name: string; completed: boolean }[];
  createdAt: Date;
}

export interface HousekeepingStaff {
  id: string;
  name: string;
  avatar?: string;
  status: "available" | "busy" | "break" | "off-duty";
  currentTaskId?: string;
  completedToday: number;
  avgCleaningTime: number;
}

const priorityConfig = {
  low: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30", icon: Flag },
  medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Flag },
  high: { label: "High", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: Flag },
  urgent: { label: "Urgent", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
};

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  "in-progress": { label: "In Progress", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  completed: { label: "Completed", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  verified: { label: "Verified", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  issue: { label: "Issue", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
};

const typeConfig = {
  "checkout-clean": { label: "Checkout Clean", estimatedMins: 45 },
  "stay-over": { label: "Stay-over Service", estimatedMins: 25 },
  "deep-clean": { label: "Deep Clean", estimatedMins: 90 },
  turndown: { label: "Turndown Service", estimatedMins: 15 },
  inspection: { label: "Inspection", estimatedMins: 10 },
};

const defaultChecklist = [
  "Make bed with fresh linens",
  "Clean bathroom surfaces",
  "Replace towels",
  "Vacuum/mop floors",
  "Empty trash bins",
  "Dust furniture",
  "Clean mirrors",
  "Restock amenities",
  "Check minibar",
  "Test electronics",
];

interface HousekeepingManagerProps {
  hotels: Hotel[];
  physicalRooms: PhysicalRoom[];
  bookings: Booking[];
  onUpdateRoomStatus?: (roomId: string, status: PhysicalRoom["status"]) => void;
}

export const HousekeepingManager = ({
  hotels,
  physicalRooms,
  bookings,
  onUpdateRoomStatus,
}: HousekeepingManagerProps) => {
  const [tasks, setTasks] = useState<HousekeepingTask[]>(() => generateDemoTasks(hotels, physicalRooms));
  const [staff, setStaff] = useState<HousekeepingStaff[]>(demoStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "staff" | "analytics">("tasks");

  // Create task form
  const [newTask, setNewTask] = useState({
    roomId: "",
    type: "checkout-clean" as HousekeepingTask["type"],
    priority: "medium" as HousekeepingTask["priority"],
    assignedTo: "",
    notes: "",
  });

  const getTaskStats = () => {
    const today = new Date();
    const todayTasks = tasks.filter((t) => isToday(t.createdAt));
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed" || t.status === "verified").length,
      issues: tasks.filter((t) => t.status === "issue").length,
      todayCompleted: todayTasks.filter((t) => t.status === "completed" || t.status === "verified").length,
      avgTime: Math.round(
        tasks
          .filter((t) => t.actualMinutes)
          .reduce((sum, t) => sum + (t.actualMinutes || 0), 0) /
          Math.max(1, tasks.filter((t) => t.actualMinutes).length)
      ),
    };
  };

  const stats = getTaskStats();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesHotel = hotelFilter === "all" || task.hotelId === hotelFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesHotel;
  });

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

    const actualMinutes = task.startedAt
      ? differenceInMinutes(new Date(), task.startedAt)
      : task.estimatedMinutes;

    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "completed" as const, completedAt: new Date(), actualMinutes }
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
    toast.success("Task completed! Room marked as available.");
  };

  const handleVerifyTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: "verified" as const, verifiedAt: new Date() } : t
      )
    );
    toast.success("Task verified!");
  };

  const handleReportIssue = (taskId: string, issue: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: "issue" as const, issues: [...(t.issues || []), issue] }
          : t
      )
    );
    toast.warning("Issue reported!");
  };

  const handleAssignTask = (taskId: string, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, assignedTo: staffId, assignedAt: new Date() }
          : t
      )
    );
    toast.success(`Task assigned to ${staffMember?.name || "staff"}`);
  };

  const handleCreateTask = () => {
    const room = physicalRooms.find((r) => r.id === newTask.roomId);
    if (!room) {
      toast.error("Please select a room");
      return;
    }

    const hotel = hotels.find((h) =>
      h.roomTypes.some((rt) => rt.id === room.roomTypeId)
    );
    const roomType = hotel?.roomTypes.find((rt) => rt.id === room.roomTypeId);

    const task: HousekeepingTask = {
      id: `task-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      hotelId: hotel?.id || "",
      hotelName: hotel?.name || "",
      roomTypeId: room.roomTypeId,
      roomTypeName: roomType?.name || "",
      status: "pending",
      priority: newTask.priority,
      type: newTask.type,
      assignedTo: newTask.assignedTo || undefined,
      assignedAt: newTask.assignedTo ? new Date() : undefined,
      estimatedMinutes: typeConfig[newTask.type].estimatedMins,
      notes: newTask.notes || undefined,
      checklistItems: defaultChecklist.map((item) => ({ name: item, completed: false })),
      createdAt: new Date(),
    };

    setTasks([task, ...tasks]);
    setIsCreateDialogOpen(false);
    setNewTask({
      roomId: "",
      type: "checkout-clean",
      priority: "medium",
      assignedTo: "",
      notes: "",
    });
    toast.success("Task created successfully!");
  };

  const handleToggleChecklist = (taskId: string, itemIndex: number) => {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId || !t.checklistItems) return t;
        const items = [...t.checklistItems];
        items[itemIndex] = { ...items[itemIndex], completed: !items[itemIndex].completed };
        return { ...t, checklistItems: items };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "pending" ? "ring-2 ring-primary" : ""}`}
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
          className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "in-progress" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "in-progress" ? "all" : "in-progress")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md transition-shadow ${statusFilter === "completed" ? "ring-2 ring-primary" : ""}`}
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
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Timer className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.avgTime}m</div>
                <div className="text-xs text-muted-foreground">Avg Time</div>
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
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room or hotel..."
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
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hotelFilter} onValueChange={setHotelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hotels</SelectItem>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task List */}
          <div className="grid gap-3">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No tasks found
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  staff={staff}
                  onStart={() => handleStartTask(task.id)}
                  onComplete={() => handleCompleteTask(task.id)}
                  onVerify={() => handleVerifyTask(task.id)}
                  onAssign={(staffId) => handleAssignTask(task.id, staffId)}
                  onViewDetails={() => setSelectedTask(task)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <StaffCard key={member.id} staff={member} tasks={tasks} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsView tasks={tasks} staff={staff} />
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DoorClosed className="h-5 w-5 text-primary" />
                  Room {selectedTask.roomNumber} - {typeConfig[selectedTask.type].label}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${statusConfig[selectedTask.status].bgColor} ${statusConfig[selectedTask.status].color}`}>
                      {statusConfig[selectedTask.status].label}
                    </Badge>
                    <Badge className={`${priorityConfig[selectedTask.priority].bgColor} ${priorityConfig[selectedTask.priority].color}`}>
                      {priorityConfig[selectedTask.priority].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Hotel</Label>
                      <p className="font-medium">{selectedTask.hotelName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Room Type</Label>
                      <p className="font-medium">{selectedTask.roomTypeName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Floor</Label>
                      <p className="font-medium">{selectedTask.floor}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estimated Time</Label>
                      <p className="font-medium">{selectedTask.estimatedMinutes} mins</p>
                    </div>
                    {selectedTask.actualMinutes && (
                      <div>
                        <Label className="text-muted-foreground">Actual Time</Label>
                        <p className="font-medium">{selectedTask.actualMinutes} mins</p>
                      </div>
                    )}
                    {selectedTask.assignedTo && (
                      <div>
                        <Label className="text-muted-foreground">Assigned To</Label>
                        <p className="font-medium">
                          {staff.find((s) => s.id === selectedTask.assignedTo)?.name || "Unknown"}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedTask.notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="text-sm mt-1">{selectedTask.notes}</p>
                    </div>
                  )}

                  {selectedTask.checklistItems && selectedTask.checklistItems.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground mb-2 block">Checklist</Label>
                      <div className="space-y-2">
                        {selectedTask.checklistItems.map((item, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklist(selectedTask.id, index)}
                              className="rounded"
                            />
                            <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                              {item.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <Progress
                        value={
                          (selectedTask.checklistItems.filter((i) => i.completed).length /
                            selectedTask.checklistItems.length) *
                          100
                        }
                        className="h-2 mt-3"
                      />
                    </div>
                  )}

                  {selectedTask.issues && selectedTask.issues.length > 0 && (
                    <div>
                      <Label className="text-red-600">Issues Reported</Label>
                      <ul className="mt-1 space-y-1">
                        {selectedTask.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Housekeeping Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Room</Label>
              <Select value={newTask.roomId} onValueChange={(v) => setNewTask({ ...newTask, roomId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {physicalRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} (Floor {room.floor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Task Type</Label>
                <Select
                  value={newTask.type}
                  onValueChange={(v) => setNewTask({ ...newTask, type: v as HousekeepingTask["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v) => setNewTask({ ...newTask, priority: v as HousekeepingTask["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Assign To (Optional)</Label>
              <Select
                value={newTask.assignedTo}
                onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff
                    .filter((s) => s.status === "available")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Special instructions..."
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Task Card Component
const TaskCard = ({
  task,
  staff,
  onStart,
  onComplete,
  onVerify,
  onAssign,
  onViewDetails,
}: {
  task: HousekeepingTask;
  staff: HousekeepingStaff[];
  onStart: () => void;
  onComplete: () => void;
  onVerify: () => void;
  onAssign: (staffId: string) => void;
  onViewDetails: () => void;
}) => {
  const assignedStaff = task.assignedTo ? staff.find((s) => s.id === task.assignedTo) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2 rounded-lg ${statusConfig[task.status].bgColor} flex-shrink-0`}
            >
              <DoorClosed className={`h-5 w-5 ${statusConfig[task.status].color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">Room {task.roomNumber}</span>
                <Badge variant="outline" className="text-xs">
                  {typeConfig[task.type].label}
                </Badge>
                <Badge className={`${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color} text-xs`}>
                  {priorityConfig[task.priority].label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {task.hotelName} • Floor {task.floor} • {task.roomTypeName}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {task.estimatedMinutes}m est.
                </span>
                {assignedStaff && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {assignedStaff.name}
                  </span>
                )}
                {task.startedAt && !task.completedAt && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <PlayCircle className="h-3 w-3" />
                    Started {formatDistanceToNow(task.startedAt, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.status === "pending" && (
              <Button size="sm" variant="outline" onClick={onStart} className="gap-1">
                <PlayCircle className="h-4 w-4" />
                Start
              </Button>
            )}
            {task.status === "in-progress" && (
              <Button size="sm" onClick={onComplete} className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            )}
            {task.status === "completed" && (
              <Button size="sm" variant="secondary" onClick={onVerify} className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Verify
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  View Details
                </DropdownMenuItem>
                {!task.assignedTo && (
                  <>
                    {staff.filter((s) => s.status === "available").map((s) => (
                      <DropdownMenuItem key={s.id} onClick={() => onAssign(s.id)}>
                        Assign to {s.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Staff Card Component
const StaffCard = ({
  staff,
  tasks,
}: {
  staff: HousekeepingStaff;
  tasks: HousekeepingTask[];
}) => {
  const currentTask = staff.currentTaskId
    ? tasks.find((t) => t.id === staff.currentTaskId)
    : null;
  const assignedTasks = tasks.filter((t) => t.assignedTo === staff.id && t.status !== "verified" && t.status !== "completed");

  const statusColors = {
    available: "bg-green-500",
    busy: "bg-blue-500",
    break: "bg-yellow-500",
    "off-duty": "bg-gray-500",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {staff.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${statusColors[staff.status]}`}
            />
          </div>
          <div>
            <div className="font-semibold">{staff.name}</div>
            <div className="text-sm text-muted-foreground capitalize">{staff.status.replace("-", " ")}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center mb-4">
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-lg font-bold">{staff.completedToday}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <div className="text-lg font-bold">{staff.avgCleaningTime}m</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
        </div>

        {currentTask && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
            <div className="text-xs text-blue-600 mb-1">Currently Working</div>
            <div className="font-medium">Room {currentTask.roomNumber}</div>
            <div className="text-sm text-muted-foreground">{typeConfig[currentTask.type].label}</div>
          </div>
        )}

        {assignedTasks.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Assigned Tasks ({assignedTasks.length})</div>
            <div className="space-y-1">
              {assignedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="text-sm flex items-center justify-between">
                  <span>Room {task.roomNumber}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {assignedTasks.length > 3 && (
                <div className="text-xs text-muted-foreground">+{assignedTasks.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Analytics View Component
const AnalyticsView = ({
  tasks,
  staff,
}: {
  tasks: HousekeepingTask[];
  staff: HousekeepingStaff[];
}) => {
  const completedTasks = tasks.filter((t) => t.status === "completed" || t.status === "verified");
  const avgTime = Math.round(
    completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.estimatedMinutes), 0) /
      Math.max(1, completedTasks.length)
  );

  const tasksByType = Object.entries(typeConfig).map(([type, config]) => ({
    type: config.label,
    count: tasks.filter((t) => t.type === type).length,
    completed: tasks.filter((t) => t.type === type && (t.status === "completed" || t.status === "verified")).length,
  }));

  const priorityBreakdown = Object.entries(priorityConfig).map(([priority, config]) => ({
    priority: config.label,
    count: tasks.filter((t) => t.priority === priority).length,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasksByType.map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.type}</span>
                  <span className="text-muted-foreground">
                    {item.completed}/{item.count}
                  </span>
                </div>
                <Progress
                  value={item.count > 0 ? (item.completed / item.count) * 100 : 0}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityBreakdown.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <span>{item.priority}</span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staff.map((member) => {
              const memberTasks = tasks.filter(
                (t) => t.assignedTo === member.id && (t.status === "completed" || t.status === "verified")
              );
              const memberAvgTime = Math.round(
                memberTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0) / Math.max(1, memberTasks.length)
              );
              return (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {memberTasks.length} tasks • {memberAvgTime}m avg
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{avgTime}</div>
              <div className="text-sm text-muted-foreground">Avg Minutes</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {tasks.filter((t) => t.status === "issue").length}
              </div>
              <div className="text-sm text-muted-foreground">Issues</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {staff.filter((s) => s.status === "available").length}
              </div>
              <div className="text-sm text-muted-foreground">Available Staff</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Demo data generators
const demoStaff: HousekeepingStaff[] = [
  { id: "staff-1", name: "Maria Garcia", status: "available", completedToday: 5, avgCleaningTime: 32 },
  { id: "staff-2", name: "John Smith", status: "busy", completedToday: 4, avgCleaningTime: 28 },
  { id: "staff-3", name: "Priya Sharma", status: "available", completedToday: 6, avgCleaningTime: 25 },
  { id: "staff-4", name: "Ahmed Hassan", status: "break", completedToday: 3, avgCleaningTime: 35 },
  { id: "staff-5", name: "Lisa Wong", status: "available", completedToday: 7, avgCleaningTime: 30 },
];

const generateDemoTasks = (hotels: Hotel[], rooms: PhysicalRoom[]): HousekeepingTask[] => {
  const tasks: HousekeepingTask[] = [];
  const statuses: HousekeepingTask["status"][] = ["pending", "in-progress", "completed", "verified"];
  const priorities: HousekeepingTask["priority"][] = ["low", "medium", "high", "urgent"];
  const types: HousekeepingTask["type"][] = ["checkout-clean", "stay-over", "deep-clean", "turndown"];

  rooms.slice(0, 15).forEach((room, index) => {
    const hotel = hotels.find((h) => h.roomTypes.some((rt) => rt.id === room.roomTypeId));
    const roomType = hotel?.roomTypes.find((rt) => rt.id === room.roomTypeId);
    const type = types[index % types.length];

    tasks.push({
      id: `task-${index + 1}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      hotelId: hotel?.id || "",
      hotelName: hotel?.name || "Unknown",
      roomTypeId: room.roomTypeId,
      roomTypeName: roomType?.name || "Unknown",
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      type,
      assignedTo: index % 3 === 0 ? demoStaff[index % demoStaff.length].id : undefined,
      estimatedMinutes: typeConfig[type].estimatedMins,
      actualMinutes: index % 4 === 2 ? typeConfig[type].estimatedMins + (Math.random() * 10 - 5) : undefined,
      checklistItems: defaultChecklist.map((item, i) => ({
        name: item,
        completed: index % 4 === 2 || index % 4 === 3 ? true : i < index % defaultChecklist.length,
      })),
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
      startedAt: index % 4 >= 1 ? new Date(Date.now() - Math.random() * 3600000 * 2) : undefined,
      completedAt: index % 4 >= 2 ? new Date(Date.now() - Math.random() * 3600000) : undefined,
    });
  });

  return tasks;
};
