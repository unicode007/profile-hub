import { Hotel } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, Heart, MapPin } from "lucide-react";
import { useState } from "react";

interface HotelTableProps {
  hotels: Hotel[];
  onView: (hotel: Hotel) => void;
}

export const HotelTable = ({ hotels, onView }: HotelTableProps) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const placeholderImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop",
  ];

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Hotel Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Rooms</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.map((hotel, index) => {
            const minPrice = hotel.roomTypes.reduce((min, room) => {
              const roomMin = room.plans.reduce(
                (pMin, plan) => Math.min(pMin, plan.discountedPrice),
                Infinity
              );
              return Math.min(min, roomMin);
            }, Infinity);

            const rating = (Math.random() * 0.7 + 4.3).toFixed(1);

            return (
              <TableRow
                key={hotel.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => onView(hotel)}
              >
                <TableCell>
                  <img
                    src={placeholderImages[index % placeholderImages.length]}
                    alt={hotel.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{hotel.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {hotel.location.city}, {hotel.location.state}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{hotel.category}</Badge>
                </TableCell>
                <TableCell>{hotel.roomTypes.length} types</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-bold text-primary">
                    ₹{minPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">/night</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(hotel.id);
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.has(hotel.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
