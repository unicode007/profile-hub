import { Booking } from "./types";
import { Separator } from "@/components/ui/separator";
import { Building2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface GuestFolioViewProps {
  booking: Booking;
}

// Demo charges for the folio
const getDemoCharges = (booking: Booking) => {
  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn));
  const roomRate = Math.round((booking.totalAmount * 0.82) / nights);
  
  const charges = [];
  const checkIn = new Date(booking.checkIn);
  
  // Add room charges for each night
  for (let i = 0; i < nights; i++) {
    const date = new Date(checkIn);
    date.setDate(date.getDate() + i);
    charges.push({
      date,
      description: `Room Charges - ${booking.roomName}`,
      debit: roomRate,
      credit: 0,
      balance: roomRate * (i + 1),
    });
  }
  
  // Add some demo extra charges
  if (booking.status === "checked-in" || booking.status === "checked-out") {
    charges.push({
      date: new Date(checkIn.getTime() + 86400000),
      description: "Restaurant - Dinner",
      debit: 1500,
      credit: 0,
      balance: charges[charges.length - 1].balance + 1500,
    });
    charges.push({
      date: new Date(checkIn.getTime() + 86400000 * 2),
      description: "Mini Bar",
      debit: 800,
      credit: 0,
      balance: charges[charges.length - 1].balance + 800,
    });
    charges.push({
      date: new Date(checkIn.getTime() + 86400000 * 2),
      description: "Laundry Services",
      debit: 500,
      credit: 0,
      balance: charges[charges.length - 1].balance + 500,
    });
  }
  
  // Add taxes
  const subtotal = charges[charges.length - 1]?.balance || 0;
  const cgst = Math.round(subtotal * 0.09);
  const sgst = Math.round(subtotal * 0.09);
  
  charges.push({
    date: new Date(booking.checkOut),
    description: "CGST @ 9%",
    debit: cgst,
    credit: 0,
    balance: subtotal + cgst,
  });
  charges.push({
    date: new Date(booking.checkOut),
    description: "SGST @ 9%",
    debit: sgst,
    credit: 0,
    balance: subtotal + cgst + sgst,
  });
  
  // Add payment
  if (booking.status === "checked-out") {
    charges.push({
      date: new Date(booking.checkOut),
      description: `Payment - ${booking.paymentMethod === "card" ? "Card" : booking.paymentMethod === "upi" ? "UPI" : "Cash"}`,
      debit: 0,
      credit: subtotal + cgst + sgst,
      balance: 0,
    });
  }
  
  return charges;
};

export const GuestFolioView = ({ booking }: GuestFolioViewProps) => {
  const charges = getDemoCharges(booking);
  const totalDebits = charges.reduce((sum, c) => sum + c.debit, 0);
  const totalCredits = charges.reduce((sum, c) => sum + c.credit, 0);
  const balance = totalDebits - totalCredits;

  return (
    <div className="text-foreground">
      {/* Header */}
      <div className="print-header flex justify-between items-start mb-6">
        <div className="logo">
          <Building2 className="h-8 w-8 text-primary logo-icon" />
          <div>
            <span className="text-2xl font-bold brand">HotelBook</span>
            <p className="text-xs text-muted-foreground subtitle">Guest Folio</p>
          </div>
        </div>
        <div className="text-right doc-info">
          <p className="text-2xl font-bold text-primary doc-title">GUEST FOLIO</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Folio No: </span>
            <span className="font-mono font-medium">FLO-{booking.id}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Printed: </span>
            <span>{format(new Date(), "dd MMM yyyy, HH:mm")}</span>
          </p>
        </div>
      </div>

      <Separator className="separator mb-6" />

      {/* Guest & Stay Info */}
      <div className="grid-2 grid grid-cols-2 gap-8 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Guest Information
          </h3>
          <p className="name font-medium text-lg">
            {booking.guestInfo.firstName} {booking.guestInfo.lastName}
          </p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.email}</p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.phone}</p>
          <p className="detail text-sm text-muted-foreground">{booking.guestInfo.country}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="section-title text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Stay Information
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Room</p>
              <p className="font-medium">{booking.roomName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Room No.</p>
              <p className="font-medium">#{Math.floor(Math.random() * 500) + 100}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Arrival</p>
              <p className="font-medium">{format(new Date(booking.checkIn), "dd MMM yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Departure</p>
              <p className="font-medium">{format(new Date(booking.checkOut), "dd MMM yyyy")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mb-6">
        <h3 className="section-title text-sm font-semibold text-muted-foreground mb-3 uppercase">
          Transaction Details
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-2 px-3 text-sm font-semibold border">Date</th>
              <th className="text-left py-2 px-3 text-sm font-semibold border">Description</th>
              <th className="text-right py-2 px-3 text-sm font-semibold border">Debit (₹)</th>
              <th className="text-right py-2 px-3 text-sm font-semibold border">Credit (₹)</th>
              <th className="text-right py-2 px-3 text-sm font-semibold border">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-3 text-sm border">{format(charge.date, "dd MMM")}</td>
                <td className="py-2 px-3 text-sm border">{charge.description}</td>
                <td className="py-2 px-3 text-sm text-right border">
                  {charge.debit > 0 ? charge.debit.toLocaleString() : "-"}
                </td>
                <td className="py-2 px-3 text-sm text-right border text-green-600">
                  {charge.credit > 0 ? charge.credit.toLocaleString() : "-"}
                </td>
                <td className="py-2 px-3 text-sm text-right border font-medium">
                  {charge.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-bold">
              <td colSpan={2} className="py-2 px-3 text-sm border">Total</td>
              <td className="py-2 px-3 text-sm text-right border">{totalDebits.toLocaleString()}</td>
              <td className="py-2 px-3 text-sm text-right border text-green-600">{totalCredits.toLocaleString()}</td>
              <td className="py-2 px-3 text-sm text-right border text-primary">{balance.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Balance Summary */}
      <div className={`p-4 rounded-lg ${balance === 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className={`text-2xl font-bold ${balance === 0 ? "text-green-600" : "text-amber-600"}`}>
              ₹{balance.toLocaleString()}
            </p>
          </div>
          {balance === 0 && (
            <div className="text-right">
              <p className="text-green-600 font-medium">✓ Settled</p>
              <p className="text-xs text-muted-foreground">Thank you for your stay!</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature Line */}
      <div className="mt-12 flex justify-between">
        <div>
          <div className="guest-signature border-t border-foreground w-48 pt-2">
            <p className="text-xs text-muted-foreground">Guest Signature</p>
          </div>
        </div>
        <div>
          <div className="guest-signature border-t border-foreground w-48 pt-2">
            <p className="text-xs text-muted-foreground">Front Desk</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for choosing {booking.hotelName}!</p>
        <p>We hope to see you again soon.</p>
      </div>
    </div>
  );
};
