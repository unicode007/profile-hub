import { RestaurantOrder, MenuItem } from "./RestaurantPOS";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { UtensilsCrossed } from "lucide-react";

interface RestaurantBillPrintProps {
  order: RestaurantOrder;
  hotelName?: string;
  hotelAddress?: string;
}

export const RestaurantBillPrint = ({ 
  order, 
  hotelName = "Grand Heritage Hotel",
  hotelAddress = "123 Main Street, City Center, State - 500001"
}: RestaurantBillPrintProps) => {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  
  return (
    <div className="font-mono text-sm bg-white text-black p-6 max-w-md mx-auto print:p-0 print:max-w-none">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <UtensilsCrossed className="h-6 w-6" />
          <h1 className="text-xl font-bold">RESTAURANT</h1>
        </div>
        <p className="font-bold text-lg">{hotelName}</p>
        <p className="text-xs text-gray-600">{hotelAddress}</p>
        <p className="text-xs text-gray-600">GSTIN: 36XXXXXXXXXXXXX</p>
      </div>

      {/* Bill Info */}
      <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="text-gray-600">Bill No: </span>
            <span className="font-bold">{order.id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Table: </span>
            <span className="font-bold">{order.tableNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Date: </span>
            <span>{format(new Date(order.createdAt), "dd/MM/yyyy")}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Time: </span>
            <span>{format(new Date(order.createdAt), "hh:mm a")}</span>
          </div>
          {order.guestInfo?.guestName && (
            <>
              <div className="col-span-2">
                <span className="text-gray-600">Guest: </span>
                <span className="font-bold">{order.guestInfo.guestName}</span>
                {order.guestInfo.roomNumber && (
                  <span className="ml-2">(Room {order.guestInfo.roomNumber})</span>
                )}
              </div>
            </>
          )}
          {order.kotNumbers.length > 0 && (
            <div className="col-span-2">
              <span className="text-gray-600">KOT#: </span>
              <span>{order.kotNumbers.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-400 text-xs">
              <th className="text-left py-2 font-semibold">Item</th>
              <th className="text-center py-2 font-semibold w-12">Qty</th>
              <th className="text-right py-2 font-semibold w-16">Rate</th>
              <th className="text-right py-2 font-semibold w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-dashed border-gray-200">
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <span className={`w-3 h-3 rounded-sm border ${item.menuItem.isVeg ? "border-green-600 bg-green-600" : "border-red-600 bg-red-600"}`}>
                      <span className="block w-1.5 h-1.5 bg-white rounded-full m-0.5" />
                    </span>
                    <span className="text-sm">{item.menuItem.name}</span>
                  </div>
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatCurrency(item.menuItem.price)}</td>
                <td className="text-right py-2 font-medium">
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-400 pt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>CGST @ 9%</span>
          <span>{formatCurrency(order.tax / 2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>SGST @ 9%</span>
          <span>{formatCurrency(order.tax / 2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span>GRAND TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        {order.paymentMethod && (
          <div className="flex justify-between text-xs text-gray-600 pt-1">
            <span>Payment Mode</span>
            <span className="uppercase font-medium">
              {order.paymentMethod === "room" 
                ? `Room Charge (${order.guestInfo?.roomNumber || "N/A"})` 
                : order.paymentMethod}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center border-t border-dashed border-gray-400 pt-4">
        <p className="text-xs text-gray-600 mb-2">
          Items: {order.items.reduce((sum, i) => sum + i.quantity, 0)} | 
          Server: Staff
        </p>
        <p className="font-bold text-sm mb-1">Thank You! Visit Again!</p>
        <p className="text-xs text-gray-500">This is a computer generated bill</p>
        <p className="text-xs text-gray-500 mt-2">
          For feedback: restaurant@hotelbook.com
        </p>
      </div>

      {/* Duplicate/Original Indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs border border-gray-400 px-2 py-0.5 rounded">
          CUSTOMER COPY
        </span>
      </div>
    </div>
  );
};
