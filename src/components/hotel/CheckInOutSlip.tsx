import { Booking } from "./types";
import { Separator } from "@/components/ui/separator";
import { Building2, LogIn, LogOut, User, Calendar, Key, Clock } from "lucide-react";
import { format } from "date-fns";

interface CheckInOutSlipProps {
  booking: Booking;
  type: "check-in" | "check-out";
}

export const CheckInOutSlip = ({ booking, type }: CheckInOutSlipProps) => {
  const isCheckIn = type === "check-in";
  const roomNumber = Math.floor(Math.random() * 400) + 101;

  return (
    <div className="text-foreground">
      {/* Header */}
      <div className="print-header flex justify-between items-start mb-6">
        <div className="logo">
          <Building2 className="h-8 w-8 text-primary logo-icon" />
          <div>
            <span className="text-2xl font-bold brand">{booking.hotelName}</span>
            <p className="text-xs text-muted-foreground subtitle">{booking.hotelAddress}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            isCheckIn ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}>
            {isCheckIn ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
            <span className="font-bold text-lg">{isCheckIn ? "CHECK-IN" : "CHECK-OUT"}</span>
          </div>
        </div>
      </div>

      <Separator className="separator mb-6" />

      {/* Slip Number & Time */}
      <div className="text-center mb-6 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">Slip Number</p>
        <p className="text-xl font-bold font-mono">
          {isCheckIn ? "CI" : "CO"}-{booking.id}-{format(new Date(), "ddMMyy")}
        </p>
        <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
          <Clock className="h-4 w-4" />
          {format(new Date(), "dd MMM yyyy, HH:mm:ss")}
        </p>
      </div>

      {/* Guest Info Card */}
      <div className="border-2 border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">
              {booking.guestInfo.firstName} {booking.guestInfo.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{booking.guestInfo.country}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{booking.guestInfo.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{booking.guestInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Room & Booking Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Key className="h-4 w-4" /> Room Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Number</span>
              <span className="font-bold text-xl text-primary">{roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room Type</span>
              <span className="font-medium">{booking.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{booking.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. of Rooms</span>
              <span className="font-medium">{booking.rooms}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Stay Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono font-medium">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{format(new Date(booking.checkIn), "dd MMM yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium">{format(new Date(booking.checkOut), "dd MMM yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests</span>
              <span className="font-medium">
                {booking.guests.adults}A{booking.guests.children > 0 ? ` + ${booking.guests.children}C` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Instructions based on Check-in/out */}
      {isCheckIn ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Welcome Notes</h3>
          <ul className="text-sm text-green-600 dark:text-green-500 space-y-1">
            <li>• WiFi Password: <span className="font-mono font-bold">HOTEL{roomNumber}</span></li>
            <li>• Breakfast: 7:00 AM - 10:30 AM at Level 1 Restaurant</li>
            <li>• Room Service: Dial 0 from your room phone</li>
            <li>• Checkout Time: 11:00 AM</li>
          </ul>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Checkout Summary</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Bill</p>
              <p className="text-xl font-bold">₹{booking.totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="text-green-600 font-medium">✓ Settled</p>
            </div>
          </div>
        </div>
      )}

      {/* Signature Area */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <div className="border-t border-foreground pt-2">
            <p className="text-xs text-muted-foreground">Guest Signature</p>
          </div>
        </div>
        <div>
          <div className="border-t border-foreground pt-2">
            <p className="text-xs text-muted-foreground">Front Desk Staff</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
        <p>{isCheckIn ? "Enjoy your stay!" : "Thank you for staying with us!"}</p>
        <p>For assistance, dial 0 or visit the front desk</p>
      </div>
    </div>
  );
};
