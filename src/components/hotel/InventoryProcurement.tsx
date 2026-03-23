import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Package, Plus, Search, Edit, Trash2, Eye, MoreHorizontal,
  ShoppingCart, FileText, Send, CheckCircle, XCircle, Truck,
  Users, Star, Phone, Mail, MapPin, ClipboardList, ArrowRight,
  BarChart3, AlertTriangle, TrendingUp, TrendingDown, Box, Layers,
  Receipt, Filter, History, FolderTree, Recycle, ArrowUpDown,
  Download, Printer, Calendar, Hash, Barcode, Clock, Warehouse,
  PieChart, Activity, RefreshCw, ArrowDown, ArrowUp, Minus
} from "lucide-react";
import { format } from "date-fns";

// ============ TYPES ============
interface Supplier {
  id: string; name: string; contact_person: string; email: string; phone: string;
  address: string; city: string; state: string; pincode: string; gst_number: string; pan_number: string;
  category: string; payment_terms: string; rating: number; is_active: boolean; notes: string;
  bank_name: string; bank_account: string; ifsc_code: string; credit_limit: number;
  total_orders: number; total_value: number; last_order_date: string;
}

interface InventoryItem {
  id: string; name: string; category: string; sub_category: string; sku: string; hsn_code: string;
  barcode: string; current_stock: number; min_stock: number; max_stock: number; reorder_level: number;
  unit: string; unit_cost: number; selling_price: number; tax_rate: number;
  supplier: string; supplier_id: string; location: string; shelf_number: string;
  batch_number: string; expiry_date: string; lead_time_days: number;
  is_active: boolean; is_perishable: boolean; is_returnable: boolean;
  last_restocked: string; last_issued: string; avg_daily_consumption: number;
  image_url: string; description: string; brand: string; manufacturer: string;
}

interface MaterialCategory {
  id: string; name: string; parent_id: string | null; description: string;
  item_count: number; is_active: boolean;
}

interface StockTransaction {
  id: string; item_id: string; item_name: string; transaction_type: string;
  quantity: number; unit: string; before_qty: number; after_qty: number;
  reference_type: string; reference_number: string;
  performed_by: string; notes: string; created_at: string;
}

interface WastageRecord {
  id: string; item_id: string; item_name: string; quantity: number; unit: string;
  reason: string; wastage_type: string; cost: number;
  reported_by: string; approved_by: string; status: string;
  created_at: string; notes: string;
}

interface PurchaseRequest {
  id: string; request_number: string; requested_by_name: string; department: string;
  priority: string; status: string; notes: string; required_date: string;
  items: PRItem[]; created_at: string;
}
interface PRItem { id: string; item_name: string; quantity: number; unit: string; estimated_cost: number; }

interface PurchaseOrder {
  id: string; po_number: string; supplier_name: string; supplier_id: string;
  status: string; subtotal: number; tax_amount: number; total_amount: number;
  discount_amount: number; shipping_cost: number;
  expected_delivery: string; payment_terms: string; delivery_address: string;
  items: POItem[]; created_at: string; approved_by: string;
}
interface POItem {
  id: string; item_name: string; quantity: number; unit: string;
  unit_price: number; total_price: number; received_quantity: number;
  tax_rate: number; discount: number; hsn_code: string;
}

interface Quotation {
  id: string; quotation_number: string; supplier_name: string; supplier_id: string;
  status: string; total_amount: number; valid_until: string;
  delivery_days: number; payment_terms: string; items: QTItem[]; created_at: string;
}
interface QTItem {
  id: string; item_name: string; quantity: number; unit: string;
  unit_price: number; total_price: number;
}

interface GoodsReceipt {
  id: string; grn_number: string; po_number: string; supplier_name: string;
  received_by_name: string; status: string; received_date: string;
  invoice_number: string; invoice_amount: number;
  items: GRNItem[]; created_at: string;
}
interface GRNItem {
  id: string; item_name: string; ordered_quantity: number; received_quantity: number;
  accepted_quantity: number; rejected_quantity: number; rejection_reason: string;
  batch_number: string; expiry_date: string;
}

// ============ DEMO DATA ============
const DEMO_CATEGORIES: MaterialCategory[] = [
  { id: "mc1", name: "Linen & Textiles", parent_id: null, description: "Bed sheets, towels, curtains, tablecloths", item_count: 12, is_active: true },
  { id: "mc2", name: "Toiletries & Amenities", parent_id: null, description: "Soaps, shampoos, dental kits, slippers", item_count: 15, is_active: true },
  { id: "mc3", name: "Cleaning Supplies", parent_id: null, description: "Detergents, disinfectants, mops, brushes", item_count: 8, is_active: true },
  { id: "mc4", name: "Food & Beverage", parent_id: null, description: "Kitchen ingredients, beverages, dry goods", item_count: 20, is_active: true },
  { id: "mc5", name: "Equipment & Tools", parent_id: null, description: "Maintenance tools, kitchen equipment", item_count: 6, is_active: true },
  { id: "mc6", name: "Stationery & Printing", parent_id: null, description: "Office supplies, guest forms, brochures", item_count: 5, is_active: true },
  { id: "mc7", name: "Electrical & Electronics", parent_id: null, description: "Bulbs, batteries, cables, adapters", item_count: 7, is_active: true },
  { id: "mc8", name: "Plumbing Supplies", parent_id: null, description: "Pipes, fittings, washers, taps", item_count: 4, is_active: true },
  { id: "mc9", name: "Guest Room Supplies", parent_id: null, description: "Minibar items, hangers, safes, stationery sets", item_count: 10, is_active: true },
  { id: "mc10", name: "Uniforms & PPE", parent_id: null, description: "Staff uniforms, gloves, masks, safety gear", item_count: 6, is_active: true },
];

const DEMO_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Hotel Essentials Pvt Ltd", contact_person: "Rajesh Kumar", email: "rajesh@hotelessentials.com", phone: "+91 9876543210", address: "123 Industrial Area, Phase-II", city: "Hyderabad", state: "Telangana", pincode: "500032", gst_number: "36AABCH1234A1Z5", pan_number: "AABCH1234A", category: "general", payment_terms: "Net 30", rating: 4, is_active: true, notes: "Reliable supplier since 2019", bank_name: "HDFC Bank", bank_account: "50100234567890", ifsc_code: "HDFC0001234", credit_limit: 500000, total_orders: 45, total_value: 1250000, last_order_date: "2026-03-15" },
  { id: "s2", name: "CleanPro Supplies", contact_person: "Anita Sharma", email: "anita@cleanpro.in", phone: "+91 9876543211", address: "45 MG Road, Andheri", city: "Mumbai", state: "Maharashtra", pincode: "400069", gst_number: "27AABCC5678B2Z3", pan_number: "AABCC5678B", category: "cleaning", payment_terms: "Net 15", rating: 5, is_active: true, notes: "Best cleaning supplies in market", bank_name: "ICICI Bank", bank_account: "30210456789012", ifsc_code: "ICIC0002345", credit_limit: 300000, total_orders: 32, total_value: 680000, last_order_date: "2026-03-18" },
  { id: "s3", name: "FreshFoods Co", contact_person: "Mohammed Ali", email: "ali@freshfoods.com", phone: "+91 9876543212", address: "78 Food Park, Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066", gst_number: "29AABCF9012C3Z1", pan_number: "AABCF9012C", category: "food", payment_terms: "COD", rating: 3, is_active: true, notes: "Daily delivery available", bank_name: "SBI", bank_account: "20304567891234", ifsc_code: "SBIN0003456", credit_limit: 200000, total_orders: 120, total_value: 3200000, last_order_date: "2026-03-22" },
  { id: "s4", name: "LuxLinens International", contact_person: "Priya Patel", email: "priya@luxlinens.com", phone: "+91 9876543213", address: "90 Textile Hub, SG Highway", city: "Ahmedabad", state: "Gujarat", pincode: "380054", gst_number: "24AABCL3456D4Z8", pan_number: "AABCL3456D", category: "linen", payment_terms: "Net 45", rating: 4, is_active: true, notes: "Premium quality linens", bank_name: "Axis Bank", bank_account: "91704567890123", ifsc_code: "UTIB0004567", credit_limit: 800000, total_orders: 28, total_value: 2100000, last_order_date: "2026-03-10" },
  { id: "s5", name: "Sparkling Amenities Ltd", contact_person: "Deepika Reddy", email: "deepika@sparklingamenities.in", phone: "+91 9876543214", address: "22 Industrial Estate", city: "Chennai", state: "Tamil Nadu", pincode: "600032", gst_number: "33AABCS7890E5Z6", pan_number: "AABCS7890E", category: "amenities", payment_terms: "Net 30", rating: 4, is_active: true, notes: "Eco-friendly products available", bank_name: "Kotak Bank", bank_account: "40506789012345", ifsc_code: "KKBK0005678", credit_limit: 400000, total_orders: 18, total_value: 450000, last_order_date: "2026-03-12" },
  { id: "s6", name: "ProTech Equipment", contact_person: "Vikram Singh", email: "vikram@protech.co.in", phone: "+91 9876543215", address: "56 MIDC Area, Chinchwad", city: "Pune", state: "Maharashtra", pincode: "411019", gst_number: "27AABCP1234F6Z7", pan_number: "AABCP1234F", category: "equipment", payment_terms: "Net 60", rating: 3, is_active: true, notes: "Warranty on all products", bank_name: "PNB", bank_account: "60708901234567", ifsc_code: "PUNB0006789", credit_limit: 1000000, total_orders: 8, total_value: 890000, last_order_date: "2026-02-28" },
];

