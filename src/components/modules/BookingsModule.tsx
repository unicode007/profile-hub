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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, CalendarCheck, Trash2, Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", confirmed: "bg-blue-100 text-blue-800",
  checked_in: "bg-green-100 text-green-800", checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800", completed: "bg-emerald-100 text-emerald-800",
  no_show: "bg-purple-100 text-purple-800",
};

export function BookingsModule() {
  const { currentHotelId } = useAuth();
  const { data: bookings, isLoading } = useTableQuery("bookings");
  const { data: roomTypes } = useTableQuery("room_types");
  const { insert, update, remove } = useTableMutation("bookings");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    guest_first_name: "", guest_last_name: "", guest_email: "", guest_phone: "",
    check_in: "", check_out: "", adults: "1", children: "0", rooms_count: "1",
    room_type_id: "", total_amount: "", payment_method: "cash" as string, special_requests: "",
  });

  const handleSubmit = async () => {
    if (!form.guest_first_name || !form.guest_last_name || !form.check_in || !form.check_out) {
      toast.error("Please fill required fields"); return;
    }
    try {
      await insert.mutateAsync({
        ...form, hotel_id: currentHotelId,
        adults: Number(form.adults), children: Number(form.children),
        rooms_count: Number(form.rooms_count), total_amount: Number(form.total_amount) || 0,
      });
      toast.success("Booking created");
      setIsDialogOpen(false);
      setForm({ guest_first_name: "", guest_last_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "", adults: "1", children: "0", rooms_count: "1", room_type_id: "", total_amount: "", payment_method: "cash", special_requests: "" });
    } catch {}
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { id, status };
    if (status === "checked_in") updates.check_in_time = new Date().toISOString();
    if (status === "checked_out") updates.check_out_time = new Date().toISOString();
    try { await update.mutateAsync(updates); toast.success("Status updated"); } catch {}
  };

  const filtered = bookings?.filter((b: any) => filter === "all" || b.status === filter) ?? [];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Bookings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Booking</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Booking</DialogTitle></DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name*</Label><Input value={form.guest_first_name} onChange={e => setForm(f => ({ ...f, guest_first_name: e.target.value }))} /></div>
                <div><Label>Last Name*</Label><Input value={form.guest_last_name} onChange={e => setForm(f => ({ ...f, guest_last_name: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.guest_email} onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.guest_phone} onChange={e => setForm(f => ({ ...f, guest_phone: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Check-in*</Label><Input type="date" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} /></div>
                <div><Label>Check-out*</Label><Input type="date" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Adults</Label><Input type="number" value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))} /></div>
                <div><Label>Children</Label><Input type="number" value={form.children} onChange={e => setForm(f => ({ ...f, children: e.target.value }))} /></div>
                <div><Label>Rooms</Label><Input type="number" value={form.rooms_count} onChange={e => setForm(f => ({ ...f, rooms_count: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room Type</Label>
                  <Select value={form.room_type_id} onValueChange={v => setForm(f => ({ ...f, room_type_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{roomTypes?.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name} - ₹{r.base_price}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Total Amount</Label><Input type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} /></div>
              </div>
              <div><Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["cash", "card", "upi", "payathotel"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Special Requests</Label><Textarea value={form.special_requests} onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={insert.isPending}>Create Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "checked_in", "checked_out", "cancelled"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>{s === "all" ? "All" : s.replace("_", " ")}</Button>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking #</TableHead><TableHead>Guest</TableHead>
              <TableHead>Check-in</TableHead><TableHead>Check-out</TableHead>
              <TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-sm">{b.booking_number}</TableCell>
                <TableCell>{b.guest_first_name} {b.guest_last_name}</TableCell>
                <TableCell>{b.check_in}</TableCell><TableCell>{b.check_out}</TableCell>
                <TableCell>₹{b.total_amount}</TableCell>
                <TableCell><Badge className={statusColors[b.status] || ""}>{b.status?.replace("_", " ")}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {b.status === "pending" && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "confirmed")}>Confirm</DropdownMenuItem>}
                      {b.status === "confirmed" && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "checked_in")}>Check In</DropdownMenuItem>}
                      {b.status === "checked_in" && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "checked_out")}>Check Out</DropdownMenuItem>}
                      {["pending", "confirmed"].includes(b.status) && <DropdownMenuItem onClick={() => handleStatusChange(b.id, "cancelled")}>Cancel</DropdownMenuItem>}
                      <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(b.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
