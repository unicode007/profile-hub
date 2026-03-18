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
import { Plus, MoreVertical, Loader2, Wrench, Trash2, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
};

export function MaintenanceModule() {
  const { currentHotelId } = useAuth();
  const { data: tasks, isLoading } = useTableQuery("maintenance_tasks");
  const { data: rooms } = useTableQuery("physical_rooms");
  const { insert, update, remove } = useTableMutation("maintenance_tasks");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    title: "", room_number: "", category: "general", priority: "medium" as string,
    description: "", assigned_to_name: "", estimated_cost: "",
    scheduled_date: new Date().toISOString().split("T")[0],
  });

  const resetForm = () => {
    setForm({ title: "", room_number: "", category: "general", priority: "medium", description: "", assigned_to_name: "", estimated_cost: "", scheduled_date: new Date().toISOString().split("T")[0] });
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const data: any = { ...form, estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null };
    try {
      if (editingTask) { await update.mutateAsync({ id: editingTask.id, ...data }); toast.success("Updated"); }
      else { await insert.mutateAsync({ ...data, hotel_id: currentHotelId }); toast.success("Created"); }
      setIsDialogOpen(false); resetForm();
    } catch {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { id, status };
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();
    try { await update.mutateAsync(updates); toast.success("Updated"); } catch {}
  };

  const filteredTasks = tasks?.filter((t: any) => filter === "all" || t.status === filter) ?? [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Maintenance Requests</h2>
        <Dialog open={isDialogOpen} onOpenChange={o => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTask ? "Edit Request" : "New Request"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Fix AC in Room 101" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room</Label>
                  <Select value={form.room_number} onValueChange={v => setForm(f => ({ ...f, room_number: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{rooms?.map((r: any) => <SelectItem key={r.id} value={r.room_number}>{r.room_number}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["electrical", "plumbing", "hvac", "furniture", "general"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["low", "medium", "high", "urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Est. Cost</Label><Input type="number" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} /></div>
              </div>
              <div><Label>Assigned To</Label><Input value={form.assigned_to_name} onChange={e => setForm(f => ({ ...f, assigned_to_name: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={insert.isPending || update.isPending}>
                {editingTask ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "in_progress", "completed"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>{s === "all" ? "All" : s.replace("_", " ")}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task: any) => (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" />{task.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setEditingTask(task); setForm({ title: task.title, room_number: task.room_number || "", category: task.category, priority: task.priority, description: task.description || "", assigned_to_name: task.assigned_to_name || "", estimated_cost: task.estimated_cost?.toString() || "", scheduled_date: task.scheduled_date }); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    {task.status === "pending" && <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in_progress")}>Start</DropdownMenuItem>}
                    {task.status === "in_progress" && <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>Complete</DropdownMenuItem>}
                    <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(task.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge className={statusColors[task.status] || ""}>{task.status?.replace("_", " ")}</Badge>
                <Badge variant="outline">{task.category}</Badge>
              </div>
              {task.room_number && <p className="text-sm">Room: {task.room_number}</p>}
              {task.assigned_to_name && <p className="text-sm">Assigned: {task.assigned_to_name}</p>}
              {task.estimated_cost && <p className="text-sm">Cost: ₹{task.estimated_cost}</p>}
            </CardContent>
          </Card>
        ))}
        {filteredTasks.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No requests found</p>}
      </div>
    </div>
  );
}
