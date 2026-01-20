import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hotel, RoomType, Booking } from "./types";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { Calendar, User, Bed, CreditCard, Plus, Minus } from "lucide-react";

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotels: Hotel[];
  selectedHotel?: Hotel;
  selectedDate?: Date;
  selectedRoom?: RoomType;
  onCreateBooking: (booking: Partial<Booking>) => void;
}

export const QuickBookingModal = ({
  isOpen,
  onClose,
  hotels,
  selectedHotel,
  selectedDate,
  selectedRoom,
  onCreateBooking,
}: QuickBookingModalProps) => {
  const [formData, setFormData] = useState({
    hotelId: selectedHotel?.id || "",
    roomId: selectedRoom?.id || "",
    checkIn: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    checkOut: selectedDate ? format(new Date(selectedDate.getTime() + 86400000), "yyyy-MM-dd") : format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adults: 2,
    children: 0,
    specialRequests: "",
  });

  const currentHotel = hotels.find((h) => h.id === formData.hotelId);
  const currentRoom = currentHotel?.roomTypes.find((r) => r.id === formData.roomId);

  const nights = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
  const basePrice = currentRoom?.plans?.[0]?.discountedPrice || currentRoom?.plans?.[0]?.originalPrice || 0;
  const totalAmount = basePrice * Math.max(nights, 1);

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.hotelId || !formData.roomId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (nights < 1) {
      toast.error("Check-out must be after check-in");
      return;
    }

    const newBooking: Partial<Booking> = {
      id: `BK${Date.now()}`,
      hotelId: formData.hotelId,
      hotelName: currentHotel?.name || "",
      hotelAddress: currentHotel?.location?.address || "",
      roomName: currentRoom?.name || "",
      planName: currentRoom?.plans?.[0]?.name || "Standard",
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      guests: {
        adults: formData.adults,
        children: formData.children,
      },
      rooms: 1,
      guestInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: "India",
      },
      totalAmount,
      status: "confirmed",
      paymentMethod: "pending",
      createdAt: new Date(),
    };

    onCreateBooking(newBooking);
    toast.success("Booking created successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Quick Booking
          </DialogTitle>
          <DialogDescription>
            Create a new reservation quickly from the calendar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hotel & Room Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hotel *</Label>
              <Select
                value={formData.hotelId}
                onValueChange={(value) => setFormData({ ...formData, hotelId: value, roomId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room Type *</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                disabled={!formData.hotelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {currentHotel?.roomTypes.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - ₹{room.plans?.[0]?.discountedPrice || room.plans?.[0]?.originalPrice || 0}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in *</Label>
              <Input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Check-out *</Label>
              <Input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn}
              />
            </div>
          </div>

          {/* Guest Info */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Guest Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Guests Count */}
          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Guests
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Adults</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{formData.adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFormData({ ...formData, adults: formData.adults + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Children</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFormData({ ...formData, children: Math.max(0, formData.children - 1) })}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{formData.children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setFormData({ ...formData, children: formData.children + 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          {currentRoom && nights > 0 && (
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4" />
                Price Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room Rate</span>
                  <span>₹{basePrice.toLocaleString()} × {nights} nights</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Calendar className="h-4 w-4" />
            Create Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
