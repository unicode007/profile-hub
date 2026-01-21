import { useState, useMemo } from "react";
import { Booking, Hotel } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarHoverCard } from "./CalendarHoverCard";
import { CalendarMiniStats } from "./CalendarMiniStats";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  AlertTriangle,
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
  onViewBooking?: (booking: Booking) => void;
}

export const DateAvailabilityCalendar = ({
  hotel,
  bookings,
  onSelectDate,
  onViewBooking,
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
      return hotel.roomTypes.length * 5;
    }
    return 5;
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

  const getCheckInsForDay = (date: Date) => {
    return hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      return isSameDay(checkIn, startOfDay(date));
    });
  };

  const getCheckOutsForDay = (date: Date) => {
    return hotelBookings.filter((b) => {
      const checkOut = startOfDay(new Date(b.checkOut));
      return isSameDay(checkOut, startOfDay(date));
    });
  };

  const getStayingGuestsForDay = (date: Date) => {
    return hotelBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      return isWithinInterval(startOfDay(date), {
        start: checkIn,
        end: addDays(checkOut, -1),
      });
    });
  };

  const getAvailabilityStatus = (date: Date) => {
    const booked = getBookedRoomsForDay(date);
    const available = totalRooms - booked;
    const percentage = (available / totalRooms) * 100;
    
    if (percentage === 0) return { status: "full", available, color: "bg-destructive/20 border-destructive/40 text-destructive" };
    if (percentage <= 25) return { status: "low", available, color: "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400" };
    if (percentage <= 50) return { status: "medium", available, color: "bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400" };
    return { status: "high", available, color: "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" };
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    setSelectedDate(date);
    const { available } = getAvailabilityStatus(date);
    onSelectDate?.(date, available);
  };

  const selectedDateInfo = selectedDate ? {
    ...getAvailabilityStatus(selectedDate),
    checkIns: getCheckInsForDay(selectedDate),
    checkOuts: getCheckOutsForDay(selectedDate),
    stayingGuests: getStayingGuestsForDay(selectedDate),
  } : null;

  const monthStats = useMemo(() => {
    let totalRevenue = 0;
    let totalBookings = 0;
    let occupiedNights = 0;
    let lowAvailabilityDays = 0;

    daysInMonth.forEach((day) => {
      const booked = getBookedRoomsForDay(day);
      occupiedNights += booked;
      const { status } = getAvailabilityStatus(day);
      if (status === "low" || status === "full") lowAvailabilityDays++;
    });

    hotelBookings.forEach((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      if (checkIn >= monthStart && checkIn <= monthEnd) {
        totalRevenue += b.totalAmount || 0;
        totalBookings += 1;
      }
    });

    const avgOccupancy = (occupiedNights / (daysInMonth.length * totalRooms)) * 100;

    return { totalRevenue, totalBookings, avgOccupancy, lowAvailabilityDays };
  }, [daysInMonth, hotelBookings, totalRooms, monthStart, monthEnd]);

  return (
    <div className="space-y-6">
      {/* Mini Stats */}
      <CalendarMiniStats 
        bookings={bookings} 
        hotel={hotel} 
        currentMonth={currentMonth} 
      />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle>Date Availability</CardTitle>
              {monthStats.lowAvailabilityDays > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {monthStats.lowAvailabilityDays} days low
                </Badge>
              )}
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
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800" />
              <span>High ({">"}50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-800" />
              <span>Medium (25-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-800" />
              <span>Low ({"<"}25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 bg-destructive/20 border-destructive/40" />
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
              <div key={`empty-${i}`} className="h-24" />
            ))}
            
            {daysInMonth.map((day) => {
              const isPast = isBefore(day, today);
              const { status, available, color } = getAvailabilityStatus(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const checkIns = getCheckInsForDay(day);
              const checkOuts = getCheckOutsForDay(day);
              const stayingGuests = getStayingGuestsForDay(day);
              const hasActivity = checkIns.length > 0 || checkOuts.length > 0;
              
              return (
                <CalendarHoverCard
                  key={day.toISOString()}
                  date={day}
                  hotel={hotel}
                  availableRooms={available}
                  totalRooms={totalRooms}
                  checkIns={checkIns}
                  checkOuts={checkOuts}
                  stayingGuests={stayingGuests}
                  onViewBooking={onViewBooking}
                >
                  <div
                    className={`h-24 p-1.5 border-2 rounded-lg cursor-pointer transition-all ${
                      isPast ? "opacity-40 cursor-not-allowed bg-muted border-muted" : color
                    } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""} ${
                      isToday(day) ? "border-primary" : ""
                    } hover:shadow-md`}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {hasActivity && (
                          <div className="flex gap-0.5">
                            {checkIns.length > 0 && (
                              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                                +{checkIns.length}
                              </Badge>
                            )}
                            {checkOuts.length > 0 && (
                              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">
                                -{checkOuts.length}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {!isPast && (
                        <div className="mt-auto">
                          <Progress 
                            value={((totalRooms - available) / totalRooms) * 100} 
                            className="h-1.5 mb-1" 
                          />
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium">{available} left</span>
                            {stayingGuests.length > 0 && (
                              <span className="text-muted-foreground">{stayingGuests.length} guests</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CalendarHoverCard>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <Badge className={selectedDateInfo.color}>
                {selectedDateInfo.status === "full" && "Sold Out"}
                {selectedDateInfo.status === "low" && "Low Availability"}
                {selectedDateInfo.status === "medium" && "Medium Availability"}
                {selectedDateInfo.status === "high" && "High Availability"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Bed className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.available}</div>
                  <div className="text-xs text-muted-foreground">Available Rooms</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.checkIns.length}</div>
                  <div className="text-xs text-muted-foreground">Check-ins</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.checkOuts.length}</div>
                  <div className="text-xs text-muted-foreground">Check-outs</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{selectedDateInfo.stayingGuests.length}</div>
                  <div className="text-xs text-muted-foreground">Staying</div>
                </div>
              </div>
            </div>

            {selectedDateInfo.stayingGuests.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Guests on this date:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {selectedDateInfo.stayingGuests.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewBooking?.(booking)}
                    >
                      <div>
                        <span className="font-medium">
                          {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                        </span>
                        <div className="text-xs text-muted-foreground">{booking.roomName}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
