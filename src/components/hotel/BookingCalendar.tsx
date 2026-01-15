import { useState, useMemo } from "react";
import { Booking, Hotel } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Clock,
  Users,
  LogIn,
  LogOut,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  getDay,
  isToday,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
} from "date-fns";

interface BookingCalendarProps {
  hotels: Hotel[];
  bookings: Booking[];
  onViewBooking?: (booking: Booking) => void;
}

export const BookingCalendar = ({
  hotels,
  bookings,
  onViewBooking,
}: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const today = startOfDay(new Date());
  const startDay = getDay(monthStart);

  const getBookingsForDay = (date: Date, type: "checkIn" | "checkOut" | "staying") => {
    return bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const checkIn = startOfDay(new Date(b.checkIn));
      const checkOut = startOfDay(new Date(b.checkOut));
      const day = startOfDay(date);

      switch (type) {
        case "checkIn":
          return isSameDay(checkIn, day);
        case "checkOut":
          return isSameDay(checkOut, day);
        case "staying":
          return day >= checkIn && day < checkOut;
        default:
          return false;
      }
    });
  };

  const getDayStats = (date: Date) => {
    const checkIns = getBookingsForDay(date, "checkIn");
    const checkOuts = getBookingsForDay(date, "checkOut");
    const staying = getBookingsForDay(date, "staying");
    const revenue = checkIns.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    return { checkIns, checkOuts, staying, revenue };
  };

  const monthlyStats = useMemo(() => {
    let totalCheckIns = 0;
    let totalCheckOuts = 0;
    let totalRevenue = 0;
    let peakOccupancy = 0;

    daysInMonth.forEach((day) => {
      const stats = getDayStats(day);
      totalCheckIns += stats.checkIns.length;
      totalCheckOuts += stats.checkOuts.length;
      totalRevenue += stats.revenue;
      peakOccupancy = Math.max(peakOccupancy, stats.staying.length);
    });

    return { totalCheckIns, totalCheckOuts, totalRevenue, peakOccupancy };
  }, [daysInMonth, bookings]);

  const selectedDayStats = getDayStats(selectedDate);

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "bg-blue-500 text-white";
      case "checked-in": return "bg-green-500 text-white";
      case "checked-out": return "bg-gray-500 text-white";
      case "pending": return "bg-yellow-500 text-white";
      case "completed": return "bg-purple-500 text-white";
      default: return "bg-muted";
    }
  };

  const renderDayCell = (day: Date, isLarge = false) => {
    const stats = getDayStats(day);
    const hasActivity = stats.checkIns.length > 0 || stats.checkOuts.length > 0;
    const isSelected = isSameDay(day, selectedDate);

    return (
      <div
        key={day.toISOString()}
        className={`${isLarge ? "min-h-32" : "h-24"} p-1 border rounded-lg cursor-pointer transition-all hover:border-primary ${
          isSelected ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : "bg-background"
        } ${isToday(day) ? "border-primary border-2" : "border-border"}`}
        onClick={() => setSelectedDate(day)}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : ""}`}>
              {format(day, "d")}
            </span>
            {hasActivity && (
              <div className="flex gap-1">
                {stats.checkIns.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 bg-green-100 text-green-700">
                    +{stats.checkIns.length}
                  </Badge>
                )}
                {stats.checkOuts.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 bg-red-100 text-red-700">
                    -{stats.checkOuts.length}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {isLarge && stats.staying.length > 0 && (
            <div className="mt-1 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1">
                  {stats.staying.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(booking.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewBooking?.(booking);
                      }}
                    >
                      {booking.guestInfo.firstName}
                    </div>
                  ))}
                  {stats.staying.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{stats.staying.length - 3} more
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {!isLarge && stats.staying.length > 0 && (
            <div className="mt-auto text-xs text-center text-muted-foreground">
              {stats.staying.length} guests
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <LogIn className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats.totalCheckIns}</div>
                <div className="text-sm text-muted-foreground">Check-ins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats.totalCheckOuts}</div>
                <div className="text-sm text-muted-foreground">Check-outs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">₹{(monthlyStats.totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{monthlyStats.peakOccupancy}</div>
                <div className="text-sm text-muted-foreground">Peak Guests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-primary" />
              <CardTitle>Booking Calendar</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week")}>
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
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
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {viewMode === "month" ? (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              {daysInMonth.map((day) => renderDayCell(day))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {daysInWeek.map((day) => renderDayCell(day, true))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
            <Badge variant="outline">{selectedDayStats.staying.length} guests staying</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="checkins">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="checkins" className="gap-2">
                <LogIn className="h-4 w-4" />
                Check-ins ({selectedDayStats.checkIns.length})
              </TabsTrigger>
              <TabsTrigger value="checkouts" className="gap-2">
                <LogOut className="h-4 w-4" />
                Check-outs ({selectedDayStats.checkOuts.length})
              </TabsTrigger>
              <TabsTrigger value="staying" className="gap-2">
                <Users className="h-4 w-4" />
                Staying ({selectedDayStats.staying.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checkins" className="mt-4">
              {selectedDayStats.checkIns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No check-ins scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayStats.checkIns.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() => onViewBooking?.(booking)}
                    >
                      <div>
                        <div className="font-medium">
                          {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.roomName} • {booking.hotelName}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {booking.guests.adults + booking.guests.children} guest{(booking.guests.adults + booking.guests.children) > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="checkouts" className="mt-4">
              {selectedDayStats.checkOuts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No check-outs scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayStats.checkOuts.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => onViewBooking?.(booking)}
                    >
                      <div>
                        <div className="font-medium">
                          {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.roomName} • {booking.hotelName}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          ₹{(booking.totalAmount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="staying" className="mt-4">
              {selectedDayStats.staying.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No guests staying
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayStats.staying.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                      onClick={() => onViewBooking?.(booking)}
                    >
                      <div>
                        <div className="font-medium">
                          {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.roomName} • {format(new Date(booking.checkIn), "MMM d")} - {format(new Date(booking.checkOut), "MMM d")}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {booking.hotelName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
