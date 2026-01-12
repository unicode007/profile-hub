import { Hotel } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Bed, Bath, MapPin } from "lucide-react";
import { useState } from "react";

interface HotelCardProps {
  hotel: Hotel;
  onView: (hotel: Hotel) => void;
}

export const HotelCard = ({ hotel, onView }: HotelCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const minPrice = hotel.roomTypes.reduce((min, room) => {
    const roomMin = room.plans.reduce(
      (pMin, plan) => Math.min(pMin, plan.discountedPrice),
      Infinity
    );
    return Math.min(min, roomMin);
  }, Infinity);

  const maxPrice = hotel.roomTypes.reduce((max, room) => {
    const roomMax = room.plans.reduce(
      (pMax, plan) => Math.max(pMax, plan.originalPrice),
      0
    );
    return Math.max(max, roomMax);
  }, 0);

  const totalBeds = hotel.roomTypes.reduce((sum, room) => sum + 1, 0);
  const rating = (Math.random() * 0.7 + 4.3).toFixed(1);

  // Generate placeholder image URL based on hotel name
  const imageIndex = hotel.id.charCodeAt(0) % 10;
  const placeholderImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=400&h=300&fit=crop",
  ];

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => onView(hotel)}
    >
      <div className="relative">
        <img
          src={placeholderImages[imageIndex]}
          alt={hotel.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            {rating}
          </Badge>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
            }`}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 truncate">{hotel.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {hotel.location.address}, {hotel.location.city}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" /> {hotel.roomTypes.length} bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {Math.ceil(hotel.roomTypes.length / 2)} bath
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ₹{minPrice.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/night</span>
            </div>
            {maxPrice > minPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{maxPrice.toLocaleString()}/night
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
