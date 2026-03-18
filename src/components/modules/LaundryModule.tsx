import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, Shirt, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", pickup: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800", ready: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
};

export function LaundryModule() {
  const { currentHotelId } = useAuth();
  const { data: orders, isLoading } = useTableQuery("laundry_orders");
  const { insert, update, remove } = useTableMutation("laundry_orders");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({ room_number: "", guest_name: "", total_amount: "", is_express: false, notes: "" });

  const handleSubmit = async () => {
    if (!form.room_number || !form.guest_name) { toast.error("Room and guest name required"); return; }
    try {
      await insert.mutateAsync({ ...form, total_amount: Number(form.total_amount) || 0, hotel_id: currentHotelId, items: [] });
      toast.success("Order created"); setIsDialogOpen(false);
      setForm({ room_number: "", guest_name: "", total_amount: "", is_express: false, notes: "" });
    } catch {}
  };

  const nextStatus: Record<string, string> = { pending: "pickup", pickup: "processing", processing: "ready", ready: "delivered" };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Laundry Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Laundry Order</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Room Number*</Label><Input value={form.room_number} onChange={e => setForm(f => ({ ...f, room_number: e.target.value }))} /></div>
                <div><Label>Guest Name*</Label><Input value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} /></div>
              </div>
              <div><Label>Total Amount</Label><Input type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} /></div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full">Create Order</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders?.map((order: any) => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Shirt className="h-4 w-4 text-primary" />Room {order.room_number}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {nextStatus[order.status] && <DropdownMenuItem onClick={() => { update.mutateAsync({ id: order.id, status: nextStatus[order.status] }); toast.success("Updated"); }}>Move to {nextStatus[order.status]}</DropdownMenuItem>}
                    <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(order.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
              <p className="text-sm mt-2">{order.guest_name}</p>
              {order.total_amount > 0 && <p className="text-sm font-semibold">₹{order.total_amount}</p>}
              {order.is_express && <Badge variant="outline" className="mt-1">Express</Badge>}
            </CardContent>
          </Card>
        ))}
        {(!orders || orders.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">No orders</p>}
      </div>
    </div>
  );
}
