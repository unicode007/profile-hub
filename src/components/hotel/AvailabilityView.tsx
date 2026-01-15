import { useState } from "react";
import { Hotel, Booking } from "./types";
import { RoomCalendar } from "./RoomCalendar";
import { DateAvailabilityCalendar } from "./DateAvailabilityCalendar";
import { BookingCalendar } from "./BookingCalendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, CalendarCheck, CalendarRange, Grid3X3 } from "lucide-react";

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
  const [calendarType, setCalendarType] = useState<"room" | "date" | "booking">("room");
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Availability & Calendars
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {calendarType !== "booking" && (
            <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
              <SelectTrigger className="w-[200px]">
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
          )}
        </div>
      </div>

      {/* Calendar Type Tabs */}
      <Tabs value={calendarType} onValueChange={(v) => setCalendarType(v as typeof calendarType)}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="room" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Room Grid
          </TabsTrigger>
          <TabsTrigger value="date" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Date View
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <CalendarRange className="h-4 w-4" />
            Booking Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="room" className="mt-6">
          {selectedHotel && (
            <RoomCalendar
              hotel={selectedHotel}
              bookings={bookings}
              onViewBooking={onViewBooking}
              onMoveBooking={onMoveBooking}
            />
          )}
        </TabsContent>

        <TabsContent value="date" className="mt-6">
          {selectedHotel && (
            <DateAvailabilityCalendar
              hotel={selectedHotel}
              bookings={bookings}
            />
          )}
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <BookingCalendar
            hotels={hotels}
            bookings={bookings}
            onViewBooking={onViewBooking}
          />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        <p className="font-medium mb-2">💡 Calendar Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Room Grid:</strong> View room-by-room availability, drag bookings to reschedule</li>
          <li><strong>Date View:</strong> See daily availability with color-coded status indicators</li>
          <li><strong>Booking Calendar:</strong> Track check-ins, check-outs, and guest stays across all hotels</li>
        </ul>
      </div>
    </div>
  );
};
