import { useState } from "react";
import { RoomType, Hotel, Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bed,
  Eye,
  DoorClosed,
  Users,
  DollarSign,
  Settings,
  AlertTriangle,
  Calendar,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Wifi,
  Car,
  Utensils,
  Bath,
} from "lucide-react";
import { format, isWithinInterval, startOfDay, addDays } from "date-fns";
import { CalendarHoverCard } from "./CalendarHoverCard";

interface RoomTypeManagerProps {
  hotel: Hotel;
  bookings: Booking[];
  onUpdateHotel?: (hotel: Hotel) => void;
  onBlockRoom?: (roomTypeId: string, dates: Date[], reason: string) => void;
}

interface BlockedRoom {
  roomTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();
  if (lowerAmenity.includes("wifi") || lowerAmenity.includes("internet")) return Wifi;
  if (lowerAmenity.includes("parking") || lowerAmenity.includes("car")) return Car;
  if (lowerAmenity.includes("food") || lowerAmenity.includes("dining") || lowerAmenity.includes("breakfast")) return Utensils;
  if (lowerAmenity.includes("bath") || lowerAmenity.includes("shower")) return Bath;
  return null;
};

export const RoomTypeManager = ({
  hotel,
  bookings,
  onUpdateHotel,
  onBlockRoom,
}: RoomTypeManagerProps) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [blockedRooms, setBlockedRooms] = useState<BlockedRoom[]>([]);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockingRoom, setBlockingRoom] = useState<string | null>(null);
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [roomInventory, setRoomInventory] = useState<Record<string, number>>(
    hotel.roomTypes.reduce((acc, room) => ({ ...acc, [room.id]: 5 }), {})
  );

  const hotelBookings = bookings.filter((b) => b.hotelId === hotel.id && b.status !== "cancelled");

  const getRoomStats = (roomType: RoomType) => {
    const today = startOfDay(new Date());
    const todayBookings = hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      return b.roomName === roomType.name && isWithinInterval(today, {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
    });

    const totalRooms = roomInventory[roomType.id] || 5;
    const bookedRooms = todayBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
    const blockedCount = blockedRooms.filter(
      (br) => br.roomTypeId === roomType.id && isWithinInterval(today, {
        start: startOfDay(br.startDate),
        end: startOfDay(br.endDate),
      })
    ).length;
    const availableRooms = Math.max(0, totalRooms - bookedRooms - blockedCount);
    const occupancyRate = ((totalRooms - availableRooms) / totalRooms) * 100;

    const totalRevenue = hotelBookings
      .filter((b) => b.roomName === roomType.name)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const avgRate = roomType.plans.length > 0
      ? roomType.plans.reduce((sum, p) => sum + p.discountedPrice, 0) / roomType.plans.length
      : 0;

    return {
      totalRooms,
      bookedRooms,
      availableRooms,
      blockedCount,
      occupancyRate,
      totalRevenue,
      avgRate,
      todayBookings,
    };
  };

  const handleBlockRoom = () => {
    if (!blockingRoom || !blockStartDate || !blockEndDate || !blockReason) {
      toast.error("Please fill all fields");
      return;
    }

    const newBlock: BlockedRoom = {
      roomTypeId: blockingRoom,
      startDate: new Date(blockStartDate),
      endDate: new Date(blockEndDate),
      reason: blockReason,
    };

    setBlockedRooms([...blockedRooms, newBlock]);
    onBlockRoom?.(blockingRoom, [newBlock.startDate], blockReason);
    setBlockDialogOpen(false);
    setBlockingRoom(null);
    setBlockStartDate("");
    setBlockEndDate("");
    setBlockReason("");
    toast.success("Room blocked successfully!");
  };

  const handleUnblockRoom = (index: number) => {
    const updatedBlocks = blockedRooms.filter((_, i) => i !== index);
    setBlockedRooms(updatedBlocks);
    toast.success("Room unblocked successfully!");
  };

  const updateRoomInventory = (roomId: string, count: number) => {
    if (count < 1) return;
    setRoomInventory({ ...roomInventory, [roomId]: count });
    toast.success("Room inventory updated!");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <DoorClosed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{hotel.roomTypes.length}</div>
                <div className="text-sm text-muted-foreground">Room Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <Bed className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(roomInventory).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Rooms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {hotel.roomTypes.reduce((sum, r) => sum + getRoomStats(r).bookedRooms, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Occupied Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{blockedRooms.length}</div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Types Grid */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              Room Types
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Room Type
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.roomTypes.map((room) => {
              const stats = getRoomStats(room);
              const isLowAvailability = stats.availableRooms <= 1;

              return (
                <CalendarHoverCard key={room.id} roomType={room}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      isLowAvailability ? "border-orange-300" : "border-transparent"
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{room.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {room.size} • {room.view}
                          </p>
                        </div>
                        {isLowAvailability && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Occupancy</span>
                            <span className="font-medium">{stats.occupancyRate.toFixed(0)}%</span>
                          </div>
                          <Progress value={stats.occupancyRate} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            <div className="text-lg font-bold text-green-600">{stats.availableRooms}</div>
                            <div className="text-xs text-muted-foreground">Available</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                            <div className="text-lg font-bold text-blue-600">{stats.bookedRooms}</div>
                            <div className="text-xs text-muted-foreground">Booked</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                            <div className="text-lg font-bold text-orange-600">{stats.blockedCount}</div>
                            <div className="text-xs text-muted-foreground">Blocked</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Avg Rate: </span>
                            <span className="font-medium">₹{stats.avgRate.toLocaleString()}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CalendarHoverCard>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Rooms */}
      {blockedRooms.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Lock className="h-5 w-5" />
              Blocked Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {blockedRooms.map((block, index) => {
                const room = hotel.roomTypes.find((r) => r.id === block.roomTypeId);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{room?.name || "Unknown Room"}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(block.startDate, "MMM d")} - {format(block.endDate, "MMM d, yyyy")}
                        <span className="mx-2">•</span>
                        {block.reason}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblockRoom(index)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Unlock className="h-4 w-4 mr-1" />
                      Unblock
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block Room Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Room Type</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-background"
                value={blockingRoom || ""}
                onChange={(e) => setBlockingRoom(e.target.value)}
              >
                <option value="">Select room type</option>
                {hotel.roomTypes.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                placeholder="e.g., Maintenance, Renovation"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <Button onClick={handleBlockRoom} className="w-full">
              Block Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Detail Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-primary" />
                  {selectedRoom.name}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pt-4">
                  {/* Room Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{selectedRoom.size}</div>
                      <div className="text-xs text-muted-foreground">Size</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{selectedRoom.view}</div>
                      <div className="text-xs text-muted-foreground">View</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{selectedRoom.bedCount} {selectedRoom.bedType}</div>
                      <div className="text-xs text-muted-foreground">Bed</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{selectedRoom.bathrooms}</div>
                      <div className="text-xs text-muted-foreground">Bathrooms</div>
                    </div>
                  </div>

                  {/* Inventory Control */}
                  <div className="p-4 border rounded-lg">
                    <Label className="mb-2 block">Room Inventory</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateRoomInventory(selectedRoom.id, (roomInventory[selectedRoom.id] || 5) - 1)}
                      >
                        -
                      </Button>
                      <div className="text-2xl font-bold w-16 text-center">
                        {roomInventory[selectedRoom.id] || 5}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateRoomInventory(selectedRoom.id, (roomInventory[selectedRoom.id] || 5) + 1)}
                      >
                        +
                      </Button>
                      <span className="text-muted-foreground">total rooms</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {selectedRoom.amenities.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.amenities.map((amenity) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <Badge key={amenity} variant="secondary" className="gap-1">
                              {Icon && <Icon className="h-3 w-3" />}
                              {amenity}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Pricing Plans */}
                  <div>
                    <Label className="mb-2 block">Pricing Plans</Label>
                    <div className="space-y-2">
                      {selectedRoom.plans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {plan.features.slice(0, 2).join(" • ")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">
                              ₹{plan.discountedPrice.toLocaleString()}
                            </div>
                            {plan.originalPrice > plan.discountedPrice && (
                              <div className="text-xs text-muted-foreground line-through">
                                ₹{plan.originalPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setBlockingRoom(selectedRoom.id);
                        setSelectedRoom(null);
                        setBlockDialogOpen(true);
                      }}
                    >
                      <Lock className="h-4 w-4" />
                      Block Rooms
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Room
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
