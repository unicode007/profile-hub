-- 1. SUBSCRIPTION PLANS
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  max_hotels integer NOT NULL DEFAULT 1,
  max_users_per_tenant integer NOT NULL DEFAULT 5,
  max_rooms_per_hotel integer NOT NULL DEFAULT 50,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  trial_days integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subscription_plans_updated BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. TENANTS
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_user_id uuid,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled','trial')),
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. TENANT SUBSCRIPTIONS
CREATE TABLE public.tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','cancelled','expired')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uniq_active_subscription_per_tenant
  ON public.tenant_subscriptions(tenant_id) WHERE status IN ('trialing','active','past_due');
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tenant_subscriptions_updated BEFORE UPDATE ON public.tenant_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Seed plans + default tenant
INSERT INTO public.subscription_plans (name, code, description, price_monthly, price_yearly, max_hotels, max_users_per_tenant, max_rooms_per_hotel, features, sort_order) VALUES
  ('Starter','starter','Single hotel, basic features', 999, 9990, 1, 5, 50,
    '{"dynamic_pricing": false, "advanced_reports": false, "restaurant_pos": true, "housekeeping": true}'::jsonb, 1),
  ('Growth','growth','Up to 3 hotels, dynamic pricing', 2999, 29990, 3, 25, 150,
    '{"dynamic_pricing": true, "advanced_reports": true, "restaurant_pos": true, "housekeeping": true, "minibar": true}'::jsonb, 2),
  ('Enterprise','enterprise','Unlimited hotels, all features', 9999, 99990, 999, 999, 999,
    '{"dynamic_pricing": true, "advanced_reports": true, "restaurant_pos": true, "housekeeping": true, "minibar": true, "night_audit": true, "procurement": true}'::jsonb, 3);

INSERT INTO public.tenants (id, name, slug, status, contact_email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default', 'active', 'admin@example.com');

INSERT INTO public.tenant_subscriptions (tenant_id, plan_id, status, billing_cycle, current_period_end)
SELECT '00000000-0000-0000-0000-000000000001', id, 'active', 'yearly', now() + interval '1 year'
FROM public.subscription_plans WHERE code = 'enterprise';

-- 5. tenant_id on hotels
ALTER TABLE public.hotels ADD COLUMN tenant_id uuid;
UPDATE public.hotels SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
ALTER TABLE public.hotels ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.hotels
  ADD CONSTRAINT hotels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_hotels_tenant_id ON public.hotels(tenant_id);

-- 6. MENUS + ROLE PERMISSIONS
CREATE TABLE public.hotel_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.hotel_menus(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  icon text,
  route text,
  required_feature text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key)
);
ALTER TABLE public.hotel_menus ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_hotel_menus_tenant_id ON public.hotel_menus(tenant_id);

CREATE TABLE public.hotel_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  menu_id uuid NOT NULL REFERENCES public.hotel_menus(id) ON DELETE CASCADE,
  can_view boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_update boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  can_report boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hotel_id, role, menu_id)
);
ALTER TABLE public.hotel_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_hotel_role_permissions_hotel_id ON public.hotel_role_permissions(hotel_id);

-- 7. PUBLIC LISTINGS
CREATE TABLE public.hotel_public_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL UNIQUE REFERENCES public.hotels(id) ON DELETE CASCADE,
  is_public boolean NOT NULL DEFAULT false,
  slug text UNIQUE,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  cover_image_url text,
  short_summary text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hotel_public_listings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_hotel_public_listings_updated BEFORE UPDATE ON public.hotel_public_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. HELPERS
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.tenants WHERE owner_user_id = _user_id
  UNION
  SELECT DISTINCT h.tenant_id
  FROM public.hotels h
  JOIN public.user_roles ur ON ur.hotel_id = h.id
  WHERE ur.user_id = _user_id AND ur.hotel_id IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.get_tenant_active_plan(_tenant_id uuid)
RETURNS public.subscription_plans LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.* FROM public.tenant_subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.tenant_id = _tenant_id AND s.status IN ('trialing','active','past_due')
  ORDER BY s.created_at DESC LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.tenant_has_feature(_tenant_id uuid, _feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT (p.features ->> _feature)::boolean FROM public.get_tenant_active_plan(_tenant_id) p),
    false
  )
$$;

-- 9. PLAN LIMIT TRIGGERS
CREATE OR REPLACE FUNCTION public.enforce_hotel_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_count int; plan_max int;
BEGIN
  SELECT max_hotels INTO plan_max FROM public.get_tenant_active_plan(NEW.tenant_id);
  IF plan_max IS NULL THEN
    RAISE EXCEPTION 'Tenant % has no active subscription', NEW.tenant_id USING ERRCODE='check_violation';
  END IF;
  SELECT count(*) INTO current_count FROM public.hotels WHERE tenant_id = NEW.tenant_id;
  IF current_count >= plan_max THEN
    RAISE EXCEPTION 'Plan limit reached: maximum % hotels allowed', plan_max USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_enforce_hotel_limit BEFORE INSERT ON public.hotels
