import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Bed, CheckCircle2, ChevronRight } from "lucide-react";
import { AmenitiesSection } from "./AmenitiesSection";
import { RoomTypeForm } from "./RoomTypeForm";
import { Hotel, RoomType, HOTEL_CATEGORIES } from "./types";
import { toast } from "@/hooks/use-toast";

interface HotelOnboardingProps {
  onHotelCreated: (hotel: Hotel) => void;
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
  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [amenities, setAmenities] = useState(initialAmenities);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const handleAmenityChange = (category: string, amenity: string, checked: boolean) => {
    setAmenities((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category as keyof typeof prev], amenity]
        : prev[category as keyof typeof prev].filter((a) => a !== amenity),
    }));
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

    const hotel: Hotel = {
      id: Date.now().toString(),
      name: hotelName,
      description,
      category,
      location,
      amenities,
      roomTypes,
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
    { id: "location", label: "Location", icon: MapPin },
    { id: "amenities", label: "Amenities", icon: CheckCircle2 },
    { id: "rooms", label: "Room Types", icon: Bed },
  ];

  const nextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
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
              <CardTitle>Basic Information</CardTitle>
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
              <CardTitle>Room Types & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <RoomTypeForm roomTypes={roomTypes} onRoomTypesChange={setRoomTypes} />
              <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} size="lg">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Create Hotel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
