import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Loader2, Search, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  stored: "bg-blue-100 text-blue-800", claimed: "bg-green-100 text-green-800",
  disposed: "bg-gray-100 text-gray-800", donated: "bg-purple-100 text-purple-800",
};

export function LostFoundModule() {
  const { currentHotelId } = useAuth();
  const { data: items, isLoading } = useTableQuery("lost_and_found");
  const { insert, update, remove } = useTableMutation("lost_and_found");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [form, setForm] = useState({ item_name: "", description: "", category: "other", location_found: "", found_by: "", storage_location: "" });

  const handleSubmit = async () => {
    if (!form.item_name) { toast.error("Item name required"); return; }
    try {
      await insert.mutateAsync({ ...form, hotel_id: currentHotelId });
      toast.success("Item logged"); setIsDialogOpen(false);
      setForm({ item_name: "", description: "", category: "other", location_found: "", found_by: "", storage_location: "" });
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Lost & Found</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Log Item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Found Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Item Name*</Label><Input value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Location Found</Label><Input value={form.location_found} onChange={e => setForm(f => ({ ...f, location_found: e.target.value }))} /></div>
                <div><Label>Found By</Label><Input value={form.found_by} onChange={e => setForm(f => ({ ...f, found_by: e.target.value }))} /></div>
              </div>
              <div><Label>Storage Location</Label><Input value={form.storage_location} onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full">Log Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: any) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base">{item.item_name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.status === "stored" && <DropdownMenuItem onClick={() => update.mutateAsync({ id: item.id, status: "claimed", claim_date: new Date().toISOString().split("T")[0] })}>Mark Claimed</DropdownMenuItem>}
                    {item.status === "stored" && <DropdownMenuItem onClick={() => update.mutateAsync({ id: item.id, status: "disposed" })}>Dispose</DropdownMenuItem>}
                    <DropdownMenuItem className="text-destructive" onClick={() => { remove.mutateAsync(item.id); toast.success("Deleted"); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
              {item.location_found && <p className="text-sm mt-2">Found at: {item.location_found}</p>}
              {item.found_date && <p className="text-sm text-muted-foreground">{item.found_date}</p>}
              {item.description && <p className="text-sm text-muted-foreground mt-1 truncate">{item.description}</p>}
            </CardContent>
          </Card>
        ))}
        {(!items || items.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">No items logged</p>}
      </div>
    </div>
  );
}
