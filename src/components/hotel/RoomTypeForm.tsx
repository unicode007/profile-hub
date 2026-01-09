import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { RoomType, RoomPlan, ROOM_AMENITIES_OPTIONS } from "./types";

interface RoomTypeFormProps {
  roomTypes: RoomType[];
  onRoomTypesChange: (roomTypes: RoomType[]) => void;
}

const defaultPlan: Omit<RoomPlan, "id"> = {
  name: "Room With Free Cancellation",
  features: ["Free stay for the kid", "Existing bed(s) can accommodate all the guests"],
  originalPrice: 3500,
  discountedPrice: 1759,
  taxesAndFees: 239,
  freeCancellation: true,
};

export const RoomTypeForm = ({ roomTypes, onRoomTypesChange }: RoomTypeFormProps) => {
  const addRoomType = () => {
    const newRoom: RoomType = {
      id: Date.now().toString(),
      name: "",
      size: "250 sq.ft (23 sq.mt)",
      view: "City View",
      bedType: "Queen Bed",
      bedCount: 1,
      bathrooms: 1,
      amenities: [],
      plans: [],
    };
    onRoomTypesChange([...roomTypes, newRoom]);
  };

  const removeRoomType = (roomId: string) => {
    onRoomTypesChange(roomTypes.filter((r) => r.id !== roomId));
  };

  const updateRoomType = (roomId: string, updates: Partial<RoomType>) => {
    onRoomTypesChange(
      roomTypes.map((r) => (r.id === roomId ? { ...r, ...updates } : r))
    );
  };

  const addPlan = (roomId: string) => {
    const room = roomTypes.find((r) => r.id === roomId);
    if (!room) return;

    const newPlan: RoomPlan = {
      id: Date.now().toString(),
      ...defaultPlan,
    };

    updateRoomType(roomId, { plans: [...room.plans, newPlan] });
  };

  const removePlan = (roomId: string, planId: string) => {
    const room = roomTypes.find((r) => r.id === roomId);
    if (!room) return;
    updateRoomType(roomId, { plans: room.plans.filter((p) => p.id !== planId) });
  };

  const updatePlan = (roomId: string, planId: string, updates: Partial<RoomPlan>) => {
    const room = roomTypes.find((r) => r.id === roomId);
    if (!room) return;
    updateRoomType(roomId, {
      plans: room.plans.map((p) => (p.id === planId ? { ...p, ...updates } : p)),
    });
  };

  const toggleRoomAmenity = (roomId: string, amenity: string) => {
    const room = roomTypes.find((r) => r.id === roomId);
    if (!room) return;
    const newAmenities = room.amenities.includes(amenity)
      ? room.amenities.filter((a) => a !== amenity)
      : [...room.amenities, amenity];
    updateRoomType(roomId, { amenities: newAmenities });
  };

  return (
    <div className="space-y-6">
      {roomTypes.map((room, index) => (
        <Card key={room.id} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
            onClick={() => removeRoomType(room.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CardHeader>
            <CardTitle className="text-lg">Room Type {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Room Name</Label>
                <Input
                  placeholder="e.g., Deluxe Room - Queen Bed (AC)"
                  value={room.name}
                  onChange={(e) => updateRoomType(room.id, { name: e.target.value })}
                />
              </div>
              <div>
                <Label>Room Size</Label>
                <Input
                  placeholder="e.g., 250 sq.ft (23 sq.mt)"
                  value={room.size}
                  onChange={(e) => updateRoomType(room.id, { size: e.target.value })}
                />
              </div>
              <div>
                <Label>View</Label>
                <Select
                  value={room.view}
                  onValueChange={(value) => updateRoomType(room.id, { view: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="City View">City View</SelectItem>
                    <SelectItem value="Garden View">Garden View</SelectItem>
                    <SelectItem value="Pool View">Pool View</SelectItem>
                    <SelectItem value="Mountain View">Mountain View</SelectItem>
                    <SelectItem value="Sea View">Sea View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bed Type</Label>
                <Select
                  value={room.bedType}
                  onValueChange={(value) => updateRoomType(room.id, { bedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Bed">Single Bed</SelectItem>
                    <SelectItem value="Queen Bed">Queen Bed</SelectItem>
                    <SelectItem value="King Bed">King Bed</SelectItem>
                    <SelectItem value="Double Bed">Double Bed</SelectItem>
                    <SelectItem value="Twin Beds">Twin Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Beds</Label>
                <Input
                  type="number"
                  min={1}
                  value={room.bedCount}
                  onChange={(e) => updateRoomType(room.id, { bedCount: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  min={1}
                  value={room.bathrooms}
                  onChange={(e) => updateRoomType(room.id, { bathrooms: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            {/* Room Amenities */}
            <div>
              <Label className="mb-2 block">Room Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {ROOM_AMENITIES_OPTIONS.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${room.id}-${amenity}`}
                      checked={room.amenities.includes(amenity)}
                      onCheckedChange={() => toggleRoomAmenity(room.id, amenity)}
                    />
                    <Label htmlFor={`${room.id}-${amenity}`} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Pricing Plans</Label>
                <Button variant="outline" size="sm" onClick={() => addPlan(room.id)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Plan
                </Button>
              </div>

              {room.plans.map((plan, planIndex) => (
                <Card key={plan.id} className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Plan {planIndex + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removePlan(room.id, plan.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label>Plan Name</Label>
                        <Select
                          value={plan.name}
                          onValueChange={(value) => updatePlan(room.id, plan.id, { name: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Room With Free Cancellation">Room With Free Cancellation</SelectItem>
                            <SelectItem value="Room with Breakfast">Room with Breakfast</SelectItem>
                            <SelectItem value="Room With Free Cancellation | Breakfast only">Breakfast Only</SelectItem>
                            <SelectItem value="Room With Free Cancellation | Breakfast + Lunch/Dinner">Breakfast + Lunch/Dinner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={plan.originalPrice}
                          onChange={(e) =>
                            updatePlan(room.id, plan.id, { originalPrice: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input
                          type="number"
                          value={plan.discountedPrice}
                          onChange={(e) =>
                            updatePlan(room.id, plan.id, { discountedPrice: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label>Taxes & Fees (₹)</Label>
                        <Input
                          type="number"
                          value={plan.taxesAndFees}
                          onChange={(e) =>
                            updatePlan(room.id, plan.id, { taxesAndFees: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`${plan.id}-cancellation`}
                          checked={plan.freeCancellation}
                          onCheckedChange={(checked) =>
                            updatePlan(room.id, plan.id, { freeCancellation: checked as boolean })
                          }
                        />
                        <Label htmlFor={`${plan.id}-cancellation`} className="cursor-pointer">
                          Free Cancellation
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addRoomType} className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" /> Add Room Type
      </Button>
    </div>
  );
};
