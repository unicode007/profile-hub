import { createContext, useContext, useState, ReactNode } from "react";
import { User, Booking } from "@/components/hotel/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  bookings: Booking[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
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
    checkIn: new Date("2025-02-15"),
    checkOut: new Date("2025-02-18"),
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
    createdAt: new Date("2025-01-10"),
  },
  {
    id: "BK002DEMO",
    hotelId: "demo-6",
    hotelName: "Heritage Palace Hotel",
    hotelImage: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    hotelAddress: "Palace Road, Old City, Jaipur",
    roomName: "Royal Suite",
    planName: "Royal Experience",
    checkIn: new Date("2024-12-20"),
    checkOut: new Date("2024-12-23"),
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
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "BK003DEMO",
    hotelId: "demo-2",
    hotelName: "Seaside Beach Resort",
    hotelImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    hotelAddress: "Beach Road, Coastal Area, Goa",
    roomName: "Ocean View Cottage",
    planName: "Beach Getaway Package",
    checkIn: new Date("2025-03-10"),
    checkOut: new Date("2025-03-14"),
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
    createdAt: new Date("2025-01-12"),
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

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
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        bookings,
        login,
        signup,
        logout,
        addBooking,
        cancelBooking,
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