FOR EACH ROW EXECUTE FUNCTION public.enforce_hotel_limit();

CREATE OR REPLACE FUNCTION public.enforce_user_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tenant uuid; plan_max int; current_count int;
BEGIN
  IF NEW.hotel_id IS NULL THEN RETURN NEW; END IF;
  SELECT tenant_id INTO tenant FROM public.hotels WHERE id = NEW.hotel_id;
  IF tenant IS NULL THEN RETURN NEW; END IF;
  SELECT max_users_per_tenant INTO plan_max FROM public.get_tenant_active_plan(tenant);
  IF plan_max IS NULL THEN
    RAISE EXCEPTION 'Tenant % has no active subscription', tenant USING ERRCODE='check_violation';
  END IF;
  SELECT count(DISTINCT ur.user_id) INTO current_count
  FROM public.user_roles ur JOIN public.hotels h ON h.id = ur.hotel_id
  WHERE h.tenant_id = tenant;
  IF current_count >= plan_max
     AND NOT EXISTS (
       SELECT 1 FROM public.user_roles ur2 JOIN public.hotels h2 ON h2.id = ur2.hotel_id
       WHERE h2.tenant_id = tenant AND ur2.user_id = NEW.user_id
     )
  THEN
    RAISE EXCEPTION 'Plan limit reached: maximum % users for this tenant', plan_max USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_enforce_user_limit BEFORE INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_limit();

CREATE OR REPLACE FUNCTION public.enforce_room_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tenant uuid; plan_max int; current_count int;
BEGIN
  SELECT tenant_id INTO tenant FROM public.hotels WHERE id = NEW.hotel_id;
  IF tenant IS NULL THEN RETURN NEW; END IF;
  SELECT max_rooms_per_hotel INTO plan_max FROM public.get_tenant_active_plan(tenant);
  IF plan_max IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO current_count FROM public.physical_rooms WHERE hotel_id = NEW.hotel_id;
  IF current_count >= plan_max THEN
    RAISE EXCEPTION 'Plan limit reached: maximum % rooms allowed per hotel', plan_max USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_enforce_room_limit BEFORE INSERT ON public.physical_rooms
FOR EACH ROW EXECUTE FUNCTION public.enforce_room_limit();

-- 10. RLS POLICIES
-- subscription_plans
CREATE POLICY "View active plans" ON public.subscription_plans FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Platform admins manage plans" ON public.subscription_plans FOR ALL
  USING (public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));

-- tenants
CREATE POLICY "View own tenant" ON public.tenants FOR SELECT
  USING (owner_user_id = auth.uid()
    OR id IN (SELECT public.get_user_tenant_ids(auth.uid()))
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Update own tenant" ON public.tenants FOR UPDATE
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Create tenant" ON public.tenants FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Delete tenant" ON public.tenants FOR DELETE
  USING (public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));

-- tenant_subscriptions
CREATE POLICY "View subscription" ON public.tenant_subscriptions FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
    OR tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Manage subscriptions" ON public.tenant_subscriptions FOR ALL
  USING (public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));

-- hotel_menus
CREATE POLICY "View tenant menus" ON public.hotel_menus FOR SELECT
  USING (tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
    OR tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Manage tenant menus" ON public.hotel_menus FOR ALL
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
    OR public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
    OR public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));

-- hotel_role_permissions
CREATE POLICY "View role perms" ON public.hotel_role_permissions FOR SELECT
  USING (hotel_id IN (SELECT public.get_user_hotel_ids(auth.uid()))
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Manage role perms" ON public.hotel_role_permissions FOR ALL
  USING (public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));

-- hotel_public_listings
CREATE POLICY "Public read listed" ON public.hotel_public_listings FOR SELECT
  USING (is_public = true);
CREATE POLICY "Owner read listings" ON public.hotel_public_listings FOR SELECT
  USING (hotel_id IN (
    SELECT h.id FROM public.hotels h
    WHERE h.tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
  ) OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Manage listings" ON public.hotel_public_listings FOR ALL
  USING (hotel_id IN (
    SELECT h.id FROM public.hotels h
    WHERE h.tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
  ) OR public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (hotel_id IN (
    SELECT h.id FROM public.hotels h
    WHERE h.tenant_id IN (SELECT id FROM public.tenants WHERE owner_user_id = auth.uid())
  ) OR public.has_role(auth.uid(),'hotel_admin')
    OR public.has_role(auth.uid(),'platform_admin')
    OR public.has_role(auth.uid(),'super_admin'));