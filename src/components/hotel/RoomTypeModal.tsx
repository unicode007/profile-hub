import { useState } from "react";
import { RoomType, RoomPlan, ROOM_AMENITIES_OPTIONS, Hotel } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bed,
  Plus,
  Trash2,
  DollarSign,
  Eye,
  Bath,
  Ruler,
  Settings,
  Hotel as HotelIcon,
  Check,
} from "lucide-react";

interface RoomTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotels: Hotel[];
  roomType?: RoomType | null;
  onSave: (roomType: RoomType, linkedHotelIds: string[]) => void;
}

const BED_TYPES = ["Single Bed", "Double Bed", "Queen Bed", "King Bed", "Twin Beds", "Bunk Beds"];
const VIEW_TYPES = ["City View", "Pool View", "Garden View", "Ocean View", "Mountain View", "Standard", "Lake View", "River View"];

export const RoomTypeModal = ({
  open,
  onOpenChange,
  hotels,
  roomType,
  onSave,
}: RoomTypeModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "plans" | "amenities" | "hotels">("details");
  const [linkedHotelIds, setLinkedHotelIds] = useState<string[]>(() => {
    if (roomType) {
      return hotels
        .filter((h) => h.roomTypes.some((rt) => rt.id === roomType.id))
        .map((h) => h.id);
    }
    return [];
  });

  const [formData, setFormData] = useState<{
    name: string;
    size: string;
    view: string;
    bedType: string;
    bedCount: number;
    bathrooms: number;
    amenities: string[];
    plans: RoomPlan[];
  }>({
    name: roomType?.name || "",
    size: roomType?.size || "",
    view: roomType?.view || "City View",
    bedType: roomType?.bedType || "Queen Bed",
    bedCount: roomType?.bedCount || 1,
    bathrooms: roomType?.bathrooms || 1,
    amenities: roomType?.amenities || [],
    plans: roomType?.plans || [
      {
        id: `plan-${Date.now()}`,
        name: "Standard Rate",
        features: [],
        originalPrice: 3000,
        discountedPrice: 2500,
        taxesAndFees: 300,
        freeCancellation: true,
      },
    ],
  });

  const [newPlanFeature, setNewPlanFeature] = useState("");

  const handleSave = () => {
    if (!formData.name || !formData.size) {
      toast.error("Please fill in required fields");
      return;
    }

    if (linkedHotelIds.length === 0) {
      toast.error("Please select at least one hotel");
      return;
    }

    const savedRoomType: RoomType = {
      id: roomType?.id || `rt-${Date.now()}`,
      name: formData.name,
      size: formData.size,
      view: formData.view,
      bedType: formData.bedType,
      bedCount: formData.bedCount,
      bathrooms: formData.bathrooms,
      amenities: formData.amenities,
      plans: formData.plans,
      images: roomType?.images || [],
    };

    onSave(savedRoomType, linkedHotelIds);
    toast.success(roomType ? "Room type updated!" : "Room type created!");
    onOpenChange(false);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleHotel = (hotelId: string) => {
    setLinkedHotelIds((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  };

  const addPlan = () => {
    setFormData((prev) => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          id: `plan-${Date.now()}`,
          name: `Plan ${prev.plans.length + 1}`,
          features: [],
          originalPrice: 3000,
          discountedPrice: 2500,
          taxesAndFees: 300,
          freeCancellation: true,
        },
      ],
    }));
  };

  const updatePlan = (index: number, updates: Partial<RoomPlan>) => {
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.map((p, i) => (i === index ? { ...p, ...updates } : p)),
    }));
  };

  const removePlan = (index: number) => {
    if (formData.plans.length <= 1) {
      toast.error("At least one plan is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  const addFeatureToPlan = (planIndex: number, feature: string) => {
    if (!feature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.map((p, i) =>
        i === planIndex ? { ...p, features: [...p.features, feature.trim()] } : p
      ),
    }));
    setNewPlanFeature("");
  };

  const removeFeatureFromPlan = (planIndex: number, featureIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.map((p, i) =>
        i === planIndex ? { ...p, features: p.features.filter((_, fi) => fi !== featureIndex) } : p
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-primary" />
            {roomType ? "Edit Room Type" : "Create Room Type"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="hotels">Link Hotels</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 max-h-[50vh] mt-4">
            <TabsContent value="details" className="space-y-4 pr-4">
              <div>
                <Label>Room Type Name *</Label>
                <Input
                  placeholder="e.g., Deluxe Room - Queen Bed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size *</Label>
                  <Input
                    placeholder="e.g., 250 sq.ft (23 sq.mt)"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
                <div>
                  <Label>View</Label>
                  <Select
                    value={formData.view}
                    onValueChange={(v) => setFormData({ ...formData, view: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIEW_TYPES.map((view) => (
                        <SelectItem key={view} value={view}>
                          {view}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Bed Type</Label>
                  <Select
                    value={formData.bedType}
                    onValueChange={(v) => setFormData({ ...formData, bedType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BED_TYPES.map((bed) => (
                        <SelectItem key={bed} value={bed}>
                          {bed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bed Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.bedCount}
                    onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-4 pr-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Rate Plans</Label>
                <Button size="sm" variant="outline" onClick={addPlan} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Plan
                </Button>
              </div>

              {formData.plans.map((plan, planIndex) => (
                <Card key={plan.id}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={plan.name}
                        onChange={(e) => updatePlan(planIndex, { name: e.target.value })}
                        className="font-semibold max-w-xs"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removePlan(planIndex)}
                        className="text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={plan.originalPrice}
                          onChange={(e) =>
                            updatePlan(planIndex, { originalPrice: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Discounted Price (₹)</Label>
                        <Input
                          type="number"
                          value={plan.discountedPrice}
                          onChange={(e) =>
                            updatePlan(planIndex, { discountedPrice: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Taxes & Fees (₹)</Label>
                        <Input
                          type="number"
                          value={plan.taxesAndFees}
                          onChange={(e) =>
                            updatePlan(planIndex, { taxesAndFees: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Free Cancellation</Label>
                      <Switch
                        checked={plan.freeCancellation}
                        onCheckedChange={(checked) =>
                          updatePlan(planIndex, { freeCancellation: checked })
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Features</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {plan.features.map((feature, fi) => (
                          <Badge key={fi} variant="secondary" className="gap-1">
                            {feature}
                            <button
                              onClick={() => removeFeatureFromPlan(planIndex, fi)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add feature..."
                          value={newPlanFeature}
                          onChange={(e) => setNewPlanFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFeatureToPlan(planIndex, newPlanFeature);
                            }
                          }}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addFeatureToPlan(planIndex, newPlanFeature)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4 pr-4">
              <Label className="text-base">Select Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ROOM_AMENITIES_OPTIONS.map((amenity) => (
                  <Button
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAmenity(amenity)}
                    className="justify-start h-auto py-2 px-3"
                  >
                    {formData.amenities.includes(amenity) && (
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="text-left text-sm">{amenity}</span>
                  </Button>
                ))}
              </div>

              {formData.amenities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">Selected ({formData.amenities.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4 pr-4">
              <Label className="text-base">Link to Hotels *</Label>
              <p className="text-sm text-muted-foreground">
                Select which hotels this room type should be available in.
              </p>

              <div className="grid gap-2">
                {hotels.map((hotel) => (
                  <Card
                    key={hotel.id}
                    className={`cursor-pointer transition-all ${
                      linkedHotelIds.includes(hotel.id) ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => toggleHotel(hotel.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            linkedHotelIds.includes(hotel.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <HotelIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {hotel.location.city}, {hotel.location.state}
                          </div>
                        </div>
                      </div>
                      {linkedHotelIds.includes(hotel.id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {linkedHotelIds.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Linked to {linkedHotelIds.length} hotel(s)
                  </Label>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {roomType ? "Update Room Type" : "Create Room Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
