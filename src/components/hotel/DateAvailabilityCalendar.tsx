import { useState, useMemo } from "react";
import { Booking, Hotel } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Users,
  Bed,
  DollarSign,
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
  getDay,
  isBefore,
  isToday,
} from "date-fns";

interface DateAvailabilityCalendarProps {
  hotel: Hotel;
  bookings: Booking[];
  onSelectDate?: (date: Date, availableRooms: number) => void;
}

export const DateAvailabilityCalendar = ({
  hotel,
  bookings,
  onSelectDate,
}: DateAvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = startOfDay(new Date());
  const startDay = getDay(monthStart);

  const hotelBookings = bookings.filter((b) => b.hotelId === hotel.id && b.status !== "cancelled");

  const totalRooms = useMemo(() => {
    if (selectedRoomType === "all") {
      // Assume 5 rooms per room type if not specified
      return hotel.roomTypes.length * 5;
    }
    return 5; // Default rooms per type
  }, [hotel.roomTypes, selectedRoomType]);

  const getBookedRoomsForDay = (date: Date) => {
    return hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      const isInRange = isWithinInterval(startOfDay(date), {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
      if (selectedRoomType !== "all") {
        const room = hotel.roomTypes.find((r) => r.id === selectedRoomType);
        return isInRange && b.roomName === room?.name;
      }
      return isInRange;
    }).reduce((sum, b) => sum + (b.rooms || 1), 0);
  };

  const getAvailabilityStatus = (date: Date) => {
    const booked = getBookedRoomsForDay(date);
    const available = totalRooms - booked;
    const percentage = (available / totalRooms) * 100;
    
    if (percentage === 0) return { status: "full", available, color: "bg-destructive/20 text-destructive" };
    if (percentage <= 25) return { status: "low", available, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
    if (percentage <= 50) return { status: "medium", available, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { status: "high", available, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    setSelectedDate(date);
    const { available } = getAvailabilityStatus(date);
    onSelectDate?.(date, available);
  };

  const selectedDateInfo = selectedDate ? {
    ...getAvailabilityStatus(selectedDate),
    bookings: hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      return isWithinInterval(startOfDay(selectedDate), {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
    }),
  } : null;

  const monthStats = useMemo(() => {
    let totalRevenue = 0;
    let totalBookings = 0;
    let occupiedNights = 0;

    daysInMonth.forEach((day) => {
      const booked = getBookedRoomsForDay(day);
      occupiedNights += booked;
    });

    hotelBookings.forEach((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      if (checkIn >= monthStart && checkIn <= monthEnd) {
        totalRevenue += b.totalAmount || 0;
        totalBookings += 1;
      }
    });

    const avgOccupancy = (occupiedNights / (daysInMonth.length * totalRooms)) * 100;

    return { totalRevenue, totalBookings, avgOccupancy };
  }, [daysInMonth, hotelBookings, totalRooms, monthStart, monthEnd]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle>Date Availability</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Room type" />
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
                <div className="w-36 text-center font-medium">
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
        </CardHeader>
        <CardContent className="pt-6">
          {/* Month Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{monthStats.totalBookings}</div>
              <div className="text-sm text-muted-foreground">Bookings</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">₹{monthStats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{monthStats.avgOccupancy.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg Occupancy</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30" />
              <span>High Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/20" />
              <span>Sold Out</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}
            
            {daysInMonth.map((day) => {
              const isPast = isBefore(day, today);
              const { status, available, color } = getAvailabilityStatus(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`h-20 p-1 border rounded-lg cursor-pointer transition-all ${
                    isPast ? "opacity-40 cursor-not-allowed bg-muted" : color
                  } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""} ${
                    isToday(day) ? "border-primary border-2" : "border-border"
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {!isPast && (
                      <div className="mt-auto text-xs">
                        <span className="font-medium">{available}</span>
                        <span className="text-muted-foreground"> left</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Bed className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.available}</div>
                  <div className="text-sm text-muted-foreground">Available Rooms</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.bookings.length}</div>
                  <div className="text-sm text-muted-foreground">Active Bookings</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge className={selectedDateInfo.color}>
                  {selectedDateInfo.status === "full" && "Sold Out"}
                  {selectedDateInfo.status === "low" && "Low Availability"}
                  {selectedDateInfo.status === "medium" && "Medium Availability"}
                  {selectedDateInfo.status === "high" && "High Availability"}
                </Badge>
              </div>
            </div>

            {selectedDateInfo.bookings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Guests on this date:</h4>
                {selectedDateInfo.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-medium">
                        {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </span>
                      <span className="text-muted-foreground ml-2">({booking.roomName})</span>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
