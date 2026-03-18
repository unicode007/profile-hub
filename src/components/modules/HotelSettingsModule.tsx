import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Loader2, Hotel, Trash2, Edit } from "lucide-react";

export function HotelSettingsModule() {
  const { currentHotelId, isAdmin } = useAuth();
  const { data: hotels, isLoading } = useTableQuery("hotels");
  const { data: roomTypes } = useTableQuery("room_types");
  const { insert: insertHotel, update: updateHotel, remove: removeHotel } = useTableMutation("hotels");
  const { insert: insertRoomType, remove: removeRoomType } = useTableMutation("room_types");
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false);

  const [hotelForm, setHotelForm] = useState({ name: "", address: "", city: "", state: "", phone: "", email: "", star_rating: "3", check_in_time: "14:00", check_out_time: "12:00", description: "" });
  const [roomTypeForm, setRoomTypeForm] = useState({ name: "", base_price: "", max_occupancy: "2", bed_type: "", total_rooms: "1", description: "" });

  const handleCreateHotel = async () => {
    if (!hotelForm.name) { toast.error("Hotel name required"); return; }
    try {
      await insertHotel.mutateAsync({ ...hotelForm, star_rating: Number(hotelForm.star_rating) });
      toast.success("Hotel created"); setIsHotelDialogOpen(false);
    } catch {}
  };

  const handleCreateRoomType = async () => {
    if (!roomTypeForm.name || !roomTypeForm.base_price) { toast.error("Name and price required"); return; }
    try {
      await insertRoomType.mutateAsync({
        ...roomTypeForm, hotel_id: currentHotelId,
        base_price: Number(roomTypeForm.base_price),
        max_occupancy: Number(roomTypeForm.max_occupancy),
        total_rooms: Number(roomTypeForm.total_rooms),
      });
      toast.success("Room type created"); setIsRoomTypeDialogOpen(false);
      setRoomTypeForm({ name: "", base_price: "", max_occupancy: "2", bed_type: "", total_rooms: "1", description: "" });
    } catch {}
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Hotel Settings</h2>

      {/* Hotels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hotels</h3>
          <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Hotel</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Hotel</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name*</Label><Input value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input value={hotelForm.city} onChange={e => setHotelForm(f => ({ ...f, city: e.target.value }))} /></div>
                  <div><Label>State</Label><Input value={hotelForm.state} onChange={e => setHotelForm(f => ({ ...f, state: e.target.value }))} /></div>
                </div>
                <div><Label>Address</Label><Input value={hotelForm.address} onChange={e => setHotelForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input value={hotelForm.phone} onChange={e => setHotelForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={hotelForm.email} onChange={e => setHotelForm(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Stars</Label><Input type="number" value={hotelForm.star_rating} onChange={e => setHotelForm(f => ({ ...f, star_rating: e.target.value }))} /></div>
                  <div><Label>Check-in</Label><Input value={hotelForm.check_in_time} onChange={e => setHotelForm(f => ({ ...f, check_in_time: e.target.value }))} /></div>
                  <div><Label>Check-out</Label><Input value={hotelForm.check_out_time} onChange={e => setHotelForm(f => ({ ...f, check_out_time: e.target.value }))} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))} /></div>
                <Button onClick={handleCreateHotel} className="w-full">Create Hotel</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotels?.map((h: any) => (
            <Card key={h.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-foreground">{h.name}</p>
                  <p className="text-sm text-muted-foreground">{h.city}, {h.state} • {"⭐".repeat(h.star_rating || 3)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { removeHotel.mutateAsync(h.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Room Types */}
      {currentHotelId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Room Types</h3>
            <Dialog open={isRoomTypeDialogOpen} onOpenChange={setIsRoomTypeDialogOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Room Type</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Room Type</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name*</Label><Input value={roomTypeForm.name} onChange={e => setRoomTypeForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Price*</Label><Input type="number" value={roomTypeForm.base_price} onChange={e => setRoomTypeForm(f => ({ ...f, base_price: e.target.value }))} /></div>
                    <div><Label>Max Occ.</Label><Input type="number" value={roomTypeForm.max_occupancy} onChange={e => setRoomTypeForm(f => ({ ...f, max_occupancy: e.target.value }))} /></div>
                    <div><Label>Total Rooms</Label><Input type="number" value={roomTypeForm.total_rooms} onChange={e => setRoomTypeForm(f => ({ ...f, total_rooms: e.target.value }))} /></div>
                  </div>
                  <div><Label>Bed Type</Label><Input value={roomTypeForm.bed_type} onChange={e => setRoomTypeForm(f => ({ ...f, bed_type: e.target.value }))} /></div>
                  <Button onClick={handleCreateRoomType} className="w-full">Create Room Type</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomTypes?.map((rt: any) => (
              <Card key={rt.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div><p className="font-semibold">{rt.name}</p><p className="text-sm text-muted-foreground">₹{rt.base_price}/night • {rt.total_rooms} rooms</p></div>
                    <Button variant="ghost" size="icon" onClick={() => { removeRoomType.mutateAsync(rt.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
