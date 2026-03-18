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
import { Plus, MoreVertical, Loader2, MessageSquare, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800", in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800", closed: "bg-gray-100 text-gray-800",
};

export function GuestCommModule() {
  const { currentHotelId } = useAuth();
  const { data: comms, isLoading } = useTableQuery("guest_communications");
  const { insert, update, remove } = useTableMutation("guest_communications");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({ room_number: "", guest_name: "", type: "request", priority: "medium" as string, subject: "", message: "" });

  const handleSubmit = async () => {
    if (!form.subject) { toast.error("Subject required"); return; }
    try {
      await insert.mutateAsync({ ...form, hotel_id: currentHotelId });
      toast.success("Created"); setIsDialogOpen(false);
      setForm({ room_number: "", guest_name: "", type: "request", priority: "medium", subject: "", message: "" });
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Guest Communications</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Request</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Communication</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room</Label><Input value={form.room_number} onChange={e => setForm(f => ({ ...f, room_number: e.target.value }))} /></div>
                <div><Label>Guest</Label><Input value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["request", "complaint", "wakeup_call", "feedback", "amenity"].map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["low", "medium", "high", "urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Subject*</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comms?.map((c: any) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base">{c.subject}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {c.status === "open" && <DropdownMenuItem onClick={() => update.mutateAsync({ id: c.id, status: "in_progress" })}>In Progress</DropdownMenuItem>}
                    {c.status === "in_progress" && <DropdownMenuItem onClick={() => update.mutateAsync({ id: c.id, status: "resolved", resolved_at: new Date().toISOString() })}>Resolve</DropdownMenuItem>}
                    <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(c.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <Badge className={statusColors[c.status] || ""}>{c.status?.replace("_", " ")}</Badge>
                <Badge variant="outline">{c.type?.replace("_", " ")}</Badge>
              </div>
              {c.room_number && <p className="text-sm">Room {c.room_number} • {c.guest_name}</p>}
              {c.message && <p className="text-sm text-muted-foreground mt-1 truncate">{c.message}</p>}
            </CardContent>
          </Card>
        ))}
        {(!comms || comms.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">No communications</p>}
      </div>
    </div>
  );
}
