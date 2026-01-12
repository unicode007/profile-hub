import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  Users,
  Search,
  LayoutGrid,
  TableIcon,
  Map,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HotelListingHeaderProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onAddNew: () => void;
  totalResults: number;
  location: string;
}

export const HotelListingHeader = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onAddNew,
  totalResults,
  location,
}: HotelListingHeaderProps) => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2 Adults");
  const [searchLocation, setSearchLocation] = useState(location);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Location */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Where</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Check-in */}
          <div className="min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div className="min-w-[150px]">
            <label className="text-xs text-muted-foreground mb-1 block">Check-out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "MMM d, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div className="min-w-[140px]">
            <label className="text-xs text-muted-foreground mb-1 block">Guests</label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 Adult">1 Adult</SelectItem>
                <SelectItem value="2 Adults">2 Adults</SelectItem>
                <SelectItem value="3 Adults">3 Adults</SelectItem>
                <SelectItem value="4 Adults">4 Adults</SelectItem>
                <SelectItem value="5+ Adults">5+ Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="pt-5">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Update Search
            </Button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Found {totalResults} results near <span className="text-primary">{location}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              Card View
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="gap-1.5"
            >
              <TableIcon className="h-4 w-4" />
              Table View
            </Button>
          </div>

          {/* Add Hotel */}
          <Button onClick={onAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Hotel
          </Button>
        </div>
      </div>
    </div>
  );
};
