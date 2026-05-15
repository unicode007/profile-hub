import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { demoHotels, demoBookings, demoPhysicalRooms } from "@/components/layout/demoStore";
import { DEMO_REVIEWS } from "@/components/hotel/ReviewsRatings";
import { useState } from "react";

import { HotelDashboard } from "@/components/hotel/HotelDashboard";
import { BookingCalendar } from "@/components/hotel/BookingCalendar";
import { RoomCalendar } from "@/components/hotel/RoomCalendar";
import { PhysicalRoomCalendar } from "@/components/hotel/PhysicalRoomCalendar";
import { DateAvailabilityCalendar } from "@/components/hotel/DateAvailabilityCalendar";
import { KanbanBoard } from "@/components/hotel/KanbanBoard";
import { OverbookingManager } from "@/components/hotel/OverbookingManager";
import { RoomTypeManager } from "@/components/hotel/RoomTypeManager";
import { PhysicalRoomManager } from "@/components/hotel/PhysicalRoomManager";
import { RoomInventoryMaster } from "@/components/hotel/RoomInventoryMaster";
import { HousekeepingManager } from "@/components/hotel/HousekeepingManager";
import { MaintenanceManager } from "@/components/hotel/MaintenanceManager";
import { MinibarManager } from "@/components/hotel/MinibarManager";
import { LaundryManagement } from "@/components/hotel/LaundryManagement";
import { LostAndFound } from "@/components/hotel/LostAndFound";
import { InventoryProcurement } from "@/components/hotel/InventoryProcurement";
import { RestaurantPOS } from "@/components/hotel/RestaurantPOS";
import { KitchenDisplayScreen } from "@/components/hotel/KitchenDisplayScreen";
import { GuestCommunication } from "@/components/hotel/GuestCommunication";
import { ReviewsRatings } from "@/components/hotel/ReviewsRatings";
import { StaffManager } from "@/components/hotel/StaffManager";
import { StaffLoginPortal } from "@/components/hotel/StaffLoginPortal";
import { NightAuditReports } from "@/components/hotel/NightAuditReports";
import { RevenueAnalytics } from "@/components/hotel/RevenueAnalytics";
import { HotelOnboarding } from "@/components/hotel/HotelOnboarding";

const noop = () => {};
const noopBooking = (b: any) => console.log("view booking", b?.id);

function PageShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Showcase() {
  const { module } = useParams<{ module: string }>();
  const [staffUser, setStaffUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const hotel = demoHotels[0];

  switch (module) {
    case "dashboard":
      return (
        <PageShell title="Front Desk Dashboard" description="Today's check-ins, check-outs, and active stays.">
          <HotelDashboard bookings={demoBookings} onCheckIn={noop} onCheckOut={noop} onViewBooking={noopBooking} />
        </PageShell>
      );
    case "analytics":
      return (
        <PageShell title="Revenue Analytics" description="KPIs: Revenue, Occupancy, ADR, RevPAR.">
          <RevenueAnalytics hotels={demoHotels} bookings={demoBookings} />
        </PageShell>
      );
    case "calendar":
      return (
        <PageShell title="Booking Calendar">
          <BookingCalendar hotels={demoHotels} bookings={demoBookings} onViewBooking={noopBooking} />
        </PageShell>
      );
    case "room-calendar":
      return (
        <PageShell title="Room Type Calendar">
          <RoomCalendar hotel={hotel} bookings={demoBookings} onViewBooking={noopBooking} />
        </PageShell>
      );
    case "physical-calendar":
      return (
        <PageShell title="Physical Room Calendar">
          <PhysicalRoomCalendar hotel={hotel} bookings={demoBookings} physicalRooms={demoPhysicalRooms.filter(r => r.hotelId === hotel.id)} onViewBooking={noopBooking} />
        </PageShell>
      );
    case "availability":
      return (
        <PageShell title="Date Availability">
          <DateAvailabilityCalendar hotel={hotel} bookings={demoBookings} />
        </PageShell>
      );
    case "kanban":
      return (
        <PageShell title="Booking Kanban">
          <KanbanBoard hotels={demoHotels} bookings={demoBookings} onViewBooking={noopBooking} onCheckIn={noop} onCheckOut={noop} />
        </PageShell>
      );
    case "overbooking":
      return (
        <PageShell title="Overbooking Manager">
          <OverbookingManager hotels={demoHotels} bookings={demoBookings} />
        </PageShell>
      );
    case "room-types":
      return (
        <PageShell title="Room Type Manager">
          <RoomTypeManager hotel={hotel} bookings={demoBookings} />
        </PageShell>
      );
    case "physical-rooms":
      return (
        <PageShell title="Physical Room Manager">
          <PhysicalRoomManager hotel={hotel} bookings={demoBookings} physicalRooms={demoPhysicalRooms.filter(r => r.hotelId === hotel.id)} onUpdateRooms={noop} />
        </PageShell>
      );
    case "inventory-master":
      return (
        <PageShell title="Inventory Master">
          <RoomInventoryMaster hotel={hotel} bookings={demoBookings} />
        </PageShell>
      );
    case "housekeeping":
      return (
        <PageShell title="Housekeeping">
          <HousekeepingManager hotels={demoHotels} physicalRooms={demoPhysicalRooms} bookings={demoBookings} />
        </PageShell>
      );
    case "maintenance":
      return (
        <PageShell title="Maintenance">
          <MaintenanceManager hotels={demoHotels} physicalRooms={demoPhysicalRooms} />
        </PageShell>
      );
    case "minibar":
      return (
        <PageShell title="Minibar">
          <MinibarManager hotels={demoHotels} physicalRooms={demoPhysicalRooms} bookings={demoBookings} />
        </PageShell>
      );
    case "laundry":
      return (
        <PageShell title="Laundry Management">
          <LaundryManagement bookings={demoBookings} />
        </PageShell>
      );
    case "lost-found":
      return (
        <PageShell title="Lost & Found">
          <LostAndFound />
        </PageShell>
      );
    case "procurement":
      return (
        <PageShell title="Procurement & Inventory">
          <InventoryProcurement />
        </PageShell>
      );
    case "restaurant":
      return (
        <PageShell title="Restaurant POS">
          <RestaurantPOS bookings={demoBookings} onAddChargeToFolio={noop} onOrdersUpdate={setOrders} />
        </PageShell>
      );
    case "kds":
      return (
        <PageShell title="Kitchen Display Screen">
          <KitchenDisplayScreen orders={orders} onUpdateItemStatus={noop} />
        </PageShell>
      );
    case "guest-comms":
      return (
        <PageShell title="Guest Communication">
          <GuestCommunication bookings={demoBookings} />
        </PageShell>
      );
    case "reviews":
      return (
        <PageShell title="Reviews & Ratings">
          <ReviewsRatings hotel={hotel} reviews={DEMO_REVIEWS} onAddReview={noop} userBookings={demoBookings} />
        </PageShell>
      );
    case "staff":
      return (
        <PageShell title="Staff Management">
          <StaffManager />
        </PageShell>
      );
    case "staff-login":
      return (
        <PageShell title="Staff Login Portal">
          <StaffLoginPortal currentUser={staffUser} onLogin={setStaffUser} onLogout={() => setStaffUser(null)} />
        </PageShell>
      );
    case "night-audit":
      return (
        <PageShell title="Night Audit Reports">
          <NightAuditReports hotels={demoHotels} bookings={demoBookings} />
        </PageShell>
      );
    case "onboarding":
      return (
        <PageShell title="Hotel Onboarding">
          <HotelOnboarding onHotelCreated={() => {}} />
        </PageShell>
      );
    default:
      return <Navigate to="/app/dashboard" replace />;
  }
}