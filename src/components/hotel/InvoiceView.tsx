import { Booking, Hotel } from "./types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Building2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

interface InvoiceViewProps {
  booking: Booking;
  hotel?: Hotel;
  onClose?: () => void;
}

export const InvoiceView = ({ booking, hotel, onClose }: InvoiceViewProps) => {
  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const roomCharges = booking.totalAmount * 0.82;
  const taxes = booking.totalAmount * 0.18;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Invoice downloaded as PDF");
  };

  return (
    <div className="bg-white dark:bg-card p-8 max-w-3xl mx-auto print:p-0">
      {/* Action Buttons - Hidden in print */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HotelBook</span>
          </div>
          <p className="text-sm text-muted-foreground">Hotel Booking & Management</p>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-primary mb-2">INVOICE</h1>
          <p className="text-sm">
            <span className="text-muted-foreground">Invoice No: </span>
            <span className="font-mono font-medium">INV-{booking.id}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Date: </span>
            <span>{format(new Date(), "dd MMM yyyy")}</span>
          </p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Bill To & Hotel Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h3>
          <p className="font-medium">
            {booking.guestInfo.firstName} {booking.guestInfo.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{booking.guestInfo.email}</p>
          <p className="text-sm text-muted-foreground">{booking.guestInfo.phone}</p>
          <p className="text-sm text-muted-foreground">{booking.guestInfo.country}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">HOTEL DETAILS</h3>
          <p className="font-medium">{booking.hotelName}</p>
          <p className="text-sm text-muted-foreground">{booking.hotelAddress}</p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">BOOKING DETAILS</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Booking ID</p>
            <p className="font-mono font-medium">{booking.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p className="font-medium">{format(new Date(booking.checkIn), "dd MMM yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Check-out</p>
            <p className="font-medium">{format(new Date(booking.checkOut), "dd MMM yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium">{nights} Night{nights > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 text-sm font-semibold">Description</th>
              <th className="text-center py-3 text-sm font-semibold">Qty</th>
              <th className="text-center py-3 text-sm font-semibold">Nights</th>
              <th className="text-right py-3 text-sm font-semibold">Rate</th>
              <th className="text-right py-3 text-sm font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4">
                <p className="font-medium">{booking.roomName}</p>
                <p className="text-sm text-muted-foreground">{booking.planName}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.guests.adults} Adult{booking.guests.adults > 1 ? "s" : ""}
                  {booking.guests.children > 0 &&
                    `, ${booking.guests.children} Child${booking.guests.children > 1 ? "ren" : ""}`}
                </p>
              </td>
              <td className="text-center py-4">{booking.rooms}</td>
              <td className="text-center py-4">{nights}</td>
              <td className="text-right py-4">
                ₹{Math.round(roomCharges / (nights * booking.rooms)).toLocaleString()}
              </td>
              <td className="text-right py-4">₹{roomCharges.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{roomCharges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CGST (9%)</span>
            <span>₹{(taxes / 2).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SGST (9%)</span>
            <span>₹{(taxes / 2).toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">₹{booking.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium capitalize">
              {booking.paymentMethod === "card"
                ? "Credit/Debit Card"
                : booking.paymentMethod === "upi"
                ? "UPI Payment"
                : "Pay at Hotel"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Payment Received
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(booking.createdAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for choosing HotelBook!</p>
        <p>For queries, contact: support@hotelbook.com | +91 1800-XXX-XXXX</p>
      </div>
    </div>
  );
};
