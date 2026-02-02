import { useState, useRef } from "react";
import { Hotel, Booking, RoomType } from "./types";
import { RoomCalendar } from "./RoomCalendar";
import { DateAvailabilityCalendar } from "./DateAvailabilityCalendar";
import { BookingCalendar } from "./BookingCalendar";
import { ShareCalendarModal } from "./ShareCalendarModal";
import { QuickBookingModal } from "./QuickBookingModal";
import { RoomTypeManager } from "./RoomTypeManager";
import { RoomTypeModal } from "./RoomTypeModal";
import { KanbanBoard } from "./KanbanBoard";
import { PhysicalRoomManager, PhysicalRoom } from "./PhysicalRoomManager";
import { RoomAssignmentModal } from "./RoomAssignmentModal";
import { HousekeepingManager } from "./HousekeepingManager";
import { BookingPopupList } from "./BookingPopupList";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarRange,
  Grid3X3,
  Share2,
  Download,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Maximize2,
  Bed,
  Kanban,
  DoorClosed,
  Key,
  Sparkles,
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface AvailabilityViewProps {
  hotels: Hotel[];
  bookings: Booking[];
  onBack: () => void;
  onViewBooking: (booking: Booking) => void;
  onMoveBooking: (bookingId: string, newCheckIn: Date, newCheckOut: Date) => void;
  onCreateBooking?: (booking: Partial<Booking>) => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking["status"]) => void;
}

// Generate demo physical rooms
const generateDemoPhysicalRooms = (hotels: Hotel[]): PhysicalRoom[] => {
  const rooms: PhysicalRoom[] = [];
  hotels.forEach((hotel) => {
    hotel.roomTypes.forEach((roomType, rtIndex) => {
      for (let i = 1; i <= 5; i++) {
        const floor = Math.floor((rtIndex * 5 + i - 1) / 5) + 1;
        const roomNum = `${floor}${String(rtIndex * 10 + i).padStart(2, "0")}`;
        rooms.push({
          id: `${hotel.id}-${roomType.id}-${i}`,
          roomNumber: roomNum,
          floor,
          roomTypeId: roomType.id,
          hotelId: hotel.id,
          hotelName: hotel.name,
          roomTypeName: roomType.name,
          status: i === 1 ? "occupied" : i === 2 ? "dirty" : "available",
          keyCardNumber: `KC-${roomNum}`,
          lastCleaned: new Date(),
        });
      }
    });
  });
  return rooms;
};

