import { useState } from "react";
import { Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  Shirt, Plus, Search, Clock, CheckCircle2, Package, Truck, MoreVertical,
  Edit, Trash2, DollarSign, CalendarDays, Timer, User, RotateCcw, Zap
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface LaundryOrder {
  id: string;
  roomNumber: string;
  guestName: string;
  bookingId?: string;
  items: LaundryItem[];
  status: "pending-pickup" | "picked-up" | "processing" | "ready" | "delivered" | "cancelled";
  serviceType: "regular" | "express" | "dry-clean" | "pressing";
  priority: "normal" | "express" | "urgent";
  totalAmount: number;
  specialInstructions?: string;
  pickedUpAt?: Date;
  processedAt?: Date;
  readyAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  estimatedDelivery: Date;
  assignedTo?: string;
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  serviceType: "wash" | "dry-clean" | "press" | "wash-press";
}

const statusConfig: Record<LaundryOrder["status"], { label: string; color: string; bg: string }> = {
  "pending-pickup": { label: "Pending Pickup", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  "picked-up": { label: "Picked Up", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  processing: { label: "Processing", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  ready: { label: "Ready", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

const priorityConfig: Record<LaundryOrder["priority"], { label: string; color: string; surcharge: number }> = {
  normal: { label: "Normal", color: "text-gray-600", surcharge: 1 },
  express: { label: "Express", color: "text-orange-600", surcharge: 1.5 },
  urgent: { label: "Urgent", color: "text-red-600", surcharge: 2 },
};

const laundryPriceList = [
  { name: "Shirt", wash: 80, dryClean: 150, press: 40, washPress: 100 },
  { name: "Trouser", wash: 100, dryClean: 180, press: 50, washPress: 130 },
  { name: "T-Shirt", wash: 60, dryClean: 120, press: 30, washPress: 80 },
  { name: "Suit (2pc)", wash: 0, dryClean: 450, press: 150, washPress: 0 },
  { name: "Dress", wash: 120, dryClean: 300, press: 80, washPress: 180 },
  { name: "Saree", wash: 150, dryClean: 350, press: 100, washPress: 200 },
  { name: "Jacket/Blazer", wash: 0, dryClean: 350, press: 120, washPress: 0 },
  { name: "Jeans", wash: 100, dryClean: 200, press: 50, washPress: 130 },
  { name: "Bedsheet", wash: 150, dryClean: 0, press: 60, washPress: 180 },
  { name: "Towel", wash: 80, dryClean: 0, press: 0, washPress: 0 },
  { name: "Curtain (per panel)", wash: 200, dryClean: 400, press: 100, washPress: 250 },
  { name: "Undergarment", wash: 40, dryClean: 0, press: 0, washPress: 0 },
];

const demoOrders: LaundryOrder[] = [
  { id: "laun-1", roomNumber: "301", guestName: "John Smith", status: "pending-pickup", serviceType: "regular", priority: "normal", items: [{ id: "li-1", name: "Shirt", quantity: 3, unitPrice: 80, serviceType: "wash" }, { id: "li-2", name: "Trouser", quantity: 2, unitPrice: 100, serviceType: "wash" }], totalAmount: 440, createdAt: new Date(Date.now() - 1800000), estimatedDelivery: new Date(Date.now() + 86400000) },
  { id: "laun-2", roomNumber: "205", guestName: "Maria Garcia", status: "processing", serviceType: "express", priority: "express", items: [{ id: "li-3", name: "Dress", quantity: 2, unitPrice: 300, serviceType: "dry-clean" }, { id: "li-4", name: "Suit (2pc)", quantity: 1, unitPrice: 450, serviceType: "dry-clean" }], totalAmount: 1575, pickedUpAt: new Date(Date.now() - 7200000), processedAt: new Date(Date.now() - 3600000), createdAt: new Date(Date.now() - 10800000), estimatedDelivery: new Date(Date.now() + 43200000), assignedTo: "Laundry Staff - Ramu" },
  { id: "laun-3", roomNumber: "412", guestName: "Raj Patel", status: "ready", serviceType: "pressing", priority: "normal", items: [{ id: "li-5", name: "Shirt", quantity: 5, unitPrice: 40, serviceType: "press" }, { id: "li-6", name: "Trouser", quantity: 3, unitPrice: 50, serviceType: "press" }], totalAmount: 350, readyAt: new Date(Date.now() - 900000), createdAt: new Date(Date.now() - 21600000), estimatedDelivery: new Date(Date.now() + 3600000), assignedTo: "Laundry Staff - Geeta" },
  { id: "laun-4", roomNumber: "118", guestName: "Sarah Lee", status: "delivered", serviceType: "regular", priority: "normal", items: [{ id: "li-7", name: "Bedsheet", quantity: 2, unitPrice: 150, serviceType: "wash" }, { id: "li-8", name: "Towel", quantity: 4, unitPrice: 80, serviceType: "wash" }], totalAmount: 620, deliveredAt: new Date(Date.now() - 3600000), createdAt: new Date(Date.now() - 86400000), estimatedDelivery: new Date(Date.now() - 7200000) },
  { id: "laun-5", roomNumber: "505", guestName: "Emma Brown", status: "picked-up", serviceType: "dry-clean", priority: "urgent", items: [{ id: "li-9", name: "Saree", quantity: 1, unitPrice: 350, serviceType: "dry-clean" }, { id: "li-10", name: "Jacket/Blazer", quantity: 1, unitPrice: 350, serviceType: "dry-clean" }], totalAmount: 1400, pickedUpAt: new Date(Date.now() - 1800000), createdAt: new Date(Date.now() - 3600000), estimatedDelivery: new Date(Date.now() + 14400000), assignedTo: "Laundry Staff - Ramu", specialInstructions: "Handle with extreme care - silk saree" },
];

interface LaundryManagementProps {
  bookings: Booking[];
  onAddChargeToFolio?: (bookingId: string, amount: number, description: string) => void;
}

export const LaundryManagement = ({ bookings, onAddChargeToFolio }: LaundryManagementProps) => {
  const [orders, setOrders] = useState<LaundryOrder[]>(demoOrders);
  const [activeTab, setActiveTab] = useState<"orders" | "pricing" | "analytics">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LaundryOrder | null>(null);

  const [newOrder, setNewOrder] = useState({
    roomNumber: "", guestName: "", serviceType: "regular" as LaundryOrder["serviceType"],
    priority: "normal" as LaundryOrder["priority"], specialInstructions: "",
    items: [{ id: `new-${Date.now()}`, name: "", quantity: 1, unitPrice: 0, serviceType: "wash" as LaundryItem["serviceType"] }],
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending-pickup").length,
    processing: orders.filter(o => o.status === "processing" || o.status === "picked-up").length,
    ready: orders.filter(o => o.status === "ready").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    todayRevenue: orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.totalAmount, 0),
  };

  const filtered = orders.filter(o => {
    const matchSearch = !searchQuery || o.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || o.roomNumber.includes(searchQuery);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const calcTotal = (items: LaundryItem[], priority: LaundryOrder["priority"]) => {
    const subtotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    return Math.round(subtotal * priorityConfig[priority].surcharge);
  };

  const handleCreate = () => {
    if (!newOrder.roomNumber || !newOrder.guestName || newOrder.items.every(i => !i.name)) {
      toast.error("Fill required fields"); return;
    }
    const validItems = newOrder.items.filter(i => i.name && i.quantity > 0);
    const total = calcTotal(validItems, newOrder.priority);
    const order: LaundryOrder = {
      id: `laun-${Date.now()}`, roomNumber: newOrder.roomNumber, guestName: newOrder.guestName,
      serviceType: newOrder.serviceType, priority: newOrder.priority, items: validItems,
      totalAmount: total, status: "pending-pickup", createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + (newOrder.priority === "urgent" ? 14400000 : newOrder.priority === "express" ? 43200000 : 86400000)),
      specialInstructions: newOrder.specialInstructions || undefined,
    };
    setOrders([order, ...orders]);
    setIsCreateOpen(false);
    setNewOrder({ roomNumber: "", guestName: "", serviceType: "regular", priority: "normal", specialInstructions: "", items: [{ id: `new-${Date.now()}`, name: "", quantity: 1, unitPrice: 0, serviceType: "wash" }] });
    toast.success("Laundry order created!");
  };

  const handleUpdateStatus = (id: string, status: LaundryOrder["status"]) => {
    const now = new Date();
    setOrders(orders.map(o => {
      if (o.id !== id) return o;
      const updates: Partial<LaundryOrder> = { status };
      if (status === "picked-up") updates.pickedUpAt = now;
      if (status === "processing") updates.processedAt = now;
      if (status === "ready") updates.readyAt = now;
      if (status === "delivered") {
        updates.deliveredAt = now;
        if (o.bookingId && onAddChargeToFolio) {
          onAddChargeToFolio(o.bookingId, o.totalAmount, `Laundry - ${o.items.length} items`);
        }
      }
      return { ...o, ...updates };
    }));
    toast.success(`Status updated to ${statusConfig[status].label}`);
  };

  const handleDelete = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast.success("Order deleted");
  };

  const handleEdit = (order: LaundryOrder) => {
    setEditingOrder({ ...order });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
    setIsEditOpen(false);
    setEditingOrder(null);
    toast.success("Order updated!");
  };

  const addItemToNewOrder = () => {
    setNewOrder({ ...newOrder, items: [...newOrder.items, { id: `new-${Date.now()}`, name: "", quantity: 1, unitPrice: 0, serviceType: "wash" }] });
  };

  const updateNewOrderItem = (index: number, field: string, value: any) => {
    const items = [...newOrder.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "name") {
      const priceItem = laundryPriceList.find(p => p.name === value);
      if (priceItem) {
        const serviceField = items[index].serviceType === "dry-clean" ? "dryClean" : items[index].serviceType === "press" ? "press" : items[index].serviceType === "wash-press" ? "washPress" : "wash";
        items[index].unitPrice = priceItem[serviceField] || 0;
      }
    }
    if (field === "serviceType") {
      const priceItem = laundryPriceList.find(p => p.name === items[index].name);
      if (priceItem) {
        const serviceField = value === "dry-clean" ? "dryClean" : value === "press" ? "press" : value === "wash-press" ? "washPress" : "wash";
        items[index].unitPrice = priceItem[serviceField] || 0;
      }
    }
    setNewOrder({ ...newOrder, items });
  };

  const removeNewOrderItem = (index: number) => {
    setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Orders", value: stats.total, icon: Shirt, color: "bg-primary/10 text-primary" },
          { label: "Pending Pickup", value: stats.pending, icon: Clock, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" },
          { label: "Processing", value: stats.processing, icon: RotateCcw, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "Ready", value: stats.ready, icon: CheckCircle2, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Delivered", value: stats.delivered, icon: Truck, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
          { label: "Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="py-3 px-4"><div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${s.color.split(" ")[0]}`}><s.icon className={`h-4 w-4 ${s.color.split(" ").slice(1).join(" ")}`} /></div>
            <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </div></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2"><Shirt className="h-4 w-4" />Orders</TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2"><DollarSign className="h-4 w-4" />Price List</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><Timer className="h-4 w-4" />Analytics</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />New Order</Button>
        </div>

        <TabsContent value="orders" className="mt-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search guest or room..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground"><Shirt className="h-8 w-8 mx-auto mb-2 opacity-50" />No orders found</CardContent></Card>
            ) : filtered.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-muted"><Shirt className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">#{order.id}</span>
                          <Badge className={`${statusConfig[order.status].bg} ${statusConfig[order.status].color} text-xs`}>{statusConfig[order.status].label}</Badge>
                          <Badge variant="outline" className={`text-xs ${priorityConfig[order.priority].color}`}>{priorityConfig[order.priority].label}</Badge>
                          {order.priority !== "normal" && <Zap className="h-3 w-3 text-orange-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.guestName}</span>
                          <span>🚪 Room {order.roomNumber}</span>
                          <span className="font-semibold text-foreground">₹{order.totalAmount.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(order.createdAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {order.status === "pending-pickup" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, "picked-up")}>Pick Up</Button>}
                      {order.status === "picked-up" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, "processing")}>Process</Button>}
                      {order.status === "processing" && <Button size="sm" onClick={() => handleUpdateStatus(order.id, "ready")}>Mark Ready</Button>}
                      {order.status === "ready" && <Button size="sm" onClick={() => handleUpdateStatus(order.id, "delivered")}>Deliver</Button>}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(order)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          {order.status !== "delivered" && order.status !== "cancelled" && <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "cancelled")} className="text-red-600">Cancel</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleDelete(order.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Laundry Price List (₹)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Item</TableHead><TableHead>Wash</TableHead><TableHead>Dry Clean</TableHead><TableHead>Press Only</TableHead><TableHead>Wash + Press</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {laundryPriceList.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.wash > 0 ? `₹${item.wash}` : "-"}</TableCell>
                      <TableCell>{item.dryClean > 0 ? `₹${item.dryClean}` : "-"}</TableCell>
                      <TableCell>{item.press > 0 ? `₹${item.press}` : "-"}</TableCell>
                      <TableCell>{item.washPress > 0 ? `₹${item.washPress}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>• Express service: 1.5x regular price (6-hour delivery)</p>
                <p>• Urgent service: 2x regular price (4-hour delivery)</p>
                <p>• Regular delivery: 24 hours</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Service Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {["regular", "express", "dry-clean", "pressing"].map(type => {
                  const count = orders.filter(o => o.serviceType === type).length;
                  return (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{type}</span>
                      <div className="flex items-center gap-2"><Badge variant="outline">{count}</Badge><span className="text-muted-foreground">{Math.round((count / Math.max(1, orders.length)) * 100)}%</span></div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">₹{orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">₹{Math.round(orders.reduce((s, o) => s + o.totalAmount, 0) / Math.max(1, orders.length)).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Avg Order Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader><DialogTitle>Order #{selectedOrder.id}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2"><Badge className={`${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color}`}>{statusConfig[selectedOrder.status].label}</Badge><Badge variant="outline" className={priorityConfig[selectedOrder.priority].color}>{priorityConfig[selectedOrder.priority].label}</Badge></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label className="text-muted-foreground">Guest</Label><p className="font-medium">{selectedOrder.guestName}</p></div>
                  <div><Label className="text-muted-foreground">Room</Label><p className="font-medium">{selectedOrder.roomNumber}</p></div>
                  <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{format(selectedOrder.createdAt, "MMM dd, hh:mm a")}</p></div>
                  <div><Label className="text-muted-foreground">Est. Delivery</Label><p className="font-medium">{format(selectedOrder.estimatedDelivery, "MMM dd, hh:mm a")}</p></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Items</Label>
                  <Table>
                    <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Service</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedOrder.items.map(item => (
                        <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell className="capitalize">{item.serviceType}</TableCell><TableCell>₹{item.unitPrice * item.quantity}</TableCell></TableRow>
                      ))}
                      <TableRow className="font-bold"><TableCell colSpan={3}>Total</TableCell><TableCell>₹{selectedOrder.totalAmount}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>
                {selectedOrder.specialInstructions && <div><Label className="text-muted-foreground">Special Instructions</Label><p className="text-sm mt-1">{selectedOrder.specialInstructions}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Laundry Order</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pt-2 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Guest Name *</Label><Input value={newOrder.guestName} onChange={e => setNewOrder({ ...newOrder, guestName: e.target.value })} /></div>
                <div><Label>Room Number *</Label><Input value={newOrder.roomNumber} onChange={e => setNewOrder({ ...newOrder, roomNumber: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Service Type</Label>
                  <Select value={newOrder.serviceType} onValueChange={v => setNewOrder({ ...newOrder, serviceType: v as LaundryOrder["serviceType"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="regular">Regular</SelectItem><SelectItem value="express">Express</SelectItem><SelectItem value="dry-clean">Dry Clean</SelectItem><SelectItem value="pressing">Pressing</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={newOrder.priority} onValueChange={v => setNewOrder({ ...newOrder, priority: v as LaundryOrder["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label} {k !== "normal" ? `(${v.surcharge}x)` : ""}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2"><Label>Items</Label><Button variant="outline" size="sm" onClick={addItemToNewOrder}><Plus className="h-3 w-3 mr-1" />Add Item</Button></div>
                {newOrder.items.map((item, idx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-4">
                      <Select value={item.name} onValueChange={v => updateNewOrderItem(idx, "name", v)}>
                        <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                        <SelectContent>{laundryPriceList.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Input type="number" min={1} value={item.quantity} onChange={e => updateNewOrderItem(idx, "quantity", parseInt(e.target.value) || 1)} /></div>
                    <div className="col-span-3">
                      <Select value={item.serviceType} onValueChange={v => updateNewOrderItem(idx, "serviceType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="wash">Wash</SelectItem><SelectItem value="dry-clean">Dry Clean</SelectItem><SelectItem value="press">Press</SelectItem><SelectItem value="wash-press">Wash+Press</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 text-sm font-medium text-right">₹{item.unitPrice * item.quantity}</div>
                    <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewOrderItem(idx)}><Trash2 className="h-3 w-3" /></Button></div>
                  </div>
                ))}
                <div className="text-right font-bold mt-2">Total: ₹{calcTotal(newOrder.items.filter(i => i.name), newOrder.priority)}</div>
              </div>

              <div><Label>Special Instructions</Label><Textarea value={newOrder.specialInstructions} onChange={e => setNewOrder({ ...newOrder, specialInstructions: e.target.value })} placeholder="Handle with care, etc." /></div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
          {editingOrder && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Guest Name</Label><Input value={editingOrder.guestName} onChange={e => setEditingOrder({ ...editingOrder, guestName: e.target.value })} /></div>
                <div><Label>Room</Label><Input value={editingOrder.roomNumber} onChange={e => setEditingOrder({ ...editingOrder, roomNumber: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label>
                  <Select value={editingOrder.priority} onValueChange={v => setEditingOrder({ ...editingOrder, priority: v as LaundryOrder["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Status</Label>
                  <Select value={editingOrder.status} onValueChange={v => setEditingOrder({ ...editingOrder, status: v as LaundryOrder["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Special Instructions</Label><Textarea value={editingOrder.specialInstructions || ""} onChange={e => setEditingOrder({ ...editingOrder, specialInstructions: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
