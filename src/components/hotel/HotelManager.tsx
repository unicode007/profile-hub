import { useState } from "react";
import { Hotel, RoomType, RoomPlan, Booking } from "./types";
import { HotelOnboarding } from "./HotelOnboarding";
import { HotelView } from "./HotelView";
import { HotelListingPage } from "./HotelListingPage";
import { BookingCheckout, BookingDetails } from "./BookingCheckout";
import { BookingConfirmation } from "./BookingConfirmation";
import { MyBookings } from "./MyBookings";
import { BookingDetail } from "./BookingDetail";
import { HotelDashboard } from "./HotelDashboard";
import { InvoiceView } from "./InvoiceView";
import { UserHeader } from "./UserHeader";
import { AvailabilityView } from "./AvailabilityView";
import { DEMO_HOTELS } from "./demoData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Building2, LayoutDashboard, Hotel as HotelIcon, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type View = 
  | "list" 
  | "add" 
  | "view" 
  | "checkout" 
  | "confirmation" 
  | "bookings" 
  | "booking-detail" 
  | "dashboard"
  | "invoice"
  | "availability";

export const HotelManager = () => {
  const { isAuthenticated, user, bookings: userBookings, addBooking, allBookings, checkIn, checkOut, cancelBooking, moveBooking, reviews, addReview } = useAuth();
  const [view, setView] = useState<View>("list");
  const [hotels, setHotels] = useState<Hotel[]>(DEMO_HOTELS);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RoomPlan | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [mainTab, setMainTab] = useState<"hotels" | "dashboard">("hotels");

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
        specialRequests: details.specialRequests,
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
    setSelectedBooking(null);
    setView("list");
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setView("booking-detail");
  };

  const handleCheckIn = (bookingId: string) => {
    checkIn(bookingId);
    toast.success("Guest checked in successfully!");
  };

  const handleCheckOut = (bookingId: string) => {
    checkOut(bookingId);
    toast.success("Guest checked out successfully!");
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
    toast.success("Booking cancelled successfully!");
    if (view === "booking-detail") {
      setView("bookings");
    }
  };

  const handleViewInvoice = (booking: Booking) => {
    setSelectedBooking(booking);
    setView("invoice");
  };

  const handleMoveBooking = (bookingId: string, newCheckIn: Date, newCheckOut: Date) => {
    moveBooking(bookingId, newCheckIn, newCheckOut);
    toast.success("Booking rescheduled successfully!");
  };

  return (
    <div>
      {/* Header with User Auth */}
      <div className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToHotels}>
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HotelBook</span>
            </div>
            
            {/* Main Navigation */}
            {isAuthenticated && (
              <>
                <Tabs value={mainTab} onValueChange={(v) => {
                  setMainTab(v as "hotels" | "dashboard");
                  if (v === "dashboard") {
                    setView("dashboard");
                  } else {
                    setView("list");
                  }
                }} className="ml-4">
                  <TabsList>
                    <TabsTrigger value="hotels" className="gap-2">
                      <HotelIcon className="h-4 w-4" /> Hotels
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 gap-2"
                  onClick={() => setView("availability")}
                >
                  <CalendarDays className="h-4 w-4" />
                  Availability
                </Button>
              </>
            )}
          </div>
          <UserHeader onNavigateToBookings={() => {
            setMainTab("hotels");
            setView("bookings");
          }} />
        </div>
      </div>

      <div className={view === "checkout" || view === "confirmation" || view === "invoice" ? "" : "container mx-auto p-6 max-w-6xl"}>
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
          <HotelView 
            hotel={selectedHotel} 
            onBack={handleBack} 
            onBookNow={handleBookNow}
            reviews={reviews}
            onAddReview={addReview}
            userBookings={userBookings}
            currentUserId={user?.id}
          />
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
        {view === "bookings" && (
          <MyBookings 
            onViewBooking={handleViewBooking}
            onViewInvoice={handleViewInvoice}
          />
        )}
        {view === "booking-detail" && selectedBooking && (
          <BookingDetail
            booking={selectedBooking}
            onBack={() => setView("bookings")}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onCancel={handleCancelBooking}
          />
        )}
        {view === "dashboard" && (
          <HotelDashboard
            bookings={allBookings}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onViewBooking={handleViewBooking}
          />
        )}
        {view === "invoice" && selectedBooking && (
          <div className="container mx-auto p-6 max-w-4xl">
            <InvoiceView 
              booking={selectedBooking} 
              onClose={() => setView("bookings")} 
            />
          </div>
        )}
        {view === "availability" && (
          <AvailabilityView
            hotels={hotels}
            bookings={allBookings}
            onBack={() => {
              setMainTab("dashboard");
              setView("dashboard");
            }}
            onViewBooking={handleViewBooking}
            onMoveBooking={handleMoveBooking}
          />
        )}
      </div>
    </div>
  );
};