export const AvailabilityView = ({
  hotels,
  bookings,
  onBack,
  onViewBooking,
  onMoveBooking,
  onCreateBooking,
  onCheckIn,
  onCheckOut,
  onCancelBooking,
  onUpdateBookingStatus,
}: AvailabilityViewProps) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || "");
  const [calendarType, setCalendarType] = useState<"room" | "date" | "booking" | "rooms" | "kanban" | "physical" | "housekeeping">("room");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState<Date | undefined>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewDensity, setViewDensity] = useState<"compact" | "comfortable">("comfortable");
  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>(() => generateDemoPhysicalRooms(hotels));
  const [roomAssignmentModal, setRoomAssignmentModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    mode: "assign" | "checkout";
  }>({ isOpen: false, booking: null, mode: "assign" });
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [bookingPopup, setBookingPopup] = useState<{
    open: boolean;
    bookings: Booking[];
    title: string;
    subtitle?: string;
  }>({ open: false, bookings: [], title: "" });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  // Calculate stats
  const totalBookings = bookings.filter(b => b.status !== "cancelled").length;
  const todayCheckIns = bookings.filter(b => {
    const checkIn = new Date(b.checkIn);
    const today = new Date();
    return checkIn.toDateString() === today.toDateString() && b.status !== "cancelled";
  }).length;
  const todayCheckOuts = bookings.filter(b => {
    const checkOut = new Date(b.checkOut);
    const today = new Date();
    return checkOut.toDateString() === today.toDateString() && b.status !== "cancelled";
  }).length;

  const handleExport = (format: "csv" | "pdf" | "excel" | "print") => {
    const calendarData = {
      hotel: selectedHotel?.name || "All Hotels",
      month: currentMonth,
      bookings: bookings.filter(b => {
        if (selectedHotelId && b.hotelId !== selectedHotelId) return false;
        return b.status !== "cancelled";
      }),
    };

    switch (format) {
      case "csv":
        exportToCSV(calendarData);
        break;
      case "excel":
        exportToCSV(calendarData); // Simplified for demo
        break;
      case "pdf":
        toast.success("PDF export started...");
        break;
      case "print":
        window.print();
        break;
    }
  };

  const exportToCSV = (data: { hotel: string; bookings: Booking[] }) => {
    const headers = ["Booking ID", "Guest Name", "Room", "Check-in", "Check-out", "Status", "Amount"];
    const rows = data.bookings.map(b => [
      b.id,
      `${b.guestInfo.firstName} ${b.guestInfo.lastName}`,
      b.roomName,
      format(new Date(b.checkIn), "yyyy-MM-dd"),
      format(new Date(b.checkOut), "yyyy-MM-dd"),
      b.status,
      b.totalAmount?.toString() || "0",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendar-${data.hotel}-${format(currentMonth, "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  const handleQuickBooking = (date?: Date) => {
    setSelectedDateForBooking(date);
    setIsQuickBookingOpen(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    toast.success("Calendar refreshed!");
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-6 ${isFullscreen ? "bg-background p-6" : ""}`}
    >
      {/* Header with enhanced controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Availability & Calendars
            </h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-2 mr-4">
              <Badge variant="secondary" className="gap-1">
                <span className="text-muted-foreground">Today:</span>
                <span className="text-green-600">+{todayCheckIns} in</span>
                <span className="text-red-600">-{todayCheckOuts} out</span>
              </Badge>
            </div>

            {/* Quick Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => handleQuickBooking()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quick Booking</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("print")} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={() => setIsShareModalOpen(true)} className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Secondary Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {calendarType !== "booking" && (
              <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Month Navigation */}
            <div className="flex items-center gap-1 bg-background rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-32 text-center font-medium text-sm">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Density Toggle */}
            <div className="flex items-center gap-1 bg-background rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewDensity === "compact" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewDensity("compact")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compact View</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewDensity === "comfortable" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewDensity("comfortable")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comfortable View</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Type Tabs */}
      <Tabs value={calendarType} onValueChange={(v) => setCalendarType(v as typeof calendarType)}>
        <TabsList className="grid w-full max-w-5xl grid-cols-7">
          <TabsTrigger value="room" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Room Grid</span>
          </TabsTrigger>
          <TabsTrigger value="date" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Date View</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <CalendarRange className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="physical" className="gap-2">
            <DoorClosed className="h-4 w-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Bed className="h-4 w-4" />
            <span className="hidden sm:inline">Types</span>
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Housekeeping</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="room" className="mt-6">
          {selectedHotel && (
            <RoomCalendar
              hotel={selectedHotel}
              bookings={bookings}
              onViewBooking={onViewBooking}
              onMoveBooking={onMoveBooking}
              onQuickBook={(date, room) => {
                setSelectedDateForBooking(date);
                setIsQuickBookingOpen(true);
              }}
              viewDensity={viewDensity}
              onShowBookings={(bookings, title, subtitle) => {
                setBookingPopup({ open: true, bookings, title, subtitle });
              }}
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
            />
          )}
        </TabsContent>

        <TabsContent value="date" className="mt-6">
          {selectedHotel && (
            <DateAvailabilityCalendar
              hotel={selectedHotel}
              bookings={bookings}
              onSelectDate={(date) => handleQuickBooking(date)}
              onViewBooking={onViewBooking}
            />
          )}
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <BookingCalendar
            hotels={hotels}
            bookings={bookings}
            onViewBooking={onViewBooking}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard
            hotels={hotels}
            bookings={bookings}
            onViewBooking={onViewBooking}
            onCheckIn={(id) => {
              const booking = bookings.find((b) => b.id === id);
              if (booking) {
                setRoomAssignmentModal({ isOpen: true, booking, mode: "assign" });
              }
            }}
            onCheckOut={(id) => {
              const booking = bookings.find((b) => b.id === id);
              if (booking) {
                setRoomAssignmentModal({ isOpen: true, booking, mode: "checkout" });
              }
            }}
            onCancelBooking={onCancelBooking}
            onUpdateBookingStatus={onUpdateBookingStatus}
            onQuickBook={() => handleQuickBooking()}
            onAssignRoom={(booking) => {
              setRoomAssignmentModal({ isOpen: true, booking, mode: "assign" });
            }}
          />
        </TabsContent>

        <TabsContent value="physical" className="mt-6">
          {selectedHotel && (
            <PhysicalRoomManager
              hotel={selectedHotel}
              bookings={bookings}
              physicalRooms={physicalRooms.filter((r) => 
                selectedHotel.roomTypes.some((rt) => rt.id === r.roomTypeId)
              )}
              onUpdateRooms={(rooms) => {
                const otherRooms = physicalRooms.filter((r) => 
                  !selectedHotel.roomTypes.some((rt) => rt.id === r.roomTypeId)
                );
                setPhysicalRooms([...otherRooms, ...rooms]);
              }}
              onAssignRoom={(bookingId, roomNumber, keyCard) => {
                toast.success(`Room ${roomNumber} assigned with key ${keyCard}`);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          {selectedHotel && (
            <RoomTypeManager
              hotel={selectedHotel}
              bookings={bookings}
              onAddRoomType={() => setIsRoomTypeModalOpen(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="housekeeping" className="mt-6">
          <HousekeepingManager
            hotels={hotels}
            physicalRooms={physicalRooms}
            bookings={bookings}
            onUpdateRoomStatus={(roomId, status) => {
              setPhysicalRooms((prev) =>
                prev.map((r) =>
                  r.id === roomId ? { ...r, status } : r
                )
              );
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        <p className="font-medium mb-2">💡 Calendar Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Room Grid:</strong> View room-by-room availability, drag bookings to reschedule</li>
          <li><strong>Date View:</strong> See daily availability with color-coded status</li>
          <li><strong>Kanban:</strong> Drag bookings between status columns for quick updates</li>
          <li><strong>Rooms:</strong> Manage physical rooms, assign at check-in, track cleaning status</li>
          <li><strong>Types:</strong> Manage room inventory, block rooms, view occupancy stats</li>
        </ul>
      </div>

      {/* Share Modal */}
      <ShareCalendarModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        hotelName={selectedHotel?.name}
        calendarType={calendarType as "room" | "date" | "booking"}
        currentMonth={currentMonth}
        onExport={handleExport}
      />

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        hotels={hotels}
        selectedHotel={selectedHotel}
        selectedDate={selectedDateForBooking}
        onCreateBooking={(booking) => {
          onCreateBooking?.(booking);
          setIsQuickBookingOpen(false);
        }}
      />

      {/* Room Assignment Modal */}
      <RoomAssignmentModal
        isOpen={roomAssignmentModal.isOpen}
        onClose={() => setRoomAssignmentModal({ isOpen: false, booking: null, mode: "assign" })}
        booking={roomAssignmentModal.booking}
        hotel={selectedHotel || null}
        physicalRooms={physicalRooms}
        mode={roomAssignmentModal.mode}
        onAssignRoom={(bookingId, roomId, keyCard) => {
          // Update physical room status
          setPhysicalRooms((prev) =>
            prev.map((r) =>
              r.id === roomId
                ? { ...r, status: "occupied" as const, currentBookingId: bookingId, keyCardNumber: keyCard }
                : r
            )
          );
          onCheckIn?.(bookingId);
        }}
        onCheckIn={onCheckIn}
        onUpdateRoomStatus={(roomId, status) => {
          setPhysicalRooms((prev) =>
            prev.map((r) =>
              r.id === roomId
                ? { ...r, status, currentBookingId: undefined }
                : r
            )
          );
          if (roomAssignmentModal.booking) {
            onCheckOut?.(roomAssignmentModal.booking.id);
          }
        }}
      />

      {/* Room Type Modal */}
      <RoomTypeModal
        open={isRoomTypeModalOpen}
        onOpenChange={setIsRoomTypeModalOpen}
        hotels={hotels}
        onSave={(roomType, hotelIds) => {
          toast.success(`Room type "${roomType.name}" saved to ${hotelIds.length} hotel(s)`);
        }}
      />

      {/* Booking Popup List */}
      <BookingPopupList
        open={bookingPopup.open}
        onOpenChange={(open) => setBookingPopup((prev) => ({ ...prev, open }))}
        bookings={bookingPopup.bookings}
        title={bookingPopup.title}
        subtitle={bookingPopup.subtitle}
        onViewBooking={(booking) => {
          onViewBooking(booking);
          setBookingPopup((prev) => ({ ...prev, open: false }));
        }}
        onCheckIn={onCheckIn}
        onCheckOut={onCheckOut}
      />
    </div>
  );
};
