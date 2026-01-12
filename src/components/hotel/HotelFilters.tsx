import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Building2, Home, X } from "lucide-react";

interface FiltersState {
  priceRange: [number, number];
  placeTypes: string[];
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  propertyTypes: string[];
}

interface HotelFiltersProps {
  filters: FiltersState;
  onFiltersChange: (filters: FiltersState) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

const PLACE_TYPES = [
  { id: "entire", label: "Entire place", description: "A place all to yourself" },
  { id: "shared", label: "Shared room", description: "A sleeping space and common areas that may be shared with others" },
  { id: "room", label: "Room", description: "Your own room, plus access to shared spaces" },
];

const PROPERTY_TYPES = [
  { id: "house", label: "House", icon: Home },
  { id: "apartment", label: "Apartment", icon: Building2 },
];

const NUMBER_OPTIONS = ["Any", 1, 2, 3, 4, 5] as const;

export const HotelFilters = ({
  filters,
  onFiltersChange,
  onClearAll,
  activeFiltersCount,
}: HotelFiltersProps) => {
  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const handlePlaceTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.placeTypes, typeId]
      : filters.placeTypes.filter((t) => t !== typeId);
    onFiltersChange({ ...filters, placeTypes: newTypes });
  };

  const handlePropertyTypeChange = (typeId: string) => {
    const newTypes = filters.propertyTypes.includes(typeId)
      ? filters.propertyTypes.filter((t) => t !== typeId)
      : [...filters.propertyTypes, typeId];
    onFiltersChange({ ...filters, propertyTypes: newTypes });
  };

  const handleNumberSelect = (
    field: "bedrooms" | "beds" | "bathrooms",
    value: "Any" | number
  ) => {
    onFiltersChange({
      ...filters,
      [field]: value === "Any" ? null : value,
    });
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-primary hover:text-primary/80"
          >
            Clear all filter ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div>
          <h4 className="font-medium mb-1">Price range</h4>
          <p className="text-xs text-muted-foreground">
            The average total price for 12 nights is ₹{((filters.priceRange[0] + filters.priceRange[1]) / 2).toLocaleString()}
          </p>
        </div>
        <Slider
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          min={0}
          max={50000}
          step={500}
          className="my-4"
        />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Minimum</Label>
            <Input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                handlePriceChange([Number(e.target.value), filters.priceRange[1]])
              }
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Maximum</Label>
            <Input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handlePriceChange([filters.priceRange[0], Number(e.target.value)])
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Type of Place */}
      <div className="space-y-3">
        <h4 className="font-medium">Type of place</h4>
        <div className="space-y-3">
          {PLACE_TYPES.map((type) => (
            <div key={type.id} className="flex items-start gap-3">
              <Checkbox
                id={type.id}
                checked={filters.placeTypes.includes(type.id)}
                onCheckedChange={(checked) =>
                  handlePlaceTypeChange(type.id, checked as boolean)
                }
              />
              <div className="grid gap-0.5 leading-none">
                <Label htmlFor={type.id} className="cursor-pointer">
                  {type.label}
                </Label>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms and Beds */}
      <div className="space-y-4">
        <h4 className="font-medium">Rooms and beds</h4>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Bedrooms</Label>
          <div className="flex gap-2">
            {NUMBER_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={
                  (option === "Any" && filters.bedrooms === null) ||
                  filters.bedrooms === option
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex-1"
                onClick={() => handleNumberSelect("bedrooms", option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Beds */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Beds</Label>
          <div className="flex gap-2">
            {NUMBER_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={
                  (option === "Any" && filters.beds === null) ||
                  filters.beds === option
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex-1"
                onClick={() => handleNumberSelect("beds", option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Bathrooms</Label>
          <div className="flex gap-2">
            {NUMBER_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={
                  (option === "Any" && filters.bathrooms === null) ||
                  filters.bathrooms === option
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex-1"
                onClick={() => handleNumberSelect("bathrooms", option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <h4 className="font-medium">Property type</h4>
        <div className="grid grid-cols-2 gap-3">
          {PROPERTY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = filters.propertyTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => handlePropertyTypeChange(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <Icon className="h-5 w-5 mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