const DEMO_ITEMS: InventoryItem[] = [
  { id: "i1", name: "Bath Towels (White, 600gsm)", category: "Linen & Textiles", sub_category: "Towels", sku: "LIN-TWL-001", hsn_code: "6302", barcode: "8901234567001", current_stock: 120, min_stock: 50, max_stock: 200, reorder_level: 60, unit: "pieces", unit_cost: 350, selling_price: 0, tax_rate: 12, supplier: "LuxLinens International", supplier_id: "s4", location: "Store Room A", shelf_number: "A1-03", batch_number: "BT-2026-001", expiry_date: "", lead_time_days: 7, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-10", last_issued: "2026-03-21", avg_daily_consumption: 4.5, image_url: "", description: "Premium cotton bath towels, 70x140cm", brand: "LuxLinens", manufacturer: "LuxLinens International" },
  { id: "i2", name: "Bed Sheets (King, 300TC)", category: "Linen & Textiles", sub_category: "Bed Linen", sku: "LIN-BED-001", hsn_code: "6302", barcode: "8901234567002", current_stock: 80, min_stock: 30, max_stock: 150, reorder_level: 40, unit: "pieces", unit_cost: 800, selling_price: 0, tax_rate: 12, supplier: "LuxLinens International", supplier_id: "s4", location: "Store Room A", shelf_number: "A2-01", batch_number: "BS-2026-001", expiry_date: "", lead_time_days: 10, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-05", last_issued: "2026-03-20", avg_daily_consumption: 2.8, image_url: "", description: "Egyptian cotton king-size bed sheets", brand: "LuxLinens", manufacturer: "LuxLinens International" },
  { id: "i3", name: "Toilet Paper Rolls (3-ply)", category: "Toiletries & Amenities", sub_category: "Paper Products", sku: "TOI-PPR-001", hsn_code: "4818", barcode: "8901234567003", current_stock: 500, min_stock: 200, max_stock: 1000, reorder_level: 250, unit: "rolls", unit_cost: 25, selling_price: 0, tax_rate: 18, supplier: "Hotel Essentials Pvt Ltd", supplier_id: "s1", location: "Store Room B", shelf_number: "B1-02", batch_number: "TP-2026-003", expiry_date: "", lead_time_days: 3, is_active: true, is_perishable: false, is_returnable: false, last_restocked: "2026-03-18", last_issued: "2026-03-22", avg_daily_consumption: 18, image_url: "", description: "Soft 3-ply toilet paper rolls", brand: "Softex", manufacturer: "Hotel Essentials Pvt Ltd" },
  { id: "i4", name: "Shampoo Sachets (15ml)", category: "Toiletries & Amenities", sub_category: "Hair Care", sku: "TOI-SHP-001", hsn_code: "3305", barcode: "8901234567004", current_stock: 800, min_stock: 300, max_stock: 2000, reorder_level: 400, unit: "pieces", unit_cost: 12, selling_price: 0, tax_rate: 18, supplier: "Sparkling Amenities Ltd", supplier_id: "s5", location: "Store Room B", shelf_number: "B2-01", batch_number: "SH-2026-005", expiry_date: "2027-06-15", lead_time_days: 5, is_active: true, is_perishable: true, is_returnable: false, last_restocked: "2026-03-12", last_issued: "2026-03-22", avg_daily_consumption: 25, image_url: "", description: "Premium herbal shampoo sachets", brand: "Sparkle", manufacturer: "Sparkling Amenities Ltd" },
  { id: "i5", name: "Floor Cleaner (5L, Lemon)", category: "Cleaning Supplies", sub_category: "Surface Cleaners", sku: "CLN-FLR-001", hsn_code: "3402", barcode: "8901234567005", current_stock: 15, min_stock: 10, max_stock: 50, reorder_level: 12, unit: "bottles", unit_cost: 450, selling_price: 0, tax_rate: 18, supplier: "CleanPro Supplies", supplier_id: "s2", location: "Maintenance Room", shelf_number: "M1-01", batch_number: "FC-2026-002", expiry_date: "2027-12-31", lead_time_days: 4, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-08", last_issued: "2026-03-19", avg_daily_consumption: 0.8, image_url: "", description: "Concentrated floor cleaner with lemon fragrance", brand: "CleanPro", manufacturer: "CleanPro Supplies" },
  { id: "i6", name: "Glass Cleaner (1L, Spray)", category: "Cleaning Supplies", sub_category: "Glass Cleaners", sku: "CLN-GLS-001", hsn_code: "3402", barcode: "8901234567006", current_stock: 8, min_stock: 10, max_stock: 30, reorder_level: 12, unit: "bottles", unit_cost: 180, selling_price: 0, tax_rate: 18, supplier: "CleanPro Supplies", supplier_id: "s2", location: "Maintenance Room", shelf_number: "M1-02", batch_number: "GC-2026-001", expiry_date: "2028-01-31", lead_time_days: 4, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-02-20", last_issued: "2026-03-18", avg_daily_consumption: 0.5, image_url: "", description: "Streak-free glass and mirror cleaner", brand: "CleanPro", manufacturer: "CleanPro Supplies" },
  { id: "i7", name: "Pillow Covers (Standard)", category: "Linen & Textiles", sub_category: "Bed Linen", sku: "LIN-PLW-001", hsn_code: "6302", barcode: "8901234567007", current_stock: 200, min_stock: 60, max_stock: 300, reorder_level: 80, unit: "pieces", unit_cost: 250, selling_price: 0, tax_rate: 12, supplier: "LuxLinens International", supplier_id: "s4", location: "Store Room A", shelf_number: "A2-03", batch_number: "PC-2026-001", expiry_date: "", lead_time_days: 7, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-05", last_issued: "2026-03-20", avg_daily_consumption: 3.2, image_url: "", description: "Cotton pillow covers with zipper closure", brand: "LuxLinens", manufacturer: "LuxLinens International" },
  { id: "i8", name: "Hand Soap (250ml, Lavender)", category: "Toiletries & Amenities", sub_category: "Hand Care", sku: "TOI-SOP-001", hsn_code: "3401", barcode: "8901234567008", current_stock: 150, min_stock: 50, max_stock: 400, reorder_level: 70, unit: "bottles", unit_cost: 85, selling_price: 0, tax_rate: 18, supplier: "Sparkling Amenities Ltd", supplier_id: "s5", location: "Store Room B", shelf_number: "B2-03", batch_number: "HS-2026-002", expiry_date: "2027-09-30", lead_time_days: 5, is_active: true, is_perishable: true, is_returnable: false, last_restocked: "2026-03-12", last_issued: "2026-03-21", avg_daily_consumption: 5, image_url: "", description: "Moisturizing hand soap with lavender scent", brand: "Sparkle", manufacturer: "Sparkling Amenities Ltd" },
  { id: "i9", name: "Dental Kit (Toothbrush+Paste)", category: "Toiletries & Amenities", sub_category: "Dental Care", sku: "TOI-DNT-001", hsn_code: "9603", barcode: "8901234567009", current_stock: 300, min_stock: 100, max_stock: 600, reorder_level: 150, unit: "kits", unit_cost: 18, selling_price: 0, tax_rate: 12, supplier: "Sparkling Amenities Ltd", supplier_id: "s5", location: "Store Room B", shelf_number: "B3-01", batch_number: "DK-2026-004", expiry_date: "2028-03-31", lead_time_days: 5, is_active: true, is_perishable: false, is_returnable: false, last_restocked: "2026-03-15", last_issued: "2026-03-22", avg_daily_consumption: 12, image_url: "", description: "Compact travel dental kit for guests", brand: "FreshSmile", manufacturer: "Sparkling Amenities Ltd" },
  { id: "i10", name: "LED Bulb (9W, Cool White)", category: "Electrical & Electronics", sub_category: "Lighting", sku: "ELC-LED-001", hsn_code: "8539", barcode: "8901234567010", current_stock: 45, min_stock: 20, max_stock: 100, reorder_level: 25, unit: "pieces", unit_cost: 120, selling_price: 0, tax_rate: 18, supplier: "ProTech Equipment", supplier_id: "s6", location: "Maintenance Room", shelf_number: "M2-01", batch_number: "LB-2026-001", expiry_date: "", lead_time_days: 7, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-02-28", last_issued: "2026-03-15", avg_daily_consumption: 0.7, image_url: "", description: "Energy-efficient LED bulb, B22 base", brand: "Syska", manufacturer: "ProTech Equipment" },
  { id: "i11", name: "Disinfectant Spray (500ml)", category: "Cleaning Supplies", sub_category: "Disinfectants", sku: "CLN-DIS-001", hsn_code: "3808", barcode: "8901234567011", current_stock: 60, min_stock: 25, max_stock: 100, reorder_level: 30, unit: "bottles", unit_cost: 220, selling_price: 0, tax_rate: 18, supplier: "CleanPro Supplies", supplier_id: "s2", location: "Store Room B", shelf_number: "B4-01", batch_number: "DS-2026-003", expiry_date: "2027-08-15", lead_time_days: 4, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-10", last_issued: "2026-03-22", avg_daily_consumption: 2, image_url: "", description: "Multi-surface disinfectant spray", brand: "CleanPro", manufacturer: "CleanPro Supplies" },
  { id: "i12", name: "Wooden Hangers (Set of 5)", category: "Guest Room Supplies", sub_category: "Wardrobe", sku: "GRS-HNG-001", hsn_code: "4421", barcode: "8901234567012", current_stock: 40, min_stock: 15, max_stock: 80, reorder_level: 20, unit: "sets", unit_cost: 350, selling_price: 0, tax_rate: 18, supplier: "Hotel Essentials Pvt Ltd", supplier_id: "s1", location: "Store Room A", shelf_number: "A3-02", batch_number: "WH-2026-001", expiry_date: "", lead_time_days: 10, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-02-15", last_issued: "2026-03-10", avg_daily_consumption: 0.3, image_url: "", description: "Premium walnut-finished wooden hangers", brand: "HomeCraft", manufacturer: "Hotel Essentials Pvt Ltd" },
  { id: "i13", name: "Laundry Detergent (25kg)", category: "Cleaning Supplies", sub_category: "Laundry", sku: "CLN-LDT-001", hsn_code: "3402", barcode: "8901234567013", current_stock: 5, min_stock: 3, max_stock: 15, reorder_level: 4, unit: "bags", unit_cost: 1800, selling_price: 0, tax_rate: 18, supplier: "CleanPro Supplies", supplier_id: "s2", location: "Laundry Room", shelf_number: "L1-01", batch_number: "LD-2026-002", expiry_date: "2027-06-30", lead_time_days: 5, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-03-01", last_issued: "2026-03-20", avg_daily_consumption: 0.15, image_url: "", description: "Industrial-grade laundry powder detergent", brand: "CleanPro", manufacturer: "CleanPro Supplies" },
  { id: "i14", name: "Cooking Oil (15L tin)", category: "Food & Beverage", sub_category: "Cooking Essentials", sku: "FNB-OIL-001", hsn_code: "1507", barcode: "8901234567014", current_stock: 8, min_stock: 4, max_stock: 20, reorder_level: 5, unit: "tins", unit_cost: 2200, selling_price: 0, tax_rate: 5, supplier: "FreshFoods Co", supplier_id: "s3", location: "Kitchen Store", shelf_number: "K1-01", batch_number: "CO-2026-006", expiry_date: "2026-12-31", lead_time_days: 2, is_active: true, is_perishable: true, is_returnable: false, last_restocked: "2026-03-20", last_issued: "2026-03-22", avg_daily_consumption: 0.5, image_url: "", description: "Refined sunflower cooking oil", brand: "Fortune", manufacturer: "FreshFoods Co" },
  { id: "i15", name: "Rice (Basmati, 25kg)", category: "Food & Beverage", sub_category: "Staples", sku: "FNB-RIC-001", hsn_code: "1006", barcode: "8901234567015", current_stock: 12, min_stock: 5, max_stock: 30, reorder_level: 7, unit: "bags", unit_cost: 1650, selling_price: 0, tax_rate: 5, supplier: "FreshFoods Co", supplier_id: "s3", location: "Kitchen Store", shelf_number: "K1-03", batch_number: "BR-2026-008", expiry_date: "2027-03-31", lead_time_days: 2, is_active: true, is_perishable: false, is_returnable: false, last_restocked: "2026-03-18", last_issued: "2026-03-22", avg_daily_consumption: 0.8, image_url: "", description: "Premium aged basmati rice", brand: "Daawat", manufacturer: "FreshFoods Co" },
  { id: "i16", name: "Staff Uniform (Housekeeping)", category: "Uniforms & PPE", sub_category: "Uniforms", sku: "UNI-HKP-001", hsn_code: "6211", barcode: "8901234567016", current_stock: 25, min_stock: 10, max_stock: 50, reorder_level: 12, unit: "sets", unit_cost: 1200, selling_price: 0, tax_rate: 12, supplier: "Hotel Essentials Pvt Ltd", supplier_id: "s1", location: "HR Store", shelf_number: "H1-01", batch_number: "SU-2026-001", expiry_date: "", lead_time_days: 15, is_active: true, is_perishable: false, is_returnable: true, last_restocked: "2026-01-15", last_issued: "2026-03-01", avg_daily_consumption: 0.1, image_url: "", description: "Complete housekeeping uniform set", brand: "UniForm", manufacturer: "Hotel Essentials Pvt Ltd" },
];

const DEMO_TRANSACTIONS: StockTransaction[] = [
  { id: "st1", item_id: "i1", item_name: "Bath Towels (White, 600gsm)", transaction_type: "issue", quantity: 10, unit: "pieces", before_qty: 130, after_qty: 120, reference_type: "Housekeeping", reference_number: "HK-0321", performed_by: "Store Keeper", notes: "Daily room replenishment", created_at: "2026-03-21T09:30:00" },
  { id: "st2", item_id: "i3", item_name: "Toilet Paper Rolls (3-ply)", transaction_type: "issue", quantity: 36, unit: "rolls", before_qty: 536, after_qty: 500, reference_type: "Housekeeping", reference_number: "HK-0321", performed_by: "Store Keeper", notes: "Morning restocking", created_at: "2026-03-21T08:00:00" },
  { id: "st3", item_id: "i14", item_name: "Cooking Oil (15L tin)", transaction_type: "receipt", quantity: 4, unit: "tins", before_qty: 4, after_qty: 8, reference_type: "GRN", reference_number: "GRN-FD0320", performed_by: "Kitchen Manager", notes: "Received from FreshFoods Co", created_at: "2026-03-20T14:00:00" },
  { id: "st4", item_id: "i6", item_name: "Glass Cleaner (1L, Spray)", transaction_type: "issue", quantity: 3, unit: "bottles", before_qty: 11, after_qty: 8, reference_type: "Maintenance", reference_number: "MT-0318", performed_by: "Store Keeper", notes: "For lobby glass cleaning", created_at: "2026-03-18T10:15:00" },
  { id: "st5", item_id: "i4", item_name: "Shampoo Sachets (15ml)", transaction_type: "receipt", quantity: 200, unit: "pieces", before_qty: 600, after_qty: 800, reference_type: "GRN", reference_number: "GRN-SA0312", performed_by: "Store Keeper", notes: "Monthly restock from Sparkling Amenities", created_at: "2026-03-12T11:00:00" },
  { id: "st6", item_id: "i5", item_name: "Floor Cleaner (5L, Lemon)", transaction_type: "issue", quantity: 2, unit: "bottles", before_qty: 17, after_qty: 15, reference_type: "Housekeeping", reference_number: "HK-0319", performed_by: "Store Keeper", notes: "Deep cleaning lobby and restaurant", created_at: "2026-03-19T07:30:00" },
  { id: "st7", item_id: "i2", item_name: "Bed Sheets (King, 300TC)", transaction_type: "return", quantity: 5, unit: "pieces", before_qty: 75, after_qty: 80, reference_type: "Laundry", reference_number: "LN-0320", performed_by: "Laundry Manager", notes: "Returned after laundering", created_at: "2026-03-20T16:00:00" },
  { id: "st8", item_id: "i15", item_name: "Rice (Basmati, 25kg)", transaction_type: "issue", quantity: 2, unit: "bags", before_qty: 14, after_qty: 12, reference_type: "Kitchen", reference_number: "KT-0322", performed_by: "Chef", notes: "For banquet dinner", created_at: "2026-03-22T06:00:00" },
  { id: "st9", item_id: "i11", item_name: "Disinfectant Spray (500ml)", transaction_type: "issue", quantity: 5, unit: "bottles", before_qty: 65, after_qty: 60, reference_type: "Housekeeping", reference_number: "HK-0322", performed_by: "Store Keeper", notes: "Daily room sanitization", created_at: "2026-03-22T08:00:00" },
  { id: "st10", item_id: "i10", item_name: "LED Bulb (9W, Cool White)", transaction_type: "adjustment", quantity: -3, unit: "pieces", before_qty: 48, after_qty: 45, reference_type: "Audit", reference_number: "AUD-0315", performed_by: "Inventory Manager", notes: "Physical count discrepancy", created_at: "2026-03-15T17:00:00" },
];

const DEMO_WASTAGE: WastageRecord[] = [
  { id: "w1", item_id: "i4", item_name: "Shampoo Sachets (15ml)", quantity: 15, unit: "pieces", reason: "Damaged packaging", wastage_type: "damage", cost: 180, reported_by: "Store Keeper", approved_by: "Inventory Manager", status: "approved", created_at: "2026-03-20T10:00:00", notes: "Water damage in storage" },
  { id: "w2", item_id: "i14", item_name: "Cooking Oil (15L tin)", quantity: 1, unit: "tins", reason: "Expired stock", wastage_type: "expiry", cost: 2200, reported_by: "Chef", approved_by: "Kitchen Manager", status: "approved", created_at: "2026-03-18T14:30:00", notes: "Past best-before date" },
  { id: "w3", item_id: "i8", item_name: "Hand Soap (250ml, Lavender)", quantity: 5, unit: "bottles", reason: "Leaking bottles", wastage_type: "damage", cost: 425, reported_by: "Housekeeping Staff", approved_by: "", status: "pending", created_at: "2026-03-22T09:00:00", notes: "Found during inspection" },
  { id: "w4", item_id: "i9", item_name: "Dental Kit (Toothbrush+Paste)", quantity: 8, unit: "kits", reason: "Manufacturing defect", wastage_type: "defect", cost: 144, reported_by: "Front Desk", approved_by: "Inventory Manager", status: "approved", created_at: "2026-03-15T11:00:00", notes: "Toothbrush bristles defective" },
];

const DEMO_PRS: PurchaseRequest[] = [
  { id: "pr1", request_number: "PR-A1B2C3D4", requested_by_name: "Housekeeping Dept", department: "housekeeping", priority: "high", status: "approved", notes: "Urgent restocking needed for weekend rush", required_date: "2026-03-25", items: [{ id: "pri1", item_name: "Bath Towels (White, 600gsm)", quantity: 50, unit: "pieces", estimated_cost: 17500 }, { id: "pri2", item_name: "Bed Sheets (King, 300TC)", quantity: 30, unit: "pieces", estimated_cost: 24000 }], created_at: "2026-03-18" },
  { id: "pr2", request_number: "PR-E5F6G7H8", requested_by_name: "Maintenance Dept", department: "maintenance", priority: "medium", status: "pending", notes: "Monthly cleaning supplies replenishment", required_date: "2026-03-30", items: [{ id: "pri3", item_name: "Floor Cleaner (5L, Lemon)", quantity: 20, unit: "bottles", estimated_cost: 9000 }, { id: "pri4", item_name: "Glass Cleaner (1L, Spray)", quantity: 15, unit: "bottles", estimated_cost: 2700 }], created_at: "2026-03-19" },
  { id: "pr3", request_number: "PR-I9J0K1L2", requested_by_name: "Kitchen Dept", department: "kitchen", priority: "urgent", status: "draft", notes: "Running low on essential cooking supplies", required_date: "2026-03-24", items: [{ id: "pri5", item_name: "Rice (Basmati, 25kg)", quantity: 10, unit: "bags", estimated_cost: 16500 }, { id: "pri6", item_name: "Cooking Oil (15L tin)", quantity: 5, unit: "tins", estimated_cost: 11000 }], created_at: "2026-03-22" },
];

const DEMO_POS: PurchaseOrder[] = [
  { id: "po1", po_number: "PO-X1Y2Z3A4", supplier_name: "LuxLinens International", supplier_id: "s4", status: "sent", subtotal: 41500, tax_amount: 4980, total_amount: 46480, discount_amount: 0, shipping_cost: 0, expected_delivery: "2026-03-28", payment_terms: "Net 45", delivery_address: "Hotel Grand Palace, Hyderabad", items: [{ id: "poi1", item_name: "Bath Towels (White, 600gsm)", quantity: 50, unit: "pieces", unit_price: 350, total_price: 17500, received_quantity: 0, tax_rate: 12, discount: 0, hsn_code: "6302" }, { id: "poi2", item_name: "Bed Sheets (King, 300TC)", quantity: 30, unit: "pieces", unit_price: 800, total_price: 24000, received_quantity: 0, tax_rate: 12, discount: 0, hsn_code: "6302" }], created_at: "2026-03-19", approved_by: "Hotel Admin" },
  { id: "po2", po_number: "PO-B5C6D7E8", supplier_name: "CleanPro Supplies", supplier_id: "s2", status: "partially_received", subtotal: 11700, tax_amount: 2106, total_amount: 13806, discount_amount: 0, shipping_cost: 0, expected_delivery: "2026-03-22", payment_terms: "Net 15", delivery_address: "Hotel Grand Palace, Hyderabad", items: [{ id: "poi3", item_name: "Floor Cleaner (5L, Lemon)", quantity: 20, unit: "bottles", unit_price: 450, total_price: 9000, received_quantity: 15, tax_rate: 18, discount: 0, hsn_code: "3402" }, { id: "poi4", item_name: "Glass Cleaner (1L, Spray)", quantity: 15, unit: "bottles", unit_price: 180, total_price: 2700, received_quantity: 15, tax_rate: 18, discount: 0, hsn_code: "3402" }], created_at: "2026-03-17", approved_by: "Hotel Admin" },
];

const DEMO_QUOTATIONS: Quotation[] = [
  { id: "qt1", quotation_number: "QT-M1N2O3P4", supplier_name: "LuxLinens International", supplier_id: "s4", status: "approved", total_amount: 46480, valid_until: "2026-04-15", delivery_days: 7, payment_terms: "Net 45", items: [{ id: "qti1", item_name: "Bath Towels (White, 600gsm)", quantity: 50, unit: "pieces", unit_price: 350, total_price: 17500 }, { id: "qti2", item_name: "Bed Sheets (King, 300TC)", quantity: 30, unit: "pieces", unit_price: 800, total_price: 24000 }], created_at: "2026-03-17" },
  { id: "qt2", quotation_number: "QT-Q5R6S7T8", supplier_name: "Hotel Essentials Pvt Ltd", supplier_id: "s1", status: "received", total_amount: 52000, valid_until: "2026-04-10", delivery_days: 10, payment_terms: "Net 30", items: [{ id: "qti3", item_name: "Bath Towels (White, 600gsm)", quantity: 50, unit: "pieces", unit_price: 380, total_price: 19000 }, { id: "qti4", item_name: "Bed Sheets (King, 300TC)", quantity: 30, unit: "pieces", unit_price: 850, total_price: 25500 }], created_at: "2026-03-17" },
];

const DEMO_GRNS: GoodsReceipt[] = [
  { id: "grn1", grn_number: "GRN-U1V2W3X4", po_number: "PO-B5C6D7E8", supplier_name: "CleanPro Supplies", received_by_name: "Store Manager", status: "partial", received_date: "2026-03-20", invoice_number: "CP/2026/1234", invoice_amount: 13200, items: [{ id: "grni1", item_name: "Floor Cleaner (5L, Lemon)", ordered_quantity: 20, received_quantity: 15, accepted_quantity: 15, rejected_quantity: 0, rejection_reason: "", batch_number: "FC-2026-003", expiry_date: "2027-12-31" }, { id: "grni2", item_name: "Glass Cleaner (1L, Spray)", ordered_quantity: 15, received_quantity: 15, accepted_quantity: 14, rejected_quantity: 1, rejection_reason: "Damaged bottle", batch_number: "GC-2026-002", expiry_date: "2028-01-31" }], created_at: "2026-03-20" },
];

const CATEGORIES = ["Linen & Textiles", "Toiletries & Amenities", "Cleaning Supplies", "Food & Beverage", "Equipment & Tools", "Stationery & Printing", "Electrical & Electronics", "Plumbing Supplies", "Guest Room Supplies", "Uniforms & PPE"];
const SUPPLIER_CATEGORIES = ["general", "cleaning", "food", "linen", "equipment", "electrical", "plumbing", "stationery", "amenities", "uniforms"];
const UNITS = ["pieces", "rolls", "bottles", "bags", "kits", "sets", "tins", "boxes", "liters", "kg", "meters", "pairs", "dozen", "cartons"];
const WASTAGE_TYPES = ["damage", "expiry", "defect", "spillage", "theft", "natural_loss", "other"];

export const InventoryProcurement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [items, setItems] = useState<InventoryItem[]>(DEMO_ITEMS);
  const [categories, setCategories] = useState<MaterialCategory[]>(DEMO_CATEGORIES);
  const [transactions, setTransactions] = useState<StockTransaction[]>(DEMO_TRANSACTIONS);
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>(DEMO_WASTAGE);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(DEMO_PRS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(DEMO_POS);
  const [quotations, setQuotations] = useState<Quotation[]>(DEMO_QUOTATIONS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(DEMO_GRNS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modals
  const [supplierModal, setSupplierModal] = useState<{ open: boolean; editing?: Supplier }>({ open: false });
  const [itemModal, setItemModal] = useState<{ open: boolean; editing?: InventoryItem }>({ open: false });
  const [prModal, setPrModal] = useState<{ open: boolean; editing?: PurchaseRequest }>({ open: false });
  const [poModal, setPoModal] = useState<{ open: boolean; editing?: PurchaseOrder }>({ open: false });
  const [qtModal, setQtModal] = useState<{ open: boolean; editing?: Quotation }>({ open: false });
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: MaterialCategory }>({ open: false });
  const [wastageModal, setWastageModal] = useState<{ open: boolean; editing?: WastageRecord }>({ open: false });
  const [stockAdjustModal, setStockAdjustModal] = useState<{ open: boolean; item?: InventoryItem }>({ open: false });
  const [viewModal, setViewModal] = useState<{ open: boolean; type: string; data: any }>({ open: false, type: "", data: null });

  // Form states
  const [formSupplier, setFormSupplier] = useState<Partial<Supplier>>({});
  const [formItem, setFormItem] = useState<Partial<InventoryItem>>({});
  const [formPR, setFormPR] = useState<Partial<PurchaseRequest & { items: PRItem[] }>>({ items: [] });
  const [formPO, setFormPO] = useState<Partial<PurchaseOrder & { items: POItem[] }>>({ items: [] });
  const [formQT, setFormQT] = useState<Partial<Quotation & { items: QTItem[] }>>({ items: [] });
  const [formCategory, setFormCategory] = useState<Partial<MaterialCategory>>({});
  const [formWastage, setFormWastage] = useState<Partial<WastageRecord>>({});
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "remove" | "set">("add");

  // Stats
  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock);
  const expiringItems = items.filter(i => i.expiry_date && new Date(i.expiry_date) <= new Date(Date.now() + 90 * 86400000));
  const totalStockValue = items.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0);
  const totalWastageCost = wastageRecords.filter(w => w.status === "approved").reduce((s, w) => s + w.cost, 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === "sent" || po.status === "approved");
  const pendingPRs = purchaseRequests.filter(pr => pr.status === "pending" || pr.status === "draft");

  // ---- CRUD HANDLERS ----
  const handleSaveSupplier = () => {
    if (!formSupplier.name) { toast.error("Supplier name is required"); return; }
    if (supplierModal.editing) {
      setSuppliers(prev => prev.map(s => s.id === supplierModal.editing!.id ? { ...s, ...formSupplier } as Supplier : s));
      toast.success("Supplier updated");
    } else {
      const ns: Supplier = { id: `s${Date.now()}`, name: formSupplier.name!, contact_person: formSupplier.contact_person || "", email: formSupplier.email || "", phone: formSupplier.phone || "", address: formSupplier.address || "", city: formSupplier.city || "", state: formSupplier.state || "", pincode: formSupplier.pincode || "", gst_number: formSupplier.gst_number || "", pan_number: formSupplier.pan_number || "", category: formSupplier.category || "general", payment_terms: formSupplier.payment_terms || "Net 30", rating: formSupplier.rating || 3, is_active: true, notes: formSupplier.notes || "", bank_name: formSupplier.bank_name || "", bank_account: formSupplier.bank_account || "", ifsc_code: formSupplier.ifsc_code || "", credit_limit: formSupplier.credit_limit || 0, total_orders: 0, total_value: 0, last_order_date: "" };
      setSuppliers(prev => [ns, ...prev]);
      toast.success("Supplier added");
    }
    setSupplierModal({ open: false }); setFormSupplier({});
  };
  const handleDeleteSupplier = (id: string) => { setSuppliers(prev => prev.filter(s => s.id !== id)); toast.success("Supplier deleted"); };

  const handleSaveItem = () => {
    if (!formItem.name) { toast.error("Item name is required"); return; }
    if (itemModal.editing) {
      setItems(prev => prev.map(i => i.id === itemModal.editing!.id ? { ...i, ...formItem } as InventoryItem : i));
      toast.success("Item updated");
    } else {
      const ni: InventoryItem = { id: `i${Date.now()}`, name: formItem.name!, category: formItem.category || "Guest Room Supplies", sub_category: formItem.sub_category || "", sku: formItem.sku || `SKU-${Date.now().toString(36).toUpperCase()}`, hsn_code: formItem.hsn_code || "", barcode: formItem.barcode || "", current_stock: formItem.current_stock || 0, min_stock: formItem.min_stock || 5, max_stock: formItem.max_stock || 100, reorder_level: formItem.reorder_level || 10, unit: formItem.unit || "pieces", unit_cost: formItem.unit_cost || 0, selling_price: formItem.selling_price || 0, tax_rate: formItem.tax_rate || 18, supplier: formItem.supplier || "", supplier_id: formItem.supplier_id || "", location: formItem.location || "", shelf_number: formItem.shelf_number || "", batch_number: formItem.batch_number || "", expiry_date: formItem.expiry_date || "", lead_time_days: formItem.lead_time_days || 7, is_active: true, is_perishable: formItem.is_perishable || false, is_returnable: formItem.is_returnable || false, last_restocked: "", last_issued: "", avg_daily_consumption: 0, image_url: "", description: formItem.description || "", brand: formItem.brand || "", manufacturer: formItem.manufacturer || "" };
      setItems(prev => [ni, ...prev]);
      toast.success("Item added");
    }
    setItemModal({ open: false }); setFormItem({});
  };
  const handleDeleteItem = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); toast.success("Item deleted"); };

  const handleStockAdjust = () => {
    if (!stockAdjustModal.item || adjustQty === 0) { toast.error("Enter valid quantity"); return; }
    const item = stockAdjustModal.item;
    let newQty = item.current_stock;
    if (adjustType === "add") newQty += adjustQty;
    else if (adjustType === "remove") newQty = Math.max(0, newQty - adjustQty);
    else newQty = adjustQty;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, current_stock: newQty } : i));
    const txn: StockTransaction = { id: `st${Date.now()}`, item_id: item.id, item_name: item.name, transaction_type: "adjustment", quantity: newQty - item.current_stock, unit: item.unit, before_qty: item.current_stock, after_qty: newQty, reference_type: "Manual Adjustment", reference_number: `ADJ-${Date.now().toString(36).toUpperCase().slice(-6)}`, performed_by: "Inventory Manager", notes: adjustReason, created_at: new Date().toISOString() };
    setTransactions(prev => [txn, ...prev]);
    toast.success(`Stock adjusted: ${item.name} → ${newQty} ${item.unit}`);
    setStockAdjustModal({ open: false }); setAdjustQty(0); setAdjustReason(""); setAdjustType("add");
  };

  const handleSaveCategory = () => {
    if (!formCategory.name) { toast.error("Category name required"); return; }
    if (categoryModal.editing) {
      setCategories(prev => prev.map(c => c.id === categoryModal.editing!.id ? { ...c, ...formCategory } as MaterialCategory : c));
      toast.success("Category updated");
    } else {
      const nc: MaterialCategory = { id: `mc${Date.now()}`, name: formCategory.name!, parent_id: formCategory.parent_id || null, description: formCategory.description || "", item_count: 0, is_active: true };
      setCategories(prev => [nc, ...prev]);
      toast.success("Category added");
    }
    setCategoryModal({ open: false }); setFormCategory({});
  };
  const handleDeleteCategory = (id: string) => { setCategories(prev => prev.filter(c => c.id !== id)); toast.success("Category deleted"); };

  const handleSaveWastage = () => {
    if (!formWastage.item_name || !formWastage.quantity) { toast.error("Item and quantity required"); return; }
    if (wastageModal.editing) {
      setWastageRecords(prev => prev.map(w => w.id === wastageModal.editing!.id ? { ...w, ...formWastage } as WastageRecord : w));
      toast.success("Wastage record updated");
    } else {
      const item = items.find(i => i.name === formWastage.item_name);
      const cost = (item?.unit_cost || 0) * (formWastage.quantity || 0);
      const nw: WastageRecord = { id: `w${Date.now()}`, item_id: item?.id || "", item_name: formWastage.item_name!, quantity: formWastage.quantity || 0, unit: item?.unit || "pieces", reason: formWastage.reason || "", wastage_type: formWastage.wastage_type || "damage", cost, reported_by: formWastage.reported_by || "Staff", approved_by: "", status: "pending", created_at: new Date().toISOString(), notes: formWastage.notes || "" };
      setWastageRecords(prev => [nw, ...prev]);
      toast.success("Wastage recorded");
    }
    setWastageModal({ open: false }); setFormWastage({});
  };
  const handleApproveWastage = (id: string) => {
    const w = wastageRecords.find(r => r.id === id);
    if (w) {
      setItems(prev => prev.map(i => i.id === w.item_id ? { ...i, current_stock: Math.max(0, i.current_stock - w.quantity) } : i));
      setWastageRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved", approved_by: "Inventory Manager" } : r));
      const item = items.find(i => i.id === w.item_id);
      if (item) {
        setTransactions(prev => [{ id: `st${Date.now()}`, item_id: w.item_id, item_name: w.item_name, transaction_type: "wastage", quantity: -w.quantity, unit: w.unit, before_qty: item.current_stock, after_qty: Math.max(0, item.current_stock - w.quantity), reference_type: "Wastage", reference_number: `WST-${id.slice(-6)}`, performed_by: "System", notes: w.reason, created_at: new Date().toISOString() }, ...prev]);
      }
      toast.success("Wastage approved & stock adjusted");
    }
  };
  const handleDeleteWastage = (id: string) => { setWastageRecords(prev => prev.filter(w => w.id !== id)); toast.success("Wastage record deleted"); };

  const handleSavePR = () => {
    if (!formPR.requested_by_name || (formPR.items?.length || 0) === 0) { toast.error("Fill department and add items"); return; }
    if (prModal.editing) {
      setPurchaseRequests(prev => prev.map(pr => pr.id === prModal.editing!.id ? { ...pr, ...formPR } as PurchaseRequest : pr));
      toast.success("Purchase request updated");
    } else {
      const np: PurchaseRequest = { id: `pr${Date.now()}`, request_number: `PR-${Date.now().toString(36).toUpperCase().slice(-8)}`, requested_by_name: formPR.requested_by_name!, department: formPR.department || "general", priority: formPR.priority || "medium", status: "draft", notes: formPR.notes || "", required_date: formPR.required_date || "", items: formPR.items || [], created_at: new Date().toISOString() };
      setPurchaseRequests(prev => [np, ...prev]);
      toast.success("Purchase request created");
    }
    setPrModal({ open: false }); setFormPR({ items: [] });
  };
  const handleDeletePR = (id: string) => { setPurchaseRequests(prev => prev.filter(pr => pr.id !== id)); toast.success("Purchase request deleted"); };
  const handleApprovePR = (id: string) => { setPurchaseRequests(prev => prev.map(pr => pr.id === id ? { ...pr, status: "approved" } : pr)); toast.success("Purchase request approved"); };

  const handleSavePO = () => {
    if (!formPO.supplier_name || (formPO.items?.length || 0) === 0) { toast.error("Select supplier and add items"); return; }
    if (poModal.editing) {
      setPurchaseOrders(prev => prev.map(po => po.id === poModal.editing!.id ? { ...po, ...formPO } as PurchaseOrder : po));
      toast.success("Purchase order updated");
    } else {
      const subtotal = (formPO.items || []).reduce((s, i) => s + i.total_price, 0);
      const tax = (formPO.items || []).reduce((s, i) => s + (i.total_price * (i.tax_rate || 18) / 100), 0);
      const np: PurchaseOrder = { id: `po${Date.now()}`, po_number: `PO-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: formPO.supplier_name!, supplier_id: formPO.supplier_id || "", status: "draft", subtotal, tax_amount: tax, total_amount: subtotal + tax, discount_amount: 0, shipping_cost: 0, expected_delivery: formPO.expected_delivery || "", payment_terms: formPO.payment_terms || "Net 30", delivery_address: formPO.delivery_address || "", items: formPO.items || [], created_at: new Date().toISOString(), approved_by: "" };
      setPurchaseOrders(prev => [np, ...prev]);
      toast.success("Purchase order created");
    }
    setPoModal({ open: false }); setFormPO({ items: [] });
  };
  const handleDeletePO = (id: string) => { setPurchaseOrders(prev => prev.filter(po => po.id !== id)); toast.success("Purchase order deleted"); };

  const handleSaveQT = () => {
    if (!formQT.supplier_name || (formQT.items?.length || 0) === 0) { toast.error("Select supplier and add items"); return; }
    if (qtModal.editing) {
      setQuotations(prev => prev.map(qt => qt.id === qtModal.editing!.id ? { ...qt, ...formQT } as Quotation : qt));
      toast.success("Quotation updated");
    } else {
      const total = (formQT.items || []).reduce((s, i) => s + i.total_price, 0);
      const nq: Quotation = { id: `qt${Date.now()}`, quotation_number: `QT-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: formQT.supplier_name!, supplier_id: formQT.supplier_id || "", status: "received", total_amount: total, valid_until: formQT.valid_until || "", delivery_days: formQT.delivery_days || 7, payment_terms: formQT.payment_terms || "Net 30", items: formQT.items || [], created_at: new Date().toISOString() };
      setQuotations(prev => [nq, ...prev]);
      toast.success("Quotation recorded");
    }
    setQtModal({ open: false }); setFormQT({ items: [] });
  };
  const handleDeleteQT = (id: string) => { setQuotations(prev => prev.filter(qt => qt.id !== id)); toast.success("Quotation deleted"); };
  const handleConvertQTtoPO = (qt: Quotation) => {
    const subtotal = qt.items.reduce((s, i) => s + i.total_price, 0);
    const tax = subtotal * 0.18;
    const np: PurchaseOrder = { id: `po${Date.now()}`, po_number: `PO-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: qt.supplier_name, supplier_id: qt.supplier_id, status: "draft", subtotal, tax_amount: tax, total_amount: subtotal + tax, discount_amount: 0, shipping_cost: 0, expected_delivery: "", payment_terms: qt.payment_terms || "Net 30", delivery_address: "", items: qt.items.map(i => ({ ...i, received_quantity: 0, tax_rate: 18, discount: 0, hsn_code: "" })), created_at: new Date().toISOString(), approved_by: "" };
    setPurchaseOrders(prev => [np, ...prev]);
    setQuotations(prev => prev.map(q => q.id === qt.id ? { ...q, status: "converted" } : q));
    toast.success("Quotation converted to Purchase Order");
  };

  const handleCreateGRN = (po: PurchaseOrder) => {
    const ng: GoodsReceipt = { id: `grn${Date.now()}`, grn_number: `GRN-${Date.now().toString(36).toUpperCase().slice(-8)}`, po_number: po.po_number, supplier_name: po.supplier_name, received_by_name: "Store Manager", status: "pending", received_date: new Date().toISOString().split("T")[0], invoice_number: "", invoice_amount: 0, items: po.items.map(i => ({ id: `grni${Date.now()}${Math.random()}`, item_name: i.item_name, ordered_quantity: i.quantity, received_quantity: 0, accepted_quantity: 0, rejected_quantity: 0, rejection_reason: "", batch_number: "", expiry_date: "" })), created_at: new Date().toISOString() };
    setGoodsReceipts(prev => [ng, ...prev]);
    toast.success("Goods Receipt Note created");
    setActiveTab("grn");
  };
  const handleDeleteGRN = (id: string) => { setGoodsReceipts(prev => prev.filter(g => g.id !== id)); toast.success("GRN deleted"); };

  // Item helpers
  const addPRItem = () => setFormPR(prev => ({ ...prev, items: [...(prev.items || []), { id: `pri${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", estimated_cost: 0 }] }));
  const removePRItem = (id: string) => setFormPR(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updatePRItem = (id: string, field: string, value: any) => setFormPR(prev => ({ ...prev, items: (prev.items || []).map(i => i.id === id ? { ...i, [field]: value } : i) }));
  const addPOItem = () => setFormPO(prev => ({ ...prev, items: [...(prev.items || []), { id: `poi${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", unit_price: 0, total_price: 0, received_quantity: 0, tax_rate: 18, discount: 0, hsn_code: "" }] }));
  const removePOItem = (id: string) => setFormPO(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updatePOItem = (id: string, field: string, value: any) => setFormPO(prev => ({ ...prev, items: (prev.items || []).map(i => { const u = { ...i, [field]: value }; if (field === "quantity" || field === "unit_price") u.total_price = u.quantity * u.unit_price; return i.id === id ? u : i; }) }));
  const addQTItem = () => setFormQT(prev => ({ ...prev, items: [...(prev.items || []), { id: `qti${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", unit_price: 0, total_price: 0 }] }));
  const removeQTItem = (id: string) => setFormQT(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updateQTItem = (id: string, field: string, value: any) => setFormQT(prev => ({ ...prev, items: (prev.items || []).map(i => { const u = { ...i, [field]: value }; if (field === "quantity" || field === "unit_price") u.total_price = u.quantity * u.unit_price; return i.id === id ? u : i; }) }));

  const getStatusColor = (status: string) => {
    const c: Record<string, string> = { draft: "secondary", pending: "outline", approved: "default", sent: "default", received: "default", partial: "outline", completed: "default", cancelled: "destructive", converted: "secondary", partially_received: "outline" };
    return (c[status] || "secondary") as any;
  };
  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { low: "secondary", medium: "outline", high: "default", urgent: "destructive" };
    return (c[p] || "secondary") as any;
  };
  const getTxnIcon = (type: string) => {
    if (type === "receipt") return <ArrowDown className="h-4 w-4 text-green-600" />;
    if (type === "issue") return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (type === "return") return <RefreshCw className="h-4 w-4 text-blue-500" />;
    if (type === "wastage") return <Recycle className="h-4 w-4 text-orange-500" />;
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  const filteredItems = items.filter(i => {
    const ms = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase()) || i.barcode.includes(searchTerm);
    const mc = filterCategory === "all" || i.category === filterCategory;
    return ms && mc;
  });

  // ============ DASHBOARD ============
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("items")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{items.length}</p></div><Package className="h-7 w-7 text-primary opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">Value: ₹{(totalStockValue / 100000).toFixed(1)}L</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("items")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p></div><AlertTriangle className="h-7 w-7 text-destructive opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">Below minimum level</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("items")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Expiring Soon</p><p className="text-2xl font-bold text-orange-600">{expiringItems.length}</p></div><Clock className="h-7 w-7 text-orange-500 opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">Within 90 days</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("po")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Pending POs</p><p className="text-2xl font-bold">{pendingPOs.length}</p></div><ShoppingCart className="h-7 w-7 text-primary opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">₹{pendingPOs.reduce((s, po) => s + po.total_amount, 0).toLocaleString()}</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("wastage")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Wastage Cost</p><p className="text-2xl font-bold text-orange-600">₹{totalWastageCost.toLocaleString()}</p></div><Recycle className="h-7 w-7 text-orange-500 opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">{wastageRecords.length} records</p></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("suppliers")}>
          <CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-xs text-muted-foreground">Suppliers</p><p className="text-2xl font-bold">{suppliers.filter(s => s.is_active).length}</p></div><Users className="h-7 w-7 text-primary opacity-80" /></div><p className="text-xs text-muted-foreground mt-1">Active vendors</p></CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Low Stock Alerts ({lowStockItems.length})</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead>Current</TableHead><TableHead>Min / Reorder</TableHead><TableHead>Lead Time</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{lowStockItems.map(item => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-xs text-muted-foreground">{item.sku}</TableCell><TableCell><Badge variant="secondary">{item.category}</Badge></TableCell><TableCell><Badge variant="destructive">{item.current_stock} {item.unit}</Badge></TableCell><TableCell className="text-xs">{item.min_stock} / {item.reorder_level}</TableCell><TableCell className="text-xs">{item.lead_time_days} days</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => { setFormPR({ requested_by_name: "Auto-generated", department: "inventory", priority: "high", items: [{ id: `pri${Date.now()}`, item_name: item.name, quantity: item.max_stock - item.current_stock, unit: item.unit, estimated_cost: (item.max_stock - item.current_stock) * item.unit_cost }] }); setPrModal({ open: true }); }}>Create PR</Button></TableCell>
              </TableRow>
            ))}</TableBody></Table></CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Recent Transactions</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{transactions.slice(0, 6).map(txn => (
            <div key={txn.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
              {getTxnIcon(txn.transaction_type)}
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{txn.item_name}</p><p className="text-xs text-muted-foreground">{txn.reference_type} • {format(new Date(txn.created_at), "dd MMM HH:mm")}</p></div>
              <Badge variant={txn.quantity > 0 ? "default" : "destructive"} className="text-xs">{txn.quantity > 0 ? "+" : ""}{txn.quantity}</Badge>
            </div>
          ))}</div></CardContent>
        </Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Category Stock Value</CardTitle></CardHeader>
          <CardContent>{CATEGORIES.filter(c => items.some(i => i.category === c)).map(cat => {
            const ci = items.filter(i => i.category === cat);
            const val = ci.reduce((s, i) => s + i.current_stock * i.unit_cost, 0);
            return (<div key={cat} className="flex items-center justify-between py-1.5 border-b last:border-0"><div><p className="font-medium text-sm">{cat}</p><p className="text-xs text-muted-foreground">{ci.length} items</p></div><p className="text-sm font-medium">₹{val.toLocaleString()}</p></div>);
          })}</CardContent>
        </Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-lg">Supplier Performance</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{suppliers.slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.total_orders} orders • ₹{(s.total_value / 100000).toFixed(1)}L</p></div>
              <div className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`h-3 w-3 ${i < s.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />))}</div>
            </div>
          ))}</div></CardContent>
        </Card>
      </div>
    </div>
  );

  // ============ ITEMS ============
  const renderItems = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name, SKU, barcode..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={() => { setFormItem({}); setItemModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
      </div>
      <Card><CardContent className="p-0"><ScrollArea className="w-full"><Table>
        <TableHeader><TableRow><TableHead>Item / Brand</TableHead><TableHead>SKU / Barcode</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead>Reorder</TableHead><TableHead>Unit Cost</TableHead><TableHead>Value</TableHead><TableHead>Location</TableHead><TableHead>Supplier</TableHead><TableHead>Lead</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{filteredItems.map(item => (
          <TableRow key={item.id}>
            <TableCell><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.brand}{item.is_perishable && <Badge variant="outline" className="ml-1 text-[10px] px-1">Perishable</Badge>}</p></TableCell>
            <TableCell><p className="text-xs font-mono">{item.sku}</p>{item.barcode && <p className="text-[10px] text-muted-foreground">{item.barcode}</p>}</TableCell>
            <TableCell><Badge variant="secondary" className="text-xs">{item.category}</Badge>{item.sub_category && <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub_category}</p>}</TableCell>
            <TableCell><Badge variant={item.current_stock <= item.min_stock ? "destructive" : item.current_stock <= item.reorder_level ? "outline" : "default"}>{item.current_stock} {item.unit}</Badge></TableCell>
            <TableCell className="text-xs">{item.reorder_level}</TableCell>
            <TableCell className="text-sm">₹{item.unit_cost}</TableCell>
            <TableCell className="font-medium text-sm">₹{(item.current_stock * item.unit_cost).toLocaleString()}</TableCell>
            <TableCell className="text-xs">{item.location}<br/><span className="text-muted-foreground">{item.shelf_number}</span></TableCell>
            <TableCell className="text-xs max-w-[100px] truncate">{item.supplier}</TableCell>
            <TableCell className="text-xs">{item.lead_time_days}d</TableCell>
            <TableCell>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "item", data: item })}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setFormItem(item); setItemModal({ open: true, editing: item }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setStockAdjustModal({ open: true, item }); setAdjustQty(0); setAdjustReason(""); }}><ArrowUpDown className="h-4 w-4 mr-2" /> Adjust Stock</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}</TableBody></Table></ScrollArea></CardContent></Card>
    </div>
  );

  // ============ CATEGORIES ============
  const renderCategories = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Material Categories</h3><Button onClick={() => { setFormCategory({}); setCategoryModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Category</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{categories.map(cat => (
        <Card key={cat.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex justify-between items-start"><div><p className="font-semibold">{cat.name}</p><p className="text-sm text-muted-foreground mt-1">{cat.description}</p></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setFormCategory(cat); setCategoryModal({ open: true, editing: cat }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeleteCategory(cat.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu></div>
          <div className="flex items-center gap-2 mt-3"><Badge variant="secondary">{items.filter(i => i.category === cat.name).length} items</Badge><Badge variant={cat.is_active ? "default" : "destructive"}>{cat.is_active ? "Active" : "Inactive"}</Badge></div>
        </CardContent></Card>
      ))}</div>
    </div>
  );

  // ============ STOCK TRANSACTIONS ============
  const renderTransactions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Stock Transactions</h3><Badge variant="outline">{transactions.length} records</Badge></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Before → After</TableHead><TableHead>Reference</TableHead><TableHead>Performed By</TableHead><TableHead>Date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
        <TableBody>{transactions.map(txn => (
          <TableRow key={txn.id}>
            <TableCell className="flex items-center gap-2">{getTxnIcon(txn.transaction_type)}<span className="capitalize text-sm">{txn.transaction_type}</span></TableCell>
            <TableCell className="font-medium text-sm">{txn.item_name}</TableCell>
            <TableCell><Badge variant={txn.quantity > 0 ? "default" : "destructive"}>{txn.quantity > 0 ? "+" : ""}{txn.quantity} {txn.unit}</Badge></TableCell>
            <TableCell className="text-sm">{txn.before_qty} → {txn.after_qty}</TableCell>
            <TableCell className="text-xs"><p>{txn.reference_type}</p><p className="text-muted-foreground">{txn.reference_number}</p></TableCell>
            <TableCell className="text-xs">{txn.performed_by}</TableCell>
            <TableCell className="text-xs">{format(new Date(txn.created_at), "dd MMM yyyy HH:mm")}</TableCell>
            <TableCell className="text-xs max-w-[150px] truncate">{txn.notes}</TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ WASTAGE ============
  const renderWastage = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Wastage & Loss Tracking</h3><Button onClick={() => { setFormWastage({}); setWastageModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Report Wastage</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Wastage Cost</p><p className="text-2xl font-bold text-orange-600">₹{totalWastageCost.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending Approval</p><p className="text-2xl font-bold">{wastageRecords.filter(w => w.status === "pending").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">This Month Records</p><p className="text-2xl font-bold">{wastageRecords.length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Type</TableHead><TableHead>Reason</TableHead><TableHead>Cost</TableHead><TableHead>Reported By</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{wastageRecords.map(w => (
          <TableRow key={w.id}>
            <TableCell className="font-medium">{w.item_name}</TableCell>
            <TableCell>{w.quantity} {w.unit}</TableCell>
            <TableCell><Badge variant="secondary" className="capitalize">{w.wastage_type}</Badge></TableCell>
            <TableCell className="text-sm max-w-[150px] truncate">{w.reason}</TableCell>
            <TableCell className="font-medium text-destructive">₹{w.cost.toLocaleString()}</TableCell>
            <TableCell className="text-xs">{w.reported_by}</TableCell>
            <TableCell><Badge variant={w.status === "approved" ? "default" : w.status === "pending" ? "outline" : "destructive"} className="capitalize">{w.status}</Badge></TableCell>
            <TableCell className="text-xs">{format(new Date(w.created_at), "dd MMM yyyy")}</TableCell>
            <TableCell>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {w.status === "pending" && <DropdownMenuItem onClick={() => handleApproveWastage(w.id)}><CheckCircle className="h-4 w-4 mr-2" /> Approve</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => { setFormWastage(w); setWastageModal({ open: true, editing: w }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteWastage(w.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ SUPPLIERS ============
  const renderSuppliers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search suppliers..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button onClick={() => { setFormSupplier({}); setSupplierModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(supplier => (
        <Card key={supplier.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4">
          <div className="flex justify-between items-start mb-3"><div><p className="font-semibold">{supplier.name}</p><div className="flex gap-1 mt-1"><Badge variant="secondary" className="capitalize">{supplier.category}</Badge>{supplier.gst_number && <Badge variant="outline" className="text-[10px]">GST</Badge>}</div></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "supplier", data: supplier })}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFormSupplier(supplier); setSupplierModal({ open: true, editing: supplier }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu></div>
          <div className="space-y-1 text-sm"><p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.contact_person}</p><p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.phone}</p><p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.email}</p><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.city}, {supplier.state}</p></div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between"><div className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`h-3.5 w-3.5 ${i < supplier.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />))}</div><span className="text-xs text-muted-foreground">{supplier.payment_terms}</span></div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>{supplier.total_orders} orders</span><span>₹{(supplier.total_value / 100000).toFixed(1)}L total</span><span>Credit: ₹{(supplier.credit_limit / 1000).toFixed(0)}K</span></div>
        </CardContent></Card>
      ))}</div>
    </div>
  );

  // ============ PURCHASE REQUESTS ============
  const renderPurchaseRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Purchase Requests</h3><Button onClick={() => { setFormPR({ items: [] }); setPrModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> New Request</Button></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>PR #</TableHead><TableHead>Department</TableHead><TableHead>Items</TableHead><TableHead>Est. Cost</TableHead><TableHead>Priority</TableHead><TableHead>Required</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{purchaseRequests.map(pr => (
          <TableRow key={pr.id}>
            <TableCell className="font-medium">{pr.request_number}</TableCell><TableCell className="capitalize">{pr.department}</TableCell><TableCell>{pr.items.length} items</TableCell>
            <TableCell className="font-medium">₹{pr.items.reduce((s, i) => s + i.estimated_cost, 0).toLocaleString()}</TableCell>
            <TableCell><Badge variant={getPriorityColor(pr.priority)} className="capitalize">{pr.priority}</Badge></TableCell><TableCell className="text-xs">{pr.required_date}</TableCell><TableCell><Badge variant={getStatusColor(pr.status)} className="capitalize">{pr.status}</Badge></TableCell><TableCell className="text-xs">{pr.created_at?.split("T")[0]}</TableCell>
            <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setViewModal({ open: true, type: "pr", data: pr })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>{pr.status === "pending" && <DropdownMenuItem onClick={() => handleApprovePR(pr.id)}><CheckCircle className="h-4 w-4 mr-2" /> Approve</DropdownMenuItem>}<DropdownMenuItem onClick={() => { setFormPR(pr); setPrModal({ open: true, editing: pr }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeletePR(pr.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu></TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ QUOTATIONS ============
  const renderQuotations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Quotations</h3><Button onClick={() => { setFormQT({ items: [] }); setQtModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Quotation</Button></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>QT #</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Valid Until</TableHead><TableHead>Delivery</TableHead><TableHead>Terms</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{quotations.map(qt => (
          <TableRow key={qt.id}><TableCell className="font-medium">{qt.quotation_number}</TableCell><TableCell>{qt.supplier_name}</TableCell><TableCell>{qt.items.length} items</TableCell><TableCell className="font-medium">₹{qt.total_amount.toLocaleString()}</TableCell><TableCell className="text-xs">{qt.valid_until}</TableCell><TableCell>{qt.delivery_days} days</TableCell><TableCell className="text-xs">{qt.payment_terms}</TableCell><TableCell><Badge variant={getStatusColor(qt.status)} className="capitalize">{qt.status}</Badge></TableCell>
            <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setViewModal({ open: true, type: "qt", data: qt })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>{qt.status !== "converted" && <DropdownMenuItem onClick={() => handleConvertQTtoPO(qt)}><ArrowRight className="h-4 w-4 mr-2" /> Convert to PO</DropdownMenuItem>}<DropdownMenuItem onClick={() => { setFormQT(qt); setQtModal({ open: true, editing: qt }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeleteQT(qt.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu></TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ PURCHASE ORDERS ============
  const renderPurchaseOrders = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Purchase Orders</h3><Button onClick={() => { setFormPO({ items: [] }); setPoModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> New PO</Button></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Delivery</TableHead><TableHead>Terms</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{purchaseOrders.map(po => (
          <TableRow key={po.id}><TableCell className="font-medium">{po.po_number}</TableCell><TableCell>{po.supplier_name}</TableCell><TableCell>{po.items.length} items</TableCell><TableCell className="font-medium">₹{po.total_amount.toLocaleString()}</TableCell><TableCell className="text-xs">{po.expected_delivery}</TableCell><TableCell className="text-xs">{po.payment_terms}</TableCell><TableCell><Badge variant={getStatusColor(po.status)} className="capitalize">{po.status.replace("_", " ")}</Badge></TableCell><TableCell className="text-xs">{po.created_at?.split("T")[0]}</TableCell>
            <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setViewModal({ open: true, type: "po", data: po })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>{(po.status === "sent" || po.status === "partially_received") && <DropdownMenuItem onClick={() => handleCreateGRN(po)}><Truck className="h-4 w-4 mr-2" /> Create GRN</DropdownMenuItem>}<DropdownMenuItem onClick={() => { setFormPO(po); setPoModal({ open: true, editing: po }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeletePO(po.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu></TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ GRN ============
  const renderGoodsReceipts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-semibold">Goods Receipt Notes (GRN)</h3></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>GRN #</TableHead><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Invoice #</TableHead><TableHead>Received By</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
        <TableBody>{goodsReceipts.map(grn => (
          <TableRow key={grn.id}><TableCell className="font-medium">{grn.grn_number}</TableCell><TableCell>{grn.po_number}</TableCell><TableCell>{grn.supplier_name}</TableCell><TableCell className="text-xs">{grn.invoice_number || "-"}</TableCell><TableCell>{grn.received_by_name}</TableCell><TableCell className="text-xs">{grn.received_date}</TableCell><TableCell><Badge variant={getStatusColor(grn.status)} className="capitalize">{grn.status}</Badge></TableCell>
            <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setViewModal({ open: true, type: "grn", data: grn })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem><DropdownMenuItem onClick={() => handleDeleteGRN(grn.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu></TableCell>
          </TableRow>
        ))}</TableBody></Table></CardContent></Card>
    </div>
  );

  // ============ REPORTS ============
  const renderReports = () => {
    const categoryValues = CATEGORIES.map(c => {
      const ci = items.filter(i => i.category === c);
      return { category: c, items: ci.length, value: ci.reduce((s, i) => s + i.current_stock * i.unit_cost, 0), lowStock: ci.filter(i => i.current_stock <= i.min_stock).length };
    }).filter(c => c.items > 0).sort((a, b) => b.value - a.value);

    const supplierSpend = suppliers.map(s => ({ name: s.name, orders: s.total_orders, value: s.total_value, rating: s.rating })).sort((a, b) => b.value - a.value);

    // ABC Analysis
    const itemsByValue = [...items].map(i => ({ ...i, totalValue: i.current_stock * i.unit_cost })).sort((a, b) => b.totalValue - a.totalValue);
    const grandTotal = itemsByValue.reduce((s, i) => s + i.totalValue, 0);
    let cumulative = 0;
    const abcItems = itemsByValue.map(i => { cumulative += i.totalValue; const pct = (cumulative / grandTotal) * 100; return { ...i, cumPct: pct, class: pct <= 70 ? "A" : pct <= 90 ? "B" : "C" as string }; });

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Inventory Reports & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Stock Value</p><p className="text-2xl font-bold">₹{(totalStockValue / 100000).toFixed(2)}L</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Items</p><p className="text-2xl font-bold">{items.filter(i => i.is_active).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Suppliers</p><p className="text-2xl font-bold">{suppliers.filter(s => s.is_active).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Wastage (Month)</p><p className="text-2xl font-bold text-destructive">₹{totalWastageCost.toLocaleString()}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">Stock Valuation by Category</CardTitle></CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Items</TableHead><TableHead>Value</TableHead><TableHead>% of Total</TableHead><TableHead>Low Stock</TableHead></TableRow></TableHeader>
              <TableBody>{categoryValues.map(c => (
                <TableRow key={c.category}><TableCell className="font-medium text-sm">{c.category}</TableCell><TableCell>{c.items}</TableCell><TableCell className="font-medium">₹{c.value.toLocaleString()}</TableCell><TableCell>{((c.value / totalStockValue) * 100).toFixed(1)}%</TableCell><TableCell>{c.lowStock > 0 ? <Badge variant="destructive">{c.lowStock}</Badge> : <span className="text-muted-foreground">0</span>}</TableCell></TableRow>
              ))}</TableBody></Table></CardContent>
          </Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-base">ABC Analysis</CardTitle><CardDescription>Items classified by stock value contribution</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded"><p className="text-lg font-bold text-green-700 dark:text-green-400">{abcItems.filter(i => i.class === "A").length}</p><p className="text-xs text-muted-foreground">Class A (70% value)</p></div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded"><p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{abcItems.filter(i => i.class === "B").length}</p><p className="text-xs text-muted-foreground">Class B (20% value)</p></div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded"><p className="text-lg font-bold text-red-700 dark:text-red-400">{abcItems.filter(i => i.class === "C").length}</p><p className="text-xs text-muted-foreground">Class C (10% value)</p></div>
              </div>
              <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Value</TableHead><TableHead>Class</TableHead></TableRow></TableHeader>
                <TableBody>{abcItems.slice(0, 8).map(i => (
                  <TableRow key={i.id}><TableCell className="text-sm">{i.name}</TableCell><TableCell className="font-medium">₹{i.totalValue.toLocaleString()}</TableCell><TableCell><Badge variant={i.class === "A" ? "default" : i.class === "B" ? "outline" : "secondary"}>{i.class}</Badge></TableCell></TableRow>
                ))}</TableBody></Table>
            </CardContent>
          </Card>
        </div>

        <Card><CardHeader className="pb-3"><CardTitle className="text-base">Supplier Spend Analysis</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Total Orders</TableHead><TableHead>Total Spend</TableHead><TableHead>Avg. Order</TableHead><TableHead>Rating</TableHead></TableRow></TableHeader>
            <TableBody>{supplierSpend.map(s => (
              <TableRow key={s.name}><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.orders}</TableCell><TableCell className="font-medium">₹{s.value.toLocaleString()}</TableCell><TableCell>₹{s.orders > 0 ? Math.round(s.value / s.orders).toLocaleString() : 0}</TableCell>
                <TableCell><div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`h-3 w-3 ${i < s.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />))}</div></TableCell></TableRow>
            ))}</TableBody></Table></CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold flex items-center gap-2"><Box className="h-6 w-6 text-primary" /> Inventory & Procurement</h2></div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
            <TabsTrigger value="items" className="gap-1 text-xs"><Package className="h-3.5 w-3.5" /> Items</TabsTrigger>
            <TabsTrigger value="categories" className="gap-1 text-xs"><FolderTree className="h-3.5 w-3.5" /> Categories</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1 text-xs"><History className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
            <TabsTrigger value="wastage" className="gap-1 text-xs"><Recycle className="h-3.5 w-3.5" /> Wastage</TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Suppliers</TabsTrigger>
            <TabsTrigger value="pr" className="gap-1 text-xs"><ClipboardList className="h-3.5 w-3.5" /> Purchase Requests</TabsTrigger>
            <TabsTrigger value="quotations" className="gap-1 text-xs"><Receipt className="h-3.5 w-3.5" /> Quotations</TabsTrigger>
            <TabsTrigger value="po" className="gap-1 text-xs"><ShoppingCart className="h-3.5 w-3.5" /> Purchase Orders</TabsTrigger>
            <TabsTrigger value="grn" className="gap-1 text-xs"><Truck className="h-3.5 w-3.5" /> Goods Receipt</TabsTrigger>
            <TabsTrigger value="reports" className="gap-1 text-xs"><PieChart className="h-3.5 w-3.5" /> Reports</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="dashboard" className="mt-4">{renderDashboard()}</TabsContent>
        <TabsContent value="items" className="mt-4">{renderItems()}</TabsContent>
        <TabsContent value="categories" className="mt-4">{renderCategories()}</TabsContent>
        <TabsContent value="transactions" className="mt-4">{renderTransactions()}</TabsContent>
        <TabsContent value="wastage" className="mt-4">{renderWastage()}</TabsContent>
        <TabsContent value="suppliers" className="mt-4">{renderSuppliers()}</TabsContent>
        <TabsContent value="pr" className="mt-4">{renderPurchaseRequests()}</TabsContent>
        <TabsContent value="quotations" className="mt-4">{renderQuotations()}</TabsContent>
        <TabsContent value="po" className="mt-4">{renderPurchaseOrders()}</TabsContent>
        <TabsContent value="grn" className="mt-4">{renderGoodsReceipts()}</TabsContent>
        <TabsContent value="reports" className="mt-4">{renderReports()}</TabsContent>
      </Tabs>

      {/* ====== SUPPLIER MODAL ====== */}
      <Dialog open={supplierModal.open} onOpenChange={(o) => { setSupplierModal({ open: o }); if (!o) setFormSupplier({}); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{supplierModal.editing ? "Edit" : "Add"} Supplier</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[65vh]"><div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3"><div><Label>Name *</Label><Input value={formSupplier.name || ""} onChange={e => setFormSupplier(p => ({ ...p, name: e.target.value }))} /></div><div><Label>Contact Person</Label><Input value={formSupplier.contact_person || ""} onChange={e => setFormSupplier(p => ({ ...p, contact_person: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Email</Label><Input type="email" value={formSupplier.email || ""} onChange={e => setFormSupplier(p => ({ ...p, email: e.target.value }))} /></div><div><Label>Phone</Label><Input value={formSupplier.phone || ""} onChange={e => setFormSupplier(p => ({ ...p, phone: e.target.value }))} /></div></div>
            <div><Label>Address</Label><Input value={formSupplier.address || ""} onChange={e => setFormSupplier(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3"><div><Label>City</Label><Input value={formSupplier.city || ""} onChange={e => setFormSupplier(p => ({ ...p, city: e.target.value }))} /></div><div><Label>State</Label><Input value={formSupplier.state || ""} onChange={e => setFormSupplier(p => ({ ...p, state: e.target.value }))} /></div><div><Label>Pincode</Label><Input value={formSupplier.pincode || ""} onChange={e => setFormSupplier(p => ({ ...p, pincode: e.target.value }))} /></div></div>
            <div className="grid grid-cols-3 gap-3"><div><Label>GST Number</Label><Input value={formSupplier.gst_number || ""} onChange={e => setFormSupplier(p => ({ ...p, gst_number: e.target.value }))} /></div><div><Label>PAN Number</Label><Input value={formSupplier.pan_number || ""} onChange={e => setFormSupplier(p => ({ ...p, pan_number: e.target.value }))} /></div><div><Label>Category</Label><Select value={formSupplier.category || "general"} onValueChange={v => setFormSupplier(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SUPPLIER_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div></div>
            <Separator /><p className="text-sm font-medium text-muted-foreground">Banking Details</p>
            <div className="grid grid-cols-3 gap-3"><div><Label>Bank Name</Label><Input value={formSupplier.bank_name || ""} onChange={e => setFormSupplier(p => ({ ...p, bank_name: e.target.value }))} /></div><div><Label>Account No.</Label><Input value={formSupplier.bank_account || ""} onChange={e => setFormSupplier(p => ({ ...p, bank_account: e.target.value }))} /></div><div><Label>IFSC Code</Label><Input value={formSupplier.ifsc_code || ""} onChange={e => setFormSupplier(p => ({ ...p, ifsc_code: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Payment Terms</Label><Select value={formSupplier.payment_terms || "Net 30"} onValueChange={v => setFormSupplier(p => ({ ...p, payment_terms: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COD">COD</SelectItem><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select></div><div><Label>Credit Limit (₹)</Label><Input type="number" value={formSupplier.credit_limit || 0} onChange={e => setFormSupplier(p => ({ ...p, credit_limit: +e.target.value }))} /></div></div>
            <div><Label>Notes</Label><Textarea value={formSupplier.notes || ""} onChange={e => setFormSupplier(p => ({ ...p, notes: e.target.value }))} /></div>
          </div></ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setSupplierModal({ open: false })}>Cancel</Button><Button onClick={handleSaveSupplier}>{supplierModal.editing ? "Update" : "Add"} Supplier</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== ITEM MODAL ====== */}
      <Dialog open={itemModal.open} onOpenChange={(o) => { setItemModal({ open: o }); if (!o) setFormItem({}); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{itemModal.editing ? "Edit" : "Add"} Inventory Item</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[65vh]"><div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3"><div><Label>Name *</Label><Input value={formItem.name || ""} onChange={e => setFormItem(p => ({ ...p, name: e.target.value }))} /></div><div><Label>Brand</Label><Input value={formItem.brand || ""} onChange={e => setFormItem(p => ({ ...p, brand: e.target.value }))} /></div></div>
            <div><Label>Description</Label><Textarea value={formItem.description || ""} onChange={e => setFormItem(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3"><div><Label>SKU</Label><Input value={formItem.sku || ""} onChange={e => setFormItem(p => ({ ...p, sku: e.target.value }))} /></div><div><Label>HSN Code</Label><Input value={formItem.hsn_code || ""} onChange={e => setFormItem(p => ({ ...p, hsn_code: e.target.value }))} /></div><div><Label>Barcode</Label><Input value={formItem.barcode || ""} onChange={e => setFormItem(p => ({ ...p, barcode: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Category</Label><Select value={formItem.category || "Guest Room Supplies"} onValueChange={v => setFormItem(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div><Label>Sub-category</Label><Input value={formItem.sub_category || ""} onChange={e => setFormItem(p => ({ ...p, sub_category: e.target.value }))} /></div></div>
            <Separator /><p className="text-sm font-medium text-muted-foreground">Stock Levels</p>
            <div className="grid grid-cols-4 gap-3"><div><Label>Current Stock</Label><Input type="number" value={formItem.current_stock ?? 0} onChange={e => setFormItem(p => ({ ...p, current_stock: +e.target.value }))} /></div><div><Label>Min Stock</Label><Input type="number" value={formItem.min_stock ?? 5} onChange={e => setFormItem(p => ({ ...p, min_stock: +e.target.value }))} /></div><div><Label>Reorder Level</Label><Input type="number" value={formItem.reorder_level ?? 10} onChange={e => setFormItem(p => ({ ...p, reorder_level: +e.target.value }))} /></div><div><Label>Max Stock</Label><Input type="number" value={formItem.max_stock ?? 100} onChange={e => setFormItem(p => ({ ...p, max_stock: +e.target.value }))} /></div></div>
            <div className="grid grid-cols-4 gap-3"><div><Label>Unit</Label><Select value={formItem.unit || "pieces"} onValueChange={v => setFormItem(p => ({ ...p, unit: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}</SelectContent></Select></div><div><Label>Unit Cost (₹)</Label><Input type="number" value={formItem.unit_cost ?? 0} onChange={e => setFormItem(p => ({ ...p, unit_cost: +e.target.value }))} /></div><div><Label>Tax Rate (%)</Label><Input type="number" value={formItem.tax_rate ?? 18} onChange={e => setFormItem(p => ({ ...p, tax_rate: +e.target.value }))} /></div><div><Label>Lead Time (days)</Label><Input type="number" value={formItem.lead_time_days ?? 7} onChange={e => setFormItem(p => ({ ...p, lead_time_days: +e.target.value }))} /></div></div>
            <Separator /><p className="text-sm font-medium text-muted-foreground">Storage & Supplier</p>
            <div className="grid grid-cols-3 gap-3"><div><Label>Location</Label><Input value={formItem.location || ""} onChange={e => setFormItem(p => ({ ...p, location: e.target.value }))} /></div><div><Label>Shelf Number</Label><Input value={formItem.shelf_number || ""} onChange={e => setFormItem(p => ({ ...p, shelf_number: e.target.value }))} /></div><div><Label>Batch Number</Label><Input value={formItem.batch_number || ""} onChange={e => setFormItem(p => ({ ...p, batch_number: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Supplier</Label><Select value={formItem.supplier_id || ""} onValueChange={v => { const s = suppliers.find(s => s.id === v); setFormItem(p => ({ ...p, supplier_id: v, supplier: s?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Expiry Date</Label><Input type="date" value={formItem.expiry_date || ""} onChange={e => setFormItem(p => ({ ...p, expiry_date: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Manufacturer</Label><Input value={formItem.manufacturer || ""} onChange={e => setFormItem(p => ({ ...p, manufacturer: e.target.value }))} /></div></div>
            <div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><Checkbox checked={formItem.is_perishable || false} onCheckedChange={v => setFormItem(p => ({ ...p, is_perishable: !!v }))} /> Perishable</label><label className="flex items-center gap-2 text-sm"><Checkbox checked={formItem.is_returnable || false} onCheckedChange={v => setFormItem(p => ({ ...p, is_returnable: !!v }))} /> Returnable</label></div>
          </div></ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setItemModal({ open: false })}>Cancel</Button><Button onClick={handleSaveItem}>{itemModal.editing ? "Update" : "Add"} Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== STOCK ADJUSTMENT MODAL ====== */}
      <Dialog open={stockAdjustModal.open} onOpenChange={(o) => { setStockAdjustModal({ open: o }); if (!o) { setAdjustQty(0); setAdjustReason(""); } }}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Adjust Stock: {stockAdjustModal.item?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded"><span className="text-sm">Current Stock</span><Badge>{stockAdjustModal.item?.current_stock} {stockAdjustModal.item?.unit}</Badge></div>
            <div><Label>Adjustment Type</Label><Select value={adjustType} onValueChange={v => setAdjustType(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="add">Add Stock</SelectItem><SelectItem value="remove">Remove Stock</SelectItem><SelectItem value="set">Set Exact Count</SelectItem></SelectContent></Select></div>
            <div><Label>Quantity</Label><Input type="number" value={adjustQty} onChange={e => setAdjustQty(+e.target.value)} min={0} /></div>
            <div><Label>Reason *</Label><Textarea value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Physical count, damage, audit correction..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setStockAdjustModal({ open: false })}>Cancel</Button><Button onClick={handleStockAdjust}>Adjust Stock</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== CATEGORY MODAL ====== */}
      <Dialog open={categoryModal.open} onOpenChange={(o) => { setCategoryModal({ open: o }); if (!o) setFormCategory({}); }}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{categoryModal.editing ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
          <div className="space-y-3"><div><Label>Name *</Label><Input value={formCategory.name || ""} onChange={e => setFormCategory(p => ({ ...p, name: e.target.value }))} /></div><div><Label>Description</Label><Textarea value={formCategory.description || ""} onChange={e => setFormCategory(p => ({ ...p, description: e.target.value }))} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setCategoryModal({ open: false })}>Cancel</Button><Button onClick={handleSaveCategory}>{categoryModal.editing ? "Update" : "Add"} Category</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== WASTAGE MODAL ====== */}
      <Dialog open={wastageModal.open} onOpenChange={(o) => { setWastageModal({ open: o }); if (!o) setFormWastage({}); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{wastageModal.editing ? "Edit" : "Report"} Wastage</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Item *</Label><Select value={formWastage.item_name || ""} onValueChange={v => setFormWastage(p => ({ ...p, item_name: v, item_id: items.find(i => i.name === v)?.id || "" }))}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map(i => <SelectItem key={i.id} value={i.name}>{i.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Quantity *</Label><Input type="number" value={formWastage.quantity || 0} onChange={e => setFormWastage(p => ({ ...p, quantity: +e.target.value }))} /></div><div><Label>Type</Label><Select value={formWastage.wastage_type || "damage"} onValueChange={v => setFormWastage(p => ({ ...p, wastage_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WASTAGE_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div></div>
            <div><Label>Reason</Label><Input value={formWastage.reason || ""} onChange={e => setFormWastage(p => ({ ...p, reason: e.target.value }))} /></div>
            <div><Label>Reported By</Label><Input value={formWastage.reported_by || ""} onChange={e => setFormWastage(p => ({ ...p, reported_by: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={formWastage.notes || ""} onChange={e => setFormWastage(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setWastageModal({ open: false })}>Cancel</Button><Button onClick={handleSaveWastage}>{wastageModal.editing ? "Update" : "Report"} Wastage</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== PR MODAL ====== */}
      <Dialog open={prModal.open} onOpenChange={(o) => { setPrModal({ open: o }); if (!o) setFormPR({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{prModal.editing ? "Edit" : "New"} Purchase Request</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]"><div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3"><div><Label>Requested By *</Label><Input value={formPR.requested_by_name || ""} onChange={e => setFormPR(p => ({ ...p, requested_by_name: e.target.value }))} /></div><div><Label>Department</Label><Select value={formPR.department || "general"} onValueChange={v => setFormPR(p => ({ ...p, department: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="housekeeping">Housekeeping</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="kitchen">Kitchen</SelectItem><SelectItem value="front_desk">Front Desk</SelectItem><SelectItem value="inventory">Inventory</SelectItem><SelectItem value="laundry">Laundry</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Priority</Label><Select value={formPR.priority || "medium"} onValueChange={v => setFormPR(p => ({ ...p, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div><div><Label>Required Date</Label><Input type="date" value={formPR.required_date || ""} onChange={e => setFormPR(p => ({ ...p, required_date: e.target.value }))} /></div></div>
            <div><Label>Notes</Label><Textarea value={formPR.notes || ""} onChange={e => setFormPR(p => ({ ...p, notes: e.target.value }))} /></div>
            <Separator /><div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addPRItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
            {(formPR.items || []).map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end"><div className="col-span-4"><Label className="text-xs">Item Name</Label><Input value={item.item_name} onChange={e => updatePRItem(item.id, "item_name", e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updatePRItem(item.id, "quantity", +e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updatePRItem(item.id, "unit", e.target.value)} /></div><div className="col-span-3"><Label className="text-xs">Est. Cost</Label><Input type="number" value={item.estimated_cost} onChange={e => updatePRItem(item.id, "estimated_cost", +e.target.value)} /></div><div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePRItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>
            ))}
          </div></ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setPrModal({ open: false })}>Cancel</Button><Button onClick={handleSavePR}>{prModal.editing ? "Update" : "Create"} Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== PO MODAL ====== */}
      <Dialog open={poModal.open} onOpenChange={(o) => { setPoModal({ open: o }); if (!o) setFormPO({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{poModal.editing ? "Edit" : "New"} Purchase Order</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]"><div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3"><div><Label>Supplier *</Label><Select value={formPO.supplier_id || ""} onValueChange={v => { const s = suppliers.find(s => s.id === v); setFormPO(p => ({ ...p, supplier_id: v, supplier_name: s?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Expected Delivery</Label><Input type="date" value={formPO.expected_delivery || ""} onChange={e => setFormPO(p => ({ ...p, expected_delivery: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Payment Terms</Label><Select value={formPO.payment_terms || "Net 30"} onValueChange={v => setFormPO(p => ({ ...p, payment_terms: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COD">COD</SelectItem><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select></div><div><Label>Delivery Address</Label><Input value={formPO.delivery_address || ""} onChange={e => setFormPO(p => ({ ...p, delivery_address: e.target.value }))} /></div></div>
            <Separator /><div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addPOItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
            {(formPO.items || []).map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end"><div className="col-span-3"><Label className="text-xs">Item</Label><Input value={item.item_name} onChange={e => updatePOItem(item.id, "item_name", e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updatePOItem(item.id, "quantity", +e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updatePOItem(item.id, "unit", e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Price</Label><Input type="number" value={item.unit_price} onChange={e => updatePOItem(item.id, "unit_price", +e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Total</Label><Input value={item.total_price} disabled /></div><div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePOItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>
            ))}
            {(formPO.items?.length || 0) > 0 && (<div className="text-right space-y-1 text-sm"><p>Subtotal: ₹{(formPO.items || []).reduce((s, i) => s + i.total_price, 0).toLocaleString()}</p><p>Tax: ₹{(formPO.items || []).reduce((s, i) => s + (i.total_price * (i.tax_rate || 18) / 100), 0).toLocaleString()}</p><p className="font-bold">Total: ₹{(formPO.items || []).reduce((s, i) => s + i.total_price + (i.total_price * (i.tax_rate || 18) / 100), 0).toLocaleString()}</p></div>)}
          </div></ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setPoModal({ open: false })}>Cancel</Button><Button onClick={handleSavePO}>{poModal.editing ? "Update" : "Create"} PO</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== QT MODAL ====== */}
      <Dialog open={qtModal.open} onOpenChange={(o) => { setQtModal({ open: o }); if (!o) setFormQT({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{qtModal.editing ? "Edit" : "Add"} Quotation</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]"><div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3"><div><Label>Supplier *</Label><Select value={formQT.supplier_id || ""} onValueChange={v => { const s = suppliers.find(s => s.id === v); setFormQT(p => ({ ...p, supplier_id: v, supplier_name: s?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Valid Until</Label><Input type="date" value={formQT.valid_until || ""} onChange={e => setFormQT(p => ({ ...p, valid_until: e.target.value }))} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Delivery Days</Label><Input type="number" value={formQT.delivery_days || 7} onChange={e => setFormQT(p => ({ ...p, delivery_days: +e.target.value }))} /></div><div><Label>Payment Terms</Label><Input value={formQT.payment_terms || ""} onChange={e => setFormQT(p => ({ ...p, payment_terms: e.target.value }))} /></div></div>
            <Separator /><div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addQTItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
            {(formQT.items || []).map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end"><div className="col-span-3"><Label className="text-xs">Item</Label><Input value={item.item_name} onChange={e => updateQTItem(item.id, "item_name", e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updateQTItem(item.id, "quantity", +e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updateQTItem(item.id, "unit", e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Price</Label><Input type="number" value={item.unit_price} onChange={e => updateQTItem(item.id, "unit_price", +e.target.value)} /></div><div className="col-span-2"><Label className="text-xs">Total</Label><Input value={item.total_price} disabled /></div><div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeQTItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>
            ))}
          </div></ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setQtModal({ open: false })}>Cancel</Button><Button onClick={handleSaveQT}>{qtModal.editing ? "Update" : "Save"} Quotation</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== VIEW MODAL ====== */}
      <Dialog open={viewModal.open} onOpenChange={(o) => setViewModal({ open: o, type: "", data: null })}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>
          {viewModal.type === "pr" && `Purchase Request: ${viewModal.data?.request_number}`}
          {viewModal.type === "po" && `Purchase Order: ${viewModal.data?.po_number}`}
          {viewModal.type === "qt" && `Quotation: ${viewModal.data?.quotation_number}`}
          {viewModal.type === "grn" && `GRN: ${viewModal.data?.grn_number}`}
          {viewModal.type === "item" && `Item: ${viewModal.data?.name}`}
          {viewModal.type === "supplier" && `Supplier: ${viewModal.data?.name}`}
        </DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {viewModal.type === "item" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">SKU:</span> <span className="font-mono font-medium">{viewModal.data.sku}</span></div>
                  <div><span className="text-muted-foreground">Barcode:</span> <span className="font-mono">{viewModal.data.barcode || "-"}</span></div>
                  <div><span className="text-muted-foreground">HSN Code:</span> <span>{viewModal.data.hsn_code || "-"}</span></div>
                  <div><span className="text-muted-foreground">Category:</span> <span>{viewModal.data.category}</span></div>
                  <div><span className="text-muted-foreground">Sub-category:</span> <span>{viewModal.data.sub_category || "-"}</span></div>
                  <div><span className="text-muted-foreground">Brand:</span> <span>{viewModal.data.brand || "-"}</span></div>
                  <div><span className="text-muted-foreground">Manufacturer:</span> <span>{viewModal.data.manufacturer || "-"}</span></div>
                  <div><span className="text-muted-foreground">Unit Cost:</span> <span className="font-medium">₹{viewModal.data.unit_cost}</span></div>
                  <div><span className="text-muted-foreground">Tax Rate:</span> <span>{viewModal.data.tax_rate}%</span></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Current Stock:</span> <Badge variant={viewModal.data.current_stock <= viewModal.data.min_stock ? "destructive" : "default"}>{viewModal.data.current_stock} {viewModal.data.unit}</Badge></div>
                  <div><span className="text-muted-foreground">Min / Reorder / Max:</span> <span>{viewModal.data.min_stock} / {viewModal.data.reorder_level} / {viewModal.data.max_stock}</span></div>
                  <div><span className="text-muted-foreground">Stock Value:</span> <span className="font-medium">₹{(viewModal.data.current_stock * viewModal.data.unit_cost).toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Avg Daily Usage:</span> <span>{viewModal.data.avg_daily_consumption} {viewModal.data.unit}/day</span></div>
                  <div><span className="text-muted-foreground">Days of Stock:</span> <span className="font-medium">{viewModal.data.avg_daily_consumption > 0 ? Math.floor(viewModal.data.current_stock / viewModal.data.avg_daily_consumption) : "∞"} days</span></div>
                  <div><span className="text-muted-foreground">Lead Time:</span> <span>{viewModal.data.lead_time_days} days</span></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Location:</span> <span>{viewModal.data.location} ({viewModal.data.shelf_number})</span></div>
                  <div><span className="text-muted-foreground">Batch:</span> <span>{viewModal.data.batch_number || "-"}</span></div>
                  <div><span className="text-muted-foreground">Expiry:</span> <span>{viewModal.data.expiry_date || "N/A"}</span></div>
                  <div><span className="text-muted-foreground">Supplier:</span> <span>{viewModal.data.supplier}</span></div>
                  <div><span className="text-muted-foreground">Last Restocked:</span> <span>{viewModal.data.last_restocked || "-"}</span></div>
                  <div><span className="text-muted-foreground">Last Issued:</span> <span>{viewModal.data.last_issued || "-"}</span></div>
                </div>
                {viewModal.data.description && <p className="text-sm bg-muted p-2 rounded">{viewModal.data.description}</p>}
                <div className="flex gap-2"><Badge variant={viewModal.data.is_perishable ? "destructive" : "secondary"}>{viewModal.data.is_perishable ? "Perishable" : "Non-perishable"}</Badge><Badge variant={viewModal.data.is_returnable ? "default" : "secondary"}>{viewModal.data.is_returnable ? "Returnable" : "Non-returnable"}</Badge></div>
              </div>
            )}
            {viewModal.type === "supplier" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{viewModal.data.contact_person}</span></div>
                  <div><span className="text-muted-foreground">Category:</span> <Badge variant="secondary" className="capitalize">{viewModal.data.category}</Badge></div>
                  <div><span className="text-muted-foreground">Phone:</span> <span>{viewModal.data.phone}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span>{viewModal.data.email}</span></div>
                  <div><span className="text-muted-foreground">Address:</span> <span>{viewModal.data.address}, {viewModal.data.city}, {viewModal.data.state} - {viewModal.data.pincode}</span></div>
                  <div><span className="text-muted-foreground">GST:</span> <span className="font-mono">{viewModal.data.gst_number || "-"}</span></div>
                  <div><span className="text-muted-foreground">PAN:</span> <span className="font-mono">{viewModal.data.pan_number || "-"}</span></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Bank:</span> <span>{viewModal.data.bank_name || "-"}</span></div>
                  <div><span className="text-muted-foreground">Account:</span> <span>{viewModal.data.bank_account || "-"}</span></div>
                  <div><span className="text-muted-foreground">IFSC:</span> <span>{viewModal.data.ifsc_code || "-"}</span></div>
                  <div><span className="text-muted-foreground">Credit Limit:</span> <span className="font-medium">₹{viewModal.data.credit_limit?.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Payment Terms:</span> <span>{viewModal.data.payment_terms}</span></div>
                  <div><span className="text-muted-foreground">Total Orders:</span> <span>{viewModal.data.total_orders}</span></div>
                  <div><span className="text-muted-foreground">Total Value:</span> <span className="font-medium">₹{viewModal.data.total_value?.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Last Order:</span> <span>{viewModal.data.last_order_date || "-"}</span></div>
                </div>
                {viewModal.data.notes && <p className="text-sm bg-muted p-2 rounded">{viewModal.data.notes}</p>}
              </div>
            )}
            {viewModal.type === "pr" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Department:</span> <span className="capitalize font-medium">{viewModal.data.department}</span></div>
                  <div><span className="text-muted-foreground">Priority:</span> <Badge variant={getPriorityColor(viewModal.data.priority)} className="capitalize ml-1">{viewModal.data.priority}</Badge></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Required:</span> <span className="font-medium">{viewModal.data.required_date}</span></div>
                </div>
                {viewModal.data.notes && <p className="text-sm bg-muted p-2 rounded">{viewModal.data.notes}</p>}
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Unit</TableHead><TableHead>Est. Cost</TableHead></TableRow></TableHeader><TableBody>{viewModal.data.items?.map((item: PRItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.unit}</TableCell><TableCell>₹{item.estimated_cost.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
                <p className="text-right font-bold">Total: ₹{viewModal.data.items?.reduce((s: number, i: PRItem) => s + i.estimated_cost, 0).toLocaleString()}</p>
              </div>
            )}
            {viewModal.type === "po" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Delivery:</span> <span>{viewModal.data.expected_delivery}</span></div>
                  <div><span className="text-muted-foreground">Terms:</span> <span>{viewModal.data.payment_terms}</span></div>
                  {viewModal.data.delivery_address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span>{viewModal.data.delivery_address}</span></div>}
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead><TableHead>Received</TableHead></TableRow></TableHeader><TableBody>{viewModal.data.items?.map((item: POItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>₹{item.unit_price}</TableCell><TableCell>₹{item.total_price.toLocaleString()}</TableCell><TableCell>{item.received_quantity}/{item.quantity}</TableCell></TableRow>))}</TableBody></Table>
                <div className="text-right text-sm space-y-1"><p>Subtotal: ₹{viewModal.data.subtotal.toLocaleString()}</p><p>Tax: ₹{viewModal.data.tax_amount.toLocaleString()}</p><p className="font-bold text-base">Total: ₹{viewModal.data.total_amount.toLocaleString()}</p></div>
              </div>
            )}
            {viewModal.type === "qt" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Valid Until:</span> <span>{viewModal.data.valid_until}</span></div>
                  <div><span className="text-muted-foreground">Delivery:</span> <span>{viewModal.data.delivery_days} days</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead></TableRow></TableHeader><TableBody>{viewModal.data.items?.map((item: QTItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>₹{item.unit_price}</TableCell><TableCell>₹{item.total_price.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
                <p className="text-right font-bold">Total: ₹{viewModal.data.total_amount.toLocaleString()}</p>
              </div>
            )}
            {viewModal.type === "grn" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">PO:</span> <span className="font-medium">{viewModal.data.po_number}</span></div>
                  <div><span className="text-muted-foreground">Supplier:</span> <span>{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Received By:</span> <span>{viewModal.data.received_by_name}</span></div>
                  <div><span className="text-muted-foreground">Date:</span> <span>{viewModal.data.received_date}</span></div>
                  <div><span className="text-muted-foreground">Invoice #:</span> <span>{viewModal.data.invoice_number || "-"}</span></div>
                  <div><span className="text-muted-foreground">Invoice Amt:</span> <span>{viewModal.data.invoice_amount ? `₹${viewModal.data.invoice_amount.toLocaleString()}` : "-"}</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead><TableHead>Accepted</TableHead><TableHead>Rejected</TableHead><TableHead>Batch</TableHead></TableRow></TableHeader>
                  <TableBody>{viewModal.data.items?.map((item: GRNItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.ordered_quantity}</TableCell><TableCell>{item.received_quantity}</TableCell><TableCell className="text-green-600">{item.accepted_quantity}</TableCell><TableCell className="text-destructive">{item.rejected_quantity}{item.rejection_reason && ` (${item.rejection_reason})`}</TableCell><TableCell className="text-xs">{item.batch_number || "-"}</TableCell></TableRow>))}</TableBody>
                </Table>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
