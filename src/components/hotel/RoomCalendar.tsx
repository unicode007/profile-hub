import { useState, useMemo } from "react";
import { Booking, Hotel, RoomType } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarHoverCard } from "./CalendarHoverCard";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Bed,
  Users,
  DollarSign,
  Plus,
  Eye,
  GripVertical,
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
  onQuickBook?: (date: Date, roomType: RoomType) => void;
  viewDensity?: "compact" | "comfortable";
}

export const RoomCalendar = ({
  hotel,
  bookings,
  onMoveBooking,
  onViewBooking,
  onQuickBook,
  viewDensity = "comfortable",
}: RoomCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = startOfDay(new Date());

  const hotelBookings = bookings.filter((b) => b.hotelId === hotel.id);

  // Calculate summary stats
  const monthStats = useMemo(() => {
    const activeBookings = hotelBookings.filter(b => b.status !== "cancelled");
    const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalGuests = activeBookings.reduce((sum, b) => sum + b.guests.adults + b.guests.children, 0);
    const occupiedNights = daysInMonth.reduce((sum, day) => {
      const dayBookings = activeBookings.filter((b) => {
        const checkIn = startOfDay(new Date(b.checkIn));
        const checkOut = startOfDay(new Date(b.checkOut));
        return isWithinInterval(startOfDay(day), {
          start: checkIn,
          end: addDays(checkOut, -1),
        });
      });
      return sum + dayBookings.length;
    }, 0);
    const totalPossibleNights = daysInMonth.length * hotel.roomTypes.length * 5;
    const avgOccupancy = (occupiedNights / totalPossibleNights) * 100;
    
    return { activeBookings: activeBookings.length, totalRevenue, totalGuests, avgOccupancy };
  }, [hotelBookings, daysInMonth, hotel.roomTypes.length]);

  const getBookingsForRoom = (roomName: string) => {
    return hotelBookings.filter((b) => b.roomName === roomName);
  };

  const getBookingsForDay = (date: Date, roomName?: string) => {
    return hotelBookings.filter((b) => {
      if (b.status === "cancelled") return false;
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

  const getBookingPosition = (booking: Booking, day: Date) => {
    const checkIn = startOfDay(new Date(booking.checkIn));
    const checkOut = startOfDay(new Date(booking.checkOut));
    const currentDay = startOfDay(day);
    
    const isStart = isSameDay(checkIn, currentDay);
    const isEnd = isSameDay(addDays(checkOut, -1), currentDay);
    const isMiddle = !isStart && !isEnd;
    
    return { isStart, isEnd, isMiddle };
  };

  const getBookingColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500 hover:bg-blue-600";
      case "checked-in":
        return "bg-green-500 hover:bg-green-600";
      case "checked-out":
        return "bg-gray-400 hover:bg-gray-500";
      case "cancelled":
        return "bg-red-400 hover:bg-red-500";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "completed":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const handleDragStart = (booking: Booking, dayIndex: number) => {
    setDraggedBooking(booking);
    const checkInDay = startOfDay(new Date(booking.checkIn)).getDate();
    setDragOffset(dayIndex - checkInDay + 1);
  };

  const handleDrop = (day: Date, roomName: string) => {
    if (draggedBooking && onMoveBooking && draggedBooking.roomName === roomName) {
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

  const cellHeight = viewDensity === "compact" ? "h-10" : "h-14";
  const barHeight = viewDensity === "compact" ? "h-6" : "h-10";
  const fontSize = viewDensity === "compact" ? "text-[10px]" : "text-xs";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Room Availability Grid</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-[180px]">
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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-bold">{monthStats.activeBookings}</div>
                <div className="text-xs text-muted-foreground">Bookings</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-bold">₹{(monthStats.totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-muted-foreground">Revenue</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div>
                <div className="font-bold">{monthStats.totalGuests}</div>
                <div className="text-xs text-muted-foreground">Guests</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Bed className="h-4 w-4 text-orange-500" />
              <div>
                <div className="font-bold">{monthStats.avgOccupancy.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Occupancy</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Checked In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span>Checked Out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-400" />
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="border-r border-b p-2 text-left sticky left-0 bg-muted/50 z-20 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Room Type</span>
                  </div>
                </th>
                {daysInMonth.map((day) => {
                  const isToday = isSameDay(day, today);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <th
                      key={day.toISOString()}
                      className={`border-b p-1 text-center min-w-[36px] ${
                        isToday ? "bg-primary/20" : isWeekend ? "bg-muted/30" : ""
                      }`}
                    >
                      <div className={`font-medium ${fontSize}`}>{format(day, "d")}</div>
                      <div className={`text-muted-foreground font-normal ${fontSize}`}>
                        {format(day, "EEE")}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {roomsToShow.map((room) => {
                return (
                  <tr key={room.id} className="group">
                    <td className="border-r p-2 sticky left-0 bg-background z-10">
                      <CalendarHoverCard roomType={room}>
                        <div className="cursor-pointer hover:bg-muted/50 -m-2 p-2 rounded transition-colors">
                          <div className="font-medium text-sm">{room.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {room.bedCount} {room.bedType}
                          </div>
                        </div>
                      </CalendarHoverCard>
                    </td>
                    {daysInMonth.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDay(day, room.name);
                      const isBooked = dayBookings.length > 0;
                      const booking = dayBookings[0];
                      const isToday = isSameDay(day, today);
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      const cellKey = `${room.id}-${day.toISOString()}`;
                      const isHovered = hoveredCell === cellKey;
                      const position = booking ? getBookingPosition(booking, day) : null;

                      return (
                        <td
                          key={day.toISOString()}
                          className={`border-b p-0 ${cellHeight} relative transition-colors ${
                            isToday ? "bg-primary/10" : isWeekend ? "bg-muted/20" : ""
                          } ${isHovered && !isBooked ? "bg-primary/5" : ""}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(day, room.name)}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {isBooked && booking && booking.status !== "cancelled" && (
                            <CalendarHoverCard 
                              booking={booking} 
                              onViewBooking={onViewBooking}
                              side="bottom"
                            >
                              <div
                                className={`${barHeight} my-auto mx-0 cursor-pointer ${getBookingColor(booking.status)} transition-all flex items-center ${
                                  position?.isStart ? "ml-1 rounded-l-md" : ""
                                } ${position?.isEnd ? "mr-1 rounded-r-md" : ""}`}
                                draggable
                                onDragStart={() => handleDragStart(booking, dayIndex)}
                                onClick={() => onViewBooking?.(booking)}
                              >
                                {position?.isStart && (
                                  <div className={`px-1.5 text-white truncate flex items-center gap-1 h-full ${fontSize}`}>
                                    <GripVertical className="h-3 w-3 opacity-50" />
                                    <User className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{booking.guestInfo.firstName}</span>
                                  </div>
                                )}
                              </div>
                            </CalendarHoverCard>
                          )}
                          
                          {/* Quick book button on hover for empty cells */}
                          {!isBooked && isHovered && onQuickBook && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => onQuickBook(day, room)}
                            >
                              <Plus className="h-4 w-4 text-primary" />
                            </Button>
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