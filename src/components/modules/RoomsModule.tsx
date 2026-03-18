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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, BedDouble, Trash2, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800", occupied: "bg-red-100 text-red-800",
  dirty: "bg-yellow-100 text-yellow-800", cleaning: "bg-blue-100 text-blue-800",
  maintenance: "bg-orange-100 text-orange-800", blocked: "bg-gray-100 text-gray-800",
};

export function RoomsModule() {
  const { currentHotelId } = useAuth();
  const { data: rooms, isLoading } = useTableQuery("physical_rooms");
  const { data: roomTypes } = useTableQuery("room_types");
  const { insert, update, remove } = useTableMutation("physical_rooms");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({ room_number: "", floor: "1", room_type_id: "", key_card_number: "", notes: "" });

  const resetForm = () => { setForm({ room_number: "", floor: "1", room_type_id: "", key_card_number: "", notes: "" }); setEditingRoom(null); };

  const handleSubmit = async () => {
    if (!form.room_number || !form.room_type_id) { toast.error("Room number and type required"); return; }
    try {
      if (editingRoom) { await update.mutateAsync({ id: editingRoom.id, ...form, floor: Number(form.floor) }); toast.success("Updated"); }
      else { await insert.mutateAsync({ ...form, floor: Number(form.floor), hotel_id: currentHotelId }); toast.success("Created"); }
      setIsDialogOpen(false); resetForm();
    } catch {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await update.mutateAsync({ id, status }); toast.success("Status updated"); } catch {}
  };

  const getRoomTypeName = (id: string) => roomTypes?.find((r: any) => r.id === id)?.name || "Unknown";
  const filtered = rooms?.filter((r: any) => filter === "all" || r.status === filter) ?? [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Room Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={o => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingRoom ? "Edit Room" : "Add Room"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room Number*</Label><Input value={form.room_number} onChange={e => setForm(f => ({ ...f, room_number: e.target.value }))} /></div>
                <div><Label>Floor</Label><Input type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} /></div>
              </div>
              <div><Label>Room Type*</Label>
                <Select value={form.room_type_id} onValueChange={v => setForm(f => ({ ...f, room_type_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{roomTypes?.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Key Card</Label><Input value={form.key_card_number} onChange={e => setForm(f => ({ ...f, key_card_number: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full">{editingRoom ? "Update" : "Add Room"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "available", "occupied", "dirty", "cleaning", "maintenance", "blocked"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>{s}</Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((room: any) => (
          <Card key={room.id} className="relative">
            <CardContent className="p-4 text-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6"><MoreVertical className="h-3 w-3" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setEditingRoom(room); setForm({ room_number: room.room_number, floor: room.floor.toString(), room_type_id: room.room_type_id, key_card_number: room.key_card_number || "", notes: room.notes || "" }); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                  {["available", "occupied", "dirty", "cleaning", "maintenance", "blocked"].filter(s => s !== room.status).map(s => (
                    <DropdownMenuItem key={s} onClick={() => handleStatusChange(room.id, s)}>Set {s}</DropdownMenuItem>
                  ))}
                  <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(room.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <BedDouble className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-bold text-foreground">{room.room_number}</p>
              <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
              <p className="text-xs text-muted-foreground mb-2">{getRoomTypeName(room.room_type_id)}</p>
              <Badge className={`text-xs ${statusColors[room.status] || ""}`}>{room.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">No rooms found</p>}
      </div>
    </div>
  );
}
