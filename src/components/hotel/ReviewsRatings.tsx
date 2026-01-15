import { useState } from "react";
import { Hotel, Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Camera,
  Flag,
  ChevronDown,
  Filter,
  Award,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Review {
  id: string;
  hotelId: string;
  bookingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string;
  cons?: string;
  stayDate: Date;
  roomType: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: Date;
  response?: {
    content: string;
    createdAt: Date;
  };
  categories: {
    cleanliness: number;
    service: number;
    location: number;
    value: number;
    amenities: number;
  };
}

// Demo reviews
export const DEMO_REVIEWS: Review[] = [
  {
    id: "rev-1",
    hotelId: "demo-1",
    bookingId: "BK001DEMO",
    userId: "user-1",
    userName: "Rajesh Kumar",
    rating: 5,
    title: "Exceptional stay with outstanding service!",
    content: "This was truly one of the best hotel experiences I've ever had. The staff went above and beyond to make our stay memorable. The room was spacious, clean, and had all the amenities we needed. The breakfast buffet was exceptional with a wide variety of options.",
    pros: "Excellent service, spacious rooms, great breakfast, perfect location",
    cons: "Parking could be more accessible",
    stayDate: new Date("2024-12-15"),
    roomType: "Deluxe Room - Queen Bed",
    helpful: 24,
    verified: true,
    createdAt: new Date("2024-12-20"),
    categories: {
      cleanliness: 5,
      service: 5,
      location: 5,
      value: 4,
      amenities: 5,
    },
    response: {
      content: "Thank you so much for your wonderful review, Mr. Kumar! We're thrilled to hear you had such an exceptional experience with us. We look forward to welcoming you back soon!",
      createdAt: new Date("2024-12-21"),
    },
  },
  {
    id: "rev-2",
    hotelId: "demo-1",
    bookingId: "BK002DEMO",
    userId: "user-2",
    userName: "Priya Sharma",
    rating: 4,
    title: "Great location and comfortable stay",
    content: "The hotel is perfectly located in the heart of the city. Our room was clean and comfortable. The staff was friendly and helpful. Only minor issue was the noise from the street at night, but overall a very pleasant stay.",
    pros: "Central location, friendly staff, clean rooms",
    cons: "Street noise at night, slow elevator",
    stayDate: new Date("2024-11-20"),
    roomType: "Executive Suite",
    helpful: 18,
    verified: true,
    createdAt: new Date("2024-11-25"),
    categories: {
      cleanliness: 4,
      service: 5,
      location: 5,
      value: 4,
      amenities: 4,
    },
  },
  {
    id: "rev-3",
    hotelId: "demo-1",
    bookingId: "BK003DEMO",
    userId: "user-3",
    userName: "Amit Patel",
    rating: 5,
    title: "Perfect for business travel",
    content: "As a frequent business traveler, I appreciate hotels that understand our needs. This hotel delivered perfectly - fast WiFi, quiet rooms, excellent meeting facilities, and a fantastic gym. Will definitely return!",
    pros: "Fast WiFi, business center, gym, quiet rooms",
    cons: "Restaurant closes early",
    stayDate: new Date("2024-10-10"),
    roomType: "Deluxe Room - Queen Bed",
    helpful: 32,
    verified: true,
    createdAt: new Date("2024-10-15"),
    categories: {
      cleanliness: 5,
      service: 5,
      location: 4,
      value: 5,
      amenities: 5,
    },
  },
  {
    id: "rev-4",
    hotelId: "demo-2",
    bookingId: "BK004DEMO",
    userId: "user-4",
    userName: "Sunita Reddy",
    rating: 5,
    title: "Dream beach vacation!",
    content: "The beach resort exceeded all expectations. Waking up to ocean views every morning was magical. The private beach access, excellent seafood restaurant, and spa services made this a perfect getaway.",
    pros: "Stunning views, private beach, great food, relaxing spa",
    cons: "None - perfect stay!",
    stayDate: new Date("2024-12-01"),
    roomType: "Ocean View Cottage",
    helpful: 45,
    verified: true,
    createdAt: new Date("2024-12-05"),
    categories: {
      cleanliness: 5,
      service: 5,
      location: 5,
      value: 5,
      amenities: 5,
    },
  },
  {
    id: "rev-5",
    hotelId: "demo-1",
    bookingId: "BK005DEMO",
    userId: "user-5",
    userName: "John Smith",
    userAvatar: "",
    rating: 3,
    title: "Good but could be better",
    content: "The hotel was decent for the price. Room was clean but smaller than expected. Service was a bit slow during peak hours. Location is convenient though.",
    pros: "Good location, clean",
    cons: "Small rooms, slow service during peak hours",
    stayDate: new Date("2024-09-15"),
    roomType: "Deluxe Room - Queen Bed",
    helpful: 8,
    verified: true,
    createdAt: new Date("2024-09-20"),
    categories: {
      cleanliness: 4,
      service: 3,
      location: 5,
      value: 3,
      amenities: 3,
    },
  },
];

interface ReviewsRatingsProps {
  hotel: Hotel;
  reviews: Review[];
  onAddReview: (review: Omit<Review, "id" | "createdAt" | "helpful">) => void;
  userBookings?: Booking[];
  currentUserId?: string;
}

export const ReviewsRatings = ({
  hotel,
  reviews,
  onAddReview,
  userBookings = [],
  currentUserId,
}: ReviewsRatingsProps) => {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "helpful">("newest");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
    pros: "",
    cons: "",
    categories: {
      cleanliness: 5,
      service: 5,
      location: 5,
      value: 5,
      amenities: 5,
    },
  });
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const hotelReviews = reviews.filter((r) => r.hotelId === hotel.id);

  // Calculate aggregate ratings
  const avgRating = hotelReviews.length > 0
    ? (hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length).toFixed(1)
    : "0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: hotelReviews.filter((r) => Math.floor(r.rating) === rating).length,
    percentage: hotelReviews.length > 0
      ? (hotelReviews.filter((r) => Math.floor(r.rating) === rating).length / hotelReviews.length) * 100
      : 0,
  }));

  const categoryAverages = hotelReviews.length > 0
    ? {
        cleanliness: hotelReviews.reduce((sum, r) => sum + r.categories.cleanliness, 0) / hotelReviews.length,
        service: hotelReviews.reduce((sum, r) => sum + r.categories.service, 0) / hotelReviews.length,
        location: hotelReviews.reduce((sum, r) => sum + r.categories.location, 0) / hotelReviews.length,
        value: hotelReviews.reduce((sum, r) => sum + r.categories.value, 0) / hotelReviews.length,
        amenities: hotelReviews.reduce((sum, r) => sum + r.categories.amenities, 0) / hotelReviews.length,
      }
    : { cleanliness: 0, service: 0, location: 0, value: 0, amenities: 0 };

  // Filter and sort reviews
  const filteredReviews = hotelReviews
    .filter((r) => filterRating === "all" || Math.floor(r.rating) === parseInt(filterRating))
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  // Check if user can write a review (has completed booking)
  const eligibleBookings = userBookings.filter(
    (b) =>
      b.hotelId === hotel.id &&
      (b.status === "completed" || b.status === "checked-out") &&
      !hotelReviews.some((r) => r.bookingId === b.id)
  );

  const handleSubmitReview = () => {
    if (!selectedBooking || !newReview.title || !newReview.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const booking = eligibleBookings.find((b) => b.id === selectedBooking);
    if (!booking) return;

    onAddReview({
      hotelId: hotel.id,
      bookingId: selectedBooking,
      userId: currentUserId || "user-1",
      userName: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      pros: newReview.pros,
      cons: newReview.cons,
      stayDate: booking.checkIn,
      roomType: booking.roomName,
      verified: true,
      categories: newReview.categories,
    });

    setIsWriteReviewOpen(false);
    setNewReview({
      rating: 5,
      title: "",
      content: "",
      pros: "",
      cons: "",
      categories: { cleanliness: 5, service: 5, location: 5, value: 5, amenities: 5 },
    });
    setSelectedBooking("");
    toast.success("Review submitted successfully!");
  };

  const handleMarkHelpful = (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) {
      toast.info("You've already marked this review as helpful");
      return;
    }
    setHelpfulReviews((prev) => new Set([...prev, reviewId]));
    toast.success("Marked as helpful");
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onChange?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Guest Reviews
            </CardTitle>
            {eligibleBookings.length > 0 && (
              <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Write Your Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Select Booking</Label>
                      <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a completed booking" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibleBookings.map((booking) => (
                            <SelectItem key={booking.id} value={booking.id}>
                              {booking.roomName} - {format(new Date(booking.checkIn), "MMM d, yyyy")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Overall Rating</Label>
                      <div className="mt-2">
                        {renderStars(newReview.rating, true, (rating) =>
                          setNewReview((prev) => ({ ...prev, rating }))
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {(["cleanliness", "service", "location", "value", "amenities"] as const).map((cat) => (
                        <div key={cat}>
                          <Label className="text-sm capitalize">{cat}</Label>
                          <div className="mt-1">
                            {renderStars(newReview.categories[cat], true, (rating) =>
                              setNewReview((prev) => ({
                                ...prev,
                                categories: { ...prev.categories, [cat]: rating },
                              }))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Review Title *</Label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Summarize your experience"
                      />
                    </div>

                    <div>
                      <Label>Your Review *</Label>
                      <Textarea
                        value={newReview.content}
                        onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                        className="mt-1"
                        placeholder="Share your experience..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>What you liked</Label>
                        <Textarea
                          value={newReview.pros}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, pros: e.target.value }))}
                          className="mt-1"
                          placeholder="Pros..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>What could improve</Label>
                        <Textarea
                          value={newReview.cons}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, cons: e.target.value }))}
                          className="mt-1"
                          placeholder="Cons..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{avgRating}</div>
              <div className="mt-2">{renderStars(parseFloat(avgRating))}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Based on {hotelReviews.length} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating} ★</span>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            {/* Category Ratings */}
            <div className="space-y-2">
              {Object.entries(categoryAverages).map(([category, avg]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={avg * 20} className="h-2 w-20" />
                    <span className="w-8 text-right">{avg.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          Showing {filteredReviews.length} reviews
        </span>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>
                      {review.userName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Verified Stay
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Stayed in {review.roomType} • {format(new Date(review.stayDate), "MMMM yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">{review.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{review.content}</p>
                    </div>

                    {(review.pros || review.cons) && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {review.pros && (
                          <div className="text-green-600">
                            <span className="font-medium">👍 Liked:</span> {review.pros}
                          </div>
                        )}
                        {review.cons && (
                          <div className="text-red-500">
                            <span className="font-medium">👎 Could improve:</span> {review.cons}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Category scores */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {Object.entries(review.categories).map(([cat, score]) => (
                        <span key={cat} className="text-muted-foreground capitalize">
                          {cat}: {score}/5
                        </span>
                      ))}
                    </div>

                    {/* Hotel Response */}
                    {review.response && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Badge>Hotel Response</Badge>
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(review.response.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-2">{review.response.content}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => handleMarkHelpful(review.id)}
                      >
                        <ThumbsUp className={`h-4 w-4 mr-1 ${helpfulReviews.has(review.id) ? "fill-current" : ""}`} />
                        Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
