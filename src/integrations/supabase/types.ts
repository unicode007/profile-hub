export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          adults: number | null
          booking_number: string
          check_in: string
          check_in_time: string | null
          check_out: string
          check_out_time: string | null
          children: number | null
          created_at: string
          created_by: string | null
          guest_country: string | null
          guest_email: string | null
          guest_first_name: string
          guest_last_name: string
          guest_phone: string | null
          guest_user_id: string | null
          hotel_id: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          physical_room_id: string | null
          room_plan: string | null
          room_type_id: string | null
          rooms_count: number | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          adults?: number | null
          booking_number?: string
          check_in: string
          check_in_time?: string | null
          check_out: string
          check_out_time?: string | null
          children?: number | null
          created_at?: string
          created_by?: string | null
          guest_country?: string | null
          guest_email?: string | null
          guest_first_name: string
          guest_last_name: string
          guest_phone?: string | null
          guest_user_id?: string | null
          hotel_id: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          physical_room_id?: string | null
          room_plan?: string | null
          room_type_id?: string | null
          rooms_count?: number | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          adults?: number | null
          booking_number?: string
          check_in?: string
          check_in_time?: string | null
          check_out?: string
          check_out_time?: string | null
          children?: number | null
          created_at?: string
          created_by?: string | null
          guest_country?: string | null
          guest_email?: string | null
          guest_first_name?: string
          guest_last_name?: string
          guest_phone?: string | null
          guest_user_id?: string | null
          hotel_id?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          physical_room_id?: string | null
          room_plan?: string | null
          room_type_id?: string | null
          rooms_count?: number | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_physical_room_id_fkey"
            columns: ["physical_room_id"]
            isOneToOne: false
            referencedRelation: "physical_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      folio_charges: {
        Row: {
          amount: number
          booking_id: string
          charge_type: string
          created_at: string
          created_by: string | null
          description: string
          hotel_id: string
          id: string
          status: string | null
        }
        Insert: {
          amount?: number
          booking_id: string
          charge_type: string
          created_at?: string
          created_by?: string | null
          description: string
          hotel_id: string
          id?: string
          status?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          charge_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          hotel_id?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folio_charges_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folio_charges_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipt_items: {
        Row: {
          accepted_quantity: number
          created_at: string
          grn_id: string
          id: string
          item_id: string | null
          item_name: string
          ordered_quantity: number
          po_item_id: string | null
          received_quantity: number
          rejected_quantity: number | null
          rejection_reason: string | null
          unit: string | null
        }
        Insert: {
          accepted_quantity?: number
          created_at?: string
          grn_id: string
          id?: string
          item_id?: string | null
          item_name: string
          ordered_quantity?: number
          po_item_id?: string | null
          received_quantity?: number
          rejected_quantity?: number | null
          rejection_reason?: string | null
          unit?: string | null
        }
        Update: {
          accepted_quantity?: number
          created_at?: string
          grn_id?: string
          id?: string
          item_id?: string | null
          item_name?: string
          ordered_quantity?: number
          po_item_id?: string | null
          received_quantity?: number
          rejected_quantity?: number | null
          rejection_reason?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipt_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receipts: {
        Row: {
          created_at: string
          grn_number: string
          hotel_id: string
          id: string
          notes: string | null
          po_id: string
          received_by: string | null
          received_by_name: string | null
          received_date: string | null
          status: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grn_number?: string
          hotel_id: string
          id?: string
          notes?: string | null
          po_id: string
          received_by?: string | null
          received_by_name?: string | null
          received_date?: string | null
          status?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grn_number?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          po_id?: string
          received_by?: string | null
          received_by_name?: string | null
          received_date?: string | null
          status?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_communications: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          created_at: string
          created_by: string | null
          guest_name: string | null
          hotel_id: string
          id: string
          message: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          resolved_at: string | null
          response: string | null
          room_number: string | null
          status: string | null
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          guest_name?: string | null
          hotel_id: string
          id?: string
          message?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          resolved_at?: string | null
          response?: string | null
          room_number?: string | null
          status?: string | null
          subject: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          guest_name?: string | null
          hotel_id?: string
          id?: string
          message?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          resolved_at?: string | null
          response?: string | null
          room_number?: string | null
          status?: string | null
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_communications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_communications_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string | null
          amenities: string[] | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          phone: string | null
          star_rating: number | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          phone?: string | null
          star_rating?: number | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          phone?: string | null
          star_rating?: number | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          hotel_id: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          room_id: string | null
          room_number: string | null
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          room_id?: string | null
          room_number?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          room_id?: string | null
          room_number?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "physical_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number | null
          hotel_id: string
          id: string
          is_active: boolean | null
          last_restocked: string | null
          location: string | null
          max_stock: number | null
          min_stock: number | null
          name: string
          sku: string | null
          supplier: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          hotel_id: string
          id?: string
          is_active?: boolean | null
          last_restocked?: string | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          last_restocked?: string | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          hotel_id: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hotel_id: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hotel_id?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      laundry_orders: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          delivery_time: string | null
          guest_name: string | null
          hotel_id: string
          id: string
          is_express: boolean | null
          items: Json
          notes: string | null
          pickup_time: string | null
          room_number: string | null
          status: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_time?: string | null
          guest_name?: string | null
          hotel_id: string
          id?: string
          is_express?: boolean | null
          items?: Json
          notes?: string | null
          pickup_time?: string | null
          room_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_time?: string | null
          guest_name?: string | null
          hotel_id?: string
          id?: string
          is_express?: boolean | null
          items?: Json
          notes?: string | null
          pickup_time?: string | null
          room_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laundry_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laundry_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      lost_and_found: {
        Row: {
          category: string | null
          claim_date: string | null
          claim_verified: boolean | null
          claimed_by: string | null
          created_at: string
          created_by: string | null
          description: string | null
          found_by: string | null
          found_date: string | null
          hotel_id: string
          id: string
          image_url: string | null
          item_name: string
          location_found: string | null
          notes: string | null
          status: string | null
          storage_location: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          claim_date?: string | null
          claim_verified?: boolean | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          found_by?: string | null
          found_date?: string | null
          hotel_id: string
          id?: string
          image_url?: string | null
          item_name: string
          location_found?: string | null
          notes?: string | null
          status?: string | null
          storage_location?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          claim_date?: string | null
          claim_verified?: boolean | null
          claimed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          found_by?: string | null
          found_date?: string | null
          hotel_id?: string
          id?: string
          image_url?: string | null
          item_name?: string
          location_found?: string | null
          notes?: string | null
          status?: string | null
          storage_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lost_and_found_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          assigned_to_name: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_cost: number | null
          hotel_id: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          room_id: string | null
          room_number: string | null
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          hotel_id: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          room_id?: string | null
          room_number?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          hotel_id?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          room_id?: string | null
          room_number?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "physical_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      material_categories: {
        Row: {
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          hotel_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          hotel_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          hotel_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category_id: string | null
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          image_url: string | null
          is_available: boolean | null
          is_chef_special: boolean | null
          is_popular: boolean | null
          is_veg: boolean | null
          name: string
          preparation_time: number | null
          price: number
          spice_level: string | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_chef_special?: boolean | null
          is_popular?: boolean | null
          is_veg?: boolean | null
          name: string
          preparation_time?: number | null
          price?: number
          spice_level?: string | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_chef_special?: boolean | null
          is_popular?: boolean | null
          is_veg?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          spice_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      minibar_charges: {
        Row: {
          booking_id: string | null
          created_at: string
          guest_name: string | null
          hotel_id: string
          id: string
          items: Json
          recorded_by: string | null
          room_id: string | null
          room_number: string | null
          status: string | null
          total_amount: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          guest_name?: string | null
          hotel_id: string
          id?: string
          items?: Json
          recorded_by?: string | null
          room_id?: string | null
          room_number?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          guest_name?: string | null
          hotel_id?: string
          id?: string
          items?: Json
          recorded_by?: string | null
          room_id?: string | null
          room_number?: string | null
          status?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minibar_charges_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minibar_charges_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minibar_charges_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "physical_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      minibar_items: {
        Row: {
          category: string | null
          created_at: string
          hotel_id: string
          id: string
          is_active: boolean | null
          max_stock: number | null
          min_stock: number | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minibar_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      night_audit_logs: {
        Row: {
          audit_date: string
          audited_by: string | null
          cancellations: number | null
          card_collected: number | null
          cash_collected: number | null
          check_ins: number | null
          check_outs: number | null
          created_at: string
          food_revenue: number | null
          hotel_id: string
          id: string
          no_shows: number | null
          notes: string | null
          occupied_rooms: number | null
          other_revenue: number | null
          pending_payments: number | null
          room_revenue: number | null
          total_revenue: number | null
          total_rooms: number | null
          upi_collected: number | null
        }
        Insert: {
          audit_date?: string
          audited_by?: string | null
          cancellations?: number | null
          card_collected?: number | null
          cash_collected?: number | null
          check_ins?: number | null
          check_outs?: number | null
          created_at?: string
          food_revenue?: number | null
          hotel_id: string
          id?: string
          no_shows?: number | null
          notes?: string | null
          occupied_rooms?: number | null
          other_revenue?: number | null
          pending_payments?: number | null
          room_revenue?: number | null
          total_revenue?: number | null
          total_rooms?: number | null
          upi_collected?: number | null
        }
        Update: {
          audit_date?: string
          audited_by?: string | null
          cancellations?: number | null
          card_collected?: number | null
          cash_collected?: number | null
          check_ins?: number | null
          check_outs?: number | null
          created_at?: string
          food_revenue?: number | null
          hotel_id?: string
          id?: string
          no_shows?: number | null
          notes?: string | null
          occupied_rooms?: number | null
          other_revenue?: number | null
          pending_payments?: number | null
          room_revenue?: number | null
          total_revenue?: number | null
          total_rooms?: number | null
          upi_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "night_audit_logs_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_rooms: {
        Row: {
          created_at: string
          current_booking_id: string | null
          floor: number | null
          hotel_id: string
          id: string
          key_card_number: string | null
          last_cleaned: string | null
          last_inspection: string | null
          notes: string | null
          room_number: string
          room_type_id: string
          status: Database["public"]["Enums"]["room_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_booking_id?: string | null
          floor?: number | null
          hotel_id: string
          id?: string
          key_card_number?: string | null
          last_cleaned?: string | null
          last_inspection?: string | null
          notes?: string | null
          room_number: string
          room_type_id: string
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_booking_id?: string | null
          floor?: number | null
          hotel_id?: string
          id?: string
          key_card_number?: string | null
          last_cleaned?: string | null
          last_inspection?: string | null
          notes?: string | null
          room_number?: string
          room_type_id?: string
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          po_id: string
          quantity: number
          received_quantity: number | null
          total_price: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          po_id: string
          quantity?: number
          received_quantity?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          po_id?: string
          quantity?: number
          received_quantity?: number | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          delivery_address: string | null
          expected_delivery: string | null
          hotel_id: string
          id: string
          notes: string | null
          payment_terms: string | null
          po_number: string
          purchase_request_id: string | null
          quotation_id: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          delivery_address?: string | null
          expected_delivery?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          purchase_request_id?: string | null
          quotation_id?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          delivery_address?: string | null
          expected_delivery?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          purchase_request_id?: string | null
          quotation_id?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          quantity: number
          request_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity?: number
          request_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number
          request_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department: string | null
          hotel_id: string
          id: string
          notes: string | null
          priority: string | null
          request_number: string
          requested_by: string | null
          requested_by_name: string | null
          required_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          priority?: string | null
          request_number?: string
          requested_by?: string | null
          requested_by_name?: string | null
          required_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          priority?: string | null
          request_number?: string
          requested_by?: string | null
          requested_by_name?: string | null
          required_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          quantity: number
          quotation_id: string
          total_price: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          quantity?: number
          quotation_id: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number
          quotation_id?: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_requests: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          hotel_id: string
          id: string
          notes: string | null
          purchase_request_id: string | null
          rfq_number: string
          status: string | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          hotel_id: string
          id?: string
          notes?: string | null
          purchase_request_id?: string | null
          rfq_number?: string
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          hotel_id?: string
          id?: string
          notes?: string | null
          purchase_request_id?: string | null
          rfq_number?: string
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_requests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_requests_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_days: number | null
          hotel_id: string
          id: string
          notes: string | null
          payment_terms: string | null
          quotation_number: string
          rfq_id: string | null
          status: string | null
          supplier_id: string
          total_amount: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_days?: number | null
          hotel_id: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quotation_number?: string
          rfq_id?: string | null
          status?: string | null
          supplier_id: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_days?: number | null
          hotel_id?: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quotation_number?: string
          rfq_id?: string | null
          status?: string | null
          supplier_id?: string
          total_amount?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          kot_time: string | null
          menu_item_id: string | null
          notes: string | null
          order_id: string
          quantity: number | null
          status: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          kot_time?: string | null
          menu_item_id?: string | null
          notes?: string | null
          order_id: string
          quantity?: number | null
          status?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          kot_time?: string | null
          menu_item_id?: string | null
          notes?: string | null
          order_id?: string
          quantity?: number | null
          status?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "restaurant_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_orders: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          guest_name: string | null
          hotel_id: string
          id: string
          kot_numbers: number[] | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          room_number: string | null
          server_name: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number | null
          table_number: number
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          guest_name?: string | null
          hotel_id: string
          id?: string
          kot_numbers?: number[] | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          room_number?: string | null
          server_name?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          table_number: number
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          guest_name?: string | null
          hotel_id?: string
          id?: string
          kot_numbers?: number[] | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          room_number?: string | null
          server_name?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          table_number?: number
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[] | null
          base_price: number
          bed_type: string | null
          created_at: string
          description: string | null
          hotel_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          max_occupancy: number | null
          name: string
          size_sqft: number | null
          total_rooms: number | null
          updated_at: string
          view_type: string | null
        }
        Insert: {
          amenities?: string[] | null
          base_price?: number
          bed_type?: string | null
          created_at?: string
          description?: string | null
          hotel_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_occupancy?: number | null
          name: string
          size_sqft?: number | null
          total_rooms?: number | null
          updated_at?: string
          view_type?: string | null
        }
        Update: {
          amenities?: string[] | null
          base_price?: number
          bed_type?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_occupancy?: number | null
          name?: string
          size_sqft?: number | null
          total_rooms?: number | null
          updated_at?: string
          view_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_types_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_shifts: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          hotel_id: string
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          hotel_id: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          status?: string | null
          user_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          hotel_id?: string
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_shifts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          gst_number: string | null
          hotel_id: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          guest_name: string
          hotel_id: string
          id: string
          party_size: number | null
          phone: string | null
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string | null
          table_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          guest_name: string
          hotel_id: string
          id?: string
          party_size?: number | null
          phone?: string | null
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string | null
          table_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          guest_name?: string
          hotel_id?: string
          id?: string
          party_size?: number | null
          phone?: string | null
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string | null
          table_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "table_reservations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          hotel_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_hotel_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "hotel_admin"
        | "front_desk"
        | "housekeeping"
        | "maintenance"
        | "restaurant"
        | "inventory"
        | "laundry"
        | "guest_comm"
        | "lost_found"
        | "staff"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
        | "completed"
        | "no_show"
      order_status: "active" | "billed" | "paid" | "cancelled"
      payment_method: "cash" | "card" | "upi" | "room" | "payathotel"
      room_status:
        | "available"
        | "occupied"
        | "dirty"
        | "cleaning"
        | "maintenance"
        | "blocked"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "hotel_admin",
        "front_desk",
        "housekeeping",
        "maintenance",
        "restaurant",
        "inventory",
        "laundry",
        "guest_comm",
        "lost_found",
        "staff",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "completed",
        "no_show",
      ],
      order_status: ["active", "billed", "paid", "cancelled"],
      payment_method: ["cash", "card", "upi", "room", "payathotel"],
      room_status: [
        "available",
        "occupied",
        "dirty",
        "cleaning",
        "maintenance",
        "blocked",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
