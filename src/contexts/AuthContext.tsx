import { createContext, useContext, useState, ReactNode } from "react";
import { User, Booking } from "@/components/hotel/types";
import { addDays, subDays } from "date-fns";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  bookings: Booking[];
  allBookings: Booking[]; // For hotel management dashboard
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  checkIn: (bookingId: string) => void;
  checkOut: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo bookings for the demo user
const DEMO_BOOKINGS: Booking[] = [
  {
    id: "BK001DEMO",
    hotelId: "demo-1",
    hotelName: "Grand Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    hotelAddress: "123 Main Street, Downtown, Hyderabad",
    roomName: "Deluxe Room - Queen Bed",
    planName: "Room with Breakfast",
    checkIn: addDays(new Date(), 1),
    checkOut: addDays(new Date(), 4),
    guests: { adults: 2, children: 1 },
    rooms: 1,
    guestInfo: {
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      phone: "+91 9876543210",
      country: "India",
    },
    totalAmount: 5823,
    status: "confirmed",
    paymentMethod: "card",
    createdAt: new Date(),
  },
  {
    id: "BK002DEMO",
    hotelId: "demo-6",
    hotelName: "Heritage Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    hotelAddress: "Palace Road, Old City, Jaipur",
    roomName: "Royal Suite",
    planName: "Royal Experience",
    checkIn: subDays(new Date(), 10),
    checkOut: subDays(new Date(), 7),
    guests: { adults: 2, children: 0 },
    rooms: 1,
    guestInfo: {
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      phone: "+91 9876543210",
      country: "India",
    },
    totalAmount: 40317,
    status: "completed",
    paymentMethod: "upi",
    createdAt: subDays(new Date(), 15),
  },
  {
    id: "BK003DEMO",
    hotelId: "demo-2",
    hotelName: "Seaside Beach Resort",
    hotelImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    hotelAddress: "Beach Road, Coastal Area, Goa",
    roomName: "Ocean View Cottage",
    planName: "Beach Getaway Package",
    checkIn: addDays(new Date(), 30),
    checkOut: addDays(new Date(), 34),
    guests: { adults: 2, children: 2 },
    rooms: 2,
    guestInfo: {
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      phone: "+91 9876543210",
      country: "India",
    },
    totalAmount: 53752,
    status: "pending",
    paymentMethod: "payathotel",
    createdAt: new Date(),
  },
];

// Additional bookings for hotel management demo
const ALL_DEMO_BOOKINGS: Booking[] = [
  ...DEMO_BOOKINGS,
  {
    id: "BK004DEMO",
    hotelId: "demo-1",
    hotelName: "Grand Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    hotelAddress: "123 Main Street, Downtown, Hyderabad",
    roomName: "Executive Suite",
    planName: "Suite With Free Cancellation",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 2),
    guests: { adults: 2, children: 0 },
    rooms: 1,
    guestInfo: {
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543211",
      country: "India",
    },
    totalAmount: 8540,
    status: "confirmed",
    paymentMethod: "card",
    createdAt: subDays(new Date(), 3),
  },
  {
    id: "BK005DEMO",
    hotelId: "demo-1",
    hotelName: "Grand Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    hotelAddress: "123 Main Street, Downtown, Hyderabad",
    roomName: "Deluxe Room - Queen Bed",
    planName: "Room with Breakfast",
    checkIn: subDays(new Date(), 1),
    checkOut: new Date(),
    guests: { adults: 1, children: 0 },
    rooms: 1,
    guestInfo: {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya@example.com",
      phone: "+91 9876543212",
      country: "India",
    },
    totalAmount: 1941,
    status: "checked-in",
    paymentMethod: "upi",
    createdAt: subDays(new Date(), 5),
    checkInTime: subDays(new Date(), 1),
  },
  {
    id: "BK006DEMO",
    hotelId: "demo-1",
    hotelName: "Grand Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    hotelAddress: "123 Main Street, Downtown, Hyderabad",
    roomName: "Premium Suite",
    planName: "Premium Stay",
    checkIn: addDays(new Date(), 7),
    checkOut: addDays(new Date(), 10),
    guests: { adults: 2, children: 1 },
    rooms: 1,
    guestInfo: {
      firstName: "Amit",
      lastName: "Kumar",
      email: "amit@example.com",
      phone: "+91 9876543213",
      country: "India",
    },
    totalAmount: 23517,
    status: "confirmed",
    paymentMethod: "card",
    createdAt: new Date(),
  },
  {
    id: "BK007DEMO",
    hotelId: "demo-3",
    hotelName: "Mountain View Lodge",
    hotelImage: "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800",
    hotelAddress: "Hill Station Road, Shimla",
    roomName: "Mountain View Room",
    planName: "Cozy Mountain Stay",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    guests: { adults: 2, children: 0 },
    rooms: 1,
    guestInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "+1 555-1234",
      country: "United States",
    },
    totalAmount: 11085,
    status: "confirmed",
    paymentMethod: "card",
    createdAt: subDays(new Date(), 2),
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>(ALL_DEMO_BOOKINGS);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login - accepts any email/password
    if (email && password) {
      const demoUser: User = {
        id: "user-1",
        email: email,
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        phone: "+91 9876543210",
        createdAt: new Date(),
      };
      setUser(demoUser);
      setBookings(DEMO_BOOKINGS);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    if (name && email && password) {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        name: name,
        createdAt: new Date(),
      };
      setUser(newUser);
      setBookings([]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setBookings([]);
  };

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
    setAllBookings((prev) => [booking, ...prev]);
  };

  const cancelBooking = (bookingId: string) => {
    const updateStatus = (prev: Booking[]) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b));
    setBookings(updateStatus);
    setAllBookings(updateStatus);
  };

  const checkIn = (bookingId: string) => {
    const updateStatus = (prev: Booking[]) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "checked-in" as const, checkInTime: new Date() } : b
      );
    setBookings(updateStatus);
    setAllBookings(updateStatus);
  };

  const checkOut = (bookingId: string) => {
    const updateStatus = (prev: Booking[]) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "checked-out" as const, checkOutTime: new Date() } : b
      );
    setBookings(updateStatus);
    setAllBookings(updateStatus);
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    const updateStatus = (prev: Booking[]) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b));
    setBookings(updateStatus);
    setAllBookings(updateStatus);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        bookings,
        allBookings,
        login,
        signup,
        logout,
        addBooking,
        cancelBooking,
        checkIn,
        checkOut,
        updateBookingStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
