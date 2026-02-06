import { useState, useMemo } from "react";
import { PhysicalRoom } from "./PhysicalRoomManager";
import { Hotel, Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Wine,
  Coffee,
  Cookie,
  Sandwich,
  Droplets,
  Plus,
  Minus,
  Search,
  DoorClosed,
  CreditCard,
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Receipt,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export interface MinibarItem {
  id: string;
  name: string;
  category: "beverages" | "snacks" | "spirits" | "water" | "other";
  price: number;
  stockQuantity: number;
  minStock: number;
  maxStock: number;
  icon: string;
}

export interface RoomMinibar {
  roomId: string;
  roomNumber: string;
  items: { itemId: string; quantity: number; consumed: number }[];
  lastChecked?: Date;
  lastRestocked?: Date;
  status: "stocked" | "needs-restock" | "checked" | "not-checked";
  totalCharges: number;
  pendingCharges: MinibarCharge[];
}

export interface MinibarCharge {
  id: string;
  roomId: string;
  roomNumber: string;
  bookingId: string;
  guestName: string;
  items: { itemId: string; itemName: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  status: "pending" | "added-to-folio" | "paid" | "disputed";
  recordedAt: Date;
  recordedBy: string;
}

export interface MinibarRestock {
  id: string;
  roomId: string;
  roomNumber: string;
  items: { itemId: string; itemName: string; quantity: number }[];
  restockedAt: Date;
  restockedBy: string;
}

// Demo minibar items
const demoMinibarItems: MinibarItem[] = [
  { id: "item-1", name: "Mineral Water (500ml)", category: "water", price: 50, stockQuantity: 100, minStock: 20, maxStock: 150, icon: "water" },
  { id: "item-2", name: "Coca-Cola", category: "beverages", price: 80, stockQuantity: 80, minStock: 15, maxStock: 100, icon: "beverage" },
  { id: "item-3", name: "Pepsi", category: "beverages", price: 80, stockQuantity: 75, minStock: 15, maxStock: 100, icon: "beverage" },
  { id: "item-4", name: "Orange Juice", category: "beverages", price: 120, stockQuantity: 50, minStock: 10, maxStock: 80, icon: "beverage" },
  { id: "item-5", name: "Red Bull", category: "beverages", price: 200, stockQuantity: 40, minStock: 10, maxStock: 60, icon: "beverage" },
  { id: "item-6", name: "Kingfisher Beer", category: "spirits", price: 250, stockQuantity: 60, minStock: 15, maxStock: 100, icon: "beer" },
  { id: "item-7", name: "Wine (Mini)", category: "spirits", price: 500, stockQuantity: 30, minStock: 10, maxStock: 50, icon: "wine" },
  { id: "item-8", name: "Whisky (50ml)", category: "spirits", price: 400, stockQuantity: 40, minStock: 10, maxStock: 60, icon: "whisky" },
  { id: "item-9", name: "Vodka (50ml)", category: "spirits", price: 350, stockQuantity: 35, minStock: 10, maxStock: 50, icon: "vodka" },
  { id: "item-10", name: "Pringles", category: "snacks", price: 180, stockQuantity: 50, minStock: 15, maxStock: 80, icon: "chips" },
  { id: "item-11", name: "Nuts Mix", category: "snacks", price: 150, stockQuantity: 60, minStock: 15, maxStock: 80, icon: "nuts" },
  { id: "item-12", name: "Chocolate Bar", category: "snacks", price: 100, stockQuantity: 70, minStock: 20, maxStock: 100, icon: "chocolate" },
  { id: "item-13", name: "Instant Noodles", category: "snacks", price: 120, stockQuantity: 45, minStock: 10, maxStock: 60, icon: "noodles" },
  { id: "item-14", name: "Cookies Pack", category: "snacks", price: 90, stockQuantity: 55, minStock: 15, maxStock: 80, icon: "cookies" },
  { id: "item-15", name: "Energy Bar", category: "snacks", price: 130, stockQuantity: 40, minStock: 10, maxStock: 60, icon: "bar" },
];

const categoryConfig = {
  beverages: { label: "Beverages", icon: Coffee, color: "text-blue-600" },
  snacks: { label: "Snacks", icon: Cookie, color: "text-orange-600" },
  spirits: { label: "Spirits", icon: Wine, color: "text-purple-600" },
  water: { label: "Water", icon: Droplets, color: "text-cyan-600" },
  other: { label: "Other", icon: Package, color: "text-gray-600" },
};

// Generate demo room minibar data
const generateDemoRoomMinibars = (rooms: PhysicalRoom[]): RoomMinibar[] => {
  return rooms.slice(0, 12).map((room, idx) => {
    const status: RoomMinibar["status"] = 
      idx % 4 === 0 ? "needs-restock" : 
      idx % 3 === 0 ? "not-checked" : "stocked";

    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      items: demoMinibarItems.slice(0, 8).map((item) => ({
        itemId: item.id,
        quantity: 2 + (idx % 3),
        consumed: idx % 2 === 0 ? Math.floor(Math.random() * 2) : 0,
      })),
      lastChecked: idx % 3 !== 0 ? new Date(Date.now() - idx * 3600000) : undefined,
      lastRestocked: new Date(Date.now() - (idx + 1) * 86400000),
      status,
      totalCharges: idx % 2 === 0 ? (idx + 1) * 150 : 0,
      pendingCharges: [],
    };
  });
};

// Generate demo charges
const generateDemoCharges = (rooms: PhysicalRoom[], bookings: Booking[]): MinibarCharge[] => {
  const charges: MinibarCharge[] = [];
  
  rooms.slice(0, 5).forEach((room, idx) => {
    const booking = bookings[idx % bookings.length];
    if (!booking) return;

    charges.push({
      id: `charge-${idx + 1}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      bookingId: booking.id,
      guestName: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
      items: [
        { itemId: "item-1", itemName: "Mineral Water", quantity: 2, unitPrice: 50, total: 100 },
        { itemId: "item-6", itemName: "Kingfisher Beer", quantity: 1, unitPrice: 250, total: 250 },
      ],
      totalAmount: 350,
      status: idx % 3 === 0 ? "pending" : idx % 3 === 1 ? "added-to-folio" : "paid",
      recordedAt: new Date(Date.now() - idx * 7200000),
      recordedBy: "Housekeeping Staff",
    });
  });

  return charges;
};

interface MinibarManagerProps {
  hotels: Hotel[];
  physicalRooms: PhysicalRoom[];
  bookings: Booking[];
  onAddChargeToFolio?: (bookingId: string, amount: number, description: string) => void;
}

export const MinibarManager = ({
  hotels,
  physicalRooms,
  bookings,
  onAddChargeToFolio,
}: MinibarManagerProps) => {
  const [items, setItems] = useState<MinibarItem[]>(demoMinibarItems);
  const [roomMinibars, setRoomMinibars] = useState<RoomMinibar[]>(() => generateDemoRoomMinibars(physicalRooms));
  const [charges, setCharges] = useState<MinibarCharge[]>(() => generateDemoCharges(physicalRooms, bookings));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"rooms" | "inventory" | "charges" | "reports">("rooms");
  const [selectedRoom, setSelectedRoom] = useState<RoomMinibar | null>(null);
  const [isCheckDialogOpen, setIsCheckDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [consumptionUpdates, setConsumptionUpdates] = useState<Record<string, number>>({});

  const getStats = () => {
    return {
      totalRooms: roomMinibars.length,
      needsRestock: roomMinibars.filter((r) => r.status === "needs-restock").length,
      notChecked: roomMinibars.filter((r) => r.status === "not-checked").length,
      pendingCharges: charges.filter((c) => c.status === "pending").length,
      totalPendingAmount: charges.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.totalAmount, 0),
      lowStockItems: items.filter((i) => i.stockQuantity <= i.minStock).length,
    };
  };

  const stats = getStats();

  const filteredRooms = roomMinibars.filter((room) => {
    const matchesSearch = searchQuery === "" || room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCheck = (room: RoomMinibar) => {
    setSelectedRoom(room);
    setConsumptionUpdates({});
    setIsCheckDialogOpen(true);
  };

  const handleRecordConsumption = () => {
    if (!selectedRoom) return;

    const consumedItems = Object.entries(consumptionUpdates)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, quantity]) => {
        const item = items.find((i) => i.id === itemId);
        return {
          itemId,
          itemName: item?.name || "",
          quantity,
          unitPrice: item?.price || 0,
          total: (item?.price || 0) * quantity,
        };
      });

    if (consumedItems.length === 0) {
      // Just mark as checked
      setRoomMinibars(
        roomMinibars.map((r) =>
          r.roomId === selectedRoom.roomId
            ? { ...r, status: "checked" as const, lastChecked: new Date() }
            : r
        )
      );
      toast.success("Minibar checked - no consumption recorded");
    } else {
      const totalAmount = consumedItems.reduce((sum, item) => sum + item.total, 0);

      // Find current booking for this room
      const room = physicalRooms.find((r) => r.id === selectedRoom.roomId);
      const currentBooking = bookings.find(
        (b) => b.status === "checked-in" && room?.currentBookingId === b.id
      );

      const newCharge: MinibarCharge = {
        id: `charge-${Date.now()}`,
        roomId: selectedRoom.roomId,
        roomNumber: selectedRoom.roomNumber,
        bookingId: currentBooking?.id || "",
        guestName: currentBooking
          ? `${currentBooking.guestInfo.firstName} ${currentBooking.guestInfo.lastName}`
          : "Unknown Guest",
        items: consumedItems,
        totalAmount,
        status: "pending",
        recordedAt: new Date(),
        recordedBy: "Housekeeping Staff",
      };

      setCharges([newCharge, ...charges]);

      // Update room minibar
      setRoomMinibars(
        roomMinibars.map((r) => {
          if (r.roomId !== selectedRoom.roomId) return r;

          const updatedItems = r.items.map((item) => ({
            ...item,
            consumed: item.consumed + (consumptionUpdates[item.itemId] || 0),
            quantity: item.quantity - (consumptionUpdates[item.itemId] || 0),
          }));

          const needsRestock = updatedItems.some((item) => item.quantity <= 1);

          return {
            ...r,
            items: updatedItems,
            status: needsRestock ? ("needs-restock" as const) : ("checked" as const),
            lastChecked: new Date(),
            totalCharges: r.totalCharges + totalAmount,
          };
        })
      );

      toast.success(`₹${totalAmount} consumption recorded for Room ${selectedRoom.roomNumber}`);
    }

    setIsCheckDialogOpen(false);
    setSelectedRoom(null);
    setConsumptionUpdates({});
  };

  const handleRestock = (room: RoomMinibar) => {
    setSelectedRoom(room);
    setIsRestockDialogOpen(true);
  };

  const handleConfirmRestock = () => {
    if (!selectedRoom) return;

    setRoomMinibars(
      roomMinibars.map((r) => {
        if (r.roomId !== selectedRoom.roomId) return r;

        return {
          ...r,
          items: r.items.map((item) => ({
            ...item,
            quantity: 3, // Restock to standard quantity
            consumed: 0,
          })),
          status: "stocked" as const,
          lastRestocked: new Date(),
        };
      })
    );

    toast.success(`Room ${selectedRoom.roomNumber} minibar restocked`);
    setIsRestockDialogOpen(false);
    setSelectedRoom(null);
  };

  const handleAddToFolio = (charge: MinibarCharge) => {
    setCharges(
      charges.map((c) =>
        c.id === charge.id ? { ...c, status: "added-to-folio" as const } : c
      )
    );
    onAddChargeToFolio?.(charge.bookingId, charge.totalAmount, `Minibar charges - Room ${charge.roomNumber}`);
    toast.success("Charges added to guest folio");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <DoorClosed className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.totalRooms}</div>
                <div className="text-xs text-muted-foreground">Total Rooms</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "needs-restock" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "needs-restock" ? "all" : "needs-restock")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <RefreshCw className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.needsRestock}</div>
                <div className="text-xs text-muted-foreground">Needs Restock</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer ${statusFilter === "not-checked" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "not-checked" ? "all" : "not-checked")}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.notChecked}</div>
                <div className="text-xs text-muted-foreground">Not Checked</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Receipt className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold">{stats.pendingCharges}</div>
                <div className="text-xs text-muted-foreground">Pending Charges</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold">₹{stats.totalPendingAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Pending Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.lowStockItems > 0 ? "bg-red-50 dark:bg-red-900/20" : ""}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <Package className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stats.lowStockItems}</div>
                <div className="text-xs text-muted-foreground">Low Stock Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="rooms" className="gap-2">
            <DoorClosed className="h-4 w-4" />
            Room Status
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="charges" className="gap-2">
            <Receipt className="h-4 w-4" />
            Charges
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="stocked">Stocked</SelectItem>
                <SelectItem value="needs-restock">Needs Restock</SelectItem>
                <SelectItem value="checked">Checked</SelectItem>
                <SelectItem value="not-checked">Not Checked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => {
              const statusColor =
                room.status === "stocked" ? "bg-green-100 text-green-700 dark:bg-green-900/30" :
                room.status === "needs-restock" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30" :
                room.status === "checked" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" :
                "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30";

              return (
                <Card key={room.roomId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DoorClosed className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold text-lg">Room {room.roomNumber}</span>
                      </div>
                      <Badge className={statusColor}>
                        {room.status.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Checked</span>
                        <span>{room.lastChecked ? format(room.lastChecked, "MMM d, h:mm a") : "Never"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Charges</span>
                        <span className="font-medium">₹{room.totalCharges.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenCheck(room)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Check
                      </Button>
                      {room.status === "needs-restock" && (
                        <Button size="sm" className="flex-1" onClick={() => handleRestock(room)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Restock
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Minibar Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Min/Max</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const categoryInfo = categoryConfig[item.category];
                    const CategoryIcon = categoryInfo.icon;
                    const isLowStock = item.stockQuantity <= item.minStock;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">₹{item.price}</TableCell>
                        <TableCell className="text-right">
                          <span className={isLowStock ? "text-red-600 font-bold" : ""}>
                            {item.stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.minStock} / {item.maxStock}
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Minibar Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {charges.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No charges recorded</p>
                ) : (
                  charges.map((charge) => {
                    const statusColor =
                      charge.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      charge.status === "added-to-folio" ? "bg-blue-100 text-blue-700" :
                      charge.status === "paid" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700";

                    return (
                      <Card key={charge.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">Room {charge.roomNumber}</Badge>
                                <Badge className={statusColor}>{charge.status.replace("-", " ")}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                {charge.guestName}
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                {format(charge.recordedAt, "MMM d, h:mm a")}
                              </div>
                              <div className="mt-2 space-y-1">
                                {charge.items.map((item, idx) => (
                                  <div key={idx} className="text-sm flex justify-between">
                                    <span>{item.itemName} x{item.quantity}</span>
                                    <span>₹{item.total}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xl font-bold">₹{charge.totalAmount}</span>
                              {charge.status === "pending" && (
                                <Button size="sm" onClick={() => handleAddToFolio(charge)}>
                                  Add to Folio
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹4,850</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹28,450</div>
                <p className="text-xs text-muted-foreground">45 transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Selling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Mineral Water</div>
                <p className="text-xs text-muted-foreground">124 units sold</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg per Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹385</div>
                <p className="text-xs text-muted-foreground">Per occupied night</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Check Dialog */}
      <Dialog open={isCheckDialogOpen} onOpenChange={setIsCheckDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check Minibar - Room {selectedRoom?.roomNumber}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Record any items consumed since last check:
                </p>
                {selectedRoom.items.map((roomItem) => {
                  const item = items.find((i) => i.id === roomItem.itemId);
                  if (!item) return null;

                  const categoryInfo = categoryConfig[item.category];
                  const CategoryIcon = categoryInfo.icon;

                  return (
                    <Card key={roomItem.itemId} className="bg-muted/30">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                In stock: {roomItem.quantity} • ₹{item.price}/each
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setConsumptionUpdates({
                                ...consumptionUpdates,
                                [roomItem.itemId]: Math.max(0, (consumptionUpdates[roomItem.itemId] || 0) - 1),
                              })}
                              disabled={(consumptionUpdates[roomItem.itemId] || 0) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-bold">
                              {consumptionUpdates[roomItem.itemId] || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setConsumptionUpdates({
                                ...consumptionUpdates,
                                [roomItem.itemId]: Math.min(roomItem.quantity, (consumptionUpdates[roomItem.itemId] || 0) + 1),
                              })}
                              disabled={(consumptionUpdates[roomItem.itemId] || 0) >= roomItem.quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total Charges:</span>
              <span className="text-xl font-bold">
                ₹{Object.entries(consumptionUpdates)
                  .reduce((sum, [itemId, qty]) => {
                    const item = items.find((i) => i.id === itemId);
                    return sum + (item?.price || 0) * qty;
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordConsumption}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Record & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock Minibar - Room {selectedRoom?.roomNumber}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will reset all minibar items to their standard quantities.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmRestock}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
