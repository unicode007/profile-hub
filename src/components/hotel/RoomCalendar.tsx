import { useState, useMemo } from "react";
import { Booking, Hotel, RoomType } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Bed,
  Info,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  startOfDay,
  addDays,
} from "date-fns";

interface RoomCalendarProps {
  hotel: Hotel;
  bookings: Booking[];
  onMoveBooking?: (bookingId: string, newCheckIn: Date, newCheckOut: Date) => void;
  onViewBooking?: (booking: Booking) => void;
}

export const RoomCalendar = ({
  hotel,
  bookings,
  onMoveBooking,
  onViewBooking,
}: RoomCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = startOfDay(new Date());

  const hotelBookings = bookings.filter((b) => b.hotelId === hotel.id);

  const getBookingsForRoom = (roomName: string) => {
    return hotelBookings.filter((b) => b.roomName === roomName);
  };

  const getBookingsForDay = (date: Date, roomName?: string) => {
    return hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      const isInRange = isWithinInterval(startOfDay(date), {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
      if (roomName) {
        return isInRange && b.roomName === roomName;
      }
      return isInRange;
    });
  };

  const getBookingColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500";
      case "checked-in":
        return "bg-green-500";
      case "checked-out":
        return "bg-gray-400";
      case "cancelled":
        return "bg-red-400";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-primary";
    }
  };

  const handleDragStart = (booking: Booking, dayIndex: number) => {
    setDraggedBooking(booking);
    const checkInDay = startOfDay(new Date(booking.checkIn)).getDate();
    setDragOffset(dayIndex - checkInDay + 1);
  };

  const handleDrop = (day: Date) => {
    if (draggedBooking && onMoveBooking) {
      const originalNights = Math.ceil(
        (new Date(draggedBooking.checkOut).getTime() - new Date(draggedBooking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const newCheckIn = addDays(day, -dragOffset);
      const newCheckOut = addDays(newCheckIn, originalNights);
      onMoveBooking(draggedBooking.id, newCheckIn, newCheckOut);
    }
    setDraggedBooking(null);
    setDragOffset(0);
  };

  const roomsToShow = selectedRoom === "all" 
    ? hotel.roomTypes 
    : hotel.roomTypes.filter((r) => r.id === selectedRoom);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Room Availability Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {hotel.roomTypes.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-32 text-center font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Checked In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>Checked Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span>Cancelled</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left sticky left-0 bg-muted z-10 min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Room Type
                  </div>
                </th>
                {daysInMonth.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`border p-1 text-center min-w-[40px] text-xs ${
                      isSameDay(day, today) ? "bg-primary/20" : ""
                    }`}
                  >
                    <div className="font-medium">{format(day, "d")}</div>
                    <div className="text-muted-foreground font-normal">
                      {format(day, "EEE")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roomsToShow.map((room) => {
                const roomBookings = getBookingsForRoom(room.name);
                return (
                  <tr key={room.id}>
                    <td className="border p-2 sticky left-0 bg-background z-10">
                      <div className="font-medium text-sm">{room.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {room.bedCount} {room.bedType}
                      </div>
                    </td>
                    {daysInMonth.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDay(day, room.name);
                      const isBooked = dayBookings.length > 0;
                      const booking = dayBookings[0];
                      const isCheckInDay = booking && isSameDay(startOfDay(new Date(booking.checkIn)), startOfDay(day));
                      const isCheckOutDay = booking && isSameDay(startOfDay(new Date(booking.checkOut)), startOfDay(addDays(day, 1)));

                      return (
                        <td
                          key={day.toISOString()}
                          className={`border p-0 h-12 relative ${
                            isSameDay(day, today) ? "bg-primary/10" : ""
                          }`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(day)}
                        >
                          {isBooked && booking && booking.status !== "cancelled" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-8 my-2 cursor-pointer ${getBookingColor(booking.status)} ${
                                    isCheckInDay ? "ml-1 rounded-l-md" : ""
                                  } ${isCheckOutDay ? "mr-1 rounded-r-md" : ""}`}
                                  draggable
                                  onDragStart={() => handleDragStart(booking, dayIndex)}
                                  onClick={() => onViewBooking?.(booking)}
                                >
                                  {isCheckInDay && (
                                    <div className="px-1 text-xs text-white truncate flex items-center gap-1 h-full">
                                      <User className="h-3 w-3" />
                                      {booking.guestInfo.firstName}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">
                                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                                  </p>
                                  <p className="text-xs">
                                    {format(new Date(booking.checkIn), "MMM d")} - {format(new Date(booking.checkOut), "MMM d")}
                                  </p>
                                  <p className="text-xs capitalize">Status: {booking.status}</p>
                                  <p className="text-xs">Booking: {booking.id}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
