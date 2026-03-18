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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, UtensilsCrossed, Trash2 } from "lucide-react";

export function RestaurantModule() {
  const { currentHotelId } = useAuth();
  const { data: orders, isLoading } = useTableQuery("restaurant_orders");
  const { data: menuItems } = useTableQuery("menu_items");
  const { insert: insertOrder, update: updateOrder, remove: removeOrder } = useTableMutation("restaurant_orders");
  const { insert: insertMenuItem, remove: removeMenuItem } = useTableMutation("menu_items");
  const [tab, setTab] = useState<"orders" | "menu">("orders");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [orderForm, setOrderForm] = useState({ table_number: "1", guest_name: "", room_number: "" });
  const [menuForm, setMenuForm] = useState({ name: "", price: "", description: "", is_veg: false });

  const handleCreateOrder = async () => {
    try {
      await insertOrder.mutateAsync({ ...orderForm, table_number: Number(orderForm.table_number), hotel_id: currentHotelId });
      toast.success("Order created"); setIsDialogOpen(false);
    } catch {}
  };

  const handleAddMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) { toast.error("Name and price required"); return; }
    try {
      await insertMenuItem.mutateAsync({ ...menuForm, price: Number(menuForm.price), hotel_id: currentHotelId });
      toast.success("Menu item added");
      setMenuForm({ name: "", price: "", description: "", is_veg: false });
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Restaurant & POS</h2>
        <div className="flex gap-2">
          <Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")}>Orders</Button>
          <Button variant={tab === "menu" ? "default" : "outline"} onClick={() => setTab("menu")}>Menu</Button>
        </div>
      </div>

      {tab === "orders" && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New Order</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Table Number</Label><Input type="number" value={orderForm.table_number} onChange={e => setOrderForm(f => ({ ...f, table_number: e.target.value }))} /></div>
                <div><Label>Guest Name</Label><Input value={orderForm.guest_name} onChange={e => setOrderForm(f => ({ ...f, guest_name: e.target.value }))} /></div>
                <div><Label>Room Number (optional)</Label><Input value={orderForm.room_number} onChange={e => setOrderForm(f => ({ ...f, room_number: e.target.value }))} /></div>
                <Button onClick={handleCreateOrder} className="w-full">Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Table</TableHead><TableHead>Guest</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders?.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell>Table {o.table_number}</TableCell>
                    <TableCell>{o.guest_name || "-"}</TableCell>
                    <TableCell>₹{o.total}</TableCell>
                    <TableCell><Badge>{o.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {o.status === "active" && <DropdownMenuItem onClick={() => updateOrder.mutateAsync({ id: o.id, status: "billed" })}>Bill</DropdownMenuItem>}
                          {o.status === "billed" && <DropdownMenuItem onClick={() => updateOrder.mutateAsync({ id: o.id, status: "paid" })}>Mark Paid</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => removeOrder.mutateAsync(o.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {tab === "menu" && (
        <>
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Add Menu Item</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="Item name" value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Price" type="number" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} />
              <Input placeholder="Description" value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} />
              <Button onClick={handleAddMenuItem}>Add Item</Button>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems?.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="font-bold text-primary mt-1">₹{item.price}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { removeMenuItem.mutateAsync(item.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
