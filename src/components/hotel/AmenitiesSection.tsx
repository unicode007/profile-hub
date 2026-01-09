import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AMENITIES_DATA } from "./types";

interface AmenitiesSectionProps {
  selectedAmenities: {
    basicFacilities: string[];
    generalServices: string[];
    healthAndWellness: string[];
    transfers: string[];
    roomAmenities: string[];
    foodAndDrinks: string[];
    safetyAndSecurity: string[];
    entertainment: string[];
    commonArea: string[];
    businessCenter: string[];
    otherFacilities: string[];
  };
  onAmenityChange: (category: string, amenity: string, checked: boolean) => void;
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

export const AmenitiesSection = ({
  selectedAmenities,
  onAmenityChange,
}: AmenitiesSectionProps) => {
  return (
    <div className="space-y-6">
      {Object.entries(AMENITIES_DATA).map(([category, amenities]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold text-foreground border-b pb-2">
            {categoryLabels[category]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.name} className="flex items-start space-x-2">
                <Checkbox
                  id={`${category}-${amenity.name}`}
                  checked={selectedAmenities[category as keyof typeof selectedAmenities]?.includes(amenity.name)}
                  onCheckedChange={(checked) =>
                    onAmenityChange(category, amenity.name, checked as boolean)
                  }
                />
                <div className="grid gap-0.5 leading-none">
                  <Label
                    htmlFor={`${category}-${amenity.name}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {amenity.name}
                  </Label>
                  {amenity.note && (
                    <span className="text-xs text-muted-foreground">
                      ({amenity.note})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
