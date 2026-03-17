import { useState } from "react";
import { Hotel, Booking } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, isToday, startOfDay, endOfDay, differenceInDays, subDays } from "date-fns";
import {
  Moon, Sun, FileText, DollarSign, BedDouble, TrendingUp, TrendingDown, Download,
  Printer, CheckCircle2, AlertCircle, BarChart3, CalendarDays, Clock, Users, CreditCard
} from "lucide-react";

interface NightAuditReportsProps {
  hotels: Hotel[];
  bookings: Booking[];
}

interface AuditRecord {
  id: string;
  date: Date;
  status: "pending" | "in-progress" | "completed";
  totalRevenue: number;
  roomRevenue: number;
  fbRevenue: number;
  otherRevenue: number;
  occupancy: number;
  totalRooms: number;
  occupiedRooms: number;
  arrivals: number;
  departures: number;
  stayovers: number;
  noShows: number;
  cancellations: number;
  adr: number;
  revpar: number;
  cashCollection: number;
  cardCollection: number;
  upiCollection: number;
  pendingPayments: number;
  discrepancies: string[];
  completedBy?: string;
  completedAt?: Date;
}

const generateAuditData = (bookings: Booking[], hotels: Hotel[]): AuditRecord[] => {
  const records: AuditRecord[] = [];
  const totalRooms = hotels.reduce((sum, h) => sum + h.roomTypes.reduce((s, rt) => s + (rt.rooms || 5), 0), 0);

  for (let i = 0; i < 7; i++) {
    const date = subDays(new Date(), i);
    const dayBookings = bookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      return date >= startOfDay(checkIn) && date <= endOfDay(checkOut) && b.status !== "cancelled";
    });

    const arrivals = bookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      return checkIn.toDateString() === date.toDateString() && b.status !== "cancelled";
    }).length;

    const departures = bookings.filter(b => {
      const checkOut = new Date(b.checkOut);
      return checkOut.toDateString() === date.toDateString() && b.status !== "cancelled";
    }).length;

    const occupiedRooms = Math.min(dayBookings.length * (1 + Math.random() * 0.3), totalRooms);
    const roomRevenue = dayBookings.reduce((s, b) => s + (b.totalAmount || 0) / Math.max(1, differenceInDays(new Date(b.checkOut), new Date(b.checkIn))), 0);
    const fbRevenue = Math.round(occupiedRooms * (800 + Math.random() * 1200));
    const otherRevenue = Math.round(occupiedRooms * (200 + Math.random() * 400));
    const totalRevenue = roomRevenue + fbRevenue + otherRevenue;

    records.push({
      id: `audit-${i}`,
      date,
      status: i === 0 ? "pending" : i === 1 ? "in-progress" : "completed",
      totalRevenue: Math.round(totalRevenue),
      roomRevenue: Math.round(roomRevenue),
      fbRevenue,
      otherRevenue,
      occupancy: Math.round((occupiedRooms / totalRooms) * 100),
      totalRooms,
      occupiedRooms: Math.round(occupiedRooms),
      arrivals,
      departures,
      stayovers: dayBookings.length - arrivals,
      noShows: Math.floor(Math.random() * 3),
      cancellations: Math.floor(Math.random() * 2),
      adr: Math.round(roomRevenue / Math.max(1, occupiedRooms)),
      revpar: Math.round(roomRevenue / totalRooms),
      cashCollection: Math.round(totalRevenue * 0.3),
      cardCollection: Math.round(totalRevenue * 0.45),
      upiCollection: Math.round(totalRevenue * 0.2),
      pendingPayments: Math.round(totalRevenue * 0.05),
      discrepancies: i === 2 ? ["Room 302: Minibar charge not posted", "Room 118: Late checkout not billed"] : [],
      completedBy: i > 1 ? "Night Manager - Ankit Sharma" : undefined,
      completedAt: i > 1 ? new Date(date.setHours(6, 30)) : undefined,
    });
  }
  return records;
};

