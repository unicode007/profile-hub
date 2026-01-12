import { Hotel, RoomType, RoomPlan } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Eye,
  Check,
  X,
  Building2,
  Star,
  Utensils,
} from "lucide-react";

interface HotelViewProps {
  hotel: Hotel;
  onBack: () => void;
  onBookNow?: (room: RoomType, plan: RoomPlan) => void;
}

const categoryLabels: Record<string, string> = {
  basicFacilities: "Basic Facilities",
  generalServices: "General Services",
  healthAndWellness: "Health and Wellness",
  transfers: "Transfers",
  roomAmenities: "Room Amenities",
  foodAndDrinks: "Food and Drinks",
  safetyAndSecurity: "Safety and Security",
  entertainment: "Entertainment",
  commonArea: "Common Area",
  businessCenter: "Business Center and Conferences",
  otherFacilities: "Other Facilities",
};

export const HotelView = ({ hotel, onBack, onBookNow }: HotelViewProps) => {
  const hasAmenities = Object.values(hotel.amenities).some((arr) => arr.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Hotels
        </Button>
      </div>

      {/* Hotel Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">{hotel.name}</h1>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {hotel.location.address && `${hotel.location.address}, `}
                  {hotel.location.city}
                  {hotel.location.state && `, ${hotel.location.state}`}
                  {hotel.location.pincode && ` - ${hotel.location.pincode}`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {hotel.category}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {hotel.roomTypes.length} Room Types
              </Badge>
            </div>
          </div>
          {hotel.description && (
            <p className="mt-4 text-muted-foreground">{hotel.description}</p>
          )}
        </div>
      </Card>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Bed className="h-4 w-4" /> Room Types
          </TabsTrigger>
          <TabsTrigger value="amenities" className="flex items-center gap-2">
            <Star className="h-4 w-4" /> Amenities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="mt-6 space-y-6">
          {hotel.roomTypes.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Room Info Left Side */}
                <div className="lg:w-1/3 p-4 border-r border-border">
                  <div className="bg-muted rounded-lg h-40 flex items-center justify-center mb-4">
                    <Bed className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{room.name || "Room Type"}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4" />
                      <span>{room.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{room.view}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      <span>{room.bedCount} {room.bedType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      <span>{room.bathrooms} Bathroom</span>
                    </div>
                  </div>
                  {room.amenities.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.slice(0, 6).map((amenity) => (
                          <span key={amenity} className="text-xs text-muted-foreground">
                            • {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Plans Right Side */}
                <div className="lg:w-2/3 p-4">
                  {room.plans.length > 0 ? (
                    <div className="space-y-4">
                      {room.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-primary">{plan.name}</h4>
                            <ul className="mt-2 space-y-1">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-1">
                                  <span className="text-muted-foreground">•</span> {feature}
                                </li>
                              ))}
                              {plan.freeCancellation && (
                                <li className="text-sm text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Free Cancellation till check-in
                                </li>
                              )}
                            </ul>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="text-sm text-muted-foreground line-through">
                              ₹{plan.originalPrice.toLocaleString()}
                            </div>
                            <div className="text-2xl font-bold">
                              ₹{plan.discountedPrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              +₹{plan.taxesAndFees} Taxes & Fees per night
                            </div>
                            <Button 
                              className="mt-2 bg-teal-600 hover:bg-teal-700"
                              onClick={() => onBookNow?.(room, plan)}
                            >
                              BOOK NOW
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No pricing plans added
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="amenities" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {hasAmenities ? (
                <div className="space-y-6">
                  {Object.entries(hotel.amenities).map(([category, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <h3 className="font-semibold text-foreground border-b pb-2 mb-3">
                          {categoryLabels[category]}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {items.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No amenities selected
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
