import { Hotel, RoomType, RoomPlan } from "./types";
import { BookingDetails } from "./BookingCheckout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Calendar,
  Users,
  Bed,
  MapPin,
  Phone,
  Mail,
  Download,
  Share2,
  Printer,
  Building2,
  Clock,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface BookingConfirmationProps {
  hotel: Hotel;
  room: RoomType;
  plan: RoomPlan;
  booking: BookingDetails;
  bookingId: string;
  onBackToHotels: () => void;
}

export const BookingConfirmation = ({
  hotel,
  room,
  plan,
  booking,
  bookingId,
  onBackToHotels,
}: BookingConfirmationProps) => {
  const nights = differenceInDays(booking.checkOut, booking.checkIn);
  const roomTotal = plan.discountedPrice * nights * booking.rooms;
  const taxesTotal = plan.taxesAndFees * nights * booking.rooms;
  const grandTotal = roomTotal + taxesTotal;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <Card className="mb-6 border-green-200 dark:border-green-900 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your reservation has been successfully made. A confirmation email has been sent to{" "}
              <span className="font-medium text-foreground">{booking.guestInfo.email}</span>
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white dark:bg-card px-4 py-2 rounded-lg border">
              <span className="text-sm text-muted-foreground">Booking ID:</span>
              <span className="font-mono font-bold text-primary">{bookingId}</span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Hotel Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Hotel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{hotel.name}</h3>
                <Badge variant="secondary" className="mt-1">{hotel.category}</Badge>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {hotel.location.address}, {hotel.location.city}, {hotel.location.state} - {hotel.location.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+91 1800-123-4567</span>
              </div>
            </CardContent>
          </Card>

          {/* Guest Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">
                  {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{booking.guestInfo.country}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.phone}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stay Details */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Stay Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="font-medium">{format(booking.checkIn, "EEE, dd MMM yyyy")}</p>
                  <p className="text-xs text-muted-foreground">From 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="font-medium">{format(booking.checkOut, "EEE, dd MMM yyyy")}</p>
                  <p className="text-xs text-muted-foreground">Until 11:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{nights} Night{nights > 1 ? "s" : ""}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.rooms} Room{booking.rooms > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/4 bg-muted rounded-lg h-28 flex items-center justify-center">
                <Bed className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="md:w-3/4">
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {room.size} • {room.view} • {room.bedCount} {room.bedType}
                </p>
                <Badge variant="outline" className="text-primary border-primary">
                  {plan.name}
                </Badge>
                <div className="mt-2 text-sm text-muted-foreground">
                  {booking.guests.adults} Adult{booking.guests.adults > 1 ? "s" : ""}
                  {booking.guests.children > 0 && `, ${booking.guests.children} Child${booking.guests.children > 1 ? "ren" : ""}`}
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <>
                <Separator className="my-6" />
                <div>
                  <h4 className="font-medium mb-2">Special Requests</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {booking.specialRequests}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Room Charges ({booking.rooms} Room × {nights} Night{nights > 1 ? "s" : ""})
                </span>
                <span>₹{roomTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span>₹{taxesTotal.toLocaleString()}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">
                  {booking.paymentMethod === 'card' ? 'Credit/Debit Card' :
                   booking.paymentMethod === 'upi' ? 'UPI Payment' :
                   booking.paymentMethod === 'netbanking' ? 'Net Banking' : 'Pay at Hotel'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Voucher
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Confirmation
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Details
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onBackToHotels} className="bg-teal-600 hover:bg-teal-700">
            Back to Hotels
          </Button>
        </div>
      </div>
    </div>
  );
};