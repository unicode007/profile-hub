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
import { toast } from "sonner";
import { format } from "date-fns";
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
  preparationTime: number; // in minutes
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
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
}

export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrderId?: string;
}

// Demo Menu Data
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
  { id: "m1", name: "Paneer Tikka", categoryId: "starters", price: 320, description: "Cottage cheese marinated in spices", isVeg: true, isAvailable: true, preparationTime: 15 },
  { id: "m2", name: "Chicken Tikka", categoryId: "starters", price: 380, description: "Tandoori chicken pieces", isVeg: false, isAvailable: true, preparationTime: 18 },
  { id: "m3", name: "Spring Rolls", categoryId: "starters", price: 220, description: "Crispy vegetable rolls", isVeg: true, isAvailable: true, preparationTime: 12 },
  { id: "m4", name: "Fish Fingers", categoryId: "starters", price: 420, description: "Battered fish with tartar sauce", isVeg: false, isAvailable: true, preparationTime: 15 },
  { id: "m5", name: "Mushroom Manchurian", categoryId: "starters", price: 280, description: "Indo-Chinese style mushrooms", isVeg: true, isAvailable: true, preparationTime: 14 },
  
  // Salads
  { id: "m6", name: "Caesar Salad", categoryId: "salads", price: 290, description: "Classic Caesar with croutons", isVeg: true, isAvailable: true, preparationTime: 8 },
  { id: "m7", name: "Greek Salad", categoryId: "salads", price: 260, description: "Fresh vegetables with feta cheese", isVeg: true, isAvailable: true, preparationTime: 8 },
  { id: "m8", name: "Grilled Chicken Salad", categoryId: "salads", price: 350, description: "Mixed greens with grilled chicken", isVeg: false, isAvailable: true, preparationTime: 12 },
  
  // Main Course Veg
  { id: "m9", name: "Paneer Butter Masala", categoryId: "main-veg", price: 340, description: "Cottage cheese in rich tomato gravy", isVeg: true, isAvailable: true, preparationTime: 20 },
  { id: "m10", name: "Dal Makhani", categoryId: "main-veg", price: 280, description: "Black lentils slow-cooked overnight", isVeg: true, isAvailable: true, preparationTime: 15 },
  { id: "m11", name: "Malai Kofta", categoryId: "main-veg", price: 320, description: "Potato dumplings in creamy gravy", isVeg: true, isAvailable: true, preparationTime: 22 },
  { id: "m12", name: "Vegetable Biryani", categoryId: "main-veg", price: 300, description: "Aromatic rice with mixed vegetables", isVeg: true, isAvailable: true, preparationTime: 25 },
  { id: "m13", name: "Butter Naan", categoryId: "main-veg", price: 60, description: "Soft Indian bread with butter", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m14", name: "Jeera Rice", categoryId: "main-veg", price: 180, description: "Cumin flavored basmati rice", isVeg: true, isAvailable: true, preparationTime: 10 },
  
  // Main Course Non-Veg
  { id: "m15", name: "Butter Chicken", categoryId: "main-nonveg", price: 420, description: "Tandoori chicken in creamy tomato gravy", isVeg: false, isAvailable: true, preparationTime: 22 },
  { id: "m16", name: "Mutton Rogan Josh", categoryId: "main-nonveg", price: 480, description: "Kashmiri style lamb curry", isVeg: false, isAvailable: true, preparationTime: 30 },
  { id: "m17", name: "Chicken Biryani", categoryId: "main-nonveg", price: 380, description: "Layered rice with spiced chicken", isVeg: false, isAvailable: true, preparationTime: 28 },
  { id: "m18", name: "Kadhai Chicken", categoryId: "main-nonveg", price: 400, description: "Spicy chicken with bell peppers", isVeg: false, isAvailable: true, preparationTime: 20 },
  
  // Seafood
  { id: "m19", name: "Fish Curry", categoryId: "seafood", price: 450, description: "Traditional coastal fish curry", isVeg: false, isAvailable: true, preparationTime: 20 },
  { id: "m20", name: "Prawns Masala", categoryId: "seafood", price: 520, description: "Spicy prawns in onion tomato gravy", isVeg: false, isAvailable: true, preparationTime: 18 },
  { id: "m21", name: "Grilled Fish", categoryId: "seafood", price: 580, description: "Fresh fish with herbs and lemon", isVeg: false, isAvailable: true, preparationTime: 22 },
  
  // Beverages
  { id: "m22", name: "Fresh Lime Soda", categoryId: "beverages", price: 80, description: "Sweet or salted", isVeg: true, isAvailable: true, preparationTime: 3 },
  { id: "m23", name: "Mango Lassi", categoryId: "beverages", price: 120, description: "Sweet mango yogurt drink", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m24", name: "Masala Chai", categoryId: "beverages", price: 60, description: "Traditional spiced tea", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m25", name: "Filter Coffee", categoryId: "beverages", price: 80, description: "South Indian style coffee", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m26", name: "Fresh Juice", categoryId: "beverages", price: 150, description: "Orange, Watermelon, or Mixed", isVeg: true, isAvailable: true, preparationTime: 5 },
  
  // Desserts
  { id: "m27", name: "Gulab Jamun", categoryId: "desserts", price: 120, description: "2 pcs with rabri", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m28", name: "Rasmalai", categoryId: "desserts", price: 140, description: "Soft cheese dumplings in milk", isVeg: true, isAvailable: true, preparationTime: 5 },
  { id: "m29", name: "Chocolate Brownie", categoryId: "desserts", price: 180, description: "With vanilla ice cream", isVeg: true, isAvailable: true, preparationTime: 8 },
  { id: "m30", name: "Ice Cream Sundae", categoryId: "desserts", price: 160, description: "3 scoops with toppings", isVeg: true, isAvailable: true, preparationTime: 5 },
  
  // Bar & Spirits
  { id: "m31", name: "Kingfisher Premium", categoryId: "alcohol", price: 250, description: "330ml bottle", isVeg: true, isAvailable: true, preparationTime: 2 },
  { id: "m32", name: "Budweiser", categoryId: "alcohol", price: 280, description: "330ml bottle", isVeg: true, isAvailable: true, preparationTime: 2 },
  { id: "m33", name: "IMFL Whisky (30ml)", categoryId: "alcohol", price: 180, description: "Blenders Pride / Royal Stag", isVeg: true, isAvailable: true, preparationTime: 2 },
  { id: "m34", name: "Vodka (30ml)", categoryId: "alcohol", price: 200, description: "Smirnoff / Absolut", isVeg: true, isAvailable: true, preparationTime: 2 },
  { id: "m35", name: "Wine Glass", categoryId: "alcohol", price: 350, description: "Red or White", isVeg: true, isAvailable: true, preparationTime: 2 },
];

// Demo Tables
const generateDemoTables = (): RestaurantTable[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `table-${i + 1}`,
    number: i + 1,
    capacity: i < 4 ? 2 : i < 10 ? 4 : 6,
    status: i === 2 ? "occupied" : i === 5 ? "reserved" : i === 8 ? "cleaning" : "available",
    currentOrderId: i === 2 ? "order-demo-1" : undefined,
  }));
};

