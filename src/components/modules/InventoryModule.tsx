import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Package } from "lucide-react";

export function InventoryModule() {
  const { currentHotelId } = useAuth();
  const { data: items, isLoading } = useTableQuery("inventory_items");
  const { insert, update, remove } = useTableMutation("inventory_items");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({ name: "", category: "general", sku: "", current_stock: "0", min_stock: "5", max_stock: "100", unit: "pieces", unit_cost: "0", supplier: "", location: "" });

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    try {
      await insert.mutateAsync({ ...form, current_stock: Number(form.current_stock), min_stock: Number(form.min_stock), max_stock: Number(form.max_stock), unit_cost: Number(form.unit_cost), hotel_id: currentHotelId });
      toast.success("Item added"); setIsDialogOpen(false);
      setForm({ name: "", category: "general", sku: "", current_stock: "0", min_stock: "5", max_stock: "100", unit: "pieces", unit_cost: "0", supplier: "", location: "" });
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name*</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["general", "toiletries", "linens", "cleaning", "food", "beverages", "office", "electronics"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Stock</Label><Input type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} /></div>
                <div><Label>Min</Label><Input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} /></div>
                <div><Label>Max</Label><Input type="number" value={form.max_stock} onChange={e => setForm(f => ({ ...f, max_stock: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Unit Cost</Label><Input type="number" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))} /></div>
                <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSubmit} className="w-full">Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead>
            <TableHead>Min/Max</TableHead><TableHead>Unit Cost</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {items?.map((item: any) => (
              <TableRow key={item.id} className={item.current_stock <= item.min_stock ? "bg-destructive/5" : ""}>
                <TableCell className="font-medium">{item.name}<br/><span className="text-xs text-muted-foreground">{item.sku}</span></TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className={item.current_stock <= item.min_stock ? "text-destructive font-bold" : ""}>{item.current_stock} {item.unit}</TableCell>
                <TableCell>{item.min_stock}/{item.max_stock}</TableCell>
                <TableCell>₹{item.unit_cost}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => { remove.mutateAsync(item.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {(!items || items.length === 0) && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No items</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
