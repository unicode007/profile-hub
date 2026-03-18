import { useTableQuery } from "@/hooks/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ReportsModule() {
  const { data: bookings, isLoading: bLoading } = useTableQuery("bookings");
  const { data: rooms } = useTableQuery("physical_rooms");
  const { data: orders } = useTableQuery("restaurant_orders");
  const { data: laundry } = useTableQuery("laundry_orders");
  const { data: housekeeping } = useTableQuery("housekeeping_tasks");
  const { data: maintenance } = useTableQuery("maintenance_tasks");

  if (bLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const totalRevenue = bookings?.reduce((s: number, b: any) => s + (Number(b.total_amount) || 0), 0) ?? 0;
  const foodRevenue = orders?.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0) ?? 0;
  const laundryRevenue = laundry?.reduce((s: number, l: any) => s + (Number(l.total_amount) || 0), 0) ?? 0;
  const occupancyRate = rooms && rooms.length > 0 ? ((rooms.filter((r: any) => r.status === "occupied").length / rooms.length) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Room Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">{bookings?.length || 0} bookings</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">F&B Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{foodRevenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">{orders?.length || 0} orders</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Laundry Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{laundryRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Occupancy Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{occupancyRate}%</p><p className="text-sm text-muted-foreground">{rooms?.filter((r: any) => r.status === "occupied").length || 0}/{rooms?.length || 0} rooms</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Booking Status Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {["pending", "confirmed", "checked_in", "checked_out", "cancelled", "completed"].map(s => (
              <div key={s} className="flex justify-between"><span className="capitalize text-sm">{s.replace("_", " ")}</span><span className="font-semibold">{bookings?.filter((b: any) => b.status === s).length ?? 0}</span></div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Operations Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-sm">Pending Housekeeping</span><span className="font-semibold">{housekeeping?.filter((t: any) => t.status === "pending").length ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm">Active Maintenance</span><span className="font-semibold">{maintenance?.filter((t: any) => t.status !== "completed").length ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm">Active Orders</span><span className="font-semibold">{orders?.filter((o: any) => o.status === "active").length ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm">Pending Laundry</span><span className="font-semibold">{laundry?.filter((l: any) => l.status !== "delivered").length ?? 0}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
