import { Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Bed,
  Users,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  ArrowRight,
  Eye,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface BookingPopupListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  title: string;
  subtitle?: string;
  onViewBooking?: (booking: Booking) => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
}

const statusConfig: Record<Booking["status"], { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  "checked-in": {
    label: "Checked In",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <LogIn className="h-4 w-4" />,
  },
  "checked-out": {
    label: "Checked Out",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    icon: <LogOut className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <XCircle className="h-4 w-4" />,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export const BookingPopupList = ({
  open,
  onOpenChange,
  bookings,
  title,
  subtitle,
  onViewBooking,
  onCheckIn,
  onCheckOut,
}: BookingPopupListProps) => {
  const getTotalAmount = () => {
    return bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  };

  const getGuestCount = () => {
    return bookings.reduce((sum, b) => sum + b.guests.adults + b.guests.children, 0);
  };

  const getRoomCount = () => {
    return bookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">{bookings.length}</div>
            <div className="text-xs text-muted-foreground">Bookings</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">{getRoomCount()}</div>
            <div className="text-xs text-muted-foreground">Rooms</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">{getGuestCount()}</div>
            <div className="text-xs text-muted-foreground">Guests</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold">₹{(getTotalAmount() / 1000).toFixed(1)}K</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
        </div>

        <Separator />

        {/* Booking List */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="space-y-3 pr-4">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No bookings found
              </div>
            ) : (
              bookings.map((booking) => {
                const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
                const config = statusConfig[booking.status];

                return (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold truncate">
                              {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                            </span>
                            <Badge className={`${config.bgColor} ${config.color}`}>
                              {config.icon}
                              <span className="ml-1">{config.label}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {booking.id}
                            </Badge>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Bed className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{booking.roomName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {booking.guests.adults}A
                                {booking.guests.children > 0 && ` + ${booking.guests.children}C`}
                                {booking.rooms > 1 && ` • ${booking.rooms} rooms`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {format(new Date(booking.checkIn), "MMM d")} →{" "}
                                {format(new Date(booking.checkOut), "MMM d")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{nights} night{nights !== 1 ? "s" : ""}</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {booking.guestInfo.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {booking.guestInfo.email}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t">
                            <div className="flex items-center gap-1 text-sm">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">₹{booking.totalAmount?.toLocaleString()}</span>
                              <span className="text-muted-foreground">• {booking.paymentMethod}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {onViewBooking && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                onViewBooking(booking);
                                onOpenChange(false);
                              }}
                              className="gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          )}
                          {booking.status === "confirmed" && onCheckIn && (
                            <Button
                              size="sm"
                              onClick={() => onCheckIn(booking.id)}
                              className="gap-1"
                            >
                              <LogIn className="h-3.5 w-3.5" />
                              Check In
                            </Button>
                          )}
                          {booking.status === "checked-in" && onCheckOut && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onCheckOut(booking.id)}
                              className="gap-1"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
