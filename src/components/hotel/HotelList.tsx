import { Hotel } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Eye, Building2, Plus } from "lucide-react";

interface HotelListProps {
  hotels: Hotel[];
  onViewHotel: (hotel: Hotel) => void;
  onAddNew: () => void;
}

export const HotelList = ({ hotels, onViewHotel, onAddNew }: HotelListProps) => {
  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Hotels Yet</h2>
        <p className="text-muted-foreground mb-6">Start by adding your first hotel</p>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Hotel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hotels</h1>
          <p className="text-muted-foreground">{hotels.length} hotel(s) onboarded</p>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Hotel
        </Button>
      </div>

      <div className="grid gap-4">
        {hotels.map((hotel) => {
          const minPrice = hotel.roomTypes.reduce((min, room) => {
            const roomMin = room.plans.reduce(
              (pMin, plan) => Math.min(pMin, plan.discountedPrice),
              Infinity
            );
            return Math.min(min, roomMin);
          }, Infinity);

          return (
            <Card
              key={hotel.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onViewHotel(hotel)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <Badge variant="secondary">{hotel.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {hotel.location.city}
                          {hotel.location.state && `, ${hotel.location.state}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" /> {hotel.roomTypes.length} Room Types
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {minPrice !== Infinity && (
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Starting from</div>
                        <div className="text-xl font-bold text-primary">
                          ₹{minPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">per night</div>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