export const NightAuditReports = ({ hotels, bookings }: NightAuditReportsProps) => {
  const [audits, setAudits] = useState<AuditRecord[]>(() => generateAuditData(bookings, hotels));
  const [activeTab, setActiveTab] = useState<"audit" | "daily" | "monthly" | "financial">("audit");
  const [selectedAudit, setSelectedAudit] = useState<AuditRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const todayAudit = audits[0];

  const handleRunAudit = () => {
    setAudits(audits.map((a, i) => i === 0 ? { ...a, status: "in-progress" as const } : a));
    toast.success("Night audit started...");
    setTimeout(() => {
      setAudits(prev => prev.map((a, i) => i === 0 ? { ...a, status: "completed" as const, completedBy: "System Auto", completedAt: new Date() } : a));
      toast.success("Night audit completed!");
    }, 2000);
  };

  const handleExport = (type: "pdf" | "csv" | "print") => {
    if (type === "print") { window.print(); return; }
    toast.success(`Report exported as ${type.toUpperCase()}`);
  };

  const weeklyTrend = audits.slice(0, 7).reverse();

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Revenue", value: `₹${(todayAudit?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
          { label: "Room Revenue", value: `₹${(todayAudit?.roomRevenue || 0).toLocaleString()}`, icon: BedDouble, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "F&B Revenue", value: `₹${(todayAudit?.fbRevenue || 0).toLocaleString()}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
          { label: "Occupancy", value: `${todayAudit?.occupancy || 0}%`, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          { label: "ADR", value: `₹${(todayAudit?.adr || 0).toLocaleString()}`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
          { label: "RevPAR", value: `₹${(todayAudit?.revpar || 0).toLocaleString()}`, icon: TrendingDown, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
          { label: "Arrivals", value: todayAudit?.arrivals || 0, icon: Users, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30" },
          { label: "Departures", value: todayAudit?.departures || 0, icon: CalendarDays, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="py-3 px-3"><div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${s.bg}`}><s.icon className={`h-3.5 w-3.5 ${s.color}`} /></div>
            <div><div className="text-sm font-bold">{s.value}</div><div className="text-[10px] text-muted-foreground">{s.label}</div></div>
          </div></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="audit" className="gap-2"><Moon className="h-4 w-4" />Night Audit</TabsTrigger>
            <TabsTrigger value="daily" className="gap-2"><Sun className="h-4 w-4" />Daily Report</TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2"><CalendarDays className="h-4 w-4" />Monthly</TabsTrigger>
            <TabsTrigger value="financial" className="gap-2"><DollarSign className="h-4 w-4" />Financial</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {activeTab === "audit" && todayAudit?.status !== "completed" && (
              <Button onClick={handleRunAudit} className="gap-2"><Moon className="h-4 w-4" />{todayAudit?.status === "in-progress" ? "Running..." : "Run Night Audit"}</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-1"><Download className="h-4 w-4" />Export</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("print")} className="gap-1"><Printer className="h-4 w-4" />Print</Button>
          </div>
        </div>

        <TabsContent value="audit" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Audit History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>ADR</TableHead>
                    <TableHead>Arrivals</TableHead>
                    <TableHead>Departures</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map(audit => (
                    <TableRow key={audit.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAudit(audit)}>
                      <TableCell className="font-medium">{format(audit.date, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={audit.status === "completed" ? "default" : audit.status === "in-progress" ? "secondary" : "outline"}>
                          {audit.status === "completed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : audit.status === "in-progress" ? <Clock className="h-3 w-3 mr-1" /> : null}
                          {audit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{audit.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>{audit.occupancy}%</TableCell>
                      <TableCell>₹{audit.adr.toLocaleString()}</TableCell>
                      <TableCell>{audit.arrivals}</TableCell>
                      <TableCell>{audit.departures}</TableCell>
                      <TableCell>{audit.discrepancies.length > 0 ? <Badge variant="destructive" className="text-xs">{audit.discrepancies.length}</Badge> : <span className="text-green-600">✓</span>}</TableCell>
                      <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Room Revenue", value: todayAudit?.roomRevenue || 0, pct: Math.round(((todayAudit?.roomRevenue || 0) / Math.max(1, todayAudit?.totalRevenue || 1)) * 100), color: "bg-blue-500" },
                  { label: "F&B Revenue", value: todayAudit?.fbRevenue || 0, pct: Math.round(((todayAudit?.fbRevenue || 0) / Math.max(1, todayAudit?.totalRevenue || 1)) * 100), color: "bg-purple-500" },
                  { label: "Other Revenue", value: todayAudit?.otherRevenue || 0, pct: Math.round(((todayAudit?.otherRevenue || 0) / Math.max(1, todayAudit?.totalRevenue || 1)) * 100), color: "bg-amber-500" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-medium">₹{item.value.toLocaleString()} ({item.pct}%)</span></div>
                    <Progress value={item.pct} className="h-2" />
                  </div>
                ))}
                <div className="pt-2 border-t flex justify-between font-semibold"><span>Total</span><span>₹{(todayAudit?.totalRevenue || 0).toLocaleString()}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Payment Collection</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Cash", value: todayAudit?.cashCollection || 0 },
                  { label: "Card", value: todayAudit?.cardCollection || 0 },
                  { label: "UPI", value: todayAudit?.upiCollection || 0 },
                  { label: "Pending", value: todayAudit?.pendingPayments || 0 },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span>{item.label}</span><span className="font-medium">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Occupancy Trend (7 days)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40">
                  {weeklyTrend.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">{day.occupancy}%</span>
                      <div className="w-full bg-primary/20 rounded-t" style={{ height: `${day.occupancy}%` }}>
                        <div className="w-full h-full bg-primary rounded-t" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{format(day.date, "EEE")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Guest Movement</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Check-ins", value: todayAudit?.arrivals || 0, icon: "🟢" },
                  { label: "Check-outs", value: todayAudit?.departures || 0, icon: "🔴" },
                  { label: "Stay-overs", value: todayAudit?.stayovers || 0, icon: "🔵" },
                  { label: "No-shows", value: todayAudit?.noShows || 0, icon: "⚪" },
                  { label: "Cancellations", value: todayAudit?.cancellations || 0, icon: "❌" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span>{item.icon} {item.label}</span><span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Summary - {format(new Date(), "MMMM yyyy")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: `₹${audits.reduce((s, a) => s + a.totalRevenue, 0).toLocaleString()}` },
                  { label: "Avg Occupancy", value: `${Math.round(audits.reduce((s, a) => s + a.occupancy, 0) / audits.length)}%` },
                  { label: "Avg ADR", value: `₹${Math.round(audits.reduce((s, a) => s + a.adr, 0) / audits.length).toLocaleString()}` },
                  { label: "Avg RevPAR", value: `₹${Math.round(audits.reduce((s, a) => s + a.revpar, 0) / audits.length).toLocaleString()}` },
                  { label: "Total Arrivals", value: audits.reduce((s, a) => s + a.arrivals, 0) },
                  { label: "Total Departures", value: audits.reduce((s, a) => s + a.departures, 0) },
                  { label: "Total No-Shows", value: audits.reduce((s, a) => s + a.noShows, 0) },
                  { label: "Discrepancies", value: audits.reduce((s, a) => s + a.discrepancies.length, 0) },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{item.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Financial Reconciliation</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Date</TableHead><TableHead>Cash</TableHead><TableHead>Card</TableHead><TableHead>UPI</TableHead><TableHead>Pending</TableHead><TableHead>Total</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{format(a.date, "MMM dd")}</TableCell>
                      <TableCell>₹{a.cashCollection.toLocaleString()}</TableCell>
                      <TableCell>₹{a.cardCollection.toLocaleString()}</TableCell>
                      <TableCell>₹{a.upiCollection.toLocaleString()}</TableCell>
                      <TableCell className={a.pendingPayments > 0 ? "text-red-600 font-medium" : ""}>₹{a.pendingPayments.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">₹{a.totalRevenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>₹{audits.reduce((s, a) => s + a.cashCollection, 0).toLocaleString()}</TableCell>
                    <TableCell>₹{audits.reduce((s, a) => s + a.cardCollection, 0).toLocaleString()}</TableCell>
                    <TableCell>₹{audits.reduce((s, a) => s + a.upiCollection, 0).toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">₹{audits.reduce((s, a) => s + a.pendingPayments, 0).toLocaleString()}</TableCell>
                    <TableCell>₹{audits.reduce((s, a) => s + a.totalRevenue, 0).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Audit Detail Dialog */}
      <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
        <DialogContent className="max-w-2xl">
          {selectedAudit && (
            <>
              <DialogHeader><DialogTitle>Night Audit - {format(selectedAudit.date, "MMMM dd, yyyy")}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg text-center"><div className="text-lg font-bold">₹{selectedAudit.totalRevenue.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Revenue</div></div>
                <div className="p-3 bg-muted/50 rounded-lg text-center"><div className="text-lg font-bold">{selectedAudit.occupancy}%</div><div className="text-xs text-muted-foreground">Occupancy</div></div>
                <div className="p-3 bg-muted/50 rounded-lg text-center"><div className="text-lg font-bold">{selectedAudit.occupiedRooms}/{selectedAudit.totalRooms}</div><div className="text-xs text-muted-foreground">Rooms Used</div></div>
              </div>
              {selectedAudit.discrepancies.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="font-medium text-red-600 mb-2">⚠️ Discrepancies Found:</p>
                  <ul className="space-y-1">{selectedAudit.discrepancies.map((d, i) => <li key={i} className="text-sm text-red-600">• {d}</li>)}</ul>
                </div>
              )}
              {selectedAudit.completedBy && (
                <p className="text-sm text-muted-foreground">Completed by: <strong>{selectedAudit.completedBy}</strong> at {selectedAudit.completedAt ? format(selectedAudit.completedAt, "hh:mm a") : ""}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
