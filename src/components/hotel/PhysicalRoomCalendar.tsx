import { useState, useMemo } from "react";
import { Hotel, Booking, RoomType } from "./types";
import { PhysicalRoom } from "./PhysicalRoomManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarHoverCard } from "./CalendarHoverCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  Bed,
  Eye,
  Building2,
  ArrowLeft,
  ArrowRight,
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
  differenceInDays,
  addWeeks,
  subWeeks,
} from "date-fns";

interface PhysicalRoomCalendarProps {
  hotel: Hotel;
  bookings: Booking[];
  physicalRooms: PhysicalRoom[];
  onViewBooking?: (booking: Booking) => void;
  onQuickBook?: (date: Date, room: PhysicalRoom) => void;
  onShowBookings?: (bookings: Booking[], title: string, subtitle?: string) => void;
  viewDensity?: "compact" | "comfortable";
}

export const PhysicalRoomCalendar = ({
  hotel,
  bookings,
  physicalRooms,
  onViewBooking,
  onQuickBook,
  onShowBookings,
  viewDensity = "comfortable",
}: PhysicalRoomCalendarProps) => {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return startOfDay(today);
  });
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Generate 30 days from start date
  const daysToShow = 30;
  const daysInView = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1),
  });

  const today = startOfDay(new Date());

  // Filter rooms by hotel
  const hotelRooms = physicalRooms.filter(
    (r) => r.hotelId === hotel.id
  );

  // Apply filters
  const filteredRooms = hotelRooms.filter((room) => {
    const matchesFloor = selectedFloor === "all" || room.floor.toString() === selectedFloor;
    const matchesType = selectedRoomType === "all" || room.roomTypeId === selectedRoomType;
    return matchesFloor && matchesType;
  });

  // Get unique floors
  const floors = [...new Set(hotelRooms.map((r) => r.floor))].sort((a, b) => a - b);

  // Hotel bookings only
  const hotelBookings = bookings.filter((b) => b.hotelId === hotel.id && b.status !== "cancelled");

  // Calculate room type booking counts
  const roomTypeStats = useMemo(() => {
    const stats: Record<string, { total: number; booked: number; occupancy: number }> = {};
    
    hotel.roomTypes.forEach((rt) => {
      const typeRooms = hotelRooms.filter((r) => r.roomTypeId === rt.id);
      const totalRooms = typeRooms.length;
      
      // Count bookings for this room type in current view
      const typeBookings = hotelBookings.filter((b) => b.roomName === rt.name);
      const bookedCount = typeBookings.length;
      
      // Calculate occupancy for current month
      let occupiedNights = 0;
      daysInView.forEach((day) => {
        typeBookings.forEach((b) => {
          const checkIn = startOfDay(new Date(b.checkIn));
          const checkOut = startOfDay(new Date(b.checkOut));
          if (
            isWithinInterval(startOfDay(day), {
              start: checkIn,
              end: addDays(checkOut, -1),
            })
          ) {
            occupiedNights++;
          }
        });
      });
      
      const totalPossibleNights = totalRooms * daysInView.length;
      const occupancy = totalPossibleNights > 0 ? (occupiedNights / totalPossibleNights) * 100 : 0;
      
      stats[rt.id] = { total: totalRooms, booked: bookedCount, occupancy };
    });
    
    return stats;
  }, [hotel.roomTypes, hotelRooms, hotelBookings, daysInView]);

  // Get booking for a specific room on a specific day
  const getBookingForRoomDay = (room: PhysicalRoom, date: Date) => {
    // Match bookings by room type name (since physical rooms map to room types)
    const roomType = hotel.roomTypes.find((rt) => rt.id === room.roomTypeId);
    if (!roomType) return null;

    return hotelBookings.find((b) => {
      if (b.roomName !== roomType.name) return false;
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      return isWithinInterval(startOfDay(date), {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
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
        return "bg-sky-400";
      case "checked-in":
        return "bg-emerald-400";
      case "checked-out":
        return "bg-gray-400";
      case "pending":
        return "bg-amber-400";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-primary";
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setStartDate((prev) =>
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const goToToday = () => {
    setStartDate(startOfDay(new Date()));
  };

  const cellHeight = viewDensity === "compact" ? "h-10" : "h-12";
  const barHeight = viewDensity === "compact" ? "h-6" : "h-8";
  const fontSize = viewDensity === "compact" ? "text-[10px]" : "text-xs";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Physical Room Grid</CardTitle>
              <Badge variant="outline" className="ml-2">
                {filteredRooms.length} Rooms
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filters */}
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="w-[120px]">
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

              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="w-[150px]">
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

              {/* Navigation */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="w-40 text-center font-medium text-sm">
                  {format(startDate, "dd MMM")} - {format(addDays(startDate, daysToShow - 1), "dd MMM yyyy")}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs ml-1"
                  onClick={goToToday}
                >
                  Today
                </Button>
              </div>
            </div>
          </div>

          {/* Room Type Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {hotel.roomTypes.map((rt) => {
              const stats = roomTypeStats[rt.id] || { total: 0, booked: 0, occupancy: 0 };
              return (
                <div
                  key={rt.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                    selectedRoomType === rt.id
                      ? "bg-primary/20 ring-1 ring-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                  onClick={() => setSelectedRoomType(selectedRoomType === rt.id ? "all" : rt.id)}
                >
                  <Bed className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{rt.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.booked} bookings · {stats.occupancy.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-sky-400" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-400" />
              <span>Checked In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span>Checked Out</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[900px]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background">
                <tr>
                  {/* Room Header */}
                  <th className="border-r border-b p-0 text-left sticky left-0 bg-muted/70 z-30 min-w-[80px]">
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        {format(startDate, "MMM yyyy")}
                      </div>
                      <div className="text-sm font-medium">Room</div>
                    </div>
                  </th>

                  {/* Date Headers */}
                  {daysInView.map((day) => {
                    const isToday = isSameDay(day, today);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isSaturday = day.getDay() === 6;

                    return (
                      <th
                        key={day.toISOString()}
                        className={`border-b p-0 text-center min-w-[36px] ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : isWeekend
                            ? "bg-muted/50"
                            : "bg-muted/30"
                        }`}
                      >
                        <div className="py-1.5 px-1">
                          <div
                            className={`text-[10px] uppercase font-semibold ${
                              isToday ? "" : "text-muted-foreground"
                            }`}
                          >
                            {format(day, "EEE")}
                          </div>
                          <div
                            className={`text-sm font-bold ${isToday ? "" : ""}`}
                          >
                            {format(day, "d")}
                          </div>
                          <div
                            className={`text-[9px] uppercase ${
                              isToday ? "" : "text-muted-foreground"
                            }`}
                          >
                            {format(day, "MMM")}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredRooms.map((room) => {
                  const roomType = hotel.roomTypes.find((rt) => rt.id === room.roomTypeId);
                  const maxOccupancy = roomType?.bedCount || 2;

                  return (
                    <tr key={room.id} className="group hover:bg-muted/20">
                      {/* Room Info Cell */}
                      <td className="border-r border-b p-0 sticky left-0 bg-background z-10 group-hover:bg-muted/20">
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{maxOccupancy}</span>
                          </div>
                          <div className="font-bold text-base">{room.roomNumber}</div>
                        </div>
                      </td>

                      {/* Day Cells */}
                      {daysInView.map((day) => {
                        const booking = getBookingForRoomDay(room, day);
                        const isToday = isSameDay(day, today);
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const cellKey = `${room.id}-${day.toISOString()}`;
                        const isHovered = hoveredCell === cellKey;

                        if (booking) {
                          const position = getBookingPosition(booking, day);

                          return (
                            <td
                              key={day.toISOString()}
                              className={`border-b p-0 ${cellHeight} relative ${
                                isWeekend && !isToday ? "bg-muted/10" : ""
                              }`}
                              onMouseEnter={() => setHoveredCell(cellKey)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <CalendarHoverCard
                                booking={booking}
                                onViewBooking={onViewBooking}
                                side="bottom"
                              >
                                <div
                                  className={`${barHeight} my-auto mx-0 cursor-pointer ${getBookingColor(
                                    booking.status
                                  )} transition-all flex items-center overflow-hidden ${
                                    position.isStart ? "ml-0.5 rounded-l-md" : ""
                                  } ${position.isEnd ? "mr-0.5 rounded-r-md" : ""}`}
                                  onClick={() => onViewBooking?.(booking)}
                                >
                                  {position.isStart && (
                                    <div
                                      className={`px-1.5 text-white truncate ${fontSize} whitespace-nowrap`}
                                    >
                                      {booking.guestInfo.firstName}
                                    </div>
                                  )}
                                </div>
                              </CalendarHoverCard>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={day.toISOString()}
                            className={`border-b p-0 ${cellHeight} relative transition-colors ${
                              isToday
                                ? "bg-primary/5"
                                : isWeekend
                                ? "bg-muted/10"
                                : ""
                            } ${isHovered ? "bg-primary/10" : ""}`}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => onQuickBook?.(day, room)}
                          >
                            {isHovered && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-30 hover:opacity-60 cursor-pointer">
                                <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center">
                                  <span className="text-[10px] text-primary">+</span>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {filteredRooms.length === 0 && (
                  <tr>
                    <td
                      colSpan={daysToShow + 1}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Bed className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div>No rooms found</div>
                      <div className="text-sm">Try adjusting your filters</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
