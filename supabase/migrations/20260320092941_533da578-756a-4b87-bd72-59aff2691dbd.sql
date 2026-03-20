
-- Suppliers table
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  gst_number text,
  category text DEFAULT 'general',
  payment_terms text DEFAULT 'Net 30',
  rating integer DEFAULT 3,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Purchase requests
CREATE TABLE public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  request_number text NOT NULL DEFAULT ('PR-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  requested_by uuid,
  requested_by_name text,
  department text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'draft',
  notes text,
  required_date date,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase request items
CREATE TABLE public.purchase_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_id uuid REFERENCES public.inventory_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit text DEFAULT 'pieces',
  estimated_cost numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Quotation requests (RFQ)
CREATE TABLE public.quotation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  rfq_number text NOT NULL DEFAULT ('RFQ-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  purchase_request_id uuid REFERENCES public.purchase_requests(id),
  supplier_id uuid REFERENCES public.suppliers(id),
  status text DEFAULT 'sent',
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Quotations (received from suppliers)
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  quotation_number text NOT NULL DEFAULT ('QT-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  rfq_id uuid REFERENCES public.quotation_requests(id),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  status text DEFAULT 'received',
  total_amount numeric DEFAULT 0,
  valid_until date,
  payment_terms text,
  delivery_days integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Quotation items
CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_id uuid REFERENCES public.inventory_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit text DEFAULT 'pieces',
  unit_price numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase orders
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  po_number text NOT NULL DEFAULT ('PO-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  quotation_id uuid REFERENCES public.quotations(id),
  purchase_request_id uuid REFERENCES public.purchase_requests(id),
  status text DEFAULT 'draft',
  subtotal numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_terms text,
  expected_delivery date,
  delivery_address text,
  notes text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Purchase order items
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_id uuid REFERENCES public.inventory_items(id),
  quantity integer NOT NULL DEFAULT 1,
  unit text DEFAULT 'pieces',
  unit_price numeric DEFAULT 0,
  total_price numeric DEFAULT 0,
  received_quantity integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Goods receipt notes
CREATE TABLE public.goods_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  grn_number text NOT NULL DEFAULT ('GRN-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  received_by uuid,
  received_by_name text,
  status text DEFAULT 'pending',
  notes text,
  received_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Goods receipt items
CREATE TABLE public.goods_receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id uuid NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  po_item_id uuid REFERENCES public.purchase_order_items(id),
  item_name text NOT NULL,
  item_id uuid REFERENCES public.inventory_items(id),
  ordered_quantity integer NOT NULL DEFAULT 0,
  received_quantity integer NOT NULL DEFAULT 0,
  accepted_quantity integer NOT NULL DEFAULT 0,
  rejected_quantity integer DEFAULT 0,
  rejection_reason text,
  unit text DEFAULT 'pieces',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Material categories
CREATE TABLE public.material_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_id uuid REFERENCES public.material_categories(id),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for suppliers
CREATE POLICY "Manage suppliers" ON public.suppliers FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View suppliers" ON public.suppliers FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for purchase_requests
CREATE POLICY "Manage purchase requests" ON public.purchase_requests FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View purchase requests" ON public.purchase_requests FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for purchase_request_items
CREATE POLICY "Manage pr items" ON public.purchase_request_items FOR ALL TO public
  USING (request_id IN (SELECT id FROM public.purchase_requests WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));
CREATE POLICY "View pr items" ON public.purchase_request_items FOR SELECT TO authenticated
  USING (request_id IN (SELECT id FROM public.purchase_requests WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));

-- RLS for quotation_requests
CREATE POLICY "Manage rfqs" ON public.quotation_requests FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View rfqs" ON public.quotation_requests FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for quotations
CREATE POLICY "Manage quotations" ON public.quotations FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View quotations" ON public.quotations FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for quotation_items
CREATE POLICY "Manage qt items" ON public.quotation_items FOR ALL TO public
  USING (quotation_id IN (SELECT id FROM public.quotations WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));
CREATE POLICY "View qt items" ON public.quotation_items FOR SELECT TO authenticated
  USING (quotation_id IN (SELECT id FROM public.quotations WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));

-- RLS for purchase_orders
CREATE POLICY "Manage pos" ON public.purchase_orders FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View pos" ON public.purchase_orders FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for purchase_order_items
CREATE POLICY "Manage po items" ON public.purchase_order_items FOR ALL TO public
  USING (po_id IN (SELECT id FROM public.purchase_orders WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));
CREATE POLICY "View po items" ON public.purchase_order_items FOR SELECT TO authenticated
  USING (po_id IN (SELECT id FROM public.purchase_orders WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));

-- RLS for goods_receipts
CREATE POLICY "Manage grns" ON public.goods_receipts FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View grns" ON public.goods_receipts FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- RLS for goods_receipt_items
CREATE POLICY "Manage grn items" ON public.goods_receipt_items FOR ALL TO public
  USING (grn_id IN (SELECT id FROM public.goods_receipts WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));
CREATE POLICY "View grn items" ON public.goods_receipt_items FOR SELECT TO authenticated
  USING (grn_id IN (SELECT id FROM public.goods_receipts WHERE hotel_id IN (SELECT get_user_hotel_ids(auth.uid()))));

-- RLS for material_categories
CREATE POLICY "Manage material cats" ON public.material_categories FOR ALL TO public
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'hotel_admin') OR has_role(auth.uid(), 'inventory'));
CREATE POLICY "View material cats" ON public.material_categories FOR SELECT TO authenticated
  USING (hotel_id IN (SELECT get_user_hotel_ids(auth.uid())) OR has_role(auth.uid(), 'super_admin'));

-- Update triggers
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotation_requests_updated_at BEFORE UPDATE ON public.quotation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goods_receipts_updated_at BEFORE UPDATE ON public.goods_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
