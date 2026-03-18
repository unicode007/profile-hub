import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, ShowerHead, Trash2, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function HousekeepingModule() {
  const { currentHotelId } = useAuth();
  const { data: tasks, isLoading } = useTableQuery("housekeeping_tasks");
  const { data: rooms } = useTableQuery("physical_rooms");
  const { insert, update, remove } = useTableMutation("housekeeping_tasks");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    room_number: "", task_type: "cleaning", priority: "medium" as string,
    description: "", assigned_to_name: "", scheduled_date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setForm({ room_number: "", task_type: "cleaning", priority: "medium", description: "", assigned_to_name: "", scheduled_date: new Date().toISOString().split("T")[0] });
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    if (!form.room_number) { toast.error("Room number is required"); return; }
    try {
      if (editingTask) {
        await update.mutateAsync({ id: editingTask.id, ...form });
        toast.success("Task updated");
      } else {
        await insert.mutateAsync({ ...form, hotel_id: currentHotelId });
        toast.success("Task created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try { await remove.mutateAsync(id); toast.success("Task deleted"); } catch {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updates: any = { id, status };
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      if (status === "completed") updates.completed_at = new Date().toISOString();
      await update.mutateAsync(updates);
      toast.success(`Status updated to ${status}`);
    } catch {}
  };

  const filteredTasks = tasks?.filter((t: any) => filter === "all" || t.status === filter) ?? [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Housekeeping Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room Number</Label>
                  <Select value={form.room_number} onValueChange={v => setForm(f => ({ ...f, room_number: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                    <SelectContent>
                      {rooms?.map((r: any) => <SelectItem key={r.id} value={r.room_number}>{r.room_number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Task Type</Label>
                  <Select value={form.task_type} onValueChange={v => setForm(f => ({ ...f, task_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="turndown">Turndown</SelectItem>
                      <SelectItem value="deep_clean">Deep Clean</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Assigned To</Label>
                  <Input value={form.assigned_to_name} onChange={e => setForm(f => ({ ...f, assigned_to_name: e.target.value }))} placeholder="Staff name" />
                </div>
              </div>
              <div><Label>Scheduled Date</Label>
                <Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
              </div>
              <div><Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details..." />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={insert.isPending || update.isPending}>
                {(insert.isPending || update.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "in_progress", "completed", "cancelled"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task: any) => (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShowerHead className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Room {task.room_number}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setEditingTask(task); setForm({ room_number: task.room_number, task_type: task.task_type, priority: task.priority, description: task.description || "", assigned_to_name: task.assigned_to_name || "", scheduled_date: task.scheduled_date }); setIsDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" />Edit
                    </DropdownMenuItem>
                    {task.status === "pending" && <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>Start Task</DropdownMenuItem>}
                    {task.status === "in_progress" && <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>Complete</DropdownMenuItem>}
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge className={statusColors[task.status] || ""}>{task.status?.replace("_", " ")}</Badge>
                <Badge className={priorityColors[task.priority] || ""}>{task.priority}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{task.task_type} • {task.scheduled_date}</p>
              {task.assigned_to_name && <p className="text-sm">Assigned: {task.assigned_to_name}</p>}
              {task.description && <p className="text-sm text-muted-foreground truncate">{task.description}</p>}
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No tasks found</p>}
      </div>
    </div>
  );
}
