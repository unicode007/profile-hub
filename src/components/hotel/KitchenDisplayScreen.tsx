import { useState, useEffect, useCallback } from "react";
import { RestaurantOrder, OrderItem } from "./RestaurantPOS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ChefHat,
  Bell,
  CheckCircle,
  Clock,
  Timer,
  AlertTriangle,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Flame,
  Eye,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";

interface KitchenDisplayScreenProps {
  orders: RestaurantOrder[];
  onUpdateItemStatus: (orderId: string, itemId: string, status: OrderItem["status"]) => void;
  onBumpOrder?: (orderId: string) => void;
}

export const KitchenDisplayScreen = ({
  orders,
  onUpdateItemStatus,
  onBumpOrder,
}: KitchenDisplayScreenProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [, setTick] = useState(0);
  const [flashNewOrders, setFlashNewOrders] = useState<Set<string>>(new Set());
  const [selectedPriority, setSelectedPriority] = useState<"all" | "urgent" | "normal">("all");

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Play alert sound for new/urgent orders
  const playAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 200);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  // Detect new orders and flash
  useEffect(() => {
    const activeOrders = orders.filter((o) => o.status === "active");
    const pendingOrders = activeOrders.filter((o) =>
      o.items.some((i) => i.status === "pending")
    );
    if (pendingOrders.length > 0) {
      const newIds = new Set(pendingOrders.map((o) => o.id));
      setFlashNewOrders(newIds);
      playAlert();
      const timeout = setTimeout(() => setFlashNewOrders(new Set()), 3000);
      return () => clearTimeout(timeout);
    }
  }, [orders.length, playAlert]);

  const getElapsedMinutes = (date: Date) =>
    Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  const getUrgencyClass = (minutes: number) => {
    if (minutes > 30) return "border-destructive bg-destructive/10";
    if (minutes > 20) return "border-orange-500 bg-orange-50 dark:bg-orange-950/30";
    if (minutes > 10) return "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
    return "border-primary bg-primary/5";
  };

  const activeOrders = orders
    .filter((o) => o.status === "active")
    .filter((o) => {
      if (selectedPriority === "all") return true;
      const elapsed = getElapsedMinutes(o.createdAt);
      return selectedPriority === "urgent" ? elapsed > 20 : elapsed <= 20;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const pendingCount = activeOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.status === "pending").length,
    0
  );
  const preparingCount = activeOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.status === "preparing").length,
    0
  );
  const readyCount = activeOrders.reduce(
    (sum, o) => sum + o.items.filter((i) => i.status === "ready").length,
    0
  );

  const handleItemAction = (orderId: string, itemId: string, newStatus: OrderItem["status"]) => {
    onUpdateItemStatus(orderId, itemId, newStatus);
    if (newStatus === "ready") {
      playAlert();
    }
  };

  const handleBumpAll = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    order.items
      .filter((i) => i.status !== "served")
      .forEach((item) => {
        const nextStatus: OrderItem["status"] =
          item.status === "pending"
            ? "preparing"
            : item.status === "preparing"
            ? "ready"
            : "served";
        onUpdateItemStatus(orderId, item.menuItem.id, nextStatus);
      });
    onBumpOrder?.(orderId);
    toast.success(`Order bumped for Table ${order.tableNumber}`);
  };

  return (
    <div className="space-y-4">
      {/* KDS Header - Large for tablet visibility */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Kitchen Display</h2>
              <p className="text-muted-foreground">
                {format(new Date(), "EEEE, MMM d • hh:mm a")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="lg"
              variant={soundEnabled ? "default" : "outline"}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2 h-14 px-6 text-lg"
            >
              {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              {soundEnabled ? "Sound ON" : "Sound OFF"}
            </Button>
            <Button
              size="lg"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2 h-14 px-6 text-lg"
            >
              <RefreshCw className={`h-6 w-6 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto
            </Button>
          </div>
        </div>

        {/* Stats Bar - Large touch-friendly */}
        <div className="grid grid-cols-4 gap-3">
          <Card
            className={`cursor-pointer transition-all ${selectedPriority === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedPriority("all")}
          >
            <CardContent className="py-4 px-5 text-center">
              <div className="text-4xl font-bold">{activeOrders.length}</div>
              <div className="text-sm text-muted-foreground font-medium">Active Orders</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-300">
            <CardContent className="py-4 px-5 text-center">
              <div className="text-4xl font-bold text-amber-600">{pendingCount}</div>
              <div className="text-sm text-amber-600 font-medium">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-300">
            <CardContent className="py-4 px-5 text-center">
              <div className="text-4xl font-bold text-blue-600">{preparingCount}</div>
              <div className="text-sm text-blue-600 font-medium">Preparing</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950/30 border-green-300">
            <CardContent className="py-4 px-5 text-center">
              <div className="text-4xl font-bold text-green-600">{readyCount}</div>
              <div className="text-sm text-green-600 font-medium">Ready to Serve</div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2">
          {(["all", "urgent", "normal"] as const).map((p) => (
            <Button
              key={p}
              size="lg"
              variant={selectedPriority === p ? "default" : "outline"}
              onClick={() => setSelectedPriority(p)}
              className="h-12 px-6 text-base capitalize gap-2"
            >
              {p === "urgent" && <AlertTriangle className="h-5 w-5" />}
              {p === "normal" && <Clock className="h-5 w-5" />}
              {p === "all" && <Eye className="h-5 w-5" />}
              {p === "all" ? "All Orders" : `${p} Orders`}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Grid - Large cards for tablet touch */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeOrders.map((order) => {
          const elapsed = getElapsedMinutes(order.createdAt);
          const urgencyClass = getUrgencyClass(elapsed);
          const isFlashing = flashNewOrders.has(order.id);
          const unservedItems = order.items.filter((i) => i.status !== "served");

          return (
            <Card
              key={order.id}
              className={`border-2 transition-all ${urgencyClass} ${
                isFlashing ? "animate-pulse ring-4 ring-primary/50" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-background rounded-xl p-3 shadow-sm">
                      <span className="text-3xl font-black">{order.tableNumber}</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Table {order.tableNumber}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(order.createdAt, "hh:mm a")}
                        {order.guestInfo?.guestName && (
                          <span>• {order.guestInfo.guestName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="secondary"
                      className={`text-base px-3 py-1 ${
                        elapsed > 30
                          ? "bg-destructive text-destructive-foreground animate-pulse"
                          : elapsed > 20
                          ? "bg-orange-500 text-white"
                          : ""
                      }`}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      {elapsed}m
                    </Badge>
                    <div className="flex gap-1">
                      {order.kotNumbers.map((kot) => (
                        <Badge key={kot} variant="outline" className="text-xs">
                          KOT#{kot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                {unservedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      item.status === "pending"
                        ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
                        : item.status === "preparing"
                        ? "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700"
                        : "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black">{item.quantity}×</span>
                      <div>
                        <p className="font-bold text-lg">{item.menuItem.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-sm font-semibold ${
                              item.status === "pending"
                                ? "border-amber-500 text-amber-700"
                                : item.status === "preparing"
                                ? "border-blue-500 text-blue-700"
                                : "border-green-500 text-green-700"
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                          {!item.menuItem.isVeg && (
                            <Badge variant="destructive" className="text-xs">
                              Non-Veg
                            </Badge>
                          )}
                          {item.menuItem.spiceLevel === "hot" && (
                            <Flame className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Large touch-friendly action buttons */}
                    <div className="flex gap-2">
                      {item.status === "pending" && (
                        <Button
                          size="lg"
                          className="h-14 px-6 text-base gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() =>
                            handleItemAction(order.id, item.menuItem.id, "preparing")
                          }
                        >
                          <ChefHat className="h-5 w-5" />
                          START
                        </Button>
                      )}
                      {item.status === "preparing" && (
                        <Button
                          size="lg"
                          className="h-14 px-6 text-base gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleItemAction(order.id, item.menuItem.id, "ready")
                          }
                        >
                          <Bell className="h-5 w-5" />
                          READY
                        </Button>
                      )}
                      {item.status === "ready" && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-14 px-6 text-base gap-2 border-green-500 text-green-700"
                          onClick={() =>
                            handleItemAction(order.id, item.menuItem.id, "served")
                          }
                        >
                          <CheckCircle className="h-5 w-5" />
                          SERVED
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {unservedItems.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p className="text-lg font-bold text-green-600">All Items Served!</p>
                  </div>
                )}

                <Separator className="my-2" />

                {/* Bump / Complete Order */}
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base gap-2"
                    onClick={() => handleBumpAll(order.id)}
                  >
                    <ArrowRight className="h-5 w-5" />
                    Bump All
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeOrders.length === 0 && (
          <Card className="col-span-full border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-2xl font-bold text-muted-foreground">No Active Orders</p>
              <p className="text-muted-foreground mt-2">
                Orders will appear here when sent from POS
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
