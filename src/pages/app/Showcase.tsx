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
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import * as M from "@/components/modules/Modules";

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

function ModulePlaceholder({
  title, description, scope, bullets,
}: { title: string; description: string; scope: "master" | "admin" | "staff"; bullets: string[] }) {
  const scopeLabel = scope === "master" ? "Master / Platform" : scope === "admin" ? "Admin / Tenant" : "Staff";
  return (
    <PageShell title={title} description={description}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Module Preview
            </CardTitle>
            <Badge variant="secondary">{scopeLabel}</Badge>
          </div>
          <CardDescription>
            Scaffolded entry from the SaaS spec. UI and data wiring will be implemented in upcoming iterations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 rounded-md border bg-muted/30 p-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PageShell>
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

    // ---------- Master / Platform ----------
    case "master":
      return <M.MasterDashboard />;

    // ---------- Front Desk Operations ----------
    case "plans": return <M.SubscriptionPlans />;
    case "subscriptions": return <M.TenantSubscriptions />;
    case "tenants": return <M.TenantsAdmins />;
    case "hotel-approvals": return <M.HotelApprovals />;
    case "features": return <M.FeatureFlags />;
    case "routes-menus": return <M.RoutesMenus />;
    case "global-amenities": return <M.GlobalAmenities />;
    case "global-policies": return <M.GlobalPolicies />;
    case "platform-revenue": return <M.PlatformRevenue />;

    // ---------- Admin / Tenant ----------
    case "admin-dashboard": return <M.AdminDashboard />;
    case "cancellations": return <M.Cancellations />;
    case "rate-plans": return <M.RatePlans />;
    case "channel-manager": return <M.ChannelManager />;
    case "suppliers": return <M.Suppliers />;
    case "inventory-items": return <M.InventoryItems />;
    case "menu-manager": return <M.MenuManager />;
    case "tables": return <M.TablesModule />;
    case "guests": return <M.GuestsCRM />;
    case "notifications": return <M.Notifications />;
    case "campaigns": return <M.Campaigns />;
    case "roles-permissions": return <M.RolesPermissions />;
    case "access-logs": return <M.AccessLogs />;

    // ---------- Front Desk Operations ----------
    case "fd-dashboard": return <M.FDDashboard />;
    case "arrivals": return <M.ArrivalsToday />;
    case "departures": return <M.DeparturesToday />;
    case "in-house": return <M.InHouseGuests />;
    case "walk-in": return <M.WalkInBooking />;
    case "room-rack": return <M.RoomRack />;
    case "room-allocation": return <M.RoomAllocation />;
    case "check-in": return <M.CheckInScreen />;
    case "early-checkin": return <M.EarlyCheckin />;
    case "check-out": return <M.CheckoutScreen />;
    case "late-checkout": return <M.LateCheckout />;
    case "room-change": return <M.RoomChangeScreen />;
    case "extend-stay": return <M.ExtendStay />;
    case "guest-requests": return <M.GuestRequests />;
    case "complaints": return <M.Complaints />;
    case "wakeup-calls": return <M.WakeupCalls />;
    case "cashier": return <M.Cashier />;
    case "print-center": return <M.PrintCenter />;
    case "switchboard": return <M.Switchboard />;
    case "concierge": return <M.Concierge />;

    // ---------- Finance ----------
    case "invoices": return <M.Invoices />;
    case "payments": return <M.Payments />;
    case "refunds": return <M.Refunds />;
    case "folios": return <M.Folios />;
    case "tax": return <M.TaxGST />;

    // ---------- Reports ----------
    case "report-occupancy": return <M.ReportOccupancy />;
    case "report-revenue": return <M.ReportRevenue />;
    case "report-staff": return <M.ReportStaff />;
    case "audit-logs": return <M.AuditLogs />;

    // ---------- Setup ----------
    case "hotel-profile": return <M.HotelProfile />;
    case "hotel-policies": return <M.HotelPolicies />;
    case "amenities": return <M.AdminAmenities />;
    case "public-listing": return <M.PublicListing />;
    case "email-templates": return <M.EmailTemplates />;
    case "localization": return <M.Localization />;
    case "integrations": return <M.Integrations />;

    default:
      return <Navigate to="/app/dashboard" replace />;
  }
}