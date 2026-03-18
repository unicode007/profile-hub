import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useTableQuery(
  table: string,
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
      let query = (supabase.from(table as any) as any).select("*");
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
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
      return data as any[];
    },
    enabled: options?.enabled !== false,
  });
}

export function useTableMutation(table: string) {
  const queryClient = useQueryClient();
  const { currentHotelId, user } = useAuth();

  const insertMutation = useMutation({
    mutationFn: async (record: Record<string, any>) => {
      const insertData: Record<string, any> = { ...record };
      if (currentHotelId && !insertData.hotel_id && table !== "hotels" && table !== "profiles" && table !== "user_roles") {
        insertData.hotel_id = currentHotelId;
      }
      const { data, error } = await (supabase.from(table as any) as any).insert(insertData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [table] }); },
    onError: (error: Error) => { toast.error(`Failed: ${error.message}`); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await (supabase.from(table as any) as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [table] }); },
    onError: (error: Error) => { toast.error(`Failed: ${error.message}`); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [table] }); },
    onError: (error: Error) => { toast.error(`Failed: ${error.message}`); },
  });

  return { insert: insertMutation, update: updateMutation, remove: deleteMutation };
}
