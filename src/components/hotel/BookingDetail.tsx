import { Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Bed,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Phone,
  Mail,
  Building2,
  CreditCard,
  FileText,
  LogIn,
  LogOut,
  Star,
  Receipt,
  ClipboardCheck,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { format, differenceInDays, isBefore, isAfter, isToday } from "date-fns";
import { toast } from "sonner";

type PrintDocType = "invoice" | "receipt" | "confirmation" | "folio" | "check-in" | "check-out";

interface BookingDetailProps {
  booking: Booking;
  onBack: () => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onPrintDocument?: (type: PrintDocType, booking: Booking) => void;
}

export const BookingDetail = ({
  booking,
  onBack,
  onCheckIn,
  onCheckOut,
  onCancel,
  onPrintDocument,
}: BookingDetailProps) => {
  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const today = new Date();
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);

  const canCheckIn =
    booking.status === "confirmed" &&
    (isToday(checkInDate) || (isAfter(today, checkInDate) && isBefore(today, checkOutDate)));
  const canCheckOut =
    booking.status === "checked-in" &&
    (isToday(checkOutDate) || isAfter(today, checkInDate));
  const canCancel =
    (booking.status === "confirmed" || booking.status === "pending") &&
    isBefore(today, checkInDate);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: JSX.Element; label: string }> = {
      confirmed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        label: "Confirmed",
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: "Pending",
      },
      "checked-in": {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: <LogIn className="h-3 w-3 mr-1" />,
        label: "Checked In",
      },
      "checked-out": {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: <LogOut className="h-3 w-3 mr-1" />,
        label: "Checked Out",
      },
      completed: {
        bg: "bg-slate-100 dark:bg-slate-900/30",
        text: "text-slate-700 dark:text-slate-400",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle className="h-3 w-3 mr-1" />,
        label: "Cancelled",
      },
    };
    const style = styles[status] || styles.pending;
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.icon} {style.label}
      </Badge>
    );
  };

  const handleDownloadInvoice = () => {
    toast.success("Invoice downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Booking ID: ${booking.id} - ${booking.hotelName}`);
    toast.success("Booking details copied to clipboard!");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Button>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Printer className="h-4 w-4" /> Print Documents <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Print Documents</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPrintDocument?.("invoice", booking)}>
                <FileText className="h-4 w-4 mr-2" /> Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrintDocument?.("receipt", booking)}>
                <Receipt className="h-4 w-4 mr-2" /> Payment Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrintDocument?.("confirmation", booking)}>
                <ClipboardCheck className="h-4 w-4 mr-2" /> Booking Confirmation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrintDocument?.("folio", booking)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Guest Folio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPrintDocument?.("check-in", booking)}>
                <LogIn className="h-4 w-4 mr-2" /> Check-in Slip
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPrintDocument?.("check-out", booking)}>
                <LogOut className="h-4 w-4 mr-2" /> Check-out Slip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>

      {/* Booking Status Banner */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-muted-foreground">Booking ID:</span>
                <span className="font-mono font-bold text-lg">{booking.id}</span>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Booked on {format(new Date(booking.createdAt), "PPP 'at' p")}
              </p>
            </div>
            <div className="flex gap-2">
              {canCheckIn && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onCheckIn?.(booking.id)}
                >
                  <LogIn className="h-4 w-4 mr-2" /> Check In
                </Button>
              )}
              {canCheckOut && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => onCheckOut?.(booking.id)}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Check Out
                </Button>
              )}
              {canCancel && (
                <Button variant="destructive" onClick={() => onCancel?.(booking.id)}>
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {booking.hotelImage ? (
                  <img
                    src={booking.hotelImage}
                    alt={booking.hotelName}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{booking.hotelName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" /> {booking.hotelAddress}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.5</span>
                    <span className="text-xs text-muted-foreground">(120 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                  <p className="font-bold text-lg">{format(checkInDate, "dd MMM")}</p>
                  <p className="text-sm text-muted-foreground">{format(checkInDate, "EEEE")}</p>
                  <p className="text-xs text-primary mt-1">From 2:00 PM</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-bold text-2xl text-primary">{nights}</p>
                  <p className="text-sm text-muted-foreground">Night{nights > 1 ? "s" : ""}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                  <p className="font-bold text-lg">{format(checkOutDate, "dd MMM")}</p>
                  <p className="text-sm text-muted-foreground">{format(checkOutDate, "EEEE")}</p>
                  <p className="text-xs text-primary mt-1">Until 11:00 AM</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Bed className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-medium">{booking.roomName}</p>
                    <p className="text-xs text-muted-foreground">{booking.planName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <p className="font-medium">
                      {booking.guests.adults} Adult{booking.guests.adults > 1 ? "s" : ""}
                      {booking.guests.children > 0 &&
                        `, ${booking.guests.children} Child${booking.guests.children > 1 ? "ren" : ""}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{booking.rooms} Room{booking.rooms > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Guest Name</p>
                  <p className="font-medium">
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{booking.guestInfo.country}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.guestInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.guestInfo.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Charges</span>
                  <span>₹{(booking.totalAmount * 0.82).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees (18%)</span>
                  <span>₹{(booking.totalAmount * 0.18).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                </div>
                <p className="font-medium capitalize">
                  {booking.paymentMethod === "card"
                    ? "Credit/Debit Card"
                    : booking.paymentMethod === "upi"
                    ? "UPI Payment"
                    : "Pay at Hotel"}
                </p>
              </div>

              {booking.status === "confirmed" && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Payment Successful</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Booking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div className="w-0.5 h-8 bg-muted" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Booking Created</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.createdAt), "PPP")}
                    </p>
                  </div>
                </div>

                {booking.status !== "cancelled" && (
                  <>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            booking.status === "checked-in" ||
                            booking.status === "checked-out" ||
                            booking.status === "completed"
                              ? "bg-blue-500"
                              : "bg-muted"
                          }`}
                        />
                        <div className="w-0.5 h-8 bg-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Check-in</p>
                        <p className="text-xs text-muted-foreground">
                          {format(checkInDate, "PPP")} at 2:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            booking.status === "checked-out" || booking.status === "completed"
                              ? "bg-purple-500"
                              : "bg-muted"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Check-out</p>
                        <p className="text-xs text-muted-foreground">
                          {format(checkOutDate, "PPP")} at 11:00 AM
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {booking.status === "cancelled" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-red-600">Booking Cancelled</p>
                      <p className="text-xs text-muted-foreground">Refund initiated</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
