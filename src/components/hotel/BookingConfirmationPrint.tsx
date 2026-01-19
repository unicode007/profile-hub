import { Booking } from "./types";
import { Separator } from "@/components/ui/separator";
import { Building2, Calendar, Users, MapPin, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface BookingConfirmationPrintProps {
  booking: Booking;
}

export const BookingConfirmationPrint = ({ booking }: BookingConfirmationPrintProps) => {
  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));

  return (
    <div className="text-foreground">
      {/* Header */}
      <div className="print-header flex justify-between items-start mb-6">
        <div className="logo">
          <Building2 className="h-8 w-8 text-primary logo-icon" />
          <div>
            <span className="text-2xl font-bold brand">HotelBook</span>
            <p className="text-xs text-muted-foreground subtitle">Booking Confirmation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="confirmation-badge bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
            CONFIRMED
          </span>
        </div>
      </div>

      <Separator className="separator mb-6" />

      {/* Confirmation Number */}
      <div className="text-center mb-8 p-6 bg-primary/5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">Confirmation Number</p>
        <p className="text-3xl font-bold font-mono text-primary">{booking.id}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Booked on {format(new Date(booking.createdAt), "dd MMM yyyy, HH:mm")}
        </p>
      </div>

      {/* Hotel & Guest Info */}
      <div className="grid-2 grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-3 uppercase flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Hotel Details
          </h3>
          <p className="name text-lg font-medium">{booking.hotelName}</p>
          <p className="detail text-sm text-muted-foreground">{booking.hotelAddress}</p>
        </div>
        <div>
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-3 uppercase flex items-center gap-2">
            <Users className="h-4 w-4" /> Guest Details
          </h3>
          <p className="name font-medium">
            {booking.guestInfo.firstName} {booking.guestInfo.lastName}
          </p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.email}</p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.phone}</p>
        </div>
      </div>

      {/* Stay Details */}
      <div className="info-box bg-muted/50 rounded-lg p-4 mb-6">
        <h3 className="section-title text-sm font-semibold text-muted-foreground mb-4 uppercase flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Stay Details
        </h3>
        <div className="info-grid grid grid-cols-4 gap-4">
          <div>
            <p className="info-label text-muted-foreground text-sm">Check-in</p>
            <p className="info-value font-medium">{format(new Date(booking.checkIn), "EEE, dd MMM yyyy")}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> 2:00 PM onwards
            </p>
          </div>
          <div>
            <p className="info-label text-muted-foreground text-sm">Check-out</p>
            <p className="info-value font-medium">{format(new Date(booking.checkOut), "EEE, dd MMM yyyy")}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> Before 11:00 AM
            </p>
          </div>
          <div>
            <p className="info-label text-muted-foreground text-sm">Duration</p>
            <p className="info-value font-medium">{nights} Night{nights > 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="info-label text-muted-foreground text-sm">Guests</p>
            <p className="info-value font-medium">
              {booking.guests.adults} Adult{booking.guests.adults > 1 ? "s" : ""}
              {booking.guests.children > 0 && `, ${booking.guests.children} Child`}
            </p>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="mb-6">
        <h3 className="section-title text-sm font-semibold text-muted-foreground mb-3 uppercase">
          Room Details
        </h3>
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-lg">{booking.roomName}</p>
              <p className="text-sm text-muted-foreground">{booking.planName}</p>
              <p className="text-sm text-muted-foreground">{booking.rooms} Room{booking.rooms > 1 ? "s" : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₹{booking.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total (incl. taxes)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div className="mb-6">
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Special Requests
          </h3>
          <p className="text-sm bg-muted/30 p-3 rounded">{booking.specialRequests}</p>
        </div>
      )}

      {/* Important Information */}
      <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg mb-6">
        <h3 className="font-semibold mb-2">Important Information</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Please carry a valid photo ID for check-in</li>
          <li>• Early check-in subject to availability</li>
          <li>• Free cancellation up to 24 hours before check-in</li>
          <li>• Show this confirmation at the reception</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="footer mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for booking with HotelBook!</p>
        <p>For queries, contact: support@hotelbook.com | +91 1800-XXX-XXXX</p>
      </div>
    </div>
  );
};
