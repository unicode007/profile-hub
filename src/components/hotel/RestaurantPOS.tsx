import { useState } from "react";
import { Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, addDays, isSameDay } from "date-fns";
import { PrintModal } from "./PrintModal";
import { RestaurantBillPrint } from "./RestaurantBillPrint";
import {
  UtensilsCrossed,
  Coffee,
  Wine,
  IceCream,
  Pizza,
  Soup,
  Salad,
  Beef,
  Fish,
  Cake,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Users,
  Clock,
  ChefHat,
  Bell,
  CheckCircle,
  XCircle,
  Printer,
  Send,
  Search,
  LayoutGrid,
  List,
  Calendar,
  AlertTriangle,
  Volume2,
  Timer,
  Flame,
  Sparkles,
  Phone,
  Mail,
  CalendarPlus,
  Edit,
  Eye,
} from "lucide-react";

// Menu Categories
export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  image?: string;
  spiceLevel?: "mild" | "medium" | "hot" | "extra-hot";
  isPopular?: boolean;
  isChefSpecial?: boolean;
  allergens?: string[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
  kotTime?: Date;
}

export interface RestaurantOrder {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: "active" | "billed" | "paid" | "cancelled";
  createdAt: Date;
  guestInfo?: {
    roomNumber?: string;
    bookingId?: string;
    guestName?: string;
  };
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: "cash" | "card" | "upi" | "room";
  kotNumbers: number[];
  serverName?: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrderId?: string;
  section?: "indoor" | "outdoor" | "private" | "bar";
  shape?: "round" | "square" | "rectangle";
}

export interface TableReservation {
  id: string;
  tableNumber: number;
  guestName: string;
  phone: string;
  email?: string;
  date: Date;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
  createdAt: Date;
}

// Demo Menu Data with images and enhanced details
const demoCategories: MenuCategory[] = [
  { id: "starters", name: "Starters", icon: "soup" },
  { id: "salads", name: "Salads", icon: "salad" },
  { id: "main-veg", name: "Main Course (Veg)", icon: "pizza" },
  { id: "main-nonveg", name: "Main Course (Non-Veg)", icon: "beef" },
  { id: "seafood", name: "Seafood", icon: "fish" },
  { id: "beverages", name: "Beverages", icon: "coffee" },
  { id: "desserts", name: "Desserts", icon: "cake" },
  { id: "alcohol", name: "Bar & Spirits", icon: "wine" },
];

const demoMenuItems: MenuItem[] = [
  // Starters
  { id: "m1", name: "Paneer Tikka", categoryId: "starters", price: 320, description: "Cottage cheese marinated in yogurt and spices, grilled in tandoor", isVeg: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", spiceLevel: "medium", isPopular: true },
  { id: "m2", name: "Chicken Tikka", categoryId: "starters", price: 380, description: "Tender chicken pieces marinated in aromatic spices", isVeg: false, isAvailable: true, preparationTime: 18, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300", spiceLevel: "medium", isChefSpecial: true },
  { id: "m3", name: "Spring Rolls", categoryId: "starters", price: 220, description: "Crispy vegetable rolls with sweet chili sauce", isVeg: true, isAvailable: true, preparationTime: 12, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300" },
  { id: "m4", name: "Fish Fingers", categoryId: "starters", price: 420, description: "Battered fish strips with homemade tartar sauce", isVeg: false, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=300" },
  { id: "m5", name: "Mushroom Manchurian", categoryId: "starters", price: 280, description: "Indo-Chinese style mushrooms in spicy gravy", isVeg: true, isAvailable: true, preparationTime: 14, image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=300", spiceLevel: "hot", isPopular: true },
  { id: "m36", name: "Seekh Kebab", categoryId: "starters", price: 360, description: "Minced lamb skewers with mint chutney", isVeg: false, isAvailable: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300", spiceLevel: "hot" },
  { id: "m37", name: "Hara Bhara Kebab", categoryId: "starters", price: 260, description: "Spinach and green pea patties", isVeg: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300" },
  
  // Salads
  { id: "m6", name: "Caesar Salad", categoryId: "salads", price: 290, description: "Romaine lettuce with parmesan and croutons", isVeg: true, isAvailable: true, preparationTime: 8, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300" },
  { id: "m7", name: "Greek Salad", categoryId: "salads", price: 260, description: "Fresh vegetables with feta cheese and olives", isVeg: true, isAvailable: true, preparationTime: 8, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300" },
  { id: "m8", name: "Grilled Chicken Salad", categoryId: "salads", price: 350, description: "Mixed greens with herb grilled chicken", isVeg: false, isAvailable: true, preparationTime: 12, image: "https://images.unsplash.com/photo-1512852939750-1305098529bf?w=300" },
  { id: "m38", name: "Quinoa Bowl", categoryId: "salads", price: 320, description: "Superfood quinoa with roasted vegetables", isVeg: true, isAvailable: true, preparationTime: 10, image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=300", isChefSpecial: true },
  
  // Main Course Veg
  { id: "m9", name: "Paneer Butter Masala", categoryId: "main-veg", price: 340, description: "Cottage cheese in rich tomato and butter gravy", isVeg: true, isAvailable: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300", isPopular: true, spiceLevel: "mild" },
  { id: "m10", name: "Dal Makhani", categoryId: "main-veg", price: 280, description: "Black lentils slow-cooked overnight with cream", isVeg: true, isAvailable: true, preparationTime: 15, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300", isChefSpecial: true },
  { id: "m11", name: "Malai Kofta", categoryId: "main-veg", price: 320, description: "Potato and paneer dumplings in creamy gravy", isVeg: true, isAvailable: true, preparationTime: 22, image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300" },
  { id: "m12", name: "Vegetable Biryani", categoryId: "main-veg", price: 300, description: "Aromatic basmati rice with mixed vegetables", isVeg: true, isAvailable: true, preparationTime: 25, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300", spiceLevel: "medium" },
  { id: "m13", name: "Butter Naan", categoryId: "main-veg", price: 60, description: "Soft leavened bread with butter", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300" },
  { id: "m14", name: "Jeera Rice", categoryId: "main-veg", price: 180, description: "Cumin flavored basmati rice", isVeg: true, isAvailable: true, preparationTime: 10, image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=300" },
  { id: "m39", name: "Palak Paneer", categoryId: "main-veg", price: 320, description: "Cottage cheese in creamy spinach gravy", isVeg: true, isAvailable: true, preparationTime: 18, image: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=300" },
  
  // Main Course Non-Veg
  { id: "m15", name: "Butter Chicken", categoryId: "main-nonveg", price: 420, description: "Tandoori chicken in creamy tomato makhani gravy", isVeg: false, isAvailable: true, preparationTime: 22, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300", isPopular: true, spiceLevel: "mild" },
  { id: "m16", name: "Mutton Rogan Josh", categoryId: "main-nonveg", price: 480, description: "Kashmiri style slow-cooked lamb curry", isVeg: false, isAvailable: true, preparationTime: 30, image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=300", spiceLevel: "hot", isChefSpecial: true },
  { id: "m17", name: "Chicken Biryani", categoryId: "main-nonveg", price: 380, description: "Layered aromatic rice with spiced chicken", isVeg: false, isAvailable: true, preparationTime: 28, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300", isPopular: true, spiceLevel: "medium" },
  { id: "m18", name: "Kadhai Chicken", categoryId: "main-nonveg", price: 400, description: "Spicy chicken with bell peppers in iron wok", isVeg: false, isAvailable: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=300", spiceLevel: "hot" },
  { id: "m40", name: "Lamb Chops", categoryId: "main-nonveg", price: 650, description: "Grilled lamb chops with mint sauce", isVeg: false, isAvailable: true, preparationTime: 25, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300", isChefSpecial: true },
  
  // Seafood
  { id: "m19", name: "Fish Curry", categoryId: "seafood", price: 450, description: "Traditional coastal fish in coconut gravy", isVeg: false, isAvailable: true, preparationTime: 20, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300", spiceLevel: "medium" },
  { id: "m20", name: "Prawns Masala", categoryId: "seafood", price: 520, description: "Tiger prawns in spicy onion tomato gravy", isVeg: false, isAvailable: true, preparationTime: 18, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300", spiceLevel: "hot", isPopular: true },
  { id: "m21", name: "Grilled Fish", categoryId: "seafood", price: 580, description: "Fresh catch grilled with herbs and lemon", isVeg: false, isAvailable: true, preparationTime: 22, image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=300" },
  { id: "m41", name: "Lobster Thermidor", categoryId: "seafood", price: 1200, description: "Whole lobster in creamy cheese sauce", isVeg: false, isAvailable: true, preparationTime: 35, image: "https://images.unsplash.com/photo-1553247407-23251ce81f59?w=300", isChefSpecial: true },
  
  // Beverages
  { id: "m22", name: "Fresh Lime Soda", categoryId: "beverages", price: 80, description: "Refreshing lime with soda - sweet or salted", isVeg: true, isAvailable: true, preparationTime: 3, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300" },
  { id: "m23", name: "Mango Lassi", categoryId: "beverages", price: 120, description: "Creamy mango yogurt smoothie", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300", isPopular: true },
  { id: "m24", name: "Masala Chai", categoryId: "beverages", price: 60, description: "Traditional spiced Indian tea", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300" },
  { id: "m25", name: "Filter Coffee", categoryId: "beverages", price: 80, description: "South Indian style decoction coffee", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300" },
  { id: "m26", name: "Fresh Juice", categoryId: "beverages", price: 150, description: "Orange, Watermelon, or Mixed Fruit", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300" },
  { id: "m42", name: "Virgin Mojito", categoryId: "beverages", price: 180, description: "Mint, lime, and soda refresher", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300", isPopular: true },
  
  // Desserts
  { id: "m27", name: "Gulab Jamun", categoryId: "desserts", price: 120, description: "2 pcs with warm rabri", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1666190094749-96ce0e39f075?w=300" },
  { id: "m28", name: "Rasmalai", categoryId: "desserts", price: 140, description: "Soft cheese dumplings in saffron milk", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300", isPopular: true },
  { id: "m29", name: "Chocolate Brownie", categoryId: "desserts", price: 180, description: "Warm brownie with vanilla ice cream", isVeg: true, isAvailable: true, preparationTime: 8, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=300" },
  { id: "m30", name: "Ice Cream Sundae", categoryId: "desserts", price: 160, description: "3 scoops with chocolate sauce and nuts", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300" },
  { id: "m43", name: "Tiramisu", categoryId: "desserts", price: 220, description: "Italian coffee-flavored layered dessert", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300", isChefSpecial: true },
  
  // Bar & Spirits
  { id: "m31", name: "Kingfisher Premium", categoryId: "alcohol", price: 250, description: "330ml chilled bottle", isVeg: true, isAvailable: true, preparationTime: 2, image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300" },
  { id: "m32", name: "Budweiser", categoryId: "alcohol", price: 280, description: "330ml imported lager", isVeg: true, isAvailable: true, preparationTime: 2, image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300" },
  { id: "m33", name: "IMFL Whisky (30ml)", categoryId: "alcohol", price: 180, description: "Blenders Pride / Royal Stag", isVeg: true, isAvailable: true, preparationTime: 2, image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300" },
  { id: "m34", name: "Vodka (30ml)", categoryId: "alcohol", price: 200, description: "Smirnoff / Absolut", isVeg: true, isAvailable: true, preparationTime: 2, image: "https://images.unsplash.com/photo-1598018553943-85ca3c6f8e51?w=300" },
  { id: "m35", name: "Wine Glass", categoryId: "alcohol", price: 350, description: "House Red or White", isVeg: true, isAvailable: true, preparationTime: 2, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300" },
  { id: "m44", name: "Classic Cocktail", categoryId: "alcohol", price: 450, description: "Mojito, Margarita, or Cosmopolitan", isVeg: true, isAvailable: true, preparationTime: 5, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300" },
];

// Demo Tables with sections
const generateDemoTables = (): RestaurantTable[] => {
  return [
    { id: "table-1", number: 1, capacity: 2, status: "available", section: "indoor", shape: "round" },
    { id: "table-2", number: 2, capacity: 2, status: "available", section: "indoor", shape: "round" },
    { id: "table-3", number: 3, capacity: 4, status: "occupied", section: "indoor", shape: "square", currentOrderId: "order-demo-1" },
    { id: "table-4", number: 4, capacity: 4, status: "available", section: "indoor", shape: "square" },
    { id: "table-5", number: 5, capacity: 4, status: "available", section: "indoor", shape: "square" },
    { id: "table-6", number: 6, capacity: 4, status: "reserved", section: "indoor", shape: "rectangle" },
    { id: "table-7", number: 7, capacity: 6, status: "available", section: "outdoor", shape: "rectangle" },
    { id: "table-8", number: 8, capacity: 6, status: "available", section: "outdoor", shape: "rectangle" },
    { id: "table-9", number: 9, capacity: 4, status: "cleaning", section: "outdoor", shape: "square" },
    { id: "table-10", number: 10, capacity: 8, status: "available", section: "private", shape: "rectangle" },
    { id: "table-11", number: 11, capacity: 10, status: "reserved", section: "private", shape: "rectangle" },
    { id: "table-12", number: 12, capacity: 2, status: "occupied", section: "bar", shape: "round", currentOrderId: "order-demo-2" },
    { id: "table-13", number: 13, capacity: 2, status: "available", section: "bar", shape: "round" },
    { id: "table-14", number: 14, capacity: 2, status: "available", section: "bar", shape: "round" },
    { id: "table-15", number: 15, capacity: 4, status: "available", section: "bar", shape: "square" },
  ];
};

// Demo Reservations
const generateDemoReservations = (): TableReservation[] => {
  const today = new Date();
  return [
    {
      id: "res-1",
      tableNumber: 6,
      guestName: "Mr. Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@email.com",
      date: today,
      time: "19:30",
      partySize: 4,
      specialRequests: "Anniversary celebration, need cake arrangement",
      status: "confirmed",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "res-2",
      tableNumber: 11,
      guestName: "Ms. Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya.s@company.com",
      date: today,
      time: "20:00",
      partySize: 8,
      specialRequests: "Business dinner, vegetarian preferences",
      status: "confirmed",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "res-3",
      tableNumber: 10,
      guestName: "Dr. Anil Verma",
      phone: "+91 76543 21098",
      date: addDays(today, 1),
      time: "13:00",
      partySize: 6,
      status: "confirmed",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "res-4",
      tableNumber: 7,
      guestName: "Mrs. Sneha Patel",
      phone: "+91 65432 10987",
      email: "sneha.patel@gmail.com",
      date: addDays(today, 2),
      time: "19:00",
      partySize: 4,
      specialRequests: "Outdoor seating preferred, kid-friendly menu",
      status: "confirmed",
      createdAt: new Date(),
    },
  ];
};

// Demo Orders with more realistic data
const generateDemoOrders = (menuItems: MenuItem[]): RestaurantOrder[] => {
  return [
    {
      id: "order-demo-1",
      tableNumber: 3,
      items: [
        { menuItem: menuItems[0], quantity: 2, status: "served", kotTime: new Date(Date.now() - 40 * 60000) },
        { menuItem: menuItems[14], quantity: 1, status: "preparing", kotTime: new Date(Date.now() - 10 * 60000) },
        { menuItem: menuItems[12], quantity: 4, status: "ready", kotTime: new Date(Date.now() - 15 * 60000) },
        { menuItem: menuItems[22], quantity: 2, status: "served", kotTime: new Date(Date.now() - 35 * 60000) },
      ],
      status: "active",
      createdAt: new Date(Date.now() - 45 * 60000),
      guestInfo: { roomNumber: "301", guestName: "Mr. Sharma", bookingId: "booking-1" },
      subtotal: 1660,
      tax: 299,
      total: 1959,
      kotNumbers: [1001, 1002],
      serverName: "Rahul",
    },
    {
      id: "order-demo-2",
      tableNumber: 12,
      items: [
        { menuItem: menuItems[30], quantity: 2, status: "served", kotTime: new Date(Date.now() - 20 * 60000) },
        { menuItem: menuItems[2], quantity: 1, status: "pending", kotTime: new Date(Date.now() - 2 * 60000) },
      ],
      status: "active",
      createdAt: new Date(Date.now() - 25 * 60000),
      subtotal: 720,
      tax: 130,
      total: 850,
      kotNumbers: [1003],
      serverName: "Priya",
    },
  ];
};

interface RestaurantPOSProps {
  bookings: Booking[];
  onAddChargeToFolio: (bookingId: string, amount: number, description: string) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "soup": return <Soup className="h-4 w-4" />;
    case "salad": return <Salad className="h-4 w-4" />;
    case "pizza": return <Pizza className="h-4 w-4" />;
    case "beef": return <Beef className="h-4 w-4" />;
    case "fish": return <Fish className="h-4 w-4" />;
    case "coffee": return <Coffee className="h-4 w-4" />;
    case "cake": return <Cake className="h-4 w-4" />;
    case "wine": return <Wine className="h-4 w-4" />;
    default: return <UtensilsCrossed className="h-4 w-4" />;
  }
};

export const RestaurantPOS = ({ bookings, onAddChargeToFolio }: RestaurantPOSProps) => {
  const [tables, setTables] = useState<RestaurantTable[]>(generateDemoTables);
  const [orders, setOrders] = useState<RestaurantOrder[]>(() => generateDemoOrders(demoMenuItems));
  const [reservations, setReservations] = useState<TableReservation[]>(generateDemoReservations);
  const [menuItems] = useState<MenuItem[]>(demoMenuItems);
  const [categories] = useState<MenuCategory[]>(demoCategories);
  
  const [activeView, setActiveView] = useState<"tables" | "pos" | "kitchen" | "bills" | "reservations">("tables");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSection, setTableSection] = useState<"all" | "indoor" | "outdoor" | "private" | "bar">("all");
  
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; order: RestaurantOrder | null }>({ open: false, order: null });
  const [guestLinkModal, setGuestLinkModal] = useState<{ open: boolean; table: RestaurantTable | null }>({ open: false, table: null });
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [printBillModal, setPrintBillModal] = useState<{ open: boolean; order: RestaurantOrder | null }>({ open: false, order: null });
  const [reservationModal, setReservationModal] = useState<{ open: boolean; reservation: TableReservation | null; mode: "add" | "edit" | "view" }>({ open: false, reservation: null, mode: "add" });
  const [newReservation, setNewReservation] = useState<Partial<TableReservation>>({});
  
  const [kotCounter, setKotCounter] = useState(1004);
  const [kdsAudioEnabled, setKdsAudioEnabled] = useState(true);

  // Get active bookings for room charge linking
  const activeBookings = bookings.filter(b => b.status === "checked-in");

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = item.categoryId === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Calculate current order totals
  const calculateTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    return { subtotal, tax, total: subtotal + tax };
  };

  // Table Actions
  const handleTableSelect = (table: RestaurantTable) => {
    if (table.status === "cleaning") {
      toast.error("Table is being cleaned");
      return;
    }
    
    setSelectedTable(table);
    
    if (table.currentOrderId) {
      const existingOrder = orders.find(o => o.id === table.currentOrderId);
      if (existingOrder) {
        setCurrentOrder(existingOrder.items);
      }
    } else {
      setCurrentOrder([]);
    }
    
    setActiveView("pos");
  };

  const handleLinkGuest = (tableId: string, bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setTables(prev => prev.map(t => 
      t.id === tableId ? { 
        ...t, 
        status: "occupied" as const,
      } : t
    ));

    setGuestLinkModal({ open: false, table: null });
    toast.success(`Table linked to Room ${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`);
  };

  // Order Actions
  const addToOrder = (item: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(oi => oi.menuItem.id === item.id);
      if (existing) {
        return prev.map(oi => 
          oi.menuItem.id === item.id 
            ? { ...oi, quantity: oi.quantity + 1 }
            : oi
        );
      }
      return [...prev, { menuItem: item, quantity: 1, status: "pending" }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCurrentOrder(prev => {
      return prev.map(oi => {
        if (oi.menuItem.id === itemId) {
          const newQty = oi.quantity + delta;
          if (newQty <= 0) return null as unknown as OrderItem;
          return { ...oi, quantity: newQty };
        }
        return oi;
      }).filter(Boolean);
    });
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(oi => oi.menuItem.id !== itemId));
  };

  const sendToKitchen = () => {
    if (!selectedTable || currentOrder.length === 0) return;

    const newKot = kotCounter;
    setKotCounter(prev => prev + 1);

    const totals = calculateTotals(currentOrder);
    
    const existingOrder = orders.find(o => o.id === selectedTable.currentOrderId);
    
    if (existingOrder) {
      // Update existing order
      setOrders(prev => prev.map(o => 
        o.id === existingOrder.id
          ? { 
              ...o, 
              items: currentOrder,
              kotNumbers: [...o.kotNumbers, newKot],
              ...totals,
            }
          : o
      ));
    } else {
      // Create new order
      const booking = bookings.find(b => b.id === selectedBookingId);
      const newOrder: RestaurantOrder = {
        id: `order-${Date.now()}`,
        tableNumber: selectedTable.number,
        items: currentOrder,
        status: "active",
        createdAt: new Date(),
        guestInfo: booking ? {
          roomNumber: "301",
          bookingId: booking.id,
          guestName: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
        } : undefined,
        ...totals,
        kotNumbers: [newKot],
      };

      setOrders(prev => [...prev, newOrder]);
      
      setTables(prev => prev.map(t => 
        t.id === selectedTable.id
          ? { ...t, status: "occupied" as const, currentOrderId: newOrder.id }
          : t
      ));
    }

    toast.success(`KOT #${newKot} sent to kitchen!`);
  };

  const generateBill = (order: RestaurantOrder) => {
    setPaymentModal({ open: true, order });
  };

  const processPayment = (method: "cash" | "card" | "upi" | "room") => {
    if (!paymentModal.order) return;

    if (method === "room" && paymentModal.order.guestInfo?.bookingId) {
      onAddChargeToFolio(
        paymentModal.order.guestInfo.bookingId,
        paymentModal.order.total,
        `Restaurant - Table ${paymentModal.order.tableNumber}`
      );
    }

    setOrders(prev => prev.map(o => 
      o.id === paymentModal.order!.id
        ? { ...o, status: "paid" as const, paymentMethod: method }
        : o
    ));

    const table = tables.find(t => t.currentOrderId === paymentModal.order!.id);
    if (table) {
      setTables(prev => prev.map(t => 
        t.id === table.id
          ? { ...t, status: "cleaning" as const, currentOrderId: undefined }
          : t
      ));
    }

    setPaymentModal({ open: false, order: null });
    setSelectedTable(null);
    setCurrentOrder([]);
    setActiveView("tables");
    
    toast.success(
      method === "room" 
        ? "Bill charged to room folio!" 
        : `Payment of ₹${paymentModal.order.total.toLocaleString()} received via ${method.toUpperCase()}`
    );
  };

  // Kitchen Actions
  const updateItemStatus = (orderId: string, itemId: string, status: OrderItem["status"]) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId
        ? {
            ...o,
            items: o.items.map(item => 
              item.menuItem.id === itemId ? { ...item, status } : item
            ),
          }
        : o
    ));
    if (kdsAudioEnabled && status === "ready") {
      // Could play sound here
    }
    toast.success(`Item marked as ${status}`);
  };

  // Reservation Actions
  const handleAddReservation = () => {
    if (!newReservation.guestName || !newReservation.phone || !newReservation.date || !newReservation.time || !newReservation.tableNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    const reservation: TableReservation = {
      id: `res-${Date.now()}`,
      tableNumber: newReservation.tableNumber,
      guestName: newReservation.guestName,
      phone: newReservation.phone,
      email: newReservation.email,
      date: newReservation.date,
      time: newReservation.time,
      partySize: newReservation.partySize || 2,
      specialRequests: newReservation.specialRequests,
      status: "confirmed",
      createdAt: new Date(),
    };

    setReservations(prev => [...prev, reservation]);
    
    // Update table status if reservation is for today
    if (isSameDay(newReservation.date, new Date())) {
      setTables(prev => prev.map(t => 
        t.number === newReservation.tableNumber ? { ...t, status: "reserved" as const } : t
      ));
    }

    setReservationModal({ open: false, reservation: null, mode: "add" });
    setNewReservation({});
    toast.success("Reservation created successfully!");
  };

  const handleSeatReservation = (resId: string) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    setReservations(prev => prev.map(r => 
      r.id === resId ? { ...r, status: "seated" as const } : r
    ));

    setTables(prev => prev.map(t => 
      t.number === reservation.tableNumber ? { ...t, status: "occupied" as const } : t
    ));

    toast.success(`Guest ${reservation.guestName} seated at Table ${reservation.tableNumber}`);
  };

  const handleCancelReservation = (resId: string) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    setReservations(prev => prev.map(r => 
      r.id === resId ? { ...r, status: "cancelled" as const } : r
    ));

    if (isSameDay(reservation.date, new Date())) {
      setTables(prev => prev.map(t => 
        t.number === reservation.tableNumber ? { ...t, status: "available" as const } : t
      ));
    }

    toast.success("Reservation cancelled");
  };

  // Get elapsed time for KDS
  const getElapsedTime = (date: Date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return diff;
  };

  // Filter tables by section
  const filteredTables = tableSection === "all" 
    ? tables 
    : tables.filter(t => t.section === tableSection);

  // Today's reservations
  const todaysReservations = reservations.filter(r => 
    isSameDay(new Date(r.date), new Date()) && r.status !== "cancelled"
  );

  const currentTotals = calculateTotals(currentOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            Restaurant POS
          </h2>
          <p className="text-muted-foreground">Manage orders, billing, and kitchen operations</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(), "hh:mm a")}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            Active: {orders.filter(o => o.status === "active").length}
          </Badge>
          <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
            <Calendar className="h-3 w-3" />
            Today's Res: {todaysReservations.length}
          </Badge>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="tables" className="gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Tables</span>
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">POS</span>
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="gap-1.5">
            <ChefHat className="h-4 w-4" />
            <span className="hidden sm:inline">Kitchen</span>
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Reservations</span>
          </TabsTrigger>
          <TabsTrigger value="bills" className="gap-1.5">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Bills</span>
          </TabsTrigger>
        </TabsList>

        {/* Tables View */}
        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Table Layout</CardTitle>
                  <CardDescription>Select a table to start or view an order</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={tableSection} onValueChange={(v) => setTableSection(v as typeof tableSection)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="private">Private Dining</SelectItem>
                      <SelectItem value="bar">Bar Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex gap-4 mb-6 flex-wrap items-center justify-between">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-100 dark:bg-green-950" />
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-red-100 dark:bg-red-950" />
                    <span className="text-sm">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-100 dark:bg-amber-950" />
                    <span className="text-sm">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground bg-muted" />
                    <span className="text-sm">Cleaning</span>
                  </div>
                </div>
                {todaysReservations.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Bell className="h-3 w-3" />
                    {todaysReservations.filter(r => r.status === "confirmed").length} upcoming reservations
                  </Badge>
                )}
              </div>

              {/* Table Grid with Sections */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {filteredTables.map(table => {
                  const order = orders.find(o => o.id === table.currentOrderId);
                  const reservation = todaysReservations.find(r => r.tableNumber === table.number && r.status === "confirmed");
                  const elapsedMinutes = order ? getElapsedTime(order.createdAt) : 0;
                  
                  return (
                    <div
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all group
                        hover:shadow-lg hover:scale-105
                        ${table.status === "available" ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}
                        ${table.status === "occupied" ? "border-red-500 bg-red-50 dark:bg-red-950/30" : ""}
                        ${table.status === "reserved" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : ""}
                        ${table.status === "cleaning" ? "border-muted-foreground bg-muted/50 cursor-not-allowed" : ""}
                        ${table.shape === "round" ? "rounded-full aspect-square" : ""}
                      `}
                    >
                      {/* Section Badge */}
                      {table.section && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {table.section}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold">{table.number}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          {table.capacity}
                        </div>
                        
                        {order && (
                          <div className="mt-2 space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              ₹{order.total.toLocaleString()}
                            </Badge>
                            {elapsedMinutes > 0 && (
                              <div className={`text-[10px] flex items-center justify-center gap-0.5 ${elapsedMinutes > 60 ? "text-red-500" : "text-muted-foreground"}`}>
                                <Timer className="h-2.5 w-2.5" />
                                {elapsedMinutes}m
                              </div>
                            )}
                          </div>
                        )}
                        
                        {reservation && !order && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-[10px] border-amber-500">
                              {reservation.time}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS View */}
        <TabsContent value="pos" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {selectedTable ? `Table ${selectedTable.number}` : "Select a Table"}
                    </CardTitle>
                    {selectedTable && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setGuestLinkModal({ open: true, table: selectedTable })}
                      >
                        Link to Room
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Categories */}
                  <ScrollArea className="w-full whitespace-nowrap pb-3">
                    <div className="flex gap-2">
                      {categories.map(cat => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="gap-1.5"
                        >
                          {getCategoryIcon(cat.icon)}
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  {/* Menu Items Grid with Images */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredMenuItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => selectedTable && addToOrder(item)}
                        className={`
                          rounded-lg border cursor-pointer transition-all overflow-hidden
                          hover:border-primary hover:shadow-md
                          ${!selectedTable ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {/* Item Image */}
                        {item.image && (
                          <div className="h-24 overflow-hidden bg-muted">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        
                        <div className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <span className="font-medium text-sm line-clamp-1">{item.name}</span>
                              <div className="flex gap-1 mt-0.5">
                                {item.isPopular && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 gap-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                                    <Flame className="h-2.5 w-2.5" />
                                    Popular
                                  </Badge>
                                )}
                                {item.isChefSpecial && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 gap-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Chef's
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs shrink-0 ${item.isVeg ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}
                            >
                              {item.isVeg ? "V" : "N"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">₹{item.price}</span>
                            <div className="flex items-center gap-2">
                              {item.spiceLevel && (
                                <span className="text-[10px] text-muted-foreground">
                                  {item.spiceLevel === "mild" && "🌶️"}
                                  {item.spiceLevel === "medium" && "🌶️🌶️"}
                                  {item.spiceLevel === "hot" && "🌶️🌶️🌶️"}
                                  {item.spiceLevel === "extra-hot" && "🌶️🌶️🌶️🌶️"}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-0.5" />
                                {item.preparationTime}m
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Section */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Current Order</span>
                    {currentOrder.length > 0 && (
                      <Badge variant="secondary">{currentOrder.length} items</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No items in order</p>
                      <p className="text-sm">Select items from the menu</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-3">
                        {currentOrder.map(item => (
                          <div key={item.menuItem.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{item.menuItem.price} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.menuItem.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-medium">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.menuItem.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeFromOrder(item.menuItem.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {currentOrder.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      
                      {/* Totals */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>₹{currentTotals.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST (18%)</span>
                          <span>₹{currentTotals.tax.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">₹{currentTotals.total.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={sendToKitchen}
                        >
                          <Send className="h-4 w-4" />
                          Send KOT
                        </Button>
                        <Button 
                          className="gap-2"
                          onClick={() => {
                            const existingOrder = selectedTable?.currentOrderId 
                              ? orders.find(o => o.id === selectedTable.currentOrderId)
                              : null;
                            if (existingOrder) {
                              generateBill(existingOrder);
                            } else {
                              toast.error("Send to kitchen first before billing");
                            }
                          }}
                        >
                          <Receipt className="h-4 w-4" />
                          Bill
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Kitchen View */}
        <TabsContent value="kitchen" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Kitchen Display System
              </h3>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(), "hh:mm a")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={kdsAudioEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setKdsAudioEnabled(!kdsAudioEnabled)}
                className="gap-1"
              >
                <Volume2 className="h-4 w-4" />
                {kdsAudioEnabled ? "Sound On" : "Sound Off"}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => o.status === "active").map(order => {
              const elapsedMinutes = getElapsedTime(order.createdAt);
              const pendingItems = order.items.filter(i => i.status === "pending").length;
              const preparingItems = order.items.filter(i => i.status === "preparing").length;
              const readyItems = order.items.filter(i => i.status === "ready").length;
              
              return (
                <Card 
                  key={order.id} 
                  className={`border-l-4 ${
                    elapsedMinutes > 30 ? "border-l-red-500" : 
                    elapsedMinutes > 15 ? "border-l-amber-500" : 
                    "border-l-primary"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Table {order.tableNumber}</CardTitle>
                        {elapsedMinutes > 30 && (
                          <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {order.kotNumbers.map(kot => (
                          <Badge key={kot} variant="outline" className="text-xs">KOT #{kot}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <CardDescription>
                        {format(order.createdAt, "hh:mm a")} 
                        {order.guestInfo?.guestName && ` • ${order.guestInfo.guestName}`}
                        {order.serverName && <span className="text-muted-foreground"> • Server: {order.serverName}</span>}
                      </CardDescription>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${elapsedMinutes > 30 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" : ""}`}
                      >
                        <Timer className="h-3 w-3 mr-1" />
                        {elapsedMinutes}m
                      </Badge>
                    </div>
                    {/* Status Summary */}
                    <div className="flex gap-2 mt-2">
                      {pendingItems > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-50 border-amber-300 text-amber-700">
                          {pendingItems} Pending
                        </Badge>
                      )}
                      {preparingItems > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
                          {preparingItems} Preparing
                        </Badge>
                      )}
                      {readyItems > 0 && (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700">
                          {readyItems} Ready
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {order.items.filter(i => i.status !== "served").map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`
                          flex items-center justify-between p-3 rounded-lg border
                          ${item.status === "pending" ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" : ""}
                          ${item.status === "preparing" ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" : ""}
                          ${item.status === "ready" ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : ""}
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{item.quantity}×</span>
                            <div>
                              <p className="font-medium">{item.menuItem.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    item.status === "pending" ? "border-amber-500 text-amber-600" :
                                    item.status === "preparing" ? "border-blue-500 text-blue-600" :
                                    "border-green-500 text-green-600"
                                  }`}
                                >
                                  {item.status}
                                </Badge>
                                <span>~{item.menuItem.preparationTime}m</span>
                                {!item.menuItem.isVeg && <Badge variant="destructive" className="text-[10px] px-1 py-0">Non-Veg</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => updateItemStatus(order.id, item.menuItem.id, "preparing")}
                            >
                              <ChefHat className="h-4 w-4" />
                              Start
                            </Button>
                          )}
                          {item.status === "preparing" && (
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => updateItemStatus(order.id, item.menuItem.id, "ready")}
                            >
                              <Bell className="h-4 w-4" />
                              Ready
                            </Button>
                          )}
                          {item.status === "ready" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-green-600 text-green-600"
                              onClick={() => updateItemStatus(order.id, item.menuItem.id, "served")}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Served
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.items.filter(i => i.status !== "served").length === 0 && (
                      <div className="text-center py-4 text-green-600">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">All items served!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {orders.filter(o => o.status === "active").length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No active orders in kitchen</p>
                  <p className="text-sm">New orders will appear here automatically</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Reservations View */}
        <TabsContent value="reservations" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Table Reservations</CardTitle>
                  <CardDescription>Manage restaurant table reservations</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setNewReservation({});
                    setReservationModal({ open: true, reservation: null, mode: "add" });
                  }}
                  className="gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  New Reservation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today ({todaysReservations.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="all">All Reservations</TabsTrigger>
                </TabsList>

                <TabsContent value="today">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todaysReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No reservations for today
                          </TableCell>
                        </TableRow>
                      ) : (
                        todaysReservations.map(res => (
                          <TableRow key={res.id}>
                            <TableCell className="font-medium">{res.time}</TableCell>
                            <TableCell className="font-medium">{res.guestName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {res.phone}
                                </span>
                                {res.email && (
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {res.email}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Table {res.tableNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {res.partySize}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={res.status === "confirmed" ? "default" : res.status === "seated" ? "secondary" : "outline"}
                                className={
                                  res.status === "confirmed" ? "bg-blue-500" :
                                  res.status === "seated" ? "bg-green-500" :
                                  res.status === "completed" ? "bg-muted" :
                                  res.status === "cancelled" ? "bg-red-100 text-red-700 border-red-300" : ""
                                }
                              >
                                {res.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[150px]">
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {res.specialRequests || "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => setReservationModal({ open: true, reservation: res, mode: "view" })}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {res.status === "confirmed" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-500"
                                      onClick={() => handleSeatReservation(res.id)}
                                    >
                                      Seat
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => handleCancelReservation(res.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="upcoming">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.filter(r => !isSameDay(new Date(r.date), new Date()) && r.status !== "cancelled").map(res => (
                        <TableRow key={res.id}>
                          <TableCell>{format(new Date(res.date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{res.time}</TableCell>
                          <TableCell className="font-medium">{res.guestName}</TableCell>
                          <TableCell>Table {res.tableNumber}</TableCell>
                          <TableCell>{res.partySize}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-blue-500">{res.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setReservationModal({ open: true, reservation: res, mode: "view" })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Party Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map(res => (
                        <TableRow key={res.id}>
                          <TableCell>{format(new Date(res.date), "dd MMM yyyy")}</TableCell>
                          <TableCell>{res.time}</TableCell>
                          <TableCell className="font-medium">{res.guestName}</TableCell>
                          <TableCell>Table {res.tableNumber}</TableCell>
                          <TableCell>{res.partySize}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={res.status === "cancelled" ? "destructive" : "default"}
                              className={res.status === "confirmed" ? "bg-blue-500" : res.status === "seated" ? "bg-green-500" : ""}
                            >
                              {res.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => setReservationModal({ open: true, reservation: res, mode: "view" })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills View */}
        <TabsContent value="bills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Bills</CardTitle>
              <CardDescription>View and print all restaurant bills</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(-8)}</TableCell>
                      <TableCell>{order.tableNumber}</TableCell>
                      <TableCell>
                        {order.guestInfo?.guestName || "-"}
                        {order.guestInfo?.roomNumber && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Room {order.guestInfo.roomNumber}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.items.reduce((sum, i) => sum + i.quantity, 0)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{order.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.status === "paid" ? "default" : "secondary"}
                          className={order.status === "paid" ? "bg-green-500" : ""}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.paymentMethod ? order.paymentMethod.toUpperCase() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => setPrintBillModal({ open: true, order })}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          {order.status === "active" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generateBill(order)}
                            >
                              Bill
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal({ open, order: open ? paymentModal.order : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {paymentModal.order && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Table</span>
                  <span className="font-medium">{paymentModal.order.tableNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Items</span>
                  <span className="font-medium">
                    {paymentModal.order.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>₹{paymentModal.order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>GST (18%)</span>
                  <span>₹{paymentModal.order.tax.toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{paymentModal.order.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => processPayment("cash")}
                >
                  <Banknote className="h-6 w-6" />
                  Cash
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => processPayment("card")}
                >
                  <CreditCard className="h-6 w-6" />
                  Card
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => processPayment("upi")}
                >
                  <Smartphone className="h-6 w-6" />
                  UPI
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => processPayment("room")}
                  disabled={!paymentModal.order.guestInfo?.bookingId}
                >
                  <Receipt className="h-6 w-6" />
                  Room Charge
                  {paymentModal.order.guestInfo?.roomNumber && (
                    <span className="text-xs">#{paymentModal.order.guestInfo.roomNumber}</span>
                  )}
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => {
                  setPrintBillModal({ open: true, order: paymentModal.order });
                }}
              >
                <Printer className="h-4 w-4" />
                Print Bill Preview
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Link Guest Modal */}
      <Dialog open={guestLinkModal.open} onOpenChange={(open) => setGuestLinkModal({ open, table: open ? guestLinkModal.table : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Table to Hotel Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Select Checked-in Guest</Label>
            <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select guest..." />
              </SelectTrigger>
              <SelectContent>
                {activeBookings.map(booking => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.guestInfo.firstName} {booking.guestInfo.lastName} - {booking.roomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeBookings.length === 0 && (
              <p className="text-sm text-muted-foreground">No checked-in guests available</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGuestLinkModal({ open: false, table: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => guestLinkModal.table && handleLinkGuest(guestLinkModal.table.id, selectedBookingId)}
              disabled={!selectedBookingId}
            >
              Link Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reservation Modal */}
      <Dialog open={reservationModal.open} onOpenChange={(open) => setReservationModal({ ...reservationModal, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reservationModal.mode === "add" ? "New Reservation" : 
               reservationModal.mode === "edit" ? "Edit Reservation" : 
               "Reservation Details"}
            </DialogTitle>
          </DialogHeader>
          
          {reservationModal.mode === "view" && reservationModal.reservation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Guest Name</Label>
                  <p className="font-medium">{reservationModal.reservation.guestName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{reservationModal.reservation.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{reservationModal.reservation.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {format(new Date(reservationModal.reservation.date), "dd MMM yyyy")} at {reservationModal.reservation.time}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Table</Label>
                  <p className="font-medium">Table {reservationModal.reservation.tableNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Party Size</Label>
                  <p className="font-medium">{reservationModal.reservation.partySize} guests</p>
                </div>
              </div>
              {reservationModal.reservation.specialRequests && (
                <div>
                  <Label className="text-muted-foreground">Special Requests</Label>
                  <p className="font-medium">{reservationModal.reservation.specialRequests}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Badge 
                  variant={reservationModal.reservation.status === "confirmed" ? "default" : "secondary"}
                  className={reservationModal.reservation.status === "confirmed" ? "bg-blue-500" : ""}
                >
                  {reservationModal.reservation.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Created: {format(new Date(reservationModal.reservation.createdAt), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guest Name *</Label>
                  <Input
                    placeholder="Full name"
                    value={newReservation.guestName || ""}
                    onChange={(e) => setNewReservation({ ...newReservation, guestName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={newReservation.phone || ""}
                    onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newReservation.email || ""}
                    onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Party Size *</Label>
                  <Select 
                    value={String(newReservation.partySize || 2)} 
                    onValueChange={(v) => setNewReservation({ ...newReservation, partySize: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} guests</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newReservation.date ? format(new Date(newReservation.date), "yyyy-MM-dd") : ""}
                    onChange={(e) => setNewReservation({ ...newReservation, date: new Date(e.target.value) })}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Select 
                    value={newReservation.time || ""} 
                    onValueChange={(v) => setNewReservation({ ...newReservation, time: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Table *</Label>
                  <Select 
                    value={String(newReservation.tableNumber || "")} 
                    onValueChange={(v) => setNewReservation({ ...newReservation, tableNumber: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.filter(t => t.status === "available").map(t => (
                        <SelectItem key={t.id} value={String(t.number)}>
                          Table {t.number} ({t.capacity} seats) - {t.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    placeholder="Any special requests or notes..."
                    value={newReservation.specialRequests || ""}
                    onChange={(e) => setNewReservation({ ...newReservation, specialRequests: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReservationModal({ open: false, reservation: null, mode: "add" })}>
              {reservationModal.mode === "view" ? "Close" : "Cancel"}
            </Button>
            {reservationModal.mode !== "view" && (
              <Button onClick={handleAddReservation}>
                Create Reservation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bill Modal */}
      <PrintModal
        open={printBillModal.open}
        onClose={() => setPrintBillModal({ open: false, order: null })}
        title="Restaurant Bill"
      >
        {printBillModal.order && (
          <RestaurantBillPrint order={printBillModal.order} />
        )}
      </PrintModal>
    </div>
  );
};
