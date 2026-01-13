export interface RoomType {
  id: string;
  name: string;
  size: string;
  view: string;
  bedType: string;
  bedCount: number;
  bathrooms: number;
  amenities: string[];
  plans: RoomPlan[];
  images?: string[];
}

export interface RoomPlan {
  id: string;
  name: string;
  features: string[];
  originalPrice: number;
  discountedPrice: number;
  taxesAndFees: number;
  freeCancellation: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  amenities: {
    basicFacilities: string[];
    generalServices: string[];
    healthAndWellness: string[];
    transfers: string[];
    roomAmenities: string[];
    foodAndDrinks: string[];
    safetyAndSecurity: string[];
    entertainment: string[];
    commonArea: string[];
    businessCenter: string[];
    otherFacilities: string[];
  };
  roomTypes: RoomType[];
  images?: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  hotelAddress: string;
  roomName: string;
  planName: string;
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
  };
  rooms: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  paymentMethod: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export const AMENITIES_DATA = {
  basicFacilities: [
    { name: "Power Backup", note: "" },
    { name: "Elevator/Lift", note: "" },
    { name: "Housekeeping", note: "" },
    { name: "Washing Machine", note: "" },
    { name: "Umbrellas", note: "" },
    { name: "Room Service", note: "Limited duration" },
    { name: "Laundry Service", note: "Paid" },
    { name: "Air Conditioning", note: "Room controlled" },
    { name: "Newspaper", note: "Local Language" },
    { name: "Free Parking", note: "Free - Onsite" },
    { name: "Free Wi-Fi", note: "Speed Suitable for working" },
  ],
  generalServices: [
    { name: "Luggage Assistance", note: "" },
    { name: "Doctor on Call", note: "" },
    { name: "Multilingual Staff", note: "English, Telugu" },
  ],
  healthAndWellness: [
    { name: "First-aid Services", note: "" },
    { name: "Gym", note: "" },
    { name: "Spa", note: "" },
    { name: "Swimming Pool", note: "" },
  ],
  transfers: [
    { name: "Paid Airport Transfers", note: "" },
    { name: "Paid Shuttle Service", note: "" },
  ],
  roomAmenities: [
    { name: "Mineral Water", note: "" },
    { name: "Hairdryer", note: "Available in some rooms" },
    { name: "Fireplace", note: "Available in some rooms" },
    { name: "Air Conditioning", note: "Room controlled" },
    { name: "Dental Kit", note: "Available in some rooms" },
    { name: "Iron/Ironing Board", note: "Available in some rooms" },
    { name: "Geyser/Water Heater", note: "Available in some rooms" },
    { name: "Toiletries", note: "Shampoo, Soap" },
    { name: "Dining Area", note: "Available in some rooms" },
    { name: "Work Desk", note: "Available in some rooms" },
    { name: "Heater", note: "Available in some rooms" },
  ],
  foodAndDrinks: [
    { name: "Restaurant", note: "Halal, Kosher" },
    { name: "Dining Area", note: "" },
    { name: "Barbeque", note: "" },
  ],
  safetyAndSecurity: [
    { name: "CCTV", note: "" },
    { name: "Fire Extinguishers", note: "" },
    { name: "Security Alarms", note: "" },
    { name: "Security Guard", note: "" },
  ],
  entertainment: [
    { name: "Entertainment", note: "" },
    { name: "Movie Room", note: "" },
    { name: "Music System", note: "" },
  ],
  commonArea: [
    { name: "Lounge", note: "Cigar lounge" },
    { name: "Balcony/Terrace", note: "" },
    { name: "Reception", note: "24 hours" },
    { name: "Garden", note: "" },
  ],
  businessCenter: [
    { name: "Printer", note: "" },
    { name: "Photocopying", note: "" },
    { name: "Business Centre", note: "" },
    { name: "Conference Room", note: "" },
    { name: "Banquet", note: "" },
    { name: "Fax Service", note: "" },
  ],
  otherFacilities: [
    { name: "Cloak Room", note: "" },
    { name: "Concierge", note: "" },
    { name: "Kids Play Area", note: "" },
  ],
};

export const HOTEL_CATEGORIES = [
  "Budget",
  "Standard",
  "Premium",
  "Luxury",
  "Boutique",
  "Resort",
  "Business Hotel",
  "Heritage",
];

export const ROOM_AMENITIES_OPTIONS = [
  "Daily Housekeeping",
  "Free Wi-Fi",
  "In-room Dining",
  "Room Service",
  "Bathroom",
  "Mineral Water",
  "Air Conditioning",
  "Work Desk",
  "Telephone",
  "Chair",
  "24-hour In-room Dining",
  "Iron/Ironing Board",
];
