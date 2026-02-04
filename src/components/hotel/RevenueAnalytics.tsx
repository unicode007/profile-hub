import { useMemo } from "react";
import { Booking, Hotel } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Bed,
  Target,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  addDays,
  subDays,
  differenceInDays,
  getMonth,
  getYear,
} from "date-fns";

interface RevenueAnalyticsProps {
  hotels: Hotel[];
  bookings: Booking[];
  selectedHotelId?: string;
}

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  bookings: { label: "Bookings", color: "hsl(var(--chart-2))" },
  occupancy: { label: "Occupancy", color: "hsl(var(--chart-3))" },
  adr: { label: "ADR", color: "hsl(var(--chart-4))" },
  revpar: { label: "RevPAR", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const RevenueAnalytics = ({
  hotels,
  bookings,
  selectedHotelId,
}: RevenueAnalyticsProps) => {
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      if (selectedHotelId && b.hotelId !== selectedHotelId) return false;
      return true;
    });
  }, [bookings, selectedHotelId]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    const thisMonth = startOfMonth(today);
    const lastMonth = startOfMonth(subDays(thisMonth, 1));
    const lastMonthEnd = endOfMonth(lastMonth);

    const thisMonthBookings = filteredBookings.filter(
      (b) => new Date(b.createdAt) >= thisMonth
    );
    const lastMonthBookings = filteredBookings.filter(
      (b) =>
        new Date(b.createdAt) >= lastMonth && new Date(b.createdAt) <= lastMonthEnd
    );

    const totalRevenue = filteredBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );
    const thisMonthRevenue = thisMonthBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );
    const lastMonthRevenue = lastMonthBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const revenueChange =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Calculate ADR (Average Daily Rate)
    const totalNights = filteredBookings.reduce((sum, b) => {
      const nights = differenceInDays(new Date(b.checkOut), new Date(b.checkIn));
      return sum + nights * (b.rooms || 1);
    }, 0);
    const adr = totalNights > 0 ? totalRevenue / totalNights : 0;

    // Calculate occupancy (simplified)
    const selectedHotel = selectedHotelId
      ? hotels.find((h) => h.id === selectedHotelId)
      : null;
    const totalRooms = selectedHotel
      ? selectedHotel.roomTypes.reduce((sum, rt) => sum + 5, 0)
      : hotels.reduce((sum, h) => sum + h.roomTypes.length * 5, 0);

    const daysInMonth = 30;
    const totalPossibleNights = totalRooms * daysInMonth;
    const occupancy = totalPossibleNights > 0 ? (totalNights / totalPossibleNights) * 100 : 0;

    // RevPAR (Revenue Per Available Room)
    const revpar = totalPossibleNights > 0 ? totalRevenue / totalPossibleNights : 0;

    return {
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      totalBookings: filteredBookings.length,
      thisMonthBookings: thisMonthBookings.length,
      adr,
      occupancy: Math.min(occupancy, 100),
      revpar,
      totalGuests: filteredBookings.reduce(
        (sum, b) => sum + b.guests.adults + b.guests.children,
        0
      ),
    };
  }, [filteredBookings, hotels, selectedHotelId]);

  // Daily revenue for chart
  const dailyRevenue = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });

    return days.map((day) => {
      const dayBookings = filteredBookings.filter((b) => {
        const checkIn = startOfDay(new Date(b.checkIn));
        const checkOut = startOfDay(new Date(b.checkOut));
        return isWithinInterval(startOfDay(day), {
          start: checkIn,
          end: addDays(checkOut, -1),
        });
      });

      const revenue = dayBookings.reduce((sum, b) => {
        const nights = differenceInDays(new Date(b.checkOut), new Date(b.checkIn));
        return sum + (b.totalAmount || 0) / nights;
      }, 0);

      return {
        date: format(day, "MMM d"),
        revenue: Math.round(revenue),
        bookings: dayBookings.length,
      };
    });
  }, [filteredBookings]);

  // Room type distribution
  const roomTypeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    filteredBookings.forEach((b) => {
      if (!distribution[b.roomName]) {
        distribution[b.roomName] = 0;
      }
      distribution[b.roomName] += b.totalAmount || 0;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredBookings]);

  // Monthly revenue trend
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { revenue: number; bookings: number }> = {};

    filteredBookings.forEach((b) => {
      const month = format(new Date(b.createdAt), "MMM yyyy");
      if (!months[month]) {
        months[month] = { revenue: 0, bookings: 0 };
      }
      months[month].revenue += b.totalAmount || 0;
      months[month].bookings += 1;
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        bookings: data.bookings,
      }))
      .slice(-6);
  }, [filteredBookings]);

  // Booking status distribution
  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    bookings.forEach((b) => {
      if (selectedHotelId && b.hotelId !== selectedHotelId) return;
      if (!distribution[b.status]) {
        distribution[b.status] = 0;
      }
      distribution[b.status] += 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [bookings, selectedHotelId]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold">
                  ₹{(kpis.totalRevenue / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold">
                    ₹{(kpis.thisMonthRevenue / 1000).toFixed(1)}K
                  </p>
                  {kpis.revenueChange !== 0 && (
                    <Badge
                      variant={kpis.revenueChange > 0 ? "default" : "destructive"}
                      className="text-[10px] px-1"
                    >
                      {kpis.revenueChange > 0 ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {Math.abs(kpis.revenueChange).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ADR</p>
                <p className="text-lg font-bold">₹{kpis.adr.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Bed className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-lg font-bold">{kpis.occupancy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Activity className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RevPAR</p>
                <p className="text-lg font-bold">₹{kpis.revpar.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                <Users className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Guests</p>
                <p className="text-lg font-bold">{kpis.totalGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Daily Revenue (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}K`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.3}
                  name="Revenue"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 1000}K`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Room Type Revenue Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Revenue by Room Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={roomTypeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name.slice(0, 10)}... ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {roomTypeDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Booking Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={statusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-bookings)"
                  radius={[0, 4, 4, 0]}
                  name="Bookings"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Rooms Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Performing Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Room Type</th>
                  <th className="text-right py-2 font-medium">Revenue</th>
                  <th className="text-right py-2 font-medium">Bookings</th>
                  <th className="text-right py-2 font-medium">Avg. Rate</th>
                </tr>
              </thead>
              <tbody>
                {roomTypeDistribution.slice(0, 5).map((room, index) => {
                  const roomBookings = filteredBookings.filter(
                    (b) => b.roomName === room.name
                  );
                  const avgRate =
                    roomBookings.length > 0
                      ? room.value / roomBookings.length
                      : 0;

                  return (
                    <tr key={room.name} className="border-b last:border-0">
                      <td className="py-2 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {room.name}
                      </td>
                      <td className="text-right py-2 font-medium">
                        ₹{(room.value / 1000).toFixed(1)}K
                      </td>
                      <td className="text-right py-2">{roomBookings.length}</td>
                      <td className="text-right py-2">₹{avgRate.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
