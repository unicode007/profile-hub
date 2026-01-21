import { Booking, Hotel } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Bed,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfDay } from "date-fns";

interface CalendarMiniStatsProps {
  bookings: Booking[];
  hotel?: Hotel;
  currentMonth: Date;
}

export const CalendarMiniStats = ({
  bookings,
  hotel,
  currentMonth,
}: CalendarMiniStatsProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const prevMonthStart = startOfMonth(subMonths(currentMonth, 1));
  const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));

  const filteredBookings = hotel
    ? bookings.filter((b) => b.hotelId === hotel.id && b.status !== "cancelled")
    : bookings.filter((b) => b.status !== "cancelled");

  const getMonthStats = (start: Date, end: Date) => {
    const monthBookings = filteredBookings.filter((b) => {
      const checkIn = startOfDay(new Date(b.checkIn));
      return checkIn >= start && checkIn <= end;
    });

    const revenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalGuests = monthBookings.reduce(
      (sum, b) => sum + b.guests.adults + b.guests.children,
      0
    );
    const avgStay = monthBookings.length > 0
      ? monthBookings.reduce((sum, b) => {
          const nights = Math.ceil(
            (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return sum + nights;
        }, 0) / monthBookings.length
      : 0;

    return {
      bookings: monthBookings.length,
      revenue,
      totalGuests,
      avgStay,
    };
  };

  const currentStats = getMonthStats(monthStart, monthEnd);
  const prevStats = getMonthStats(prevMonthStart, prevMonthEnd);

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const bookingsChange = getChange(currentStats.bookings, prevStats.bookings);
  const revenueChange = getChange(currentStats.revenue, prevStats.revenue);

  const stats = [
    {
      label: "Bookings",
      value: currentStats.bookings,
      change: bookingsChange,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Revenue",
      value: `₹${(currentStats.revenue / 1000).toFixed(0)}K`,
      change: revenueChange,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Guests",
      value: currentStats.totalGuests,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Avg Stay",
      value: `${currentStats.avgStay.toFixed(1)} nights`,
      icon: Bed,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.change !== undefined && stat.change >= 0;

        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.change !== undefined && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      isPositive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(stat.change).toFixed(0)}%
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
