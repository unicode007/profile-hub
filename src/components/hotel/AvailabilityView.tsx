import { useState } from "react";
import { Hotel, Booking } from "./types";
import { RoomCalendar } from "./RoomCalendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar } from "lucide-react";

interface AvailabilityViewProps {
  hotels: Hotel[];
  bookings: Booking[];
  onBack: () => void;
  onViewBooking: (booking: Booking) => void;
  onMoveBooking: (bookingId: string, newCheckIn: Date, newCheckOut: Date) => void;
}

export const AvailabilityView = ({
  hotels,
  bookings,
  onBack,
  onViewBooking,
  onMoveBooking,
}: AvailabilityViewProps) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || "");
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Room Availability
          </h1>
        </div>
        
        <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select hotel" />
          </SelectTrigger>
          <SelectContent>
            {hotels.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id}>
                {hotel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedHotel && (
        <RoomCalendar
          hotel={selectedHotel}
          bookings={bookings}
          onViewBooking={onViewBooking}
          onMoveBooking={onMoveBooking}
        />
      )}

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click on a booking to view its details</li>
          <li>Drag and drop bookings to reschedule them</li>
          <li>Use the room filter to view specific room types</li>
          <li>Navigate between months using the arrows</li>
        </ul>
      </div>
    </div>
  );
};
