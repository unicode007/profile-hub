import { useState } from "react";
import { Hotel, RoomType, RoomPlan } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Users,
  Bed,
  MapPin,
  Check,
  CreditCard,
  Building2,
  Shield,
  Clock,
  Phone,
  Mail,
  User,
  AlertCircle,
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface BookingCheckoutProps {
  hotel: Hotel;
  room: RoomType;
  plan: RoomPlan;
  onBack: () => void;
  onConfirm: (bookingDetails: BookingDetails) => void;
}

export interface BookingDetails {
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
  };
  rooms: number;
  specialRequests: string;
  paymentMethod: string;
  termsAccepted: boolean;
}

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "UAE",
];

export const BookingCheckout = ({
  hotel,
  room,
  plan,
  onBack,
  onConfirm,
}: BookingCheckoutProps) => {
  const [checkIn] = useState(addDays(new Date(), 1));
  const [checkOut] = useState(addDays(new Date(), 2));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const nights = differenceInDays(checkOut, checkIn);
  const roomTotal = plan.discountedPrice * nights * rooms;
  const taxesTotal = plan.taxesAndFees * nights * rooms;
  const grandTotal = roomTotal + taxesTotal;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!guestInfo.firstName.trim()) newErrors.firstName = "First name is required";
    if (!guestInfo.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!guestInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) newErrors.email = "Invalid email format";
    if (!guestInfo.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(guestInfo.phone.replace(/\D/g, ''))) newErrors.phone = "Invalid phone number";
    if (!termsAccepted) newErrors.terms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
        guestInfo,
        checkIn,
        checkOut,
        guests: { adults, children },
        rooms,
        specialRequests,
        paymentMethod,
        termsAccepted,
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Room Selection
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{hotel.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{hotel.location.city}, {hotel.location.state}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{hotel.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <p className="font-medium">{format(checkIn, "EEE, dd MMM yyyy")}</p>
                      <p className="text-xs text-muted-foreground">From 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-medium">{format(checkOut, "EEE, dd MMM yyyy")}</p>
                      <p className="text-xs text-muted-foreground">Until 11:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Guests</p>
                      <p className="font-medium">{adults} Adults, {children} Children</p>
                      <p className="text-xs text-muted-foreground">{rooms} Room, {nights} Night</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Room & Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3 bg-muted rounded-lg h-32 flex items-center justify-center">
                    <Bed className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {room.size} • {room.view} • {room.bedCount} {room.bedType}
                    </p>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-medium text-primary mb-2">{plan.name}</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                        {plan.freeCancellation && (
                          <li className="text-sm flex items-center gap-2 text-green-600">
                            <Check className="h-3 w-3" />
                            Free Cancellation till check-in
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Room & Guest Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Rooms</Label>
                    <Select value={rooms.toString()} onValueChange={(v) => setRooms(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>{n} Room{n > 1 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Adults</Label>
                    <Select value={adults.toString()} onValueChange={(v) => setAdults(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <SelectItem key={n} value={n.toString()}>{n} Adult{n > 1 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Children</Label>
                    <Select value={children.toString()} onValueChange={(v) => setChildren(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((n) => (
                          <SelectItem key={n} value={n.toString()}>{n} Child{n !== 1 ? "ren" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Guest Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Please enter details as per your government-issued ID
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Country/Region</Label>
                  <Select value={guestInfo.country} onValueChange={(v) => setGuestInfo({ ...guestInfo, country: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any special requests like early check-in, room preference, dietary requirements..."
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Special requests are subject to availability and may incur additional charges
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                          <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">UPI Payment</p>
                          <p className="text-sm text-muted-foreground">Pay using Google Pay, PhonePe, Paytm</p>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center text-white text-[8px] font-bold">UPI</div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex-1 cursor-pointer">
                      <p className="font-medium">Net Banking</p>
                      <p className="text-sm text-muted-foreground">Pay directly from your bank account</p>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'payathotel' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                    <RadioGroupItem value="payathotel" id="payathotel" />
                    <Label htmlFor="payathotel" className="flex-1 cursor-pointer">
                      <p className="font-medium">Pay at Hotel</p>
                      <p className="text-sm text-muted-foreground">Pay when you arrive at the hotel</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {rooms} Room × {nights} Night{nights > 1 ? "s" : ""}
                      </span>
                      <span>₹{plan.discountedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Room Total</span>
                      <span>₹{roomTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span>₹{taxesTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      You save ₹{((plan.originalPrice - plan.discountedPrice) * nights * rooms).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <span className="text-primary hover:underline">Terms & Conditions</span>,{" "}
                      <span className="text-primary hover:underline">Privacy Policy</span>, and{" "}
                      <span className="text-primary hover:underline">Cancellation Policy</span>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.terms}
                    </p>
                  )}

                  <Button
                    className="w-full h-12 text-base bg-teal-600 hover:bg-teal-700"
                    onClick={handleConfirm}
                  >
                    Confirm Booking
                  </Button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure payment - 256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Instant confirmation</span>
                    </div>
                    {plan.freeCancellation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Free cancellation available</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium mb-2">Need Help?</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Our support team is available 24/7
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+91 1800-123-4567</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};