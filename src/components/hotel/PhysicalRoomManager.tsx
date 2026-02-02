import { useState } from "react";
import { Hotel, RoomType, Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  DoorClosed,
  Key,
  Bed,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Wrench,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  ClipboardList,
  Thermometer,
  Wifi,
  Tv,
} from "lucide-react";
import { format, isToday } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PhysicalRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeId: string;
  hotelId: string;
  hotelName?: string;
  roomTypeName?: string;
  status: "available" | "occupied" | "dirty" | "cleaning" | "maintenance" | "blocked";
  keyCardNumber?: string;
  lastCleaned?: Date;
  notes?: string;
  currentBookingId?: string;
  amenities?: string[];
  lastInspection?: Date;
  minibarChecked?: boolean;
}

interface PhysicalRoomManagerProps {
  hotel: Hotel;
  bookings: Booking[];
  physicalRooms: PhysicalRoom[];
  onUpdateRooms: (rooms: PhysicalRoom[]) => void;
  onAssignRoom?: (bookingId: string, roomNumber: string, keyCard: string) => void;
  onReleaseRoom?: (roomId: string) => void;
}

const statusConfig: Record<PhysicalRoom["status"], { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  available: {
    label: "Available",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  occupied: {
    label: "Occupied",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <Users className="h-4 w-4" />,
  },
  dirty: {
    label: "Dirty",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  cleaning: {
    label: "Cleaning",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <Sparkles className="h-4 w-4" />,
  },
  maintenance: {
    label: "Maintenance",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <Wrench className="h-4 w-4" />,
  },
  blocked: {
    label: "Blocked",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    icon: <Lock className="h-4 w-4" />,
  },
};

export const PhysicalRoomManager = ({
  hotel,
  bookings,
  physicalRooms,
  onUpdateRooms,
  onAssignRoom,
  onReleaseRoom,
}: PhysicalRoomManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<PhysicalRoom | null>(null);
  const [selectedView, setSelectedView] = useState<"grid" | "floor">("grid");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    roomNumber: "",
    floor: 1,
    roomTypeId: "",
    keyCardNumber: "",
    notes: "",
  });

  const floors = [...new Set(physicalRooms.map((r) => r.floor))].sort((a, b) => a - b);

  const filteredRooms = physicalRooms.filter((room) => {
    const matchesSearch =
      searchQuery === "" ||
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesFloor = floorFilter === "all" || room.floor.toString() === floorFilter;
    const matchesRoomType = roomTypeFilter === "all" || room.roomTypeId === roomTypeFilter;
    return matchesSearch && matchesStatus && matchesFloor && matchesRoomType;
  });

  const getStatusCounts = () => {
    return {
      available: physicalRooms.filter((r) => r.status === "available").length,
      occupied: physicalRooms.filter((r) => r.status === "occupied").length,
      dirty: physicalRooms.filter((r) => r.status === "dirty").length,
      cleaning: physicalRooms.filter((r) => r.status === "cleaning").length,
      maintenance: physicalRooms.filter((r) => r.status === "maintenance").length,
      blocked: physicalRooms.filter((r) => r.status === "blocked").length,
    };
  };

  const statusCounts = getStatusCounts();

  const getRoomTypeName = (roomTypeId: string) => {
    return hotel.roomTypes.find((rt) => rt.id === roomTypeId)?.name || "Unknown";
  };

  const getCurrentGuest = (room: PhysicalRoom) => {
    if (!room.currentBookingId) return null;
    return bookings.find((b) => b.id === room.currentBookingId);
  };

  const handleAddRoom = () => {
    if (!formData.roomNumber || !formData.roomTypeId) {
      toast.error("Please fill all required fields");
      return;
    }

    const roomType = hotel.roomTypes.find((rt) => rt.id === formData.roomTypeId);

    const newRoom: PhysicalRoom = {
      id: `room-${Date.now()}`,
      roomNumber: formData.roomNumber,
      floor: formData.floor,
      roomTypeId: formData.roomTypeId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomTypeName: roomType?.name,
      status: "available",
      keyCardNumber: formData.keyCardNumber,
      notes: formData.notes,
    };

    onUpdateRooms([...physicalRooms, newRoom]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Room added successfully!");
  };

  const handleUpdateRoom = () => {
    if (!editingRoom) return;

    const updated = physicalRooms.map((r) =>
      r.id === editingRoom.id
        ? {
            ...r,
            roomNumber: formData.roomNumber,
            floor: formData.floor,
            roomTypeId: formData.roomTypeId,
            keyCardNumber: formData.keyCardNumber,
            notes: formData.notes,
          }
        : r
    );
    onUpdateRooms(updated);
    setEditingRoom(null);
    resetForm();
    toast.success("Room updated successfully!");
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = physicalRooms.find((r) => r.id === roomId);
    if (room?.status === "occupied") {
      toast.error("Cannot delete an occupied room");
      return;
    }
    onUpdateRooms(physicalRooms.filter((r) => r.id !== roomId));
    toast.success("Room deleted successfully!");
  };

  const handleStatusChange = (roomId: string, newStatus: PhysicalRoom["status"]) => {
    const updated = physicalRooms.map((r) =>
      r.id === roomId
        ? {
            ...r,
            status: newStatus,
            lastCleaned: newStatus === "available" ? new Date() : r.lastCleaned,
          }
        : r
    );
    onUpdateRooms(updated);
    toast.success(`Room status updated to ${statusConfig[newStatus].label}`);
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      floor: 1,
      roomTypeId: "",
      keyCardNumber: "",
      notes: "",
    });
  };

  const openEditDialog = (room: PhysicalRoom) => {
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeId: room.roomTypeId,
      keyCardNumber: room.keyCardNumber || "",
      notes: room.notes || "",
    });
    setEditingRoom(room);
  };

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all ${
              statusFilter === status ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${config.bgColor}`}>
                  <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                  <div className="text-xl font-bold">{statusCounts[status as keyof typeof statusCounts]}</div>
                  <div className="text-xs text-muted-foreground">{config.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>

          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor} value={floor.toString()}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {hotel.roomTypes.map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "grid" | "floor")}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="text-xs">Grid</TabsTrigger>
              <TabsTrigger value="floor" className="text-xs">By Floor</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Room Grid */}
      {selectedView === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredRooms.map((room) => {
            const config = statusConfig[room.status];
            const guest = getCurrentGuest(room);
            const roomType = getRoomTypeName(room.roomTypeId);

            return (
              <Card
                key={room.id}
                className={`relative overflow-hidden transition-all hover:shadow-md ${
                  room.status === "occupied" ? "border-blue-300" : ""
                }`}
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${config.bgColor.replace("100", "500").replace("/30", "")}`} />

                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DoorClosed className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-lg">{room.roomNumber}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(room)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {room.status !== "available" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "available")}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Mark Available
                          </DropdownMenuItem>
                        )}
                        {room.status === "occupied" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "dirty")}>
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                            Mark Dirty (Checkout)
                          </DropdownMenuItem>
                        )}
                        {room.status === "dirty" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "cleaning")}>
                            <Sparkles className="h-4 w-4 mr-2 text-yellow-600" />
                            Start Cleaning
                          </DropdownMenuItem>
                        )}
                        {room.status === "cleaning" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(room.id, "available")}>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Cleaning Done
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, "maintenance")}>
                          <Wrench className="h-4 w-4 mr-2 text-red-600" />
                          Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(room.id, "blocked")}>
                          <Lock className="h-4 w-4 mr-2" />
                          Block Room
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Badge className={`${config.bgColor} ${config.color} mb-2`}>
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <span className="truncate">{roomType}</span>
                    </div>
                    <div>Floor {room.floor}</div>
                    {room.keyCardNumber && (
                      <div className="flex items-center gap-1">
                        <Key className="h-3 w-3 text-primary" />
                        <span>{room.keyCardNumber}</span>
                      </div>
                    )}
                  </div>

                  {guest && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        <span className="font-medium truncate">
                          {guest.guestInfo.firstName} {guest.guestInfo.lastName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Out: {format(new Date(guest.checkOut), "MMM d")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Floor View */
        <div className="space-y-6">
          {floors.map((floor) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floor);
            if (floorRooms.length === 0) return null;

            return (
              <Card key={floor}>
                <CardHeader className="py-3 bg-muted/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DoorClosed className="h-4 w-4" />
                    Floor {floor}
                    <Badge variant="outline" className="ml-2">
                      {floorRooms.length} rooms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {floorRooms.map((room) => {
                      const config = statusConfig[room.status];
                      return (
                        <Badge
                          key={room.id}
                          variant="outline"
                          className={`${config.bgColor} ${config.color} cursor-pointer px-3 py-1.5`}
                          onClick={() => openEditDialog(room)}
                        >
                          {config.icon}
                          <span className="ml-1 font-bold">{room.roomNumber}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Room Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingRoom}
        onOpenChange={() => {
          setIsAddDialogOpen(false);
          setEditingRoom(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Number *</Label>
                <Input
                  placeholder="e.g., 101"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Floor *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <Label>Room Type *</Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(v) => setFormData({ ...formData, roomTypeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {hotel.roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Key Card Number</Label>
              <Input
                placeholder="e.g., KC-101"
                value={formData.keyCardNumber}
                onChange={(e) => setFormData({ ...formData, keyCardNumber: e.target.value })}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                placeholder="Any special notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingRoom(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={editingRoom ? handleUpdateRoom : handleAddRoom}
              >
                {editingRoom ? "Update Room" : "Add Room"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
