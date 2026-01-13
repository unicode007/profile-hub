import { useState } from "react";
import { Hotel, RoomType, RoomPlan, Booking } from "./types";
import { HotelOnboarding } from "./HotelOnboarding";
import { HotelView } from "./HotelView";
import { HotelListingPage } from "./HotelListingPage";
import { BookingCheckout, BookingDetails } from "./BookingCheckout";
import { BookingConfirmation } from "./BookingConfirmation";
import { MyBookings } from "./MyBookings";
import { UserHeader } from "./UserHeader";
import { DEMO_HOTELS } from "./demoData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

type View = "list" | "add" | "view" | "checkout" | "confirmation" | "bookings";

export const HotelManager = () => {
  const { isAuthenticated, addBooking } = useAuth();
  const [view, setView] = useState<View>("list");
  const [hotels, setHotels] = useState<Hotel[]>(DEMO_HOTELS);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RoomPlan | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingId, setBookingId] = useState<string>("");

  const handleHotelCreated = (hotel: Hotel) => {
    setHotels([...hotels, hotel]);
    setSelectedHotel(hotel);
    setView("view");
  };

  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setView("view");
  };

  const handleBack = () => {
    setSelectedHotel(null);
    setSelectedRoom(null);
    setSelectedPlan(null);
    setView("list");
  };

  const handleBookNow = (room: RoomType, plan: RoomPlan) => {
    setSelectedRoom(room);
    setSelectedPlan(plan);
    setView("checkout");
  };

  const handleBackToView = () => {
    setSelectedRoom(null);
    setSelectedPlan(null);
    setView("view");
  };

  const handleConfirmBooking = (details: BookingDetails) => {
    setBookingDetails(details);
    const newBookingId = `BK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setBookingId(newBookingId);

    // Add to user bookings if authenticated
    if (isAuthenticated && selectedHotel && selectedRoom && selectedPlan) {
      const nights = Math.ceil((details.checkOut.getTime() - details.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const booking: Booking = {
        id: newBookingId,
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        hotelImage: selectedHotel.images?.[0],
        hotelAddress: `${selectedHotel.location.address}, ${selectedHotel.location.city}`,
        roomName: selectedRoom.name,
        planName: selectedPlan.name,
        checkIn: details.checkIn,
        checkOut: details.checkOut,
        guests: details.guests,
        rooms: details.rooms,
        guestInfo: details.guestInfo,
        totalAmount: (selectedPlan.discountedPrice + selectedPlan.taxesAndFees) * nights * details.rooms,
        status: "confirmed",
        paymentMethod: details.paymentMethod,
        createdAt: new Date(),
      };
      addBooking(booking);
    }

    setView("confirmation");
    toast.success("Booking confirmed successfully!");
  };

  const handleBackToHotels = () => {
    setSelectedHotel(null);
    setSelectedRoom(null);
    setSelectedPlan(null);
    setBookingDetails(null);
    setBookingId("");
    setView("list");
  };

  return (
    <div>
      {/* Header with User Auth */}
      <div className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToHotels}>
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HotelBook</span>
          </div>
          <UserHeader onNavigateToBookings={() => setView("bookings")} />
        </div>
      </div>

      <div className={view === "checkout" || view === "confirmation" ? "" : "container mx-auto p-6 max-w-6xl"}>
        {view === "list" && (
          <HotelListingPage
            hotels={hotels}
            onViewHotel={handleViewHotel}
            onAddNew={() => setView("add")}
          />
        )}
        {view === "add" && (
          <div>
            <div className="mb-4">
              <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to Hotels
              </button>
            </div>
            <HotelOnboarding onHotelCreated={handleHotelCreated} />
          </div>
        )}
        {view === "view" && selectedHotel && (
          <HotelView hotel={selectedHotel} onBack={handleBack} onBookNow={handleBookNow} />
        )}
        {view === "checkout" && selectedHotel && selectedRoom && selectedPlan && (
          <BookingCheckout
            hotel={selectedHotel}
            room={selectedRoom}
            plan={selectedPlan}
            onBack={handleBackToView}
            onConfirm={handleConfirmBooking}
          />
        )}
        {view === "confirmation" && selectedHotel && selectedRoom && selectedPlan && bookingDetails && (
          <BookingConfirmation
            hotel={selectedHotel}
            room={selectedRoom}
            plan={selectedPlan}
            booking={bookingDetails}
            bookingId={bookingId}
            onBackToHotels={handleBackToHotels}
          />
        )}
        {view === "bookings" && <MyBookings />}
      </div>
    </div>
  );
};
