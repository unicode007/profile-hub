import { Booking } from "./types";
import { Separator } from "@/components/ui/separator";
import { Building2, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface ReceiptViewProps {
  booking: Booking;
}

export const ReceiptView = ({ booking }: ReceiptViewProps) => {
  return (
    <div className="text-foreground">
      {/* Header */}
      <div className="print-header flex justify-between items-start mb-6">
        <div className="logo">
          <Building2 className="h-8 w-8 text-primary logo-icon" />
          <div>
            <span className="text-2xl font-bold brand">HotelBook</span>
            <p className="text-xs text-muted-foreground subtitle">Payment Receipt</p>
          </div>
        </div>
        <div className="text-right doc-info">
          <p className="text-2xl font-bold text-primary doc-title">RECEIPT</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Receipt No: </span>
            <span className="font-mono font-medium">RCP-{booking.id}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Date: </span>
            <span>{format(new Date(), "dd MMM yyyy, HH:mm")}</span>
          </p>
        </div>
      </div>

      <Separator className="separator mb-6" />

      {/* Payment Stamp */}
      <div className="receipt-stamp text-center my-8 p-4 border-2 border-dashed border-green-500 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="stamp-text text-green-600 text-2xl font-bold">PAID</p>
        <p className="stamp-date text-sm text-muted-foreground">
          {format(new Date(booking.createdAt), "dd MMM yyyy, HH:mm:ss")}
        </p>
      </div>

      {/* Guest & Booking Info */}
      <div className="grid-2 grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-2 uppercase">
            RECEIVED FROM
          </h3>
          <p className="name font-medium">
            {booking.guestInfo.firstName} {booking.guestInfo.lastName}
          </p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.email}</p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.phone}</p>
        </div>
        <div>
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-2 uppercase">
            FOR BOOKING
          </h3>
          <p className="name font-medium">{booking.hotelName}</p>
          <p className="detail text-sm text-muted-foreground">Booking ID: {booking.id}</p>
          <p className="detail text-sm text-muted-foreground">
            {format(new Date(booking.checkIn), "dd MMM")} - {format(new Date(booking.checkOut), "dd MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Amount Details */}
      <div className="info-box bg-muted/50 rounded-lg p-4 mb-6">
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-3 text-muted-foreground">Room Charges</td>
              <td className="py-3 text-right">₹{(booking.totalAmount * 0.82).toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-muted-foreground">CGST (9%)</td>
              <td className="py-3 text-right">₹{(booking.totalAmount * 0.09).toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 text-muted-foreground">SGST (9%)</td>
              <td className="py-3 text-right">₹{(booking.totalAmount * 0.09).toLocaleString()}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-lg">Total Amount Paid</td>
              <td className="py-3 text-right font-bold text-lg text-primary">
                ₹{booking.totalAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Method */}
      <div className="payment-box bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex justify-between items-center">
        <div>
          <p className="payment-method text-sm text-muted-foreground">Payment Method</p>
          <p className="payment-type font-medium capitalize">
            {booking.paymentMethod === "card"
              ? "Credit/Debit Card"
              : booking.paymentMethod === "upi"
              ? "UPI Payment"
              : "Pay at Hotel"}
          </p>
        </div>
        <div className="text-right">
          <p className="payment-status text-green-600 dark:text-green-400 font-medium">
            ✓ Transaction Successful
          </p>
          <p className="payment-date text-xs text-muted-foreground">
            Transaction ID: TXN{booking.id.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="footer mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For queries, contact: support@hotelbook.com | +91 1800-XXX-XXXX</p>
      </div>
    </div>
  );
};
