
-- ============================================
-- 1. ENUM TYPES
-- ============================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'hotel_admin', 'front_desk', 'housekeeping', 'maintenance', 'restaurant', 'inventory', 'laundry', 'guest_comm', 'lost_found', 'staff');

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed', 'no_show');

CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'dirty', 'cleaning', 'maintenance', 'blocked');

CREATE TYPE public.order_status AS ENUM ('active', 'billed', 'paid', 'cancelled');

CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'upi', 'room', 'payathotel');

-- ============================================
-- 2. UTILITY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 3. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. USER ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  hotel_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, hotel_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_hotel_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT hotel_id FROM public.user_roles WHERE user_id = _user_id AND hotel_id IS NOT NULL
$$;

-- ============================================
-- 5. HOTELS TABLE
-- ============================================
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  email TEXT,
  website TEXT,
  star_rating INTEGER DEFAULT 3,
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '12:00',
  image_url TEXT,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. ROOM TYPES TABLE
-- ============================================
CREATE TABLE public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  max_occupancy INTEGER DEFAULT 2,
  size_sqft INTEGER,
  bed_type TEXT,
  view_type TEXT,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  total_rooms INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON public.room_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. PHYSICAL ROOMS TABLE
-- ============================================
CREATE TABLE public.physical_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor INTEGER DEFAULT 1,
  status room_status DEFAULT 'available',
  key_card_number TEXT,
  notes TEXT,
  last_cleaned TIMESTAMPTZ,
  last_inspection TIMESTAMPTZ,
  current_booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, room_number)
);
ALTER TABLE public.physical_rooms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_physical_rooms_updated_at BEFORE UPDATE ON public.physical_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. BOOKINGS TABLE
-- ============================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES public.room_types(id),
  physical_room_id UUID REFERENCES public.physical_rooms(id),
  guest_user_id UUID REFERENCES auth.users(id),
  booking_number TEXT NOT NULL UNIQUE DEFAULT 'BK' || upper(substr(gen_random_uuid()::text, 1, 8)),
  guest_first_name TEXT NOT NULL,
  guest_last_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_country TEXT DEFAULT 'India',
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  rooms_count INTEGER DEFAULT 1,
  room_plan TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status booking_status DEFAULT 'pending',
  payment_method payment_method,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  special_requests TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. HOUSEKEEPING TASKS TABLE
-- ============================================
CREATE TABLE public.housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.physical_rooms(id),
  room_number TEXT,
  task_type TEXT NOT NULL DEFAULT 'cleaning',
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_name TEXT,
  description TEXT,
  notes TEXT,
  scheduled_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_housekeeping_updated_at BEFORE UPDATE ON public.housekeeping_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 10. MAINTENANCE TASKS TABLE
-- ============================================
CREATE TABLE public.maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.physical_rooms(id),
  room_number TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_to_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  scheduled_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON public.maintenance_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. RESTAURANT MENU
-- ============================================
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_veg BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15,
  image_url TEXT,
  spice_level TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_chef_special BOOLEAN DEFAULT false,
  allergens TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. RESTAURANT ORDERS
-- ============================================
CREATE TABLE public.restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  guest_name TEXT,
  room_number TEXT,
  status order_status DEFAULT 'active',
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method payment_method,
  server_name TEXT,
  kot_numbers INTEGER[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_restaurant_orders_updated_at BEFORE UPDATE ON public.restaurant_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.restaurant_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  kot_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurant_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 13. MINIBAR
-- ============================================
CREATE TABLE public.minibar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 10,
  min_stock INTEGER DEFAULT 2,
  max_stock INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.minibar_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_minibar_items_updated_at BEFORE UPDATE ON public.minibar_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.minibar_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.physical_rooms(id),
  booking_id UUID REFERENCES public.bookings(id),
  guest_name TEXT,
  room_number TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.minibar_charges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. LAUNDRY ORDERS
-- ============================================
CREATE TABLE public.laundry_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  room_number TEXT,
  guest_name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC DEFAULT 0,
  is_express BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.laundry_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_laundry_orders_updated_at BEFORE UPDATE ON public.laundry_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 15. LOST AND FOUND
-- ============================================
CREATE TABLE public.lost_and_found (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  location_found TEXT,
  found_by TEXT,
  found_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'stored',
  claimed_by TEXT,
  claim_date DATE,
  claim_verified BOOLEAN DEFAULT false,
  storage_location TEXT,
  image_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_lost_found_updated_at BEFORE UPDATE ON public.lost_and_found
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 16. GUEST COMMUNICATIONS
-- ============================================
CREATE TABLE public.guest_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  room_number TEXT,
  guest_name TEXT,
  type TEXT NOT NULL DEFAULT 'request',
  priority task_priority DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  subject TEXT NOT NULL,
  message TEXT,
  response TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_communications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_guest_comm_updated_at BEFORE UPDATE ON public.guest_communications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 17. INVENTORY
-- ============================================
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sku TEXT,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  max_stock INTEGER DEFAULT 100,
  unit TEXT DEFAULT 'pieces',
  unit_cost NUMERIC DEFAULT 0,
  supplier TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 18. NIGHT AUDIT
-- ============================================
CREATE TABLE public.night_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_rooms INTEGER DEFAULT 0,
  occupied_rooms INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  room_revenue NUMERIC DEFAULT 0,
  food_revenue NUMERIC DEFAULT 0,
  other_revenue NUMERIC DEFAULT 0,
  cash_collected NUMERIC DEFAULT 0,
  card_collected NUMERIC DEFAULT 0,
  upi_collected NUMERIC DEFAULT 0,
  pending_payments NUMERIC DEFAULT 0,
  check_ins INTEGER DEFAULT 0,
  check_outs INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  notes TEXT,
  audited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, audit_date)
);
ALTER TABLE public.night_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 19. STAFF SHIFTS
-- ============================================
CREATE TABLE public.staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shift_type TEXT NOT NULL DEFAULT 'morning',
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 20. TABLE RESERVATIONS
-- ============================================
CREATE TABLE public.table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  party_size INTEGER DEFAULT 2,
  special_requests TEXT,
  status TEXT DEFAULT 'confirmed',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_table_reservations_updated_at BEFORE UPDATE ON public.table_reservations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 21. FOLIO CHARGES
