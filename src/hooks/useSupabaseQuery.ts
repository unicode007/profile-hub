import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type TableName = "hotels" | "room_types" | "physical_rooms" | "bookings" | 
  "housekeeping_tasks" | "maintenance_tasks" | "menu_categories" | "menu_items" |
  "restaurant_orders" | "restaurant_order_items" | "minibar_items" | "minibar_charges" |
  "laundry_orders" | "lost_and_found" | "guest_communications" | "inventory_items" |
  "inventory_transactions" | "night_audit_logs" | "staff_shifts" | "table_reservations" |
  "folio_charges" | "profiles" | "user_roles";

export function useTableQuery<T = any>(
  table: TableName,
  options?: {
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    enabled?: boolean;
  }
) {
  const { currentHotelId } = useAuth();
  
  return useQuery({
    queryKey: [table, options?.filters, currentHotelId],
    queryFn: async () => {
      let query = supabase.from(table).select("*");
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Auto-filter by hotel_id if applicable
      if (currentHotelId && !options?.filters?.hotel_id && 
          table !== "hotels" && table !== "profiles" && table !== "user_roles") {
        query = query.eq("hotel_id", currentHotelId);
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
    enabled: options?.enabled !== false,
  });
}

export function useTableMutation<T = any>(table: TableName) {
  const queryClient = useQueryClient();
  const { currentHotelId, user } = useAuth();

  const insertMutation = useMutation({
    mutationFn: async (record: Partial<T> & Record<string, any>) => {
      const insertData: Record<string, any> = { ...record };
      if (currentHotelId && !insertData.hotel_id && table !== "hotels" && table !== "profiles" && table !== "user_roles") {
        insertData.hotel_id = currentHotelId;
      }
      if (user && !insertData.created_by && "created_by" in insertData === false) {
        // Only set if column exists - we'll let it fail gracefully
      }
      const { data, error } = await supabase.from(table).insert(insertData).select().single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<T> & Record<string, any>) => {
      const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return {
    insert: insertMutation,
    update: updateMutation,
    remove: deleteMutation,
  };
}
