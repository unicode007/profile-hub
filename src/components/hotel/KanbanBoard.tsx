import { useState } from "react";
import { Booking, Hotel, RoomType } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  GripVertical,
  User,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle2,
  LogIn,
  LogOut,
  AlertCircle,
  XCircle,
  Bed,
  Key,
  Phone,
  Mail,
  Eye,
} from "lucide-react";
import { format, differenceInDays, isToday, isBefore, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanBoardProps {
  hotels: Hotel[];
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking["status"]) => void;
  onQuickBook?: () => void;
  onAssignRoom?: (booking: Booking) => void;
}

interface KanbanColumn {
  id: Booking["status"];
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  {
    id: "pending",
    title: "Pending",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    id: "confirmed",
    title: "Confirmed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: "checked-in",
    title: "Checked In",
    icon: <LogIn className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "checked-out",
    title: "Checked Out",
    icon: <LogOut className="h-4 w-4" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: "cancelled",
    title: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export const KanbanBoard = ({
  hotels,
  bookings,
  onViewBooking,
  onCheckIn,
  onCheckOut,
  onCancelBooking,
  onUpdateBookingStatus,
  onQuickBook,
  onAssignRoom,
}: KanbanBoardProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      searchQuery === "" ||
      b.guestInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesHotel = selectedHotel === "all" || b.hotelId === selectedHotel;
    
    return matchesSearch && matchesHotel;
  });

  const getBookingsForColumn = (status: Booking["status"]) => {
    return filteredBookings.filter((b) => b.status === status);
  };

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedBooking(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, columnId: Booking["status"]) => {
    e.preventDefault();
    if (draggedBooking && draggedBooking.status !== columnId) {
      // Validate status transitions
      const validTransitions: Record<Booking["status"], Booking["status"][]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["checked-in", "cancelled"],
        "checked-in": ["checked-out"],
        "checked-out": ["completed"],
        completed: [],
        cancelled: [],
      };

      if (validTransitions[draggedBooking.status]?.includes(columnId)) {
        if (columnId === "checked-in") {
          onCheckIn(draggedBooking.id);
        } else if (columnId === "checked-out") {
          onCheckOut(draggedBooking.id);
        } else if (columnId === "cancelled") {
          onCancelBooking?.(draggedBooking.id);
        } else {
          onUpdateBookingStatus?.(draggedBooking.id, columnId);
        }
        toast.success(`Booking moved to ${columnId}`);
      } else {
        toast.error(`Cannot move from ${draggedBooking.status} to ${columnId}`);
      }
    }
    setDraggedBooking(null);
    setDragOverColumn(null);
  };

  const getGuestInitials = (booking: Booking) => {
    return `${booking.guestInfo.firstName[0]}${booking.guestInfo.lastName[0]}`;
  };

  const getNights = (booking: Booking) => {
    return differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  };

  const isCheckInDue = (booking: Booking) => {
    return booking.status === "confirmed" && isToday(new Date(booking.checkIn));
  };

  const isCheckOutDue = (booking: Booking) => {
    return booking.status === "checked-in" && isToday(new Date(booking.checkOut));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            className="px-3 py-2 border rounded-md bg-background text-sm"
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
          >
            <option value="all">All Hotels</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={onQuickBook} className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {columns.map((col) => {
          const count = getBookingsForColumn(col.id).length;
          return (
            <Card key={col.id} className={`${col.bgColor}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={col.color}>{col.icon}</span>
                    <span className="text-sm font-medium">{col.title}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
        {columns.map((column) => {
          const columnBookings = getBookingsForColumn(column.id);
          const isDropTarget = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col rounded-lg border-2 transition-all ${
                isDropTarget
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/30"
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragLeave={() => setDragOverColumn(null)}
            >
              {/* Column Header */}
              <div className={`p-3 ${column.bgColor} rounded-t-lg border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={column.color}>{column.icon}</span>
                    <span className="font-semibold text-sm">{column.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {columnBookings.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {columnBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, booking)}
                      onDragEnd={handleDragEnd}
                      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                        draggedBooking?.id === booking.id ? "opacity-50" : ""
                      } ${
                        isCheckInDue(booking)
                          ? "ring-2 ring-green-500"
                          : isCheckOutDue(booking)
                          ? "ring-2 ring-purple-500"
                          : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            {/* Guest Info */}
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">
                                  {getGuestInitials(booking)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {booking.id}
                                </p>
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Bed className="h-3 w-3" />
                                <span className="truncate">{booking.roomName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(booking.checkIn), "MMM d")} -{" "}
                                  {format(new Date(booking.checkOut), "MMM d")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{getNights(booking)} night(s)</span>
                              </div>
                            </div>

                            {/* Room Number (if assigned) */}
                            {(booking as any).assignedRoom && (
                              <div className="mt-2 flex items-center gap-1 text-xs">
                                <Key className="h-3 w-3 text-primary" />
                                <span className="font-medium text-primary">
                                  Room {(booking as any).assignedRoom}
                                </span>
                              </div>
                            )}

                            {/* Due Badges */}
                            <div className="mt-2 flex gap-1">
                              {isCheckInDue(booking) && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                  Check-in Due
                                </Badge>
                              )}
                              {isCheckOutDue(booking) && (
                                <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                                  Check-out Due
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-semibold text-sm text-primary">
                                ₹{booking.totalAmount?.toLocaleString()}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onViewBooking(booking)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {booking.status === "confirmed" && (
                                    <DropdownMenuItem onClick={() => onAssignRoom?.(booking)}>
                                      <Key className="h-4 w-4 mr-2" />
                                      Assign Room
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status === "confirmed" && (
                                    <DropdownMenuItem onClick={() => onCheckIn(booking.id)}>
                                      <LogIn className="h-4 w-4 mr-2" />
                                      Check In
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status === "checked-in" && (
                                    <DropdownMenuItem onClick={() => onCheckOut(booking.id)}>
                                      <LogOut className="h-4 w-4 mr-2" />
                                      Check Out
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Phone className="h-4 w-4 mr-2" />
                                    {booking.guestInfo.phone}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    {booking.guestInfo.email}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnBookings.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No bookings
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
};
