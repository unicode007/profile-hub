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
      return <ModulePlaceholder scope="master" title="Master Dashboard" description="Platform-wide KPIs and SaaS controls."
        bullets={["Total admins & tenants", "Active vs expired subscriptions", "MRR & plan-wise revenue", "Hotel approval queue", "Feature usage analytics", "Platform growth trends"]} />;

    // ---------- Front Desk Operations ----------
    case "fd-dashboard":
      return <ModulePlaceholder scope="staff" title="Front Desk Dashboard" description="Operational hub for today's reception activity."
        bullets={["Today's arrivals & departures", "In-house guests count", "Available / occupied / dirty rooms", "Pending payments & hold bookings", "No-show candidates", "Guest requests & maintenance alerts"]} />;
    case "arrivals":
      return <ModulePlaceholder scope="staff" title="Arrivals Today" description="Confirmed bookings expected to check in today."
        bullets={["Booking & guest details", "ETA & special requests", "Pre-assigned room", "Pending advance", "One-click check-in", "Print registration card"]} />;
    case "departures":
      return <ModulePlaceholder scope="staff" title="Departures Today" description="In-house guests scheduled to check out today."
        bullets={["Folio summary", "Outstanding balance", "Late checkout flag", "One-click checkout", "Print invoice", "Trigger housekeeping"]} />;
    case "in-house":
      return <ModulePlaceholder scope="staff" title="In-House Guests" description="All currently staying guests across rooms."
        bullets={["Room → guest mapping", "Folio quick view", "Add charge / request", "Extend stay / change room", "Raise maintenance", "Print interim bill"]} />;
    case "walk-in":
      return <ModulePlaceholder scope="staff" title="Walk-in Booking" description="Create booking + check-in in a single flow."
        bullets={["Live room-type availability", "Rate plan picker", "ID proof capture", "Advance collection", "Auto room allocation", "Registration card print"]} />;
    case "room-rack":
      return <ModulePlaceholder scope="staff" title="Room Rack" description="Real-time grid of every physical room and its status."
        bullets={["Floor-wise layout", "Status colors (avail/occ/dirty/OOO)", "Drag-and-drop allocation", "Hover guest details", "Quick actions per room", "Filter by room type"]} />;
    case "room-allocation":
      return <ModulePlaceholder scope="staff" title="Room Allocation" description="Assign physical rooms to confirmed bookings."
        bullets={["Filter by booked room type", "Hide dirty/OOO/blocked rooms", "Upgrade with rate diff", "Manager approval flow", "Bulk allocation", "Audit trail"]} />;
    case "check-in":
      return <ModulePlaceholder scope="staff" title="Check-in" description="Convert a confirmed booking into an active stay."
        bullets={["Search by booking/guest/mobile/OTA", "KYC capture", "Advance / deposit collection", "Physical room assignment", "Status → Checked-in / Occupied", "Reg card print"]} />;
    case "early-checkin":
      return <ModulePlaceholder scope="staff" title="Early Check-in" description="Handle guests arriving before standard check-in time."
        bullets={["Policy lookup", "Auto fee calculation", "Manager approval if waived", "Add fee to folio", "Proceed to check-in", "Audit log"]} />;
    case "check-out":
      return <ModulePlaceholder scope="staff" title="Checkout" description="Final billing, payment, invoice and housekeeping trigger."
        bullets={["Folio recalculation", "Tax & discount apply", "Deposit adjustment", "Collect due payment", "Generate invoice", "Room → Dirty + HK task"]} />;
    case "late-checkout":
      return <ModulePlaceholder scope="staff" title="Late Checkout" description="Apply late-checkout charges per hotel policy."
        bullets={["Hourly / half-day / full-day", "Auto fee calculation", "Add to folio", "Manager waive option", "Notify housekeeping", "Audit log"]} />;
    case "room-change":
      return <ModulePlaceholder scope="staff" title="Room Change" description="Move an in-house guest to another room."
        bullets={["Reason selector", "Available rooms list", "Rate difference calc", "Approval for free upgrade", "Old room → Dirty/Maintenance", "Update folio & key card"]} />;
    case "extend-stay":
      return <ModulePlaceholder scope="staff" title="Extend Stay" description="Extend an in-house booking by additional nights."
        bullets={["Date picker", "Inventory check", "Rate recalculation", "Collect extra payment", "Suggest room change if blocked", "Update checkout date"]} />;
    case "guest-requests":
      return <ModulePlaceholder scope="staff" title="Guest Requests" description="Track service requests from in-house guests."
        bullets={["Towel / water / cleaning / taxi", "Assign to dept", "Priority & SLA", "Status pipeline", "Guest notification", "Resolution audit"]} />;
    case "complaints":
      return <ModulePlaceholder scope="staff" title="Complaints" description="Log and resolve guest complaints with escalation."
        bullets={["Category & severity", "Auto-route to dept", "Escalation rules", "Manager visibility", "Resolution notes", "Guest follow-up"]} />;
    case "wakeup-calls":
      return <ModulePlaceholder scope="staff" title="Wake-up Calls" description="Schedule and track guest wake-up calls."
        bullets={["Schedule by room", "Recurring / one-time", "Auto reminder to operator", "Status: pending/done/missed", "Snooze & retry", "Daily report"]} />;
    case "cashier":
      return <ModulePlaceholder scope="staff" title="Cashier / Collection" description="Daily payment collection and drawer reconciliation."
        bullets={["Mode-wise totals (cash/UPI/card)", "Pending payments list", "Collect & receipt print", "Refund requests", "Shift cash close", "Variance report"]} />;
    case "print-center":
      return <ModulePlaceholder scope="staff" title="Print Center" description="Reprint invoices, folios, receipts and reg cards."
        bullets={["Search by booking", "Invoice / receipt / folio", "Registration card", "GRC & ID copy", "Email PDF", "Reprint audit"]} />;
    case "switchboard":
      return <ModulePlaceholder scope="staff" title="Reception Switchboard" description="Inbound call routing and guest line directory."
        bullets={["Room → extension map", "Incoming call log", "DND status", "Message to room", "Voicemail", "Call summary"]} />;
    case "concierge":
      return <ModulePlaceholder scope="staff" title="Concierge Desk" description="Coordinate guest services, transport and local bookings."
        bullets={["Taxi & airport pickup", "Tour & restaurant booking", "Lost & found handoff", "Luggage tickets", "VIP arrival prep", "Service log"]} />;

    case "plans":
      return <ModulePlaceholder scope="master" title="Subscription Plans" description="Create & manage SaaS plans, pricing, and feature limits."
        bullets={["Plan tiers (Starter/Pro/Enterprise)", "Hotel / staff / room limits", "Feature flags per plan", "Monthly & yearly pricing", "Trial period config", "Activate / deactivate plans"]} />;
    case "subscriptions":
      return <ModulePlaceholder scope="master" title="Tenant Subscriptions" description="All active and expired tenant subscriptions."
        bullets={["Tenant → plan mapping", "Trial / active / past_due / cancelled", "Renewal & invoice history", "Upgrade / downgrade flow", "Grace period controls", "Payment failures"]} />;
    case "tenants":
      return <ModulePlaceholder scope="master" title="Tenants & Admins" description="Manage all signed-up admin workspaces."
        bullets={["Tenant directory & search", "Owner contact info", "Suspend / reactivate access", "Impersonate (audit-logged)", "Per-tenant usage stats", "Notes & internal flags"]} />;
    case "hotel-approvals":
      return <ModulePlaceholder scope="master" title="Hotel Approvals" description="Review and approve new hotel listings."
        bullets={["Pending submissions queue", "Document verification", "Approve / reject with reason", "Auto-publish on approval", "Approval audit trail", "Bulk actions"]} />;
    case "features":
      return <ModulePlaceholder scope="master" title="Feature Flags" description="Global capability toggles per plan or tenant."
        bullets={["Module-level toggles", "Per-plan overrides", "Per-tenant overrides", "Beta / preview flags", "Rollout percentage", "Change history"]} />;
    case "routes-menus":
      return <ModulePlaceholder scope="master" title="Routes & Menus" description="Define which routes and menus are available platform-wide."
        bullets={["Master menu catalog", "Route → permission mapping", "Menu visibility per plan", "Icon & ordering", "Active / inactive state", "Localized labels"]} />;
    case "global-amenities":
      return <ModulePlaceholder scope="master" title="Global Amenities" description="Master catalog of amenities hotels can pick from."
        bullets={["Category grouping", "Icon library", "Translations", "Active / inactive", "Merge & dedupe", "Usage stats per hotel"]} />;
    case "global-policies":
      return <ModulePlaceholder scope="master" title="Global Policies" description="Default cancellation, child, pet, and tax policies."
        bullets={["Templates by region", "Cancellation tiers", "Child / pet rules", "Tax slabs (GST)", "Apply to new hotels", "Version history"]} />;
    case "platform-revenue":
      return <ModulePlaceholder scope="master" title="Platform Revenue" description="SaaS revenue, MRR/ARR, churn and forecasting."
        bullets={["MRR / ARR charts", "Churn & retention", "Plan-wise breakdown", "Failed payments", "Refunds & credits", "Export to CSV"]} />;

    // ---------- Admin / Tenant ----------
    case "admin-dashboard":
      return <ModulePlaceholder scope="admin" title="Admin Dashboard" description="Tenant-level KPIs across all your hotels."
        bullets={["Bookings today / week / month", "Occupancy %, ADR, RevPAR", "Pending payments", "Housekeeping & maintenance load", "Staff activity", "Plan usage vs limit"]} />;
    case "cancellations":
      return <ModulePlaceholder scope="admin" title="Cancellations & No-show" description="Policy-driven cancellation and refund workflow."
        bullets={["Cancellation queue", "Refund calculation", "No-show marking", "Inventory release", "Policy enforcement", "Reason analytics"]} />;
    case "rate-plans":
      return <ModulePlaceholder scope="admin" title="Rate Plans" description="Room Only, BB, HB, Non-refundable, corporate, seasonal."
        bullets={["Per room-type plans", "Extra adult / child pricing", "Meal inclusions", "Refundable rules", "Tax & discount", "Active / inactive"]} />;
    case "channel-manager":
      return <ModulePlaceholder scope="admin" title="Channel Manager" description="OTA inventory and rate distribution."
        bullets={["Booking.com / Expedia / Agoda", "Two-way sync", "Rate parity controls", "Restrictions (MLOS, CTA, CTD)", "Channel performance", "Mapping wizard"]} />;
    case "suppliers":
      return <ModulePlaceholder scope="admin" title="Suppliers" description="Vendor master with contacts, terms, and ratings."
        bullets={["Supplier directory", "Payment terms", "Tax & banking", "Performance ratings", "Linked POs & GRNs", "Documents"]} />;
    case "inventory-items":
      return <ModulePlaceholder scope="admin" title="Inventory Items" description="Material master with stock, reorder, and ABC class."
        bullets={["Item catalog & SKU", "Categories", "Min / max / reorder", "Stock by location", "Low stock alerts", "Transactions"]} />;
    case "menu-manager":
      return <ModulePlaceholder scope="admin" title="Menu Manager" description="F&B menu, categories, modifiers and availability."
        bullets={["Categories & items", "Pricing & taxes", "Spice / veg flags", "Photos & descriptions", "Time-based availability", "Combos"]} />;
    case "tables":
      return <ModulePlaceholder scope="admin" title="Tables" description="Restaurant floor plan and table states."
        bullets={["Floor plan layout", "Table capacity", "Live status", "Reservations", "Merge / split", "QR ordering"]} />;
    case "guests":
      return <ModulePlaceholder scope="admin" title="Guests CRM" description="Unified guest profile across bookings."
        bullets={["Guest 360 profile", "Stay history", "Preferences", "ID proofs vault", "Loyalty tier", "Communication log"]} />;
    case "notifications":
      return <ModulePlaceholder scope="admin" title="Notifications" description="System and guest notification center."
        bullets={["Email / SMS / WhatsApp", "Templates", "Triggers (book/checkin/out)", "Delivery logs", "Quiet hours", "Test send"]} />;
    case "campaigns":
      return <ModulePlaceholder scope="admin" title="Campaigns" description="Marketing campaigns to past and future guests."
        bullets={["Segments", "Coupon codes", "Email / WhatsApp blasts", "Schedule & A/B", "Conversion tracking", "Unsubscribe handling"]} />;
    case "roles-permissions":
      return <ModulePlaceholder scope="admin" title="Roles & Permissions" description="Per-hotel role matrix with granular actions."
        bullets={["Custom roles per hotel", "Read / create / update / delete", "Approve / refund / export", "Menu visibility", "Bulk assign", "Audit history"]} />;
    case "access-logs":
      return <ModulePlaceholder scope="admin" title="Access Logs" description="Who logged in, from where, and what they accessed."
        bullets={["Login attempts", "IP & device", "Session duration", "Failed logins", "Suspicious activity", "Export"]} />;

    // ---------- Finance ----------
    case "invoices":
      return <ModulePlaceholder scope="admin" title="Invoices" description="GST-compliant invoices with print & email."
        bullets={["Invoice list & search", "Print / PDF / email", "Cancel & credit notes", "Tax breakup", "Series & numbering", "Bulk export"]} />;
    case "payments":
      return <ModulePlaceholder scope="admin" title="Payments" description="All collected payments across modes."
        bullets={["Cash / card / UPI / NB / wallet", "Reconciliation", "Settlement reports", "Failed payments", "Refund linkage", "Drawer balance"]} />;
    case "refunds":
      return <ModulePlaceholder scope="admin" title="Refunds" description="Refund queue with policy enforcement."
        bullets={["Refund requests", "Approval workflow", "Gateway refunds", "Manual refunds", "Audit log", "Guest notification"]} />;
    case "folios":
      return <ModulePlaceholder scope="admin" title="Folios" description="Live guest folios during stay."
        bullets={["Room + extras", "Split & transfer", "Posting from POS", "Tax recalculation", "Print folio", "Lock on checkout"]} />;
    case "tax":
      return <ModulePlaceholder scope="admin" title="Tax & GST" description="Tax configuration and filings."
        bullets={["GST slabs", "HSN / SAC codes", "Inclusive / exclusive", "Tax reports", "GSTR-ready exports", "State-wise"]} />;

    // ---------- Reports ----------
    case "report-occupancy":
      return <ModulePlaceholder scope="admin" title="Occupancy Report" description="Daily/weekly/monthly occupancy trends."
        bullets={["Occupancy %", "ADR & RevPAR", "By room type", "By source", "Forecast", "Compare periods"]} />;
    case "report-revenue":
      return <ModulePlaceholder scope="admin" title="Revenue Report" description="Revenue by source, segment, channel and rate plan."
        bullets={["Room vs F&B vs other", "Segment mix", "Channel mix", "Rate plan performance", "Discount impact", "YoY compare"]} />;
    case "report-staff":
      return <ModulePlaceholder scope="admin" title="Staff Productivity" description="Per-staff and per-department performance."
        bullets={["Check-ins handled", "Cleanings / hr", "Maintenance SLAs", "Sales by staff", "Attendance", "Leaderboard"]} />;
    case "audit-logs":
      return <ModulePlaceholder scope="admin" title="Audit Logs" description="Immutable trail of all critical actions."
        bullets={["Who / what / when", "Before / after diff", "Filter by module", "Export", "Retention policy", "Tamper-evident"]} />;

    // ---------- Setup ----------
    case "hotel-profile":
      return <ModulePlaceholder scope="admin" title="Hotel Profile" description="Hotel branding, contact and business details."
        bullets={["Name & logo", "Address & geo", "GST / tax info", "Bank details", "Check-in/out times", "Images & gallery"]} />;
    case "hotel-policies":
      return <ModulePlaceholder scope="admin" title="Hotel Policies" description="Per-hotel policy overrides."
        bullets={["Cancellation tiers", "Child & pet", "Smoking & ID", "Deposit rules", "Late checkout", "Group bookings"]} />;
    case "amenities":
      return <ModulePlaceholder scope="admin" title="Amenities" description="Pick from master amenities for this hotel."
        bullets={["Categorized picker", "Icons", "Show on public listing", "Free / paid flag", "Hours of availability", "Sort order"]} />;
    case "public-listing":
      return <ModulePlaceholder scope="admin" title="Public Listing & SEO" description="Control public visibility and search metadata."
        bullets={["Public toggle", "Slug & canonical URL", "SEO title & description", "Keywords", "Cover image", "Open Graph preview"]} />;
    case "email-templates":
      return <ModulePlaceholder scope="admin" title="Email Templates" description="Branded transactional email templates."
        bullets={["Booking confirmation", "Pre-arrival", "Checkout invoice", "OTP & verification", "Variables / merge tags", "Preview & test"]} />;
    case "localization":
      return <ModulePlaceholder scope="admin" title="Localization" description="Languages, currencies, and regional formats."
        bullets={["Supported languages", "Default currency", "Date / number format", "Translations", "Per-hotel overrides", "Auto-detect"]} />;
    case "integrations":
      return <ModulePlaceholder scope="admin" title="Integrations" description="Connect payment, OTA, accounting, and messaging tools."
        bullets={["Payment gateways", "OTAs / channel manager", "Tally / Zoho", "WhatsApp / SMS", "Webhooks", "API keys"]} />;

    default:
      return <Navigate to="/app/dashboard" replace />;
  }
}