 import { useState } from "react";
 import { Hotel, Booking } from "./types";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { toast } from "sonner";
 import {
   AlertTriangle,
   Calendar,
   Users,
   Phone,
   Mail,
   ArrowRightLeft,
   XCircle,
   CheckCircle2,
   DollarSign,
   Hotel as HotelIcon,
   ArrowRight,
   RefreshCw,
 } from "lucide-react";
 import { format, addDays, isWithinInterval, startOfDay, eachDayOfInterval } from "date-fns";
 
 interface OverbookingManagerProps {
   hotels: Hotel[];
   bookings: Booking[];
   onRelocateBooking?: (bookingId: string, newHotelId: string, newRoomType: string) => void;
   onCancelBooking?: (bookingId: string) => void;
   onUpgradeBooking?: (bookingId: string, newRoomType: string) => void;
 }
 
 interface OverbookingCase {
   date: Date;
   hotelId: string;
   hotelName: string;
   roomTypeId: string;
   roomTypeName: string;
   totalRooms: number;
   bookedRooms: number;
   overbookedBy: number;
   affectedBookings: Booking[];
 }
 
 export const OverbookingManager = ({
   hotels,
   bookings,
   onRelocateBooking,
   onCancelBooking,
   onUpgradeBooking,
 }: OverbookingManagerProps) => {
   const [selectedCase, setSelectedCase] = useState<OverbookingCase | null>(null);
   const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
   const [resolutionType, setResolutionType] = useState<"relocate" | "upgrade" | "cancel">("relocate");
   const [targetHotel, setTargetHotel] = useState<string>("");
   const [targetRoomType, setTargetRoomType] = useState<string>("");
 
   // Detect all overbooking cases
   const detectOverbookings = (): OverbookingCase[] => {
     const cases: OverbookingCase[] = [];
     const dateRange = eachDayOfInterval({
       start: new Date(),
       end: addDays(new Date(), 60),
     });
 
     hotels.forEach((hotel) => {
       hotel.roomTypes.forEach((roomType) => {
         const totalRooms = 10; // Default inventory
 
         dateRange.forEach((date) => {
           const dayBookings = bookings.filter((b) => {
             if (b.status === "cancelled" || b.hotelId !== hotel.id) return false;
             if (b.roomName !== roomType.name) return false;
             const checkIn = startOfDay(new Date(b.checkIn));
             const checkOut = startOfDay(new Date(b.checkOut));
             return isWithinInterval(startOfDay(date), { start: checkIn, end: addDays(checkOut, -1) });
           });
 
           const bookedRooms = dayBookings.reduce((sum, b) => sum + (b.rooms || 1), 0);
 
           if (bookedRooms > totalRooms) {
             // Check if we already have this case for this date
             const existingCase = cases.find(
               (c) =>
                 c.hotelId === hotel.id &&
                 c.roomTypeId === roomType.id &&
                 format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
             );
 
             if (!existingCase) {
               cases.push({
                 date,
                 hotelId: hotel.id,
                 hotelName: hotel.name,
                 roomTypeId: roomType.id,
                 roomTypeName: roomType.name,
                 totalRooms,
                 bookedRooms,
                 overbookedBy: bookedRooms - totalRooms,
                 affectedBookings: dayBookings,
               });
             }
           }
         });
       });
     });
 
     return cases.sort((a, b) => a.date.getTime() - b.date.getTime());
   };
 
   const overbookingCases = detectOverbookings();
 
   const handleResolve = () => {
     if (!selectedBooking) return;
 
     switch (resolutionType) {
       case "relocate":
         if (!targetHotel || !targetRoomType) {
           toast.error("Please select target hotel and room type");
           return;
         }
         onRelocateBooking?.(selectedBooking.id, targetHotel, targetRoomType);
         toast.success("Booking relocated successfully!");
         break;
       case "upgrade":
         if (!targetRoomType) {
           toast.error("Please select room type for upgrade");
           return;
         }
         onUpgradeBooking?.(selectedBooking.id, targetRoomType);
         toast.success("Booking upgraded successfully!");
         break;
       case "cancel":
         onCancelBooking?.(selectedBooking.id);
         toast.success("Booking cancelled and refund initiated!");
         break;
     }
 
     setResolutionDialogOpen(false);
     setSelectedBooking(null);
     setTargetHotel("");
     setTargetRoomType("");
   };
 
   const getAlternativeRooms = (currentHotelId: string, currentRoomType: string) => {
     const hotel = hotels.find((h) => h.id === currentHotelId);
     if (!hotel) return [];
     return hotel.roomTypes.filter((rt) => rt.name !== currentRoomType);
   };
 
   const groupedCases = overbookingCases.reduce((acc, c) => {
     const key = format(c.date, "yyyy-MM-dd");
     if (!acc[key]) acc[key] = [];
     acc[key].push(c);
     return acc;
   }, {} as Record<string, OverbookingCase[]>);
 
   if (overbookingCases.length === 0) {
     return (
       <Card>
         <CardContent className="py-12 text-center">
           <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
           <h3 className="text-xl font-semibold text-green-700">No Overbookings Detected</h3>
           <p className="text-muted-foreground mt-2">
             All room types have adequate inventory for the next 60 days.
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Summary */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                 <AlertTriangle className="h-5 w-5 text-red-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold text-red-600">{overbookingCases.length}</div>
                 <div className="text-sm text-muted-foreground">Total Cases</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                 <Calendar className="h-5 w-5 text-orange-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">{Object.keys(groupedCases).length}</div>
                 <div className="text-sm text-muted-foreground">Affected Days</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                 <Users className="h-5 w-5 text-blue-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">
                   {overbookingCases.reduce((sum, c) => sum + c.overbookedBy, 0)}
                 </div>
                 <div className="text-sm text-muted-foreground">Extra Bookings</div>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                 <HotelIcon className="h-5 w-5 text-purple-600" />
               </div>
               <div>
                 <div className="text-2xl font-bold">
                   {new Set(overbookingCases.map((c) => c.hotelId)).size}
                 </div>
                 <div className="text-sm text-muted-foreground">Hotels Affected</div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Overbooking Cases by Date */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-red-600">
             <AlertTriangle className="h-5 w-5" />
             Overbooking Cases
           </CardTitle>
         </CardHeader>
         <CardContent>
           <ScrollArea className="max-h-[500px]">
             <div className="space-y-6">
               {Object.entries(groupedCases).map(([dateKey, cases]) => (
                 <div key={dateKey} className="space-y-3">
                   <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                     <span className="font-semibold">
                       {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                     </span>
                     <Badge variant="destructive">{cases.length} issue(s)</Badge>
                   </div>
 
                   {cases.map((c, index) => (
                     <Card key={index} className="border-red-200">
                       <CardContent className="p-4">
                         <div className="flex items-start justify-between">
                           <div>
                             <div className="font-medium">{c.hotelName}</div>
                             <div className="text-sm text-muted-foreground">{c.roomTypeName}</div>
                             <div className="mt-2 flex items-center gap-4 text-sm">
                               <span className="text-blue-600">
                                 Booked: {c.bookedRooms}
                               </span>
                               <span className="text-green-600">
                                 Available: {c.totalRooms}
                               </span>
                               <Badge variant="destructive">
                                 +{c.overbookedBy} over
                               </Badge>
                             </div>
                           </div>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setSelectedCase(c)}
                             className="gap-2"
                           >
                             <RefreshCw className="h-4 w-4" />
                             Resolve
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ))}
             </div>
           </ScrollArea>
         </CardContent>
       </Card>
 
       {/* Case Detail Dialog */}
       <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
         <DialogContent className="max-w-3xl">
           {selectedCase && (
             <>
               <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-red-600" />
                   Resolve Overbooking - {selectedCase.roomTypeName}
                 </DialogTitle>
               </DialogHeader>
               <div className="space-y-4 pt-4">
                 <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="font-medium">{selectedCase.hotelName}</div>
                       <div className="text-sm text-muted-foreground">
                         {format(selectedCase.date, "EEEE, MMMM d, yyyy")}
                       </div>
                     </div>
                     <Badge variant="destructive" className="text-lg px-4 py-2">
                       {selectedCase.bookedRooms} / {selectedCase.totalRooms} rooms
                       <span className="ml-2">({selectedCase.overbookedBy} over)</span>
                     </Badge>
                   </div>
                 </div>
 
                 <div className="space-y-3">
                   <h4 className="font-medium">Affected Bookings</h4>
                   <ScrollArea className="max-h-64">
                     <div className="space-y-2">
                       {selectedCase.affectedBookings.map((booking) => (
                         <div
                           key={booking.id}
                           className="flex items-center justify-between p-3 border rounded-lg"
                         >
                           <div>
                             <div className="font-medium">
                               {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                             </div>
                             <div className="text-sm text-muted-foreground flex items-center gap-3">
                               <span className="flex items-center gap-1">
                                 <Phone className="h-3 w-3" />
                                 {booking.guestInfo.phone}
                               </span>
                               <span className="flex items-center gap-1">
                                 <Mail className="h-3 w-3" />
                                 {booking.guestInfo.email}
                               </span>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {format(new Date(booking.checkIn), "MMM d")} -{" "}
                               {format(new Date(booking.checkOut), "MMM d")} • {booking.rooms || 1} room(s)
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Badge variant="secondary">₹{booking.totalAmount?.toLocaleString()}</Badge>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setSelectedBooking(booking);
                                 setResolutionDialogOpen(true);
                               }}
                             >
                               Actions
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </ScrollArea>
                 </div>
 
                 <div className="flex gap-2 pt-4 border-t">
                   <Button variant="outline" className="flex-1 gap-2">
                     <ArrowRightLeft className="h-4 w-4" />
                     Relocate All
                   </Button>
                   <Button variant="outline" className="flex-1 gap-2">
                     <DollarSign className="h-4 w-4" />
                     Upgrade All
                   </Button>
                   <Button variant="destructive" className="flex-1 gap-2">
                     <XCircle className="h-4 w-4" />
                     Cancel Last {selectedCase.overbookedBy}
                   </Button>
                 </div>
               </div>
             </>
           )}
         </DialogContent>
       </Dialog>
 
       {/* Resolution Dialog */}
       <Dialog open={resolutionDialogOpen} onOpenChange={setResolutionDialogOpen}>
         <DialogContent>
           {selectedBooking && (
             <>
               <DialogHeader>
                 <DialogTitle>Resolve Booking</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 pt-4">
                 <div className="p-4 bg-muted/50 rounded-lg">
                   <div className="font-medium">
                     {selectedBooking.guestInfo.firstName} {selectedBooking.guestInfo.lastName}
                   </div>
                   <div className="text-sm text-muted-foreground">
                     {selectedBooking.roomName} • {selectedBooking.rooms || 1} room(s)
                   </div>
                   <div className="text-sm text-muted-foreground">
                     ₹{selectedBooking.totalAmount?.toLocaleString()}
                   </div>
                 </div>
 
                 <div className="space-y-3">
                   <Select
                     value={resolutionType}
                     onValueChange={(v) => setResolutionType(v as typeof resolutionType)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select resolution type" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="relocate">
                         <span className="flex items-center gap-2">
                           <ArrowRightLeft className="h-4 w-4" />
                           Relocate to Another Hotel
                         </span>
                       </SelectItem>
                       <SelectItem value="upgrade">
                         <span className="flex items-center gap-2">
                           <DollarSign className="h-4 w-4" />
                           Upgrade Room Type
                         </span>
                       </SelectItem>
                       <SelectItem value="cancel">
                         <span className="flex items-center gap-2">
                           <XCircle className="h-4 w-4" />
                           Cancel & Refund
                         </span>
                       </SelectItem>
                     </SelectContent>
                   </Select>
 
                   {resolutionType === "relocate" && (
                     <>
                       <Select value={targetHotel} onValueChange={setTargetHotel}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select target hotel" />
                         </SelectTrigger>
                         <SelectContent>
                           {hotels
                             .filter((h) => h.id !== selectedBooking.hotelId)
                             .map((hotel) => (
                               <SelectItem key={hotel.id} value={hotel.id}>
                                 {hotel.name}
                               </SelectItem>
                             ))}
                         </SelectContent>
                       </Select>
                       {targetHotel && (
                         <Select value={targetRoomType} onValueChange={setTargetRoomType}>
                           <SelectTrigger>
                             <SelectValue placeholder="Select room type" />
                           </SelectTrigger>
                           <SelectContent>
                             {hotels
                               .find((h) => h.id === targetHotel)
                               ?.roomTypes.map((rt) => (
                                 <SelectItem key={rt.id} value={rt.name}>
                                   {rt.name}
                                 </SelectItem>
                               ))}
                           </SelectContent>
                         </Select>
                       )}
                     </>
                   )}
 
                   {resolutionType === "upgrade" && (
                     <Select value={targetRoomType} onValueChange={setTargetRoomType}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select upgrade room type" />
                       </SelectTrigger>
                       <SelectContent>
                         {getAlternativeRooms(selectedBooking.hotelId, selectedBooking.roomName).map(
                           (rt) => (
                             <SelectItem key={rt.id} value={rt.name}>
                               {rt.name} - ₹{rt.plans[0]?.discountedPrice?.toLocaleString()}
                             </SelectItem>
                           )
                         )}
                       </SelectContent>
                     </Select>
                   )}
 
                   {resolutionType === "cancel" && (
                     <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                       <p className="font-medium text-red-600">Warning: This will cancel the booking</p>
                       <p className="text-muted-foreground mt-1">
                         A full refund of ₹{selectedBooking.totalAmount?.toLocaleString()} will be
                         initiated.
                       </p>
                     </div>
                   )}
                 </div>
 
                 <Button onClick={handleResolve} className="w-full">
                   {resolutionType === "relocate" && "Relocate Booking"}
                   {resolutionType === "upgrade" && "Upgrade Booking"}
                   {resolutionType === "cancel" && "Cancel & Refund"}
                 </Button>
               </div>
             </>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 };