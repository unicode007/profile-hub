
CREATE OR REPLACE FUNCTION public.setup_tenant_with_first_hotel(
  _tenant_name text,
  _tenant_slug text,
  _contact_email text,
  _plan_id uuid,
  _billing_cycle text,
  _hotel_name text,
  _hotel_city text,
  _hotel_address text,
  _hotel_phone text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_tenant uuid;
  v_hotel uuid;
  v_slug text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF EXISTS (SELECT 1 FROM public.tenants WHERE owner_user_id = v_user) THEN
    RAISE EXCEPTION 'You already own a workspace';
  END IF;

  v_slug := lower(regexp_replace(coalesce(_tenant_slug, _tenant_name), '[^a-zA-Z0-9]+', '-', 'g'));
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 6);
  END IF;

  INSERT INTO public.tenants (name, slug, owner_user_id, contact_email, status, trial_ends_at)
  VALUES (_tenant_name, v_slug, v_user, _contact_email, 'trial', now() + interval '14 days')
  RETURNING id INTO v_tenant;

  INSERT INTO public.tenant_subscriptions
    (tenant_id, plan_id, status, billing_cycle, current_period_end)
  VALUES
    (v_tenant, _plan_id, 'trialing', coalesce(_billing_cycle, 'monthly'), now() + interval '14 days');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user, 'tenant_owner')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.hotels (tenant_id, name, city, address, phone, created_by)
  VALUES (v_tenant, _hotel_name, _hotel_city, _hotel_address, _hotel_phone, v_user)
  RETURNING id INTO v_hotel;

  INSERT INTO public.user_roles (user_id, role, hotel_id)
  VALUES (v_user, 'hotel_admin', v_hotel)
  ON CONFLICT DO NOTHING;

  RETURN json_build_object('tenant_id', v_tenant, 'hotel_id', v_hotel, 'slug', v_slug);
END;
$$;

GRANT EXECUTE ON FUNCTION public.setup_tenant_with_first_hotel(text, text, text, uuid, text, text, text, text, text) TO authenticated;
