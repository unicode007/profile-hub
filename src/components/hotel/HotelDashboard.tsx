import { useState } from "react";
import { Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Search,
  Filter,
  Eye,
  Bed,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { format, isToday, isFuture, isPast, differenceInDays } from "date-fns";

interface HotelDashboardProps {
  bookings: Booking[];
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onViewBooking: (booking: Booking) => void;
}

export const HotelDashboard = ({
  bookings,
  onCheckIn,
  onCheckOut,
  onViewBooking,
}: HotelDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("today");

  // Filter bookings
  const todayCheckIns = bookings.filter(
    (b) =>
      isToday(new Date(b.checkIn)) &&
      (b.status === "confirmed" || b.status === "pending")
  );
  const todayCheckOuts = bookings.filter(
    (b) =>
      isToday(new Date(b.checkOut)) && b.status === "checked-in"
  );
  const currentGuests = bookings.filter((b) => b.status === "checked-in");
  const upcomingBookings = bookings.filter(
    (b) =>
      isFuture(new Date(b.checkIn)) &&
      (b.status === "confirmed" || b.status === "pending")
  );

  // Stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const occupancyRate = Math.round((currentGuests.length / 50) * 100); // Assuming 50 rooms

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; icon: JSX.Element }> = {
      confirmed: {
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      pending: {
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      "checked-in": {
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <LogIn className="h-3 w-3 mr-1" />,
      },
      "checked-out": {
        className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        icon: <LogOut className="h-3 w-3 mr-1" />,
      },
      cancelled: {
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };
    const style = styles[status] || styles.pending;
    return (
      <Badge className={style.className}>
        {style.icon}
        {status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.hotelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BookingRow = ({ booking }: { booking: Booking }) => {
    const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    const canCheckIn =
      (booking.status === "confirmed" || booking.status === "pending") &&
      !isPast(new Date(booking.checkOut));
    const canCheckOut = booking.status === "checked-in";

    return (
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-mono text-sm">{booking.id}</TableCell>
        <TableCell>
          <div>
            <p className="font-medium">
              {booking.guestInfo.firstName} {booking.guestInfo.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{booking.guestInfo.phone}</p>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{booking.roomName}</p>
            <p className="text-xs text-muted-foreground">{booking.planName}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <p>{format(new Date(booking.checkIn), "dd MMM")}</p>
            <p className="text-xs text-muted-foreground">to {format(new Date(booking.checkOut), "dd MMM")}</p>
          </div>
        </TableCell>
        <TableCell className="text-center">{nights}</TableCell>
        <TableCell>{getStatusBadge(booking.status)}</TableCell>
        <TableCell className="font-medium">₹{booking.totalAmount.toLocaleString()}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onViewBooking(booking)}>
              <Eye className="h-4 w-4" />
            </Button>
            {canCheckIn && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => onCheckIn(booking.id)}
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}
            {canCheckOut && (
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={() => onCheckOut(booking.id)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                <p className="text-3xl font-bold text-blue-600">{todayCheckIns.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-outs</p>
                <p className="text-3xl font-bold text-purple-600">{todayCheckOuts.length}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <LogOut className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Guests</p>
                <p className="text-3xl font-bold text-green-600">{currentGuests.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-3xl font-bold text-orange-600">{occupancyRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Bed className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-blue-600" /> Pending Check-ins
            </CardTitle>
            <Badge variant="secondary">{todayCheckIns.length}</Badge>
          </CardHeader>
          <CardContent>
            {todayCheckIns.length > 0 ? (
              <div className="space-y-3">
                {todayCheckIns.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.roomName} • {booking.rooms} Room
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onCheckIn(booking.id)}
                    >
                      Check In
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No pending check-ins for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's Check-outs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-purple-600" /> Pending Check-outs
            </CardTitle>
            <Badge variant="secondary">{todayCheckOuts.length}</Badge>
          </CardHeader>
          <CardContent>
            {todayCheckOuts.length > 0 ? (
              <div className="space-y-3">
                {todayCheckOuts.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.roomName} • Total: ₹{booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => onCheckOut(booking.id)}
                    >
                      Check Out
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No pending check-outs for today
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Nights</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...todayCheckIns, ...todayCheckOuts].map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                    {todayCheckIns.length === 0 && todayCheckOuts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No bookings for today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Nights</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                    {upcomingBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No upcoming bookings
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Nights</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                    {filteredBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
