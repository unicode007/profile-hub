import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Bed,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Building2,
} from "lucide-react";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import { toast } from "sonner";

interface MyBookingsProps {
  onViewHotel?: (hotelId: string) => void;
}

export const MyBookings = ({ onViewHotel }: MyBookingsProps) => {
  const { bookings, cancelBooking } = useAuth();

  const upcomingBookings = bookings.filter(
    (b) => (b.status === "confirmed" || b.status === "pending") && isFuture(new Date(b.checkIn))
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || isPast(new Date(b.checkOut))
  );
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancel = (bookingId: string) => {
    cancelBooking(bookingId);
    toast.success("Booking cancelled successfully");
  };

  const BookingCard = ({ booking }: { booking: typeof bookings[0] }) => {
    const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
    const canCancel = booking.status === "confirmed" || booking.status === "pending";

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          {/* Hotel Image */}
          <div className="md:w-1/4 h-40 md:h-auto relative">
            {booking.hotelImage ? (
              <img
                src={booking.hotelImage}
                alt={booking.hotelName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Booking Details */}
          <CardContent className="flex-1 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{booking.hotelName}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="h-3 w-3" /> {booking.hotelAddress}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <p className="font-medium">{format(new Date(booking.checkIn), "dd MMM")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-medium">{format(new Date(booking.checkOut), "dd MMM")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{nights} Night{nights > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium">
                        {booking.guests.adults}A{booking.guests.children > 0 && `, ${booking.guests.children}C`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{booking.roomName}</span>
                  <span className="text-xs text-muted-foreground">• {booking.planName}</span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm font-medium">{booking.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-primary">₹{booking.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-3 w-3" /> Voucher
                  </Button>
                  {canCancel && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your hotel reservations</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            Past
            {pastBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pastBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            Cancelled
            {cancelledBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">{cancelledBookings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No upcoming bookings. Start exploring hotels!" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No past bookings yet." />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState message="No cancelled bookings." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
