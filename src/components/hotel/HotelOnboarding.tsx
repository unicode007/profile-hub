import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Separator } from "@/components/ui/separator";
 import { Switch } from "@/components/ui/switch";
 import { Building2, MapPin, Bed, CheckCircle2, ChevronRight, ImageIcon, Package, AlertCircle, Check } from "lucide-react";
import { AmenitiesSection } from "./AmenitiesSection";
import { RoomTypeForm } from "./RoomTypeForm";
import { ImageUpload } from "./ImageUpload";
import { Hotel, RoomType, HOTEL_CATEGORIES } from "./types";
import { toast } from "@/hooks/use-toast";

interface HotelOnboardingProps {
  onHotelCreated: (hotel: Hotel) => void;
}

 interface RoomInventorySetup {
   roomTypeId: string;
   totalRooms: number;
   basePrice: number;
   overbookingAllowed: boolean;
   overbookingLimit: number;
 }
 
const initialAmenities = {
  basicFacilities: [],
  generalServices: [],
  healthAndWellness: [],
  transfers: [],
  roomAmenities: [],
  foodAndDrinks: [],
  safetyAndSecurity: [],
  entertainment: [],
  commonArea: [],
  businessCenter: [],
  otherFacilities: [],
};

export const HotelOnboarding = ({ onHotelCreated }: HotelOnboardingProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [hotelName, setHotelName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [amenities, setAmenities] = useState(initialAmenities);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
   const [roomInventory, setRoomInventory] = useState<RoomInventorySetup[]>([]);
   const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleAmenityChange = (category: string, amenity: string, checked: boolean) => {
    setAmenities((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category as keyof typeof prev], amenity]
        : prev[category as keyof typeof prev].filter((a) => a !== amenity),
    }));
  };

   // Track step completion
   const updateStepCompletion = (step: string, completed: boolean) => {
     if (completed && !completedSteps.includes(step)) {
       setCompletedSteps([...completedSteps, step]);
     } else if (!completed && completedSteps.includes(step)) {
       setCompletedSteps(completedSteps.filter(s => s !== step));
     }
   };
 
   // Validation checks
   const isBasicComplete = hotelName.length > 0 && category.length > 0;
   const isLocationComplete = location.city.length > 0;
   const isRoomsComplete = roomTypes.length > 0;
   const isInventoryComplete = roomInventory.length > 0 && roomInventory.every(inv => inv.totalRooms > 0);
 
   const totalSteps = 6;
   const completedCount = [
     isBasicComplete,
     hotelImages.length > 0,
     isLocationComplete,
     Object.values(amenities).some(arr => arr.length > 0),
     isRoomsComplete,
     isInventoryComplete,
   ].filter(Boolean).length;
 
   const progressPercent = (completedCount / totalSteps) * 100;
 
   // Initialize inventory when room types change
   const syncInventoryWithRoomTypes = () => {
     const newInventory = roomTypes.map(rt => {
       const existing = roomInventory.find(inv => inv.roomTypeId === rt.id);
       return existing || {
         roomTypeId: rt.id,
         totalRooms: 10,
         basePrice: rt.plans[0]?.discountedPrice || 5000,
         overbookingAllowed: false,
         overbookingLimit: 1,
       };
     });
     setRoomInventory(newInventory);
   };
 
   const updateInventory = (roomTypeId: string, updates: Partial<RoomInventorySetup>) => {
     setRoomInventory(prev => 
       prev.map(inv => inv.roomTypeId === roomTypeId ? { ...inv, ...updates } : inv)
     );
   };
 
  const handleSubmit = () => {
    if (!hotelName || !category || !location.city) {
      toast({
        title: "Validation Error",
        description: "Please fill in hotel name, category, and city.",
        variant: "destructive",
      });
      return;
    }

    if (roomTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one room type.",
        variant: "destructive",
      });
      return;
    }

     if (roomInventory.length === 0 || !roomInventory.every(inv => inv.totalRooms > 0)) {
       toast({
         title: "Validation Error",
         description: "Please configure inventory for all room types.",
         variant: "destructive",
       });
       return;
     }
 
    const hotel: Hotel = {
      id: Date.now().toString(),
      name: hotelName,
      description,
      category,
      location,
      amenities,
      roomTypes,
      images: hotelImages,
      rating: 4.5,
      reviewCount: 0,
      createdAt: new Date(),
    };

    onHotelCreated(hotel);
    toast({
      title: "Hotel Created!",
      description: `${hotelName} has been successfully onboarded.`,
    });
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "location", label: "Location", icon: MapPin },
    { id: "amenities", label: "Amenities", icon: CheckCircle2 },
    { id: "rooms", label: "Room Types", icon: Bed },
     { id: "inventory", label: "Inventory", icon: Package },
  ];

  const nextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
       // Sync inventory when moving to inventory tab
       if (tabs[currentIndex + 1].id === "inventory") {
         syncInventoryWithRoomTypes();
       }
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hotel Onboarding</h1>
          <p className="text-muted-foreground">Add your hotel details to get started</p>
        </div>
         <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-sm text-muted-foreground">Progress</div>
             <div className="text-lg font-bold">{completedCount}/{totalSteps} steps</div>
           </div>
           <div className="w-32">
             <Progress value={progressPercent} className="h-2" />
           </div>
         </div>
      </div>

       {/* Step Indicators */}
       <div className="flex items-center gap-2 flex-wrap">
         {tabs.map((tab, index) => {
           const isComplete = index === 0 ? isBasicComplete :
             index === 1 ? hotelImages.length > 0 :
             index === 2 ? isLocationComplete :
             index === 3 ? Object.values(amenities).some(arr => arr.length > 0) :
             index === 4 ? isRoomsComplete :
             isInventoryComplete;
           
           return (
             <Badge
               key={tab.id}
               variant={isComplete ? "default" : "outline"}
               className={`cursor-pointer transition-all ${activeTab === tab.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
               onClick={() => {
                 if (tab.id === "inventory") syncInventoryWithRoomTypes();
                 setActiveTab(tab.id);
               }}
             >
               {isComplete ? <Check className="h-3 w-3 mr-1" /> : <span className="mr-1">{index + 1}.</span>}
               {tab.label}
             </Badge>
           );
         })}
       </div>
 
      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="grid grid-cols-6 w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 Basic Information
                 {isBasicComplete && <Badge variant="secondary" className="text-green-600"><Check className="h-3 w-3 mr-1" />Complete</Badge>}
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hotel Name *</Label>
                  <Input
                    placeholder="Enter hotel name"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOTEL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your hotel..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={nextTab}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                images={hotelImages}
                onImagesChange={setHotelImages}
                maxImages={10}
                label="Upload hotel photos (exterior, lobby, rooms, amenities)"
              />
              <div className="flex justify-end">
                <Button onClick={nextTab}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Address</Label>
                <Textarea
                  placeholder="Street address"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    placeholder="City"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    placeholder="State"
                    value={location.state}
                    onChange={(e) => setLocation({ ...location, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    placeholder="Pincode"
                    value={location.pincode}
                    onChange={(e) => setLocation({ ...location, pincode: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    placeholder="Country"
                    value={location.country}
                    onChange={(e) => setLocation({ ...location, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={nextTab}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <AmenitiesSection
                selectedAmenities={amenities}
                onAmenityChange={handleAmenityChange}
              />
              <div className="flex justify-end mt-6">
                <Button onClick={nextTab}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <span className="flex items-center gap-2">
                   Room Types & Pricing
                   {isRoomsComplete && <Badge variant="secondary" className="text-green-600"><Check className="h-3 w-3 mr-1" />Complete</Badge>}
                 </span>
                 {!isRoomsComplete && (
                   <Badge variant="outline" className="text-orange-600">
                     <AlertCircle className="h-3 w-3 mr-1" />
                     At least 1 room type required
                   </Badge>
                 )}
               </CardTitle>
            </CardHeader>
            <CardContent>
              <RoomTypeForm roomTypes={roomTypes} onRoomTypesChange={setRoomTypes} />
              <div className="flex justify-end mt-6">
                 <Button onClick={nextTab} disabled={!isRoomsComplete}>
                   Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
 
         <TabsContent value="inventory" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <span className="flex items-center gap-2">
                   <Package className="h-5 w-5 text-primary" />
                   Room Inventory Setup
                   {isInventoryComplete && <Badge variant="secondary" className="text-green-600"><Check className="h-3 w-3 mr-1" />Complete</Badge>}
                 </span>
               </CardTitle>
             </CardHeader>
             <CardContent>
               {roomInventory.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                   <p>No room types configured. Please add room types first.</p>
                   <Button variant="link" onClick={() => setActiveTab("rooms")}>
                     Go to Room Types
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {roomInventory.map(inv => {
                     const roomType = roomTypes.find(rt => rt.id === inv.roomTypeId);
                     if (!roomType) return null;
 
                     return (
                       <Card key={inv.roomTypeId}>
                         <CardContent className="pt-6">
                           <div className="flex items-start justify-between mb-4">
                             <div>
                               <h3 className="font-semibold">{roomType.name}</h3>
                               <p className="text-sm text-muted-foreground">
                                 {roomType.bedCount} {roomType.bedType} • {roomType.size}
                               </p>
                             </div>
                             <Badge variant="secondary">{inv.totalRooms} rooms</Badge>
                           </div>
 
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <Label>Total Rooms</Label>
                               <Input
                                 type="number"
                                 min="1"
                                 value={inv.totalRooms}
                                 onChange={(e) => updateInventory(inv.roomTypeId, { totalRooms: parseInt(e.target.value) || 1 })}
                                 className="mt-1"
                               />
                             </div>
                             <div>
                               <Label>Base Price (₹)</Label>
                               <Input
                                 type="number"
                                 min="0"
                                 value={inv.basePrice}
                                 onChange={(e) => updateInventory(inv.roomTypeId, { basePrice: parseInt(e.target.value) || 0 })}
                                 className="mt-1"
                               />
                             </div>
                             <div>
                               <Label>Overbooking Limit</Label>
                               <Input
                                 type="number"
                                 min="0"
                                 value={inv.overbookingLimit}
                                 onChange={(e) => updateInventory(inv.roomTypeId, { overbookingLimit: parseInt(e.target.value) || 0 })}
                                 className="mt-1"
                                 disabled={!inv.overbookingAllowed}
                               />
                             </div>
                           </div>
 
                           <Separator className="my-4" />
 
                           <div className="flex items-center justify-between">
                             <div>
                               <Label>Allow Overbooking</Label>
                               <p className="text-xs text-muted-foreground">
                                 Accept bookings beyond available inventory
                               </p>
                             </div>
                             <Switch
                               checked={inv.overbookingAllowed}
                               onCheckedChange={(checked) => updateInventory(inv.roomTypeId, { overbookingAllowed: checked })}
                             />
                           </div>
                         </CardContent>
                       </Card>
                     );
                   })}
 
                   <div className="flex justify-end">
                     <Button onClick={handleSubmit} size="lg" disabled={!isInventoryComplete}>
                       <CheckCircle2 className="h-4 w-4 mr-2" /> Create Hotel
                     </Button>
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
};