// Demo Orders
const generateDemoOrders = (menuItems: MenuItem[]): RestaurantOrder[] => {
  return [
    {
      id: "order-demo-1",
      tableNumber: 3,
      items: [
        { menuItem: menuItems[0], quantity: 2, status: "served" },
        { menuItem: menuItems[14], quantity: 1, status: "preparing" },
        { menuItem: menuItems[12], quantity: 4, status: "ready" },
        { menuItem: menuItems[21], quantity: 2, status: "pending" },
      ],
      status: "active",
      createdAt: new Date(Date.now() - 45 * 60000),
      guestInfo: { roomNumber: "301", guestName: "Mr. Sharma" },
      subtotal: 1580,
      tax: 284,
      total: 1864,
      kotNumbers: [1001, 1002],
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
  const [menuItems] = useState<MenuItem[]>(demoMenuItems);
  const [categories] = useState<MenuCategory[]>(demoCategories);
  
  const [activeView, setActiveView] = useState<"tables" | "pos" | "kitchen" | "bills">("tables");
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; order: RestaurantOrder | null }>({ open: false, order: null });
  const [guestLinkModal, setGuestLinkModal] = useState<{ open: boolean; table: RestaurantTable | null }>({ open: false, table: null });
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  
  const [kotCounter, setKotCounter] = useState(1003);

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
    toast.success(`Item marked as ${status}`);
  };

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

        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(), "hh:mm a")}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            Active Orders: {orders.filter(o => o.status === "active").length}
          </Badge>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="tables" className="gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            POS
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="gap-1.5">
            <ChefHat className="h-4 w-4" />
            Kitchen
          </TabsTrigger>
          <TabsTrigger value="bills" className="gap-1.5">
            <List className="h-4 w-4" />
            Bills
          </TabsTrigger>
        </TabsList>

        {/* Tables View */}
        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Layout</CardTitle>
              <CardDescription>Select a table to start or view an order</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500" />
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span className="text-sm">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-400" />
                  <span className="text-sm">Cleaning</span>
                </div>
              </div>

              {/* Table Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {tables.map(table => {
                  const order = orders.find(o => o.id === table.currentOrderId);
                  return (
                    <div
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all
                        hover:shadow-lg hover:scale-105
                        ${table.status === "available" ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}
                        ${table.status === "occupied" ? "border-red-500 bg-red-50 dark:bg-red-950/30" : ""}
                        ${table.status === "reserved" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : ""}
                        ${table.status === "cleaning" ? "border-gray-400 bg-gray-50 dark:bg-gray-950/30 cursor-not-allowed" : ""}
                      `}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold">{table.number}</div>
                        <div className="text-xs text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-1" />
                          {table.capacity}
                        </div>
                        {order && (
                          <div className="mt-2 text-xs">
                            <Badge variant="secondary" className="text-xs">
                              ₹{order.total.toLocaleString()}
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

                  {/* Menu Items Grid */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredMenuItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => selectedTable && addToOrder(item)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          hover:border-primary hover:shadow-md
                          ${!selectedTable ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">{item.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${item.isVeg ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}`}
                          >
                            {item.isVeg ? "V" : "N"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">₹{item.price}</span>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-0.5" />
                            {item.preparationTime}m
                          </span>
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

        {/* Kitchen View */}
        <TabsContent value="kitchen" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => o.status === "active").map(order => (
              <Card key={order.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Table {order.tableNumber}</CardTitle>
                    <div className="flex gap-2">
                      {order.kotNumbers.map(kot => (
                        <Badge key={kot} variant="outline">KOT #{kot}</Badge>
                      ))}
                    </div>
                  </div>
                  <CardDescription>
                    {format(order.createdAt, "hh:mm a")} • 
                    {order.guestInfo?.guestName && ` ${order.guestInfo.guestName}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`
                        flex items-center justify-between p-2 rounded-lg
                        ${item.status === "pending" ? "bg-yellow-50 dark:bg-yellow-950/30" : ""}
                        ${item.status === "preparing" ? "bg-blue-50 dark:bg-blue-950/30" : ""}
                        ${item.status === "ready" ? "bg-green-50 dark:bg-green-950/30" : ""}
                        ${item.status === "served" ? "bg-muted" : ""}
                      `}
                    >
                      <div>
                        <p className="font-medium">
                          {item.quantity}× {item.menuItem.name}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {item.status === "pending" && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateItemStatus(order.id, item.menuItem.id, "preparing")}
                          >
                            <ChefHat className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        {item.status === "preparing" && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateItemStatus(order.id, item.menuItem.id, "ready")}
                          >
                            <Bell className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {item.status === "ready" && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateItemStatus(order.id, item.menuItem.id, "served")}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            {orders.filter(o => o.status === "active").length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No active orders in kitchen</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Bills View */}
        <TabsContent value="bills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Bills</CardTitle>
              <CardDescription>View and print all bills</CardDescription>
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
                          <Button size="icon" variant="ghost" className="h-8 w-8">
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
    </div>
  );
};
