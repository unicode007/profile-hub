import { useState } from "react";
import { Hotel, RoomType, RoomPlan } from "./types";
import { HotelOnboarding } from "./HotelOnboarding";
import { HotelList } from "./HotelList";
import { HotelView } from "./HotelView";
import { BookingCheckout, BookingDetails } from "./BookingCheckout";
import { BookingConfirmation } from "./BookingConfirmation";
import { toast } from "sonner";

type View = "list" | "add" | "view" | "checkout" | "confirmation";

// Demo hotel data
const demoHotel: Hotel = {
  id: "demo-1",
  name: "Grand Palace Hotel",
  description: "A luxurious 5-star hotel in the heart of the city with world-class amenities and exceptional service.",
  category: "Luxury",
  location: {
    address: "123 Main Street, Downtown",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    country: "India",
  },
  amenities: {
    basicFacilities: ["Power Backup", "Elevator/Lift", "Housekeeping", "Room Service", "Air Conditioning", "Free Wi-Fi", "Free Parking"],
    generalServices: ["Luggage Assistance", "Doctor on Call", "Multilingual Staff"],
    healthAndWellness: ["First-aid Services", "Gym", "Spa", "Swimming Pool"],
    transfers: ["Paid Airport Transfers", "Paid Shuttle Service"],
    roomAmenities: ["Mineral Water", "Hairdryer", "Air Conditioning", "Toiletries", "Work Desk"],
    foodAndDrinks: ["Restaurant", "Dining Area", "Barbeque"],
    safetyAndSecurity: ["CCTV", "Fire Extinguishers", "Security Alarms", "Security Guard"],
    entertainment: ["Entertainment", "Movie Room", "Music System"],
    commonArea: ["Lounge", "Balcony/Terrace", "Reception", "Garden"],
    businessCenter: ["Printer", "Conference Room", "Banquet", "Business Centre"],
    otherFacilities: ["Cloak Room", "Concierge"],
  },
  roomTypes: [
    {
      id: "room-1",
      name: "Deluxe Room - Queen Bed (Non AC)",
      size: "250 sq.ft (23 sq.mt)",
      view: "City View",
      bedType: "Queen Bed",
      bedCount: 1,
      bathrooms: 1,
      amenities: ["Daily Housekeeping", "Free Wi-Fi", "In-room Dining", "Room Service", "Bathroom", "Mineral Water"],
      plans: [
        {
          id: "plan-1",
          name: "Room With Free Cancellation",
          features: ["Free stay for the kid", "10% Discount On F&B Services", "Existing bed(s) can accommodate all the guests"],
          originalPrice: 2500,
          discountedPrice: 1257,
          taxesAndFees: 171,
          freeCancellation: true,
        },
        {
          id: "plan-2",
          name: "Room with Breakfast",
          features: ["Free stay for the kid", "10% Discount On F&B Services", "Guaranteed Complimentary Breakfast at Desi Tadka"],
          originalPrice: 3400,
          discountedPrice: 1709,
          taxesAndFees: 232,
          freeCancellation: true,
        },
      ],
    },
    {
      id: "room-2",
      name: "Deluxe Room - Queen Bed (AC)",
      size: "250 sq.ft (23 sq.mt)",
      view: "City View",
      bedType: "Queen Bed",
      bedCount: 1,
      bathrooms: 1,
      amenities: ["Daily Housekeeping", "Free Wi-Fi", "In-room Dining", "Room Service", "Bathroom", "Mineral Water", "Air Conditioning"],
      plans: [
        {
          id: "plan-3",
          name: "Room With Free Cancellation",
          features: ["Free stay for the kid", "Existing bed(s) can accommodate all the guests"],
          originalPrice: 3500,
          discountedPrice: 1759,
          taxesAndFees: 239,
          freeCancellation: true,
        },
        {
          id: "plan-4",
          name: "Room With Free Cancellation | Breakfast only",
          features: ["Free stay for the kid", "Breakfast included", "Existing bed(s) can accommodate all the guests"],
          originalPrice: 4400,
          discountedPrice: 2212,
          taxesAndFees: 301,
          freeCancellation: true,
        },
        {
          id: "plan-5",
          name: "Room With Free Cancellation | Breakfast + Lunch/Dinner",
          features: ["Free stay for the kid", "Guaranteed Complimentary Breakfast at Desi Tadka", "Guaranteed Complimentary Lunch Or Dinner at Desi Tadka"],
          originalPrice: 5000,
          discountedPrice: 2513,
          taxesAndFees: 342,
          freeCancellation: true,
        },
      ],
    },
    {
      id: "room-3",
      name: "Executive Room AC - Double Bed",
      size: "625 sq.ft (58 sq.mt)",
      view: "City View",
      bedType: "Double Bed",
      bedCount: 2,
      bathrooms: 1,
      amenities: ["Bathroom", "Mineral Water", "Air Conditioning", "Chair", "Work Desk", "Telephone"],
      plans: [
        {
          id: "plan-6",
          name: "Room With Free Cancellation",
          features: ["Free stay for the kid", "Existing bed(s) can accommodate all the guests"],
          originalPrice: 5500,
          discountedPrice: 2764,
          taxesAndFees: 376,
          freeCancellation: true,
        },
        {
          id: "plan-7",
          name: "Room With Free Cancellation | Breakfast only",
          features: ["Free stay for the kid", "Breakfast included", "Existing bed(s) can accommodate all the guests"],
          originalPrice: 6400,
          discountedPrice: 3217,
          taxesAndFees: 438,
          freeCancellation: true,
        },
        {
          id: "plan-8",
          name: "Room With Free Cancellation | Breakfast + Lunch/Dinner",
          features: ["Free stay for the kid", "Complimentary Breakfast", "Guaranteed Complimentary Lunch Or Dinner at Desi Tadka"],
          originalPrice: 7000,
          discountedPrice: 3518,
          taxesAndFees: 479,
          freeCancellation: true,
        },
      ],
    },
  ],
  createdAt: new Date(),
};

export const HotelManager = () => {
  const [view, setView] = useState<View>("list");
  const [hotels, setHotels] = useState<Hotel[]>([demoHotel]);
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
    <div className={view === "checkout" || view === "confirmation" ? "" : "container mx-auto p-6 max-w-6xl"}>
      {view === "list" && (
        <HotelList
          hotels={hotels}
          onViewHotel={handleViewHotel}
          onAddNew={() => setView("add")}
        />
      )}
      {view === "add" && (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
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
    </div>
  );
};