-- ============================================
CREATE TABLE public.folio_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  charge_type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.folio_charges ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin'));
CREATE POLICY "Super admin can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Hotel admin can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'hotel_admin'));

-- Hotels
CREATE POLICY "Users can view assigned hotels" ON public.hotels
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'super_admin') OR
    id IN (SELECT public.get_user_hotel_ids(auth.uid()))
  );
CREATE POLICY "Admin can manage hotels" ON public.hotels
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin'));

-- Room Types
CREATE POLICY "View room types" ON public.room_types FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage room types" ON public.room_types FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'inventory'));

-- Physical Rooms
CREATE POLICY "View physical rooms" ON public.physical_rooms FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage physical rooms" ON public.physical_rooms FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'front_desk') OR public.has_role(auth.uid(), 'housekeeping'));

-- Bookings
CREATE POLICY "View bookings" ON public.bookings FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR guest_user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage bookings" ON public.bookings FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'front_desk'));

-- Housekeeping
CREATE POLICY "View housekeeping" ON public.housekeeping_tasks FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage housekeeping" ON public.housekeeping_tasks FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'housekeeping'));

-- Maintenance
CREATE POLICY "View maintenance" ON public.maintenance_tasks FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage maintenance" ON public.maintenance_tasks FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'maintenance'));

-- Menu Categories
CREATE POLICY "View menu categories" ON public.menu_categories FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage menu categories" ON public.menu_categories FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'restaurant'));

-- Menu Items
CREATE POLICY "View menu items" ON public.menu_items FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage menu items" ON public.menu_items FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'restaurant'));

-- Restaurant Orders
CREATE POLICY "View restaurant orders" ON public.restaurant_orders FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage restaurant orders" ON public.restaurant_orders FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'restaurant'));

-- Restaurant Order Items
CREATE POLICY "View order items" ON public.restaurant_order_items FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM public.restaurant_orders WHERE hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid()))));
CREATE POLICY "Manage order items" ON public.restaurant_order_items FOR ALL
  USING (order_id IN (SELECT id FROM public.restaurant_orders WHERE hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid()))));

-- Minibar Items
CREATE POLICY "View minibar items" ON public.minibar_items FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage minibar items" ON public.minibar_items FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'housekeeping'));

-- Minibar Charges
CREATE POLICY "View minibar charges" ON public.minibar_charges FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage minibar charges" ON public.minibar_charges FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'front_desk') OR public.has_role(auth.uid(), 'housekeeping'));

-- Laundry
CREATE POLICY "View laundry orders" ON public.laundry_orders FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage laundry orders" ON public.laundry_orders FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'laundry'));

-- Lost and Found
CREATE POLICY "View lost and found" ON public.lost_and_found FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage lost and found" ON public.lost_and_found FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'lost_found') OR public.has_role(auth.uid(), 'front_desk'));

-- Guest Communications
CREATE POLICY "View guest comms" ON public.guest_communications FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage guest comms" ON public.guest_communications FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'guest_comm') OR public.has_role(auth.uid(), 'front_desk'));

-- Inventory
CREATE POLICY "View inventory" ON public.inventory_items FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage inventory" ON public.inventory_items FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'inventory'));

CREATE POLICY "View inventory txns" ON public.inventory_transactions FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage inventory txns" ON public.inventory_transactions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'inventory'));

-- Night Audit
CREATE POLICY "View night audit" ON public.night_audit_logs FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage night audit" ON public.night_audit_logs FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin'));

-- Staff Shifts
CREATE POLICY "View staff shifts" ON public.staff_shifts FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage staff shifts" ON public.staff_shifts FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin'));

-- Table Reservations
CREATE POLICY "View table reservations" ON public.table_reservations FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage table reservations" ON public.table_reservations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'restaurant'));

-- Folio Charges
CREATE POLICY "View folio charges" ON public.folio_charges FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid())) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Manage folio charges" ON public.folio_charges FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'hotel_admin') OR public.has_role(auth.uid(), 'front_desk'));
