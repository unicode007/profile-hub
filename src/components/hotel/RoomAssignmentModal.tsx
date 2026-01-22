import { useState, useMemo } from "react";
import { Booking, Hotel, RoomType } from "./types";
import { PhysicalRoom } from "./PhysicalRoomManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  Key,
  DoorClosed,
  Bed,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

interface RoomAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  hotel: Hotel | null;
  physicalRooms: PhysicalRoom[];
  onAssignRoom: (bookingId: string, roomId: string, keyCard: string) => void;
  onCheckIn?: (bookingId: string) => void;
  mode: "assign" | "checkout";
  onUpdateRoomStatus?: (roomId: string, status: PhysicalRoom["status"]) => void;
}

export const RoomAssignmentModal = ({
  isOpen,
  onClose,
  booking,
  hotel,
  physicalRooms,
  onAssignRoom,
  onCheckIn,
  mode,
  onUpdateRoomStatus,
}: RoomAssignmentModalProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [keyCardNumber, setKeyCardNumber] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [roomCondition, setRoomCondition] = useState<"clean" | "dirty" | "maintenance">("dirty");
  const [minibarChecked, setMinibarChecked] = useState(false);
  const [minibarCharges, setMinibarCharges] = useState("");

  // Get matching room type for the booking
  const matchingRoomType = useMemo(() => {
    if (!booking || !hotel) return null;
    return hotel.roomTypes.find((rt) => rt.name === booking.roomName);
  }, [booking, hotel]);

  // Get available rooms of the matching type
  const availableRooms = useMemo(() => {
    if (!matchingRoomType) return [];
    return physicalRooms.filter(
      (r) => r.roomTypeId === matchingRoomType.id && r.status === "available"
    );
  }, [physicalRooms, matchingRoomType]);

  // Get current room for checkout
  const currentRoom = useMemo(() => {
    if (mode !== "checkout" || !booking) return null;
    return physicalRooms.find((r) => r.currentBookingId === booking.id);
  }, [physicalRooms, booking, mode]);

  const handleAssign = () => {
    if (!booking || !selectedRoomId) {
      toast.error("Please select a room");
      return;
    }

    const selectedRoom = physicalRooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) return;

    onAssignRoom(booking.id, selectedRoomId, keyCardNumber || `KC-${selectedRoom.roomNumber}`);
    
    if (onCheckIn) {
      onCheckIn(booking.id);
    }

    toast.success(`Room ${selectedRoom.roomNumber} assigned and guest checked in!`);
    handleClose();
  };

  const handleCheckout = () => {
    if (!booking || !currentRoom) return;

    // Update room status based on condition
    const newStatus: PhysicalRoom["status"] = 
      roomCondition === "clean" ? "available" :
      roomCondition === "maintenance" ? "maintenance" : "dirty";
    
    onUpdateRoomStatus?.(currentRoom.id, newStatus);

    toast.success(`Guest checked out. Room marked as ${newStatus}.`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedRoomId("");
    setKeyCardNumber("");
    setCheckoutNotes("");
    setRoomCondition("dirty");
    setMinibarChecked(false);
    setMinibarCharges("");
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "assign" ? (
              <>
                <Key className="h-5 w-5 text-primary" />
                Room Assignment & Check-in
              </>
            ) : (
              <>
                <DoorClosed className="h-5 w-5 text-primary" />
                Check-out & Room Status
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest & Booking Info */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Guest</span>
                  </div>
                  <p className="font-semibold">
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {booking.guestInfo.phone}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Stay</span>
                  </div>
                  <p className="font-semibold">
                    {format(new Date(booking.checkIn), "MMM d")} - {format(new Date(booking.checkOut), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Room Type</span>
                  </div>
                  <p className="font-semibold">{booking.roomName}</p>
                  <p className="text-sm text-muted-foreground">{booking.planName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Payment</span>
                  </div>
                  <p className="font-semibold">₹{booking.totalAmount?.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {booking.paymentMethod}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {mode === "assign" ? (
            <>
              {/* Available Rooms */}
              <div>
                <Label className="mb-3 block">Select Available Room</Label>
                {availableRooms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p>No available rooms of type "{booking.roomName}"</p>
                    <p className="text-sm">Please check room inventory or upgrade guest</p>
                  </div>
                ) : (
                  <ScrollArea className="h-48">
                    <RadioGroup value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <div className="space-y-2">
                        {availableRooms.map((room) => (
                          <Card
                            key={room.id}
                            className={`cursor-pointer transition-all ${
                              selectedRoomId === room.id
                                ? "ring-2 ring-primary border-primary"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedRoomId(room.id)}
                          >
                            <CardContent className="p-3 flex items-center gap-3">
                              <RadioGroupItem value={room.id} id={room.id} />
                              <DoorClosed className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg">{room.roomNumber}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Floor {room.floor}
                                  </Badge>
                                </div>
                                {room.lastCleaned && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Cleaned: {format(new Date(room.lastCleaned), "MMM d, h:mm a")}
                                  </p>
                                )}
                              </div>
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </RadioGroup>
                  </ScrollArea>
                )}
              </div>

              {/* Key Card */}
              <div>
                <Label>Key Card Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., KC-101 (auto-generated if empty)"
                    value={keyCardNumber}
                    onChange={(e) => setKeyCardNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Current Room Info */}
              {currentRoom && (
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <DoorClosed className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-bold text-lg">Room {currentRoom.roomNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Floor {currentRoom.floor} • Key: {currentRoom.keyCardNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Condition */}
              <div>
                <Label className="mb-3 block">Room Condition After Checkout</Label>
                <RadioGroup value={roomCondition} onValueChange={(v) => setRoomCondition(v as typeof roomCondition)}>
                  <div className="grid grid-cols-3 gap-3">
                    <Card
                      className={`cursor-pointer ${
                        roomCondition === "clean" ? "ring-2 ring-green-500" : ""
                      }`}
                      onClick={() => setRoomCondition("clean")}
                    >
                      <CardContent className="p-3 text-center">
                        <RadioGroupItem value="clean" className="sr-only" />
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-600" />
                        <p className="text-sm font-medium">Clean</p>
                        <p className="text-xs text-muted-foreground">Ready for next guest</p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer ${
                        roomCondition === "dirty" ? "ring-2 ring-orange-500" : ""
                      }`}
                      onClick={() => setRoomCondition("dirty")}
                    >
                      <CardContent className="p-3 text-center">
                        <RadioGroupItem value="dirty" className="sr-only" />
                        <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                        <p className="text-sm font-medium">Needs Cleaning</p>
                        <p className="text-xs text-muted-foreground">Send to housekeeping</p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer ${
                        roomCondition === "maintenance" ? "ring-2 ring-red-500" : ""
                      }`}
                      onClick={() => setRoomCondition("maintenance")}
                    >
                      <CardContent className="p-3 text-center">
                        <RadioGroupItem value="maintenance" className="sr-only" />
                        <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-600" />
                        <p className="text-sm font-medium">Maintenance</p>
                        <p className="text-xs text-muted-foreground">Requires repairs</p>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Minibar Charges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="minibar"
                    checked={minibarChecked}
                    onChange={(e) => setMinibarChecked(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="minibar">Minibar Checked</Label>
                </div>
                {minibarChecked && (
                  <div className="flex items-center gap-2">
                    <Label>Additional Charges:</Label>
                    <Input
                      type="number"
                      placeholder="₹0"
                      value={minibarCharges}
                      onChange={(e) => setMinibarCharges(e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label>Checkout Notes</Label>
                <Input
                  placeholder="Any observations or issues..."
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {mode === "assign" ? (
            <Button
              onClick={handleAssign}
              disabled={!selectedRoomId}
              className="gap-2"
            >
              <Key className="h-4 w-4" />
              Assign Room & Check In
            </Button>
          ) : (
            <Button onClick={handleCheckout} className="gap-2">
              <DoorClosed className="h-4 w-4" />
              Complete Checkout
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
