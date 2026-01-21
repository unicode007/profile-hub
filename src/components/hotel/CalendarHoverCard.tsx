import { Booking, Hotel, RoomType } from "./types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  Bed,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Users,
  DollarSign,
  CalendarCheck,
  CalendarX,
  Building2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface CalendarHoverCardProps {
  children: React.ReactNode;
  booking?: Booking;
  date?: Date;
  availableRooms?: number;
  totalRooms?: number;
  checkIns?: Booking[];
  checkOuts?: Booking[];
  stayingGuests?: Booking[];
  hotel?: Hotel;
  roomType?: RoomType;
  onViewBooking?: (booking: Booking) => void;
  side?: "top" | "bottom" | "left" | "right";
}

export const CalendarHoverCard = ({
  children,
  booking,
  date,
  availableRooms,
  totalRooms,
  checkIns = [],
  checkOuts = [],
  stayingGuests = [],
  hotel,
  roomType,
  onViewBooking,
  side = "top",
}: CalendarHoverCardProps) => {
  const getStatusConfig = (status: Booking["status"]) => {
    const configs = {
      confirmed: { color: "bg-blue-500", label: "Confirmed", icon: CalendarCheck },
      "checked-in": { color: "bg-green-500", label: "Checked In", icon: User },
      "checked-out": { color: "bg-gray-500", label: "Checked Out", icon: CalendarX },
      pending: { color: "bg-yellow-500", label: "Pending", icon: Clock },
      cancelled: { color: "bg-red-500", label: "Cancelled", icon: CalendarX },
      completed: { color: "bg-purple-500", label: "Completed", icon: CalendarCheck },
    };
    return configs[status] || { color: "bg-muted", label: status, icon: Calendar };
  };

  const occupancyPercentage = totalRooms && availableRooms !== undefined
    ? ((totalRooms - availableRooms) / totalRooms) * 100
    : 0;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-80 p-0 bg-popover border shadow-xl z-50"
        side={side}
        align="center"
      >
        {/* Single Booking View */}
        {booking && (
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-base">
                  {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Booking #{booking.id}
                </p>
              </div>
              <Badge className={`${getStatusConfig(booking.status).color} text-white`}>
                {getStatusConfig(booking.status).label}
              </Badge>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.hotelName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{booking.roomName}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{booking.planName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(booking.checkIn), "MMM d")}
                  <ArrowRight className="h-3 w-3 inline mx-1" />
                  {format(new Date(booking.checkOut), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))} nights
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {booking.guests.adults} adult{booking.guests.adults !== 1 ? "s" : ""}
                  {booking.guests.children > 0 && `, ${booking.guests.children} child${booking.guests.children !== 1 ? "ren" : ""}`}
                </span>
                <span className="text-muted-foreground">•</span>
                <span>{booking.rooms} room{booking.rooms !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{booking.guestInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{booking.paymentMethod}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg">₹{booking.totalAmount?.toLocaleString()}</span>
              </div>
              {onViewBooking && (
                <Button size="sm" onClick={() => onViewBooking(booking)} className="gap-1">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Date Summary View */}
        {date && !booking && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-base">
                  {format(date, "EEEE, MMMM d")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {format(date, "yyyy")}
                </p>
              </div>
              {hotel && (
                <Badge variant="outline">{hotel.name}</Badge>
              )}
            </div>

            {/* Availability Progress */}
            {totalRooms !== undefined && availableRooms !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-medium">{occupancyPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={occupancyPercentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{totalRooms - availableRooms} booked</span>
                  <span>{availableRooms} available</span>
                </div>
              </div>
            )}

            <Separator className="my-3" />

            {/* Check-ins */}
            {checkIns.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600 mb-2">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Check-ins ({checkIns.length})</span>
                </div>
                <div className="space-y-1">
                  {checkIns.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="text-xs bg-green-50 dark:bg-green-900/20 p-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() => onViewBooking?.(b)}
                    >
                      <span>{b.guestInfo.firstName} {b.guestInfo.lastName}</span>
                      <span className="text-muted-foreground">{b.roomName}</span>
                    </div>
                  ))}
                  {checkIns.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{checkIns.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Check-outs */}
            {checkOuts.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-600 mb-2">
                  <CalendarX className="h-4 w-4" />
                  <span>Check-outs ({checkOuts.length})</span>
                </div>
                <div className="space-y-1">
                  {checkOuts.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="text-xs bg-red-50 dark:bg-red-900/20 p-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => onViewBooking?.(b)}
                    >
                      <span>{b.guestInfo.firstName} {b.guestInfo.lastName}</span>
                      <span className="text-muted-foreground">{b.roomName}</span>
                    </div>
                  ))}
                  {checkOuts.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{checkOuts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staying Guests */}
            {stayingGuests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-2">
                  <Users className="h-4 w-4" />
                  <span>Staying ({stayingGuests.length})</span>
                </div>
                <div className="space-y-1">
                  {stayingGuests.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      onClick={() => onViewBooking?.(b)}
                    >
                      <span>{b.guestInfo.firstName} {b.guestInfo.lastName}</span>
                      <span className="text-muted-foreground">{b.roomName}</span>
                    </div>
                  ))}
                  {stayingGuests.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{stayingGuests.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {checkIns.length === 0 && checkOuts.length === 0 && stayingGuests.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No activity on this date
              </div>
            )}
          </div>
        )}

        {/* Room Type View */}
        {roomType && !booking && !date && (
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-base">{roomType.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {roomType.size} • {roomType.view}
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{roomType.bedCount} {roomType.bedType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{roomType.bathrooms} bathroom{roomType.bathrooms !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {roomType.amenities.length > 0 && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {roomType.amenities.slice(0, 6).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {roomType.amenities.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{roomType.amenities.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}

            {roomType.plans.length > 0 && (
              <>
                <Separator className="my-3" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Starting from</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{Math.min(...roomType.plans.map(p => p.discountedPrice)).toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal">/night</span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
