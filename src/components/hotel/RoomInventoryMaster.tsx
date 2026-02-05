 import { useState } from "react";
 import { Hotel, RoomType, Booking } from "./types";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
 import { Progress } from "@/components/ui/progress";
 import { Separator } from "@/components/ui/separator";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
 } from "@/components/ui/table";
 import { toast } from "sonner";
 import {
 Bed,
 Package,
 Calendar,
 AlertTriangle,
 Lock,
 Unlock,
 Plus,
 Minus,
 Edit,
 Save,
 TrendingUp,
 DollarSign,
 BarChart3,
 Settings,
 RefreshCw,
 ArrowUpDown,
 Percent,
 CalendarRange,
 } from "lucide-react";
 import { format, addDays, startOfDay, isWithinInterval, eachDayOfInterval, isSameDay } from "date-fns";
 
 interface RoomInventory {
   roomTypeId: string;
   totalRooms: number;
   basePrice: number;
   minStayDays: number;
   maxOccupancy: number;
   overbookingAllowed: boolean;
   overbookingLimit: number;
   seasonalPricing: SeasonalPrice[];
   dateBlocks: DateBlock[];
 }
 
 interface SeasonalPrice {
   id: string;
   name: string;
   startDate: Date;
   endDate: Date;
   priceMultiplier: number;
   minStay?: number;
 }
 
 interface DateBlock {
   id: string;
   startDate: Date;
   endDate: Date;
   rooms: number;
   reason: string;
 }
 
 interface OverbookingAlert {
   date: Date;
   roomTypeId: string;
   roomTypeName: string;
   booked: number;
   available: number;
   overbookedBy: number;
 }
 
 interface RoomInventoryMasterProps {
   hotel: Hotel;
   bookings: Booking[];
   onUpdateInventory?: (inventory: RoomInventory[]) => void;
 }
 
 export const RoomInventoryMaster = ({
   hotel,
   bookings,
   onUpdateInventory,
 }: RoomInventoryMasterProps) => {
   const [inventory, setInventory] = useState<RoomInventory[]>(() =>
     hotel.roomTypes.map((rt) => ({
       roomTypeId: rt.id,
       totalRooms: 10,
       basePrice: rt.plans[0]?.discountedPrice || 5000,
       minStayDays: 1,
       maxOccupancy: rt.bedCount * 2,
       overbookingAllowed: false,
       overbookingLimit: 1,
       seasonalPricing: [],
       dateBlocks: [],
     }))
   );
 
   const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState("overview");
   const [seasonalDialogOpen, setSeasonalDialogOpen] = useState(false);
   const [blockDialogOpen, setBlockDialogOpen] = useState(false);
   const [overbookingDialogOpen, setOverbookingDialogOpen] = useState(false);
 
   // Form states
   const [seasonForm, setSeasonForm] = useState({
     name: "",
     startDate: "",
     endDate: "",
     priceMultiplier: 1.2,
     minStay: 1,
   });
 
   const [blockForm, setBlockForm] = useState({
     startDate: "",
     endDate: "",
     rooms: 1,
     reason: "",
   });
 
   const getInventoryForRoom = (roomTypeId: string) =>
     inventory.find((inv) => inv.roomTypeId === roomTypeId);
 
   const getRoomType = (roomTypeId: string) =>
     hotel.roomTypes.find((rt) => rt.id === roomTypeId);
 
   // Calculate availability and overbookings
   const getDateAvailability = (roomTypeId: string, date: Date) => {
     const inv = getInventoryForRoom(roomTypeId);
     if (!inv) return { available: 0, booked: 0, blocked: 0 };
 
     const dayBookings = bookings.filter((b) => {
       if (b.status === "cancelled") return false;
       const rt = hotel.roomTypes.find((r) => r.name === b.roomName);
       if (rt?.id !== roomTypeId) return false;
       const checkIn = startOfDay(new Date(b.checkIn));
       const checkOut = startOfDay(new Date(b.checkOut));
       return isWithinInterval(startOfDay(date), { start: checkIn, end: addDays(checkOut, -1) });
     });
 
     const booked = dayBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
 
     const blockedRooms = inv.dateBlocks
       .filter((block) =>
         isWithinInterval(startOfDay(date), {
           start: startOfDay(block.startDate),
           end: startOfDay(block.endDate),
         })
       )
       .reduce((sum, block) => sum + block.rooms, 0);
 
     const available = Math.max(0, inv.totalRooms - booked - blockedRooms);
 
     return { available, booked, blocked: blockedRooms };
   };
 
   // Detect overbookings
   const detectOverbookings = (): OverbookingAlert[] => {
     const alerts: OverbookingAlert[] = [];
     const dateRange = eachDayOfInterval({
       start: new Date(),
       end: addDays(new Date(), 90),
     });
 
     hotel.roomTypes.forEach((rt) => {
       const inv = getInventoryForRoom(rt.id);
       if (!inv) return;
 
       dateRange.forEach((date) => {
         const { booked, blocked } = getDateAvailability(rt.id, date);
         const available = inv.totalRooms - blocked;
 
         if (booked > available) {
           const overbookedBy = booked - available;
           if (!inv.overbookingAllowed || overbookedBy > inv.overbookingLimit) {
             alerts.push({
               date,
               roomTypeId: rt.id,
               roomTypeName: rt.name,
               booked,
               available,
               overbookedBy,
             });
           }
         }
       });
     });
 
     return alerts;
   };
 
   const overbookingAlerts = detectOverbookings();
 
   const updateInventory = (roomTypeId: string, updates: Partial<RoomInventory>) => {
     const updated = inventory.map((inv) =>
       inv.roomTypeId === roomTypeId ? { ...inv, ...updates } : inv
     );
     setInventory(updated);
     onUpdateInventory?.(updated);
   };
 
   const addSeasonalPricing = () => {
     if (!selectedRoomType || !seasonForm.name || !seasonForm.startDate || !seasonForm.endDate) {
       toast.error("Please fill all required fields");
       return;
     }
 
     const inv = getInventoryForRoom(selectedRoomType);
     if (!inv) return;
 
     const newSeason: SeasonalPrice = {
       id: `season-${Date.now()}`,
       name: seasonForm.name,
       startDate: new Date(seasonForm.startDate),
       endDate: new Date(seasonForm.endDate),
       priceMultiplier: seasonForm.priceMultiplier,
       minStay: seasonForm.minStay,
     };
 
     updateInventory(selectedRoomType, {
       seasonalPricing: [...inv.seasonalPricing, newSeason],
     });
 
     setSeasonForm({ name: "", startDate: "", endDate: "", priceMultiplier: 1.2, minStay: 1 });
     setSeasonalDialogOpen(false);
     toast.success("Seasonal pricing added!");
   };
 
   const addDateBlock = () => {
     if (!selectedRoomType || !blockForm.startDate || !blockForm.endDate || !blockForm.reason) {
       toast.error("Please fill all required fields");
       return;
     }
 
     const inv = getInventoryForRoom(selectedRoomType);
     if (!inv) return;
 
     const newBlock: DateBlock = {
       id: `block-${Date.now()}`,
       startDate: new Date(blockForm.startDate),
       endDate: new Date(blockForm.endDate),
       rooms: blockForm.rooms,
       reason: blockForm.reason,
     };
 
     updateInventory(selectedRoomType, {
       dateBlocks: [...inv.dateBlocks, newBlock],
     });
 
     setBlockForm({ startDate: "", endDate: "", rooms: 1, reason: "" });
     setBlockDialogOpen(false);
     toast.success("Date block added!");
   };
 
   const removeSeasonalPricing = (roomTypeId: string, seasonId: string) => {
     const inv = getInventoryForRoom(roomTypeId);
     if (!inv) return;
     updateInventory(roomTypeId, {
       seasonalPricing: inv.seasonalPricing.filter((s) => s.id !== seasonId),
     });
     toast.success("Seasonal pricing removed!");
   };
 
   const removeDateBlock = (roomTypeId: string, blockId: string) => {
     const inv = getInventoryForRoom(roomTypeId);
     if (!inv) return;
     updateInventory(roomTypeId, {
       dateBlocks: inv.dateBlocks.filter((b) => b.id !== blockId),
     });
     toast.success("Date block removed!");
   };
 
   // Calculate totals
   const totalRooms = inventory.reduce((sum, inv) => sum + inv.totalRooms, 0);
   const totalBlocked = inventory.reduce((sum, inv) => {
     const today = new Date();
     return sum + inv.dateBlocks
       .filter((b) => isWithinInterval(today, { start: b.startDate, end: b.endDate }))
       .reduce((s, b) => s + b.rooms, 0);
   }, 0);
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-primary/10">
                 <Package className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{totalRooms}</div>
                 <div className="text-sm text-muted-foreground">Total Inventory</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                 <Bed className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{hotel.roomTypes.length}</div>
                 <div className="text-sm text-muted-foreground">Room Types</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                 <Lock className="h-5 w-5 text-orange-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{totalBlocked}</div>
                 <div className="text-sm text-muted-foreground">Blocked Today</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card className={overbookingAlerts.length > 0 ? "border-red-300" : ""}>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-full ${overbookingAlerts.length > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                 <AlertTriangle className={`h-5 w-5 ${overbookingAlerts.length > 0 ? "text-red-600" : "text-green-600"}`} />
               </div>
               <div>
                 <div className="text-2xl font-bold">{overbookingAlerts.length}</div>
                 <div className="text-sm text-muted-foreground">Overbookings</div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Overbooking Alerts */}
       {overbookingAlerts.length > 0 && (
         <Card className="border-red-300 bg-red-50/50 dark:bg-red-900/10">
           <CardHeader className="pb-2">
             <CardTitle className="text-red-600 flex items-center gap-2">
               <AlertTriangle className="h-5 w-5" />
               Overbooking Alerts ({overbookingAlerts.length})
             </CardTitle>
           </CardHeader>
           <CardContent>
             <ScrollArea className="max-h-48">
               <div className="space-y-2">
                 {overbookingAlerts.slice(0, 10).map((alert, index) => (
                   <div
                     key={index}
                     className="flex items-center justify-between p-3 bg-background rounded-lg border"
                   >
                     <div>
                       <div className="font-medium">{alert.roomTypeName}</div>
                       <div className="text-sm text-muted-foreground">
                         {format(alert.date, "EEE, MMM d, yyyy")}
                       </div>
                     </div>
                     <div className="text-right">
                       <Badge variant="destructive">
                         +{alert.overbookedBy} overbooked
                       </Badge>
                       <div className="text-xs text-muted-foreground mt-1">
                         {alert.booked} booked / {alert.available} available
                       </div>
                     </div>
                   </div>
                 ))}
                 {overbookingAlerts.length > 10 && (
                   <Button
                     variant="ghost"
                     className="w-full"
                     onClick={() => setOverbookingDialogOpen(true)}
                   >
                     View all {overbookingAlerts.length} alerts
                   </Button>
                 )}
               </div>
             </ScrollArea>
           </CardContent>
         </Card>
       )}
 
       {/* Main Content */}
       <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
           <TabsTrigger value="overview" className="gap-2">
             <BarChart3 className="h-4 w-4" />
             Overview
           </TabsTrigger>
           <TabsTrigger value="inventory" className="gap-2">
             <Package className="h-4 w-4" />
             Inventory
           </TabsTrigger>
           <TabsTrigger value="pricing" className="gap-2">
             <DollarSign className="h-4 w-4" />
             Pricing
           </TabsTrigger>
           <TabsTrigger value="blocking" className="gap-2">
             <Lock className="h-4 w-4" />
             Blocking
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="overview" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Room Type Inventory Overview</CardTitle>
             </CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Room Type</TableHead>
                     <TableHead className="text-center">Total</TableHead>
                     <TableHead className="text-center">Available</TableHead>
                     <TableHead className="text-center">Booked</TableHead>
                     <TableHead className="text-center">Blocked</TableHead>
                     <TableHead className="text-center">Occupancy</TableHead>
                     <TableHead className="text-center">Overbooking</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {hotel.roomTypes.map((rt) => {
                     const inv = getInventoryForRoom(rt.id);
                     const today = getDateAvailability(rt.id, new Date());
                     const occupancy = inv ? ((today.booked / inv.totalRooms) * 100) : 0;
 
                     return (
                       <TableRow key={rt.id}>
                         <TableCell>
                           <div>
                             <div className="font-medium">{rt.name}</div>
                             <div className="text-xs text-muted-foreground">
                               {rt.bedCount} {rt.bedType} • {rt.size}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="text-center font-bold">{inv?.totalRooms || 0}</TableCell>
                         <TableCell className="text-center">
                           <Badge variant="outline" className="text-green-600">
                             {today.available}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-center">
                           <Badge variant="outline" className="text-blue-600">
                             {today.booked}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-center">
                           <Badge variant="outline" className="text-orange-600">
                             {today.blocked}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-center">
                           <div className="flex items-center gap-2">
                             <Progress value={occupancy} className="w-16 h-2" />
                             <span className="text-sm">{occupancy.toFixed(0)}%</span>
                           </div>
                         </TableCell>
                         <TableCell className="text-center">
                           <Badge variant={inv?.overbookingAllowed ? "secondary" : "outline"}>
                             {inv?.overbookingAllowed ? `+${inv.overbookingLimit}` : "Off"}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="inventory" className="mt-6">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
             {hotel.roomTypes.map((rt) => {
               const inv = getInventoryForRoom(rt.id);
               if (!inv) return null;
 
               return (
                 <Card key={rt.id}>
                   <CardHeader className="pb-2">
                     <CardTitle className="text-base flex items-center justify-between">
                       <span>{rt.name}</span>
                       <Badge variant="secondary">{inv.totalRooms} rooms</Badge>
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div>
                       <Label className="text-xs text-muted-foreground">Total Rooms</Label>
                       <div className="flex items-center gap-2 mt-1">
                         <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => updateInventory(rt.id, { totalRooms: Math.max(1, inv.totalRooms - 1) })}
                         >
                           <Minus className="h-3 w-3" />
                         </Button>
                         <Input
                           type="number"
                           value={inv.totalRooms}
                           onChange={(e) => updateInventory(rt.id, { totalRooms: Math.max(1, parseInt(e.target.value) || 1) })}
                           className="w-20 text-center"
                         />
                         <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => updateInventory(rt.id, { totalRooms: inv.totalRooms + 1 })}
                         >
                           <Plus className="h-3 w-3" />
                         </Button>
                       </div>
                     </div>
 
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <Label className="text-xs text-muted-foreground">Base Price</Label>
                         <div className="flex items-center gap-1 mt-1">
                           <span className="text-muted-foreground">₹</span>
                           <Input
                             type="number"
                             value={inv.basePrice}
                             onChange={(e) => updateInventory(rt.id, { basePrice: parseInt(e.target.value) || 0 })}
                             className="h-8"
                           />
                         </div>
                       </div>
                       <div>
                         <Label className="text-xs text-muted-foreground">Min Stay</Label>
                         <Input
                           type="number"
                           value={inv.minStayDays}
                           onChange={(e) => updateInventory(rt.id, { minStayDays: parseInt(e.target.value) || 1 })}
                           className="h-8 mt-1"
                         />
                       </div>
                     </div>
 
                     <div>
                       <Label className="text-xs text-muted-foreground">Max Occupancy</Label>
                       <Input
                         type="number"
                         value={inv.maxOccupancy}
                         onChange={(e) => updateInventory(rt.id, { maxOccupancy: parseInt(e.target.value) || 2 })}
                         className="h-8 mt-1"
                       />
                     </div>
 
                     <Separator />
 
                     <div className="flex items-center justify-between">
                       <div>
                         <Label className="text-sm">Allow Overbooking</Label>
                         <p className="text-xs text-muted-foreground">
                           Accept bookings beyond capacity
                         </p>
                       </div>
                       <Switch
                         checked={inv.overbookingAllowed}
                         onCheckedChange={(checked) => updateInventory(rt.id, { overbookingAllowed: checked })}
                       />
                     </div>
 
                     {inv.overbookingAllowed && (
                       <div>
                         <Label className="text-xs text-muted-foreground">Overbooking Limit</Label>
                         <Input
                           type="number"
                           value={inv.overbookingLimit}
                           onChange={(e) => updateInventory(rt.id, { overbookingLimit: Math.max(1, parseInt(e.target.value) || 1) })}
                           className="h-8 mt-1"
                         />
                       </div>
                     )}
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         </TabsContent>
 
         <TabsContent value="pricing" className="mt-6">
           <Card>
             <CardHeader className="border-b">
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-primary" />
                   Seasonal Pricing
                 </CardTitle>
                 <div className="flex items-center gap-2">
                   <Select value={selectedRoomType || ""} onValueChange={setSelectedRoomType}>
                     <SelectTrigger className="w-48">
                       <SelectValue placeholder="Select room type" />
                     </SelectTrigger>
                     <SelectContent>
                       {hotel.roomTypes.map((rt) => (
                         <SelectItem key={rt.id} value={rt.id}>
                           {rt.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <Button
                     onClick={() => setSeasonalDialogOpen(true)}
                     disabled={!selectedRoomType}
                     className="gap-2"
                   >
                     <Plus className="h-4 w-4" />
                     Add Season
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-4">
               {selectedRoomType ? (
                 <div className="space-y-3">
                   {(getInventoryForRoom(selectedRoomType)?.seasonalPricing || []).length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       No seasonal pricing configured. Add seasons for dynamic pricing.
                     </div>
                   ) : (
                     getInventoryForRoom(selectedRoomType)?.seasonalPricing.map((season) => (
                       <div
                         key={season.id}
                         className="flex items-center justify-between p-4 border rounded-lg"
                       >
                         <div>
                           <div className="font-medium flex items-center gap-2">
                             {season.name}
                             <Badge variant="secondary">
                               <Percent className="h-3 w-3 mr-1" />
                               {((season.priceMultiplier - 1) * 100).toFixed(0)}%
                             </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground">
                             {format(season.startDate, "MMM d")} - {format(season.endDate, "MMM d, yyyy")}
                             {season.minStay && season.minStay > 1 && (
                               <span className="ml-2">• Min stay: {season.minStay} nights</span>
                             )}
                           </div>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => removeSeasonalPricing(selectedRoomType, season.id)}
                           className="text-destructive"
                         >
                           Remove
                         </Button>
                       </div>
                     ))
                   )}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   Select a room type to manage seasonal pricing
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="blocking" className="mt-6">
           <Card>
             <CardHeader className="border-b">
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <Lock className="h-5 w-5 text-orange-600" />
                   Date-wise Blocking
                 </CardTitle>
                 <div className="flex items-center gap-2">
                   <Select value={selectedRoomType || ""} onValueChange={setSelectedRoomType}>
                     <SelectTrigger className="w-48">
                       <SelectValue placeholder="Select room type" />
                     </SelectTrigger>
                     <SelectContent>
                       {hotel.roomTypes.map((rt) => (
                         <SelectItem key={rt.id} value={rt.id}>
                           {rt.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <Button
                     onClick={() => setBlockDialogOpen(true)}
                     disabled={!selectedRoomType}
                     variant="outline"
                     className="gap-2"
                   >
                     <Plus className="h-4 w-4" />
                     Block Dates
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-4">
               {selectedRoomType ? (
                 <div className="space-y-3">
                   {(getInventoryForRoom(selectedRoomType)?.dateBlocks || []).length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       No date blocks configured. Block dates for maintenance or events.
                     </div>
                   ) : (
                     getInventoryForRoom(selectedRoomType)?.dateBlocks.map((block) => (
                       <div
                         key={block.id}
                         className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200"
                       >
                         <div>
                           <div className="font-medium flex items-center gap-2">
                             <Lock className="h-4 w-4 text-orange-600" />
                             {block.rooms} room(s) blocked
                           </div>
                           <div className="text-sm text-muted-foreground">
                             {format(block.startDate, "MMM d")} - {format(block.endDate, "MMM d, yyyy")}
                             <span className="ml-2">• {block.reason}</span>
                           </div>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => removeDateBlock(selectedRoomType, block.id)}
                           className="text-green-600"
                         >
                           <Unlock className="h-4 w-4 mr-1" />
                           Unblock
                         </Button>
                       </div>
                     ))
                   )}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   Select a room type to manage date blocking
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
 
       {/* Seasonal Pricing Dialog */}
       <Dialog open={seasonalDialogOpen} onOpenChange={setSeasonalDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add Seasonal Pricing</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-4">
             <div>
               <Label>Season Name</Label>
               <Input
                 placeholder="e.g., Summer Peak, Diwali Festival"
                 value={seasonForm.name}
                 onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Start Date</Label>
                 <Input
                   type="date"
                   value={seasonForm.startDate}
                   onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                 />
               </div>
               <div>
                 <Label>End Date</Label>
                 <Input
                   type="date"
                   value={seasonForm.endDate}
                   onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                 />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Price Multiplier</Label>
                 <Input
                   type="number"
                   step="0.1"
                   value={seasonForm.priceMultiplier}
                   onChange={(e) => setSeasonForm({ ...seasonForm, priceMultiplier: parseFloat(e.target.value) || 1 })}
                 />
                 <p className="text-xs text-muted-foreground mt-1">
                   1.2 = 20% increase, 0.8 = 20% decrease
                 </p>
               </div>
               <div>
                 <Label>Min Stay (nights)</Label>
                 <Input
                   type="number"
                   value={seasonForm.minStay}
                   onChange={(e) => setSeasonForm({ ...seasonForm, minStay: parseInt(e.target.value) || 1 })}
                 />
               </div>
             </div>
             <Button onClick={addSeasonalPricing} className="w-full">
               Add Seasonal Pricing
             </Button>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Date Block Dialog */}
       <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Block Dates</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 pt-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Start Date</Label>
                 <Input
                   type="date"
                   value={blockForm.startDate}
                   onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                 />
               </div>
               <div>
                 <Label>End Date</Label>
                 <Input
                   type="date"
                   value={blockForm.endDate}
                   onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                 />
               </div>
             </div>
             <div>
               <Label>Number of Rooms to Block</Label>
               <Input
                 type="number"
                 value={blockForm.rooms}
                 onChange={(e) => setBlockForm({ ...blockForm, rooms: Math.max(1, parseInt(e.target.value) || 1) })}
               />
             </div>
             <div>
               <Label>Reason</Label>
               <Input
                 placeholder="e.g., Maintenance, Renovation, Private Event"
                 value={blockForm.reason}
                 onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
               />
             </div>
             <Button onClick={addDateBlock} className="w-full">
               Block Dates
             </Button>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Overbooking Details Dialog */}
       <Dialog open={overbookingDialogOpen} onOpenChange={setOverbookingDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-red-600">
               <AlertTriangle className="h-5 w-5" />
               All Overbooking Alerts
             </DialogTitle>
           </DialogHeader>
           <ScrollArea className="max-h-[60vh]">
             <div className="space-y-2">
               {overbookingAlerts.map((alert, index) => (
                 <div
                   key={index}
                   className="flex items-center justify-between p-3 border rounded-lg"
                 >
                   <div>
                     <div className="font-medium">{alert.roomTypeName}</div>
                     <div className="text-sm text-muted-foreground">
                       {format(alert.date, "EEEE, MMM d, yyyy")}
                     </div>
                   </div>
                   <div className="text-right">
                     <Badge variant="destructive">
                       +{alert.overbookedBy} overbooked
                     </Badge>
                     <div className="text-xs text-muted-foreground mt-1">
                       {alert.booked} booked / {alert.available} available
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </ScrollArea>
         </DialogContent>
       </Dialog>
     </div>
   );
 };