import { useState } from "react";
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
import { toast } from "sonner";
import {
  Package, Plus, Search, Edit, Trash2, Eye, MoreHorizontal,
  ShoppingCart, FileText, Send, CheckCircle, XCircle, Truck,
  Users, Star, Phone, Mail, MapPin, ClipboardList, ArrowRight,
  BarChart3, AlertTriangle, TrendingUp, TrendingDown, Box, Layers,
  Receipt, Filter
} from "lucide-react";
import { format } from "date-fns";

// Types
interface Supplier {
  id: string; name: string; contact_person: string; email: string; phone: string;
  address: string; city: string; gst_number: string; category: string;
  payment_terms: string; rating: number; is_active: boolean; notes: string;
}

interface InventoryItem {
  id: string; name: string; category: string; sku: string; current_stock: number;
  min_stock: number; max_stock: number; unit: string; unit_cost: number;
  supplier: string; location: string; is_active: boolean;
}

interface PurchaseRequest {
  id: string; request_number: string; requested_by_name: string; department: string;
  priority: string; status: string; notes: string; required_date: string;
  items: PRItem[]; created_at: string;
}

interface PRItem {
  id: string; item_name: string; quantity: number; unit: string; estimated_cost: number;
}

interface PurchaseOrder {
  id: string; po_number: string; supplier_name: string; supplier_id: string;
  status: string; subtotal: number; tax_amount: number; total_amount: number;
  expected_delivery: string; payment_terms: string; items: POItem[]; created_at: string;
}

interface POItem {
  id: string; item_name: string; quantity: number; unit: string;
  unit_price: number; total_price: number; received_quantity: number;
}

interface Quotation {
  id: string; quotation_number: string; supplier_name: string; supplier_id: string;
  status: string; total_amount: number; valid_until: string;
  delivery_days: number; items: QTItem[]; created_at: string;
}

interface QTItem {
  id: string; item_name: string; quantity: number; unit: string;
  unit_price: number; total_price: number;
}

interface GoodsReceipt {
  id: string; grn_number: string; po_number: string; supplier_name: string;
  received_by_name: string; status: string; received_date: string;
  items: GRNItem[]; created_at: string;
}

interface GRNItem {
  id: string; item_name: string; ordered_quantity: number; received_quantity: number;
  accepted_quantity: number; rejected_quantity: number; rejection_reason: string;
}

// Demo data
const DEMO_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Hotel Essentials Pvt Ltd", contact_person: "Rajesh Kumar", email: "rajesh@hotelessentials.com", phone: "+91 9876543210", address: "123 Industrial Area", city: "Hyderabad", gst_number: "36AABCH1234A1Z5", category: "general", payment_terms: "Net 30", rating: 4, is_active: true, notes: "Reliable supplier" },
  { id: "s2", name: "CleanPro Supplies", contact_person: "Anita Sharma", email: "anita@cleanpro.in", phone: "+91 9876543211", address: "45 MG Road", city: "Mumbai", gst_number: "27AABCC5678B2Z3", category: "cleaning", payment_terms: "Net 15", rating: 5, is_active: true, notes: "Best cleaning supplies" },
  { id: "s3", name: "FreshFoods Co", contact_person: "Mohammed Ali", email: "ali@freshfoods.com", phone: "+91 9876543212", address: "78 Food Park", city: "Bangalore", gst_number: "29AABCF9012C3Z1", category: "food", payment_terms: "COD", rating: 3, is_active: true, notes: "" },
  { id: "s4", name: "LuxLinens International", contact_person: "Priya Patel", email: "priya@luxlinens.com", phone: "+91 9876543213", address: "90 Textile Hub", city: "Ahmedabad", gst_number: "24AABCL3456D4Z8", category: "linen", payment_terms: "Net 45", rating: 4, is_active: true, notes: "Premium linens" },
];

const DEMO_ITEMS: InventoryItem[] = [
  { id: "i1", name: "Bath Towels (White)", category: "Linen", sku: "LIN-001", current_stock: 120, min_stock: 50, max_stock: 200, unit: "pieces", unit_cost: 350, supplier: "LuxLinens International", location: "Store Room A", is_active: true },
  { id: "i2", name: "Bed Sheets (King)", category: "Linen", sku: "LIN-002", current_stock: 80, min_stock: 30, max_stock: 150, unit: "pieces", unit_cost: 800, supplier: "LuxLinens International", location: "Store Room A", is_active: true },
  { id: "i3", name: "Toilet Paper Rolls", category: "Toiletries", sku: "TOI-001", current_stock: 500, min_stock: 200, max_stock: 1000, unit: "rolls", unit_cost: 25, supplier: "Hotel Essentials Pvt Ltd", location: "Store Room B", is_active: true },
  { id: "i4", name: "Shampoo Sachets", category: "Toiletries", sku: "TOI-002", current_stock: 800, min_stock: 300, max_stock: 2000, unit: "pieces", unit_cost: 12, supplier: "Hotel Essentials Pvt Ltd", location: "Store Room B", is_active: true },
  { id: "i5", name: "Floor Cleaner (5L)", category: "Cleaning", sku: "CLN-001", current_stock: 15, min_stock: 10, max_stock: 50, unit: "bottles", unit_cost: 450, supplier: "CleanPro Supplies", location: "Maintenance Room", is_active: true },
  { id: "i6", name: "Glass Cleaner (1L)", category: "Cleaning", sku: "CLN-002", current_stock: 8, min_stock: 10, max_stock: 30, unit: "bottles", unit_cost: 180, supplier: "CleanPro Supplies", location: "Maintenance Room", is_active: true },
  { id: "i7", name: "Pillow Covers", category: "Linen", sku: "LIN-003", current_stock: 200, min_stock: 60, max_stock: 300, unit: "pieces", unit_cost: 250, supplier: "LuxLinens International", location: "Store Room A", is_active: true },
  { id: "i8", name: "Hand Soap (250ml)", category: "Toiletries", sku: "TOI-003", current_stock: 150, min_stock: 50, max_stock: 400, unit: "bottles", unit_cost: 85, supplier: "Hotel Essentials Pvt Ltd", location: "Store Room B", is_active: true },
];

const DEMO_PRS: PurchaseRequest[] = [
  { id: "pr1", request_number: "PR-A1B2C3D4", requested_by_name: "Housekeeping Dept", department: "housekeeping", priority: "high", status: "approved", notes: "Urgent restocking needed", required_date: "2026-03-25", items: [{ id: "pri1", item_name: "Bath Towels (White)", quantity: 50, unit: "pieces", estimated_cost: 17500 }, { id: "pri2", item_name: "Bed Sheets (King)", quantity: 30, unit: "pieces", estimated_cost: 24000 }], created_at: "2026-03-18" },
  { id: "pr2", request_number: "PR-E5F6G7H8", requested_by_name: "Maintenance Dept", department: "maintenance", priority: "medium", status: "pending", notes: "Monthly cleaning supplies", required_date: "2026-03-30", items: [{ id: "pri3", item_name: "Floor Cleaner (5L)", quantity: 20, unit: "bottles", estimated_cost: 9000 }, { id: "pri4", item_name: "Glass Cleaner (1L)", quantity: 15, unit: "bottles", estimated_cost: 2700 }], created_at: "2026-03-19" },
];

const DEMO_POS: PurchaseOrder[] = [
  { id: "po1", po_number: "PO-X1Y2Z3A4", supplier_name: "LuxLinens International", supplier_id: "s4", status: "sent", subtotal: 41500, tax_amount: 7470, total_amount: 48970, expected_delivery: "2026-03-28", payment_terms: "Net 45", items: [{ id: "poi1", item_name: "Bath Towels (White)", quantity: 50, unit: "pieces", unit_price: 350, total_price: 17500, received_quantity: 0 }, { id: "poi2", item_name: "Bed Sheets (King)", quantity: 30, unit: "pieces", unit_price: 800, total_price: 24000, received_quantity: 0 }], created_at: "2026-03-19" },
  { id: "po2", po_number: "PO-B5C6D7E8", supplier_name: "CleanPro Supplies", supplier_id: "s2", status: "partially_received", subtotal: 11700, tax_amount: 2106, total_amount: 13806, expected_delivery: "2026-03-22", payment_terms: "Net 15", items: [{ id: "poi3", item_name: "Floor Cleaner (5L)", quantity: 20, unit: "bottles", unit_price: 450, total_price: 9000, received_quantity: 15 }, { id: "poi4", item_name: "Glass Cleaner (1L)", quantity: 15, unit: "bottles", unit_price: 180, total_price: 2700, received_quantity: 15 }], created_at: "2026-03-17" },
];

const DEMO_QUOTATIONS: Quotation[] = [
  { id: "qt1", quotation_number: "QT-M1N2O3P4", supplier_name: "LuxLinens International", supplier_id: "s4", status: "approved", total_amount: 48970, valid_until: "2026-04-15", delivery_days: 7, items: [{ id: "qti1", item_name: "Bath Towels (White)", quantity: 50, unit: "pieces", unit_price: 350, total_price: 17500 }, { id: "qti2", item_name: "Bed Sheets (King)", quantity: 30, unit: "pieces", unit_price: 800, total_price: 24000 }], created_at: "2026-03-17" },
  { id: "qt2", quotation_number: "QT-Q5R6S7T8", supplier_name: "Hotel Essentials Pvt Ltd", supplier_id: "s1", status: "received", total_amount: 52000, valid_until: "2026-04-10", delivery_days: 10, items: [{ id: "qti3", item_name: "Bath Towels (White)", quantity: 50, unit: "pieces", unit_price: 380, total_price: 19000 }, { id: "qti4", item_name: "Bed Sheets (King)", quantity: 30, unit: "pieces", unit_price: 850, total_price: 25500 }], created_at: "2026-03-17" },
];

const DEMO_GRNS: GoodsReceipt[] = [
  { id: "grn1", grn_number: "GRN-U1V2W3X4", po_number: "PO-B5C6D7E8", supplier_name: "CleanPro Supplies", received_by_name: "Store Manager", status: "partial", received_date: "2026-03-20", items: [{ id: "grni1", item_name: "Floor Cleaner (5L)", ordered_quantity: 20, received_quantity: 15, accepted_quantity: 15, rejected_quantity: 0, rejection_reason: "" }, { id: "grni2", item_name: "Glass Cleaner (1L)", ordered_quantity: 15, received_quantity: 15, accepted_quantity: 14, rejected_quantity: 1, rejection_reason: "Damaged bottle" }], created_at: "2026-03-20" },
];

const CATEGORIES = ["Linen", "Toiletries", "Cleaning", "Food & Beverage", "Equipment", "Stationery", "Electrical", "Plumbing", "Kitchen", "Other"];
const SUPPLIER_CATEGORIES = ["general", "cleaning", "food", "linen", "equipment", "electrical", "plumbing", "stationery"];

export const InventoryProcurement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEMO_SUPPLIERS);
  const [items, setItems] = useState<InventoryItem[]>(DEMO_ITEMS);
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
  const [grnModal, setGrnModal] = useState<{ open: boolean; editing?: GoodsReceipt }>({ open: false });
  const [viewModal, setViewModal] = useState<{ open: boolean; type: string; data: any }>({ open: false, type: "", data: null });

  // Form states
  const [formSupplier, setFormSupplier] = useState<Partial<Supplier>>({});
  const [formItem, setFormItem] = useState<Partial<InventoryItem>>({});
  const [formPR, setFormPR] = useState<Partial<PurchaseRequest & { items: PRItem[] }>>({ items: [] });
  const [formPO, setFormPO] = useState<Partial<PurchaseOrder & { items: POItem[] }>>({ items: [] });
  const [formQT, setFormQT] = useState<Partial<Quotation & { items: QTItem[] }>>({ items: [] });

  // Stats
  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock);
  const totalStockValue = items.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0);
  const pendingPOs = purchaseOrders.filter(po => po.status === "sent" || po.status === "approved");
  const pendingPRs = purchaseRequests.filter(pr => pr.status === "pending" || pr.status === "draft");

  // --- SUPPLIER CRUD ---
  const handleSaveSupplier = () => {
    if (!formSupplier.name) { toast.error("Supplier name is required"); return; }
    if (supplierModal.editing) {
      setSuppliers(prev => prev.map(s => s.id === supplierModal.editing!.id ? { ...s, ...formSupplier } as Supplier : s));
      toast.success("Supplier updated");
    } else {
      const newSupplier: Supplier = { id: `s${Date.now()}`, name: formSupplier.name!, contact_person: formSupplier.contact_person || "", email: formSupplier.email || "", phone: formSupplier.phone || "", address: formSupplier.address || "", city: formSupplier.city || "", gst_number: formSupplier.gst_number || "", category: formSupplier.category || "general", payment_terms: formSupplier.payment_terms || "Net 30", rating: formSupplier.rating || 3, is_active: true, notes: formSupplier.notes || "" };
      setSuppliers(prev => [newSupplier, ...prev]);
      toast.success("Supplier added");
    }
    setSupplierModal({ open: false });
    setFormSupplier({});
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success("Supplier deleted");
  };

  // --- ITEM CRUD ---
  const handleSaveItem = () => {
    if (!formItem.name) { toast.error("Item name is required"); return; }
    if (itemModal.editing) {
      setItems(prev => prev.map(i => i.id === itemModal.editing!.id ? { ...i, ...formItem } as InventoryItem : i));
      toast.success("Item updated");
    } else {
      const newItem: InventoryItem = { id: `i${Date.now()}`, name: formItem.name!, category: formItem.category || "Other", sku: formItem.sku || `SKU-${Date.now().toString(36).toUpperCase()}`, current_stock: formItem.current_stock || 0, min_stock: formItem.min_stock || 5, max_stock: formItem.max_stock || 100, unit: formItem.unit || "pieces", unit_cost: formItem.unit_cost || 0, supplier: formItem.supplier || "", location: formItem.location || "", is_active: true };
      setItems(prev => [newItem, ...prev]);
      toast.success("Item added");
    }
    setItemModal({ open: false });
    setFormItem({});
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Item deleted");
  };

  // --- PURCHASE REQUEST CRUD ---
  const handleSavePR = () => {
    if (!formPR.requested_by_name || (formPR.items?.length || 0) === 0) { toast.error("Fill department and add items"); return; }
    if (prModal.editing) {
      setPurchaseRequests(prev => prev.map(pr => pr.id === prModal.editing!.id ? { ...pr, ...formPR } as PurchaseRequest : pr));
      toast.success("Purchase request updated");
    } else {
      const newPR: PurchaseRequest = { id: `pr${Date.now()}`, request_number: `PR-${Date.now().toString(36).toUpperCase().slice(-8)}`, requested_by_name: formPR.requested_by_name!, department: formPR.department || "general", priority: formPR.priority || "medium", status: "draft", notes: formPR.notes || "", required_date: formPR.required_date || "", items: formPR.items || [], created_at: new Date().toISOString() };
      setPurchaseRequests(prev => [newPR, ...prev]);
      toast.success("Purchase request created");
    }
    setPrModal({ open: false });
    setFormPR({ items: [] });
  };

  const handleDeletePR = (id: string) => {
    setPurchaseRequests(prev => prev.filter(pr => pr.id !== id));
    toast.success("Purchase request deleted");
  };

  const handleApprovePR = (id: string) => {
    setPurchaseRequests(prev => prev.map(pr => pr.id === id ? { ...pr, status: "approved" } : pr));
    toast.success("Purchase request approved");
  };

  // --- PURCHASE ORDER CRUD ---
  const handleSavePO = () => {
    if (!formPO.supplier_name || (formPO.items?.length || 0) === 0) { toast.error("Select supplier and add items"); return; }
    if (poModal.editing) {
      setPurchaseOrders(prev => prev.map(po => po.id === poModal.editing!.id ? { ...po, ...formPO } as PurchaseOrder : po));
      toast.success("Purchase order updated");
    } else {
      const subtotal = (formPO.items || []).reduce((s, i) => s + i.total_price, 0);
      const tax = subtotal * 0.18;
      const newPO: PurchaseOrder = { id: `po${Date.now()}`, po_number: `PO-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: formPO.supplier_name!, supplier_id: formPO.supplier_id || "", status: "draft", subtotal, tax_amount: tax, total_amount: subtotal + tax, expected_delivery: formPO.expected_delivery || "", payment_terms: formPO.payment_terms || "Net 30", items: formPO.items || [], created_at: new Date().toISOString() };
      setPurchaseOrders(prev => [newPO, ...prev]);
      toast.success("Purchase order created");
    }
    setPoModal({ open: false });
    setFormPO({ items: [] });
  };

  const handleDeletePO = (id: string) => {
    setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    toast.success("Purchase order deleted");
  };

  // --- QUOTATION CRUD ---
  const handleSaveQT = () => {
    if (!formQT.supplier_name || (formQT.items?.length || 0) === 0) { toast.error("Select supplier and add items"); return; }
    if (qtModal.editing) {
      setQuotations(prev => prev.map(qt => qt.id === qtModal.editing!.id ? { ...qt, ...formQT } as Quotation : qt));
      toast.success("Quotation updated");
    } else {
      const total = (formQT.items || []).reduce((s, i) => s + i.total_price, 0);
      const newQT: Quotation = { id: `qt${Date.now()}`, quotation_number: `QT-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: formQT.supplier_name!, supplier_id: formQT.supplier_id || "", status: "received", total_amount: total, valid_until: formQT.valid_until || "", delivery_days: formQT.delivery_days || 7, items: formQT.items || [], created_at: new Date().toISOString() };
      setQuotations(prev => [newQT, ...prev]);
      toast.success("Quotation recorded");
    }
    setQtModal({ open: false });
    setFormQT({ items: [] });
  };

  const handleDeleteQT = (id: string) => {
    setQuotations(prev => prev.filter(qt => qt.id !== id));
    toast.success("Quotation deleted");
  };

  const handleConvertQTtoPO = (qt: Quotation) => {
    const subtotal = qt.items.reduce((s, i) => s + i.total_price, 0);
    const tax = subtotal * 0.18;
    const newPO: PurchaseOrder = { id: `po${Date.now()}`, po_number: `PO-${Date.now().toString(36).toUpperCase().slice(-8)}`, supplier_name: qt.supplier_name, supplier_id: qt.supplier_id, status: "draft", subtotal, tax_amount: tax, total_amount: subtotal + tax, expected_delivery: "", payment_terms: "Net 30", items: qt.items.map(i => ({ ...i, received_quantity: 0 })), created_at: new Date().toISOString() };
    setPurchaseOrders(prev => [newPO, ...prev]);
    setQuotations(prev => prev.map(q => q.id === qt.id ? { ...q, status: "converted" } : q));
    toast.success("Quotation converted to Purchase Order");
  };

  // --- GRN ---
  const handleCreateGRN = (po: PurchaseOrder) => {
    const newGRN: GoodsReceipt = { id: `grn${Date.now()}`, grn_number: `GRN-${Date.now().toString(36).toUpperCase().slice(-8)}`, po_number: po.po_number, supplier_name: po.supplier_name, received_by_name: "Store Manager", status: "pending", received_date: new Date().toISOString().split("T")[0], items: po.items.map(i => ({ id: `grni${Date.now()}${Math.random()}`, item_name: i.item_name, ordered_quantity: i.quantity, received_quantity: 0, accepted_quantity: 0, rejected_quantity: 0, rejection_reason: "" })), created_at: new Date().toISOString() };
    setGoodsReceipts(prev => [newGRN, ...prev]);
    toast.success("Goods Receipt Note created");
    setActiveTab("grn");
  };

  const handleDeleteGRN = (id: string) => {
    setGoodsReceipts(prev => prev.filter(g => g.id !== id));
    toast.success("GRN deleted");
  };

  const addPRItem = () => setFormPR(prev => ({ ...prev, items: [...(prev.items || []), { id: `pri${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", estimated_cost: 0 }] }));
  const removePRItem = (id: string) => setFormPR(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updatePRItem = (id: string, field: string, value: any) => setFormPR(prev => ({ ...prev, items: (prev.items || []).map(i => i.id === id ? { ...i, [field]: value } : i) }));

  const addPOItem = () => setFormPO(prev => ({ ...prev, items: [...(prev.items || []), { id: `poi${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", unit_price: 0, total_price: 0, received_quantity: 0 }] }));
  const removePOItem = (id: string) => setFormPO(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updatePOItem = (id: string, field: string, value: any) => setFormPO(prev => ({ ...prev, items: (prev.items || []).map(i => { const updated = { ...i, [field]: value }; if (field === "quantity" || field === "unit_price") updated.total_price = updated.quantity * updated.unit_price; return i.id === id ? updated : i; }) }));

  const addQTItem = () => setFormQT(prev => ({ ...prev, items: [...(prev.items || []), { id: `qti${Date.now()}`, item_name: "", quantity: 1, unit: "pieces", unit_price: 0, total_price: 0 }] }));
  const removeQTItem = (id: string) => setFormQT(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
  const updateQTItem = (id: string, field: string, value: any) => setFormQT(prev => ({ ...prev, items: (prev.items || []).map(i => { const updated = { ...i, [field]: value }; if (field === "quantity" || field === "unit_price") updated.total_price = updated.quantity * updated.unit_price; return i.id === id ? updated : i; }) }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { draft: "secondary", pending: "outline", approved: "default", sent: "default", received: "default", partial: "outline", completed: "default", cancelled: "destructive", converted: "secondary", partially_received: "outline" };
    return (colors[status] || "secondary") as any;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = { low: "secondary", medium: "outline", high: "default", urgent: "destructive" };
    return (colors[priority] || "secondary") as any;
  };

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || i.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // ============ DASHBOARD ============
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("items")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Stock Value: ₹{totalStockValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("items")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Items below minimum level</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("po")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Pending POs</p>
                <p className="text-2xl font-bold">{pendingPOs.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">₹{pendingPOs.reduce((s, po) => s + po.total_amount, 0).toLocaleString()} total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("pr")}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Pending PRs</p>
                <p className="text-2xl font-bold">{pendingPRs.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-primary opacity-80" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Current</TableHead><TableHead>Min</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {lowStockItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell><Badge variant="destructive">{item.current_stock} {item.unit}</Badge></TableCell>
                    <TableCell>{item.min_stock} {item.unit}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => { setFormPR({ requested_by_name: "Auto-generated", department: "inventory", priority: "high", items: [{ id: `pri${Date.now()}`, item_name: item.name, quantity: item.max_stock - item.current_stock, unit: item.unit, estimated_cost: (item.max_stock - item.current_stock) * item.unit_cost }] }); setPrModal({ open: true }); }}>Create PR</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Recent Purchase Orders</CardTitle></CardHeader>
          <CardContent>
            {purchaseOrders.slice(0, 5).map(po => (
              <div key={po.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{po.po_number}</p>
                  <p className="text-xs text-muted-foreground">{po.supplier_name}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(po.status)}>{po.status}</Badge>
                  <p className="text-xs font-medium mt-1">₹{po.total_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Category Breakdown</CardTitle></CardHeader>
          <CardContent>
            {CATEGORIES.filter(c => items.some(i => i.category === c)).map(cat => {
              const catItems = items.filter(i => i.category === cat);
              const value = catItems.reduce((s, i) => s + i.current_stock * i.unit_cost, 0);
              return (
                <div key={cat} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="font-medium text-sm">{cat}</p><p className="text-xs text-muted-foreground">{catItems.length} items</p></div>
                  <p className="text-sm font-medium">₹{value.toLocaleString()}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============ ITEMS LIST ============
  const renderItems = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setFormItem({}); setItemModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead><TableHead>Stock</TableHead><TableHead>Min/Max</TableHead><TableHead>Unit Cost</TableHead><TableHead>Value</TableHead><TableHead>Location</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{item.sku}</TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell><Badge variant={item.current_stock <= item.min_stock ? "destructive" : "default"}>{item.current_stock} {item.unit}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.min_stock}/{item.max_stock}</TableCell>
                  <TableCell>₹{item.unit_cost}</TableCell>
                  <TableCell className="font-medium">₹{(item.current_stock * item.unit_cost).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{item.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setFormItem(item); setItemModal({ open: true, editing: item }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============ SUPPLIERS ============
  const renderSuppliers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search suppliers..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <Button onClick={() => { setFormSupplier({}); setSupplierModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(supplier => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{supplier.name}</p>
                  <Badge variant="secondary" className="mt-1">{supplier.category}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setFormSupplier(supplier); setSupplierModal({ open: true, editing: supplier }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.contact_person}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.phone}</p>
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.email}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {supplier.city}</p>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`h-4 w-4 ${i < supplier.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />))}
                <span className="text-xs text-muted-foreground ml-2">{supplier.payment_terms}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ============ PURCHASE REQUESTS ============
  const renderPurchaseRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Purchase Requests</h3>
        <Button onClick={() => { setFormPR({ items: [] }); setPrModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> New Request</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>PR #</TableHead><TableHead>Department</TableHead><TableHead>Items</TableHead><TableHead>Priority</TableHead><TableHead>Required</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
          <TableBody>
            {purchaseRequests.map(pr => (
              <TableRow key={pr.id}>
                <TableCell className="font-medium">{pr.request_number}</TableCell>
                <TableCell className="capitalize">{pr.department}</TableCell>
                <TableCell>{pr.items.length} items</TableCell>
                <TableCell><Badge variant={getPriorityColor(pr.priority)} className="capitalize">{pr.priority}</Badge></TableCell>
                <TableCell className="text-xs">{pr.required_date}</TableCell>
                <TableCell><Badge variant={getStatusColor(pr.status)} className="capitalize">{pr.status}</Badge></TableCell>
                <TableCell className="text-xs">{pr.created_at?.split("T")[0]}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "pr", data: pr })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                      {pr.status === "pending" && <DropdownMenuItem onClick={() => handleApprovePR(pr.id)}><CheckCircle className="h-4 w-4 mr-2" /> Approve</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => { setFormPR(pr); setPrModal({ open: true, editing: pr }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePR(pr.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );

  // ============ QUOTATIONS ============
  const renderQuotations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quotations</h3>
        <Button onClick={() => { setFormQT({ items: [] }); setQtModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> Add Quotation</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>QT #</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Valid Until</TableHead><TableHead>Delivery</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
          <TableBody>
            {quotations.map(qt => (
              <TableRow key={qt.id}>
                <TableCell className="font-medium">{qt.quotation_number}</TableCell>
                <TableCell>{qt.supplier_name}</TableCell>
                <TableCell>{qt.items.length} items</TableCell>
                <TableCell className="font-medium">₹{qt.total_amount.toLocaleString()}</TableCell>
                <TableCell className="text-xs">{qt.valid_until}</TableCell>
                <TableCell>{qt.delivery_days} days</TableCell>
                <TableCell><Badge variant={getStatusColor(qt.status)} className="capitalize">{qt.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "qt", data: qt })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                      {qt.status !== "converted" && <DropdownMenuItem onClick={() => handleConvertQTtoPO(qt)}><ArrowRight className="h-4 w-4 mr-2" /> Convert to PO</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => { setFormQT(qt); setQtModal({ open: true, editing: qt }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteQT(qt.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );

  // ============ PURCHASE ORDERS ============
  const renderPurchaseOrders = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Purchase Orders</h3>
        <Button onClick={() => { setFormPO({ items: [] }); setPoModal({ open: true }); }}><Plus className="h-4 w-4 mr-1" /> New PO</Button>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Delivery</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
          <TableBody>
            {purchaseOrders.map(po => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.po_number}</TableCell>
                <TableCell>{po.supplier_name}</TableCell>
                <TableCell>{po.items.length} items</TableCell>
                <TableCell className="font-medium">₹{po.total_amount.toLocaleString()}</TableCell>
                <TableCell className="text-xs">{po.expected_delivery}</TableCell>
                <TableCell><Badge variant={getStatusColor(po.status)} className="capitalize">{po.status.replace("_", " ")}</Badge></TableCell>
                <TableCell className="text-xs">{po.created_at?.split("T")[0]}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "po", data: po })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                      {(po.status === "sent" || po.status === "partially_received") && <DropdownMenuItem onClick={() => handleCreateGRN(po)}><Truck className="h-4 w-4 mr-2" /> Create GRN</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => { setFormPO(po); setPoModal({ open: true, editing: po }); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePO(po.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );

  // ============ GOODS RECEIPTS ============
  const renderGoodsReceipts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Goods Receipt Notes (GRN)</h3>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>GRN #</TableHead><TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Received By</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
          <TableBody>
            {goodsReceipts.map(grn => (
              <TableRow key={grn.id}>
                <TableCell className="font-medium">{grn.grn_number}</TableCell>
                <TableCell>{grn.po_number}</TableCell>
                <TableCell>{grn.supplier_name}</TableCell>
                <TableCell>{grn.received_by_name}</TableCell>
                <TableCell className="text-xs">{grn.received_date}</TableCell>
                <TableCell><Badge variant={getStatusColor(grn.status)} className="capitalize">{grn.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewModal({ open: true, type: "grn", data: grn })}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteGRN(grn.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          Inventory & Procurement
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="items" className="gap-1 text-xs"><Package className="h-3.5 w-3.5" /> Items</TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Suppliers</TabsTrigger>
          <TabsTrigger value="pr" className="gap-1 text-xs"><ClipboardList className="h-3.5 w-3.5" /> Purchase Requests</TabsTrigger>
          <TabsTrigger value="quotations" className="gap-1 text-xs"><Receipt className="h-3.5 w-3.5" /> Quotations</TabsTrigger>
          <TabsTrigger value="po" className="gap-1 text-xs"><ShoppingCart className="h-3.5 w-3.5" /> Purchase Orders</TabsTrigger>
          <TabsTrigger value="grn" className="gap-1 text-xs"><Truck className="h-3.5 w-3.5" /> Goods Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">{renderDashboard()}</TabsContent>
        <TabsContent value="items" className="mt-4">{renderItems()}</TabsContent>
        <TabsContent value="suppliers" className="mt-4">{renderSuppliers()}</TabsContent>
        <TabsContent value="pr" className="mt-4">{renderPurchaseRequests()}</TabsContent>
        <TabsContent value="quotations" className="mt-4">{renderQuotations()}</TabsContent>
        <TabsContent value="po" className="mt-4">{renderPurchaseOrders()}</TabsContent>
        <TabsContent value="grn" className="mt-4">{renderGoodsReceipts()}</TabsContent>
      </Tabs>

      {/* ====== SUPPLIER MODAL ====== */}
      <Dialog open={supplierModal.open} onOpenChange={(o) => { setSupplierModal({ open: o }); if (!o) setFormSupplier({}); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{supplierModal.editing ? "Edit" : "Add"} Supplier</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div><Label>Name *</Label><Input value={formSupplier.name || ""} onChange={e => setFormSupplier(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Contact Person</Label><Input value={formSupplier.contact_person || ""} onChange={e => setFormSupplier(p => ({ ...p, contact_person: e.target.value }))} /></div>
                <div><Label>Category</Label><Select value={formSupplier.category || "general"} onValueChange={v => setFormSupplier(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SUPPLIER_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={formSupplier.email || ""} onChange={e => setFormSupplier(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={formSupplier.phone || ""} onChange={e => setFormSupplier(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div><Label>Address</Label><Input value={formSupplier.address || ""} onChange={e => setFormSupplier(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input value={formSupplier.city || ""} onChange={e => setFormSupplier(p => ({ ...p, city: e.target.value }))} /></div>
                <div><Label>GST Number</Label><Input value={formSupplier.gst_number || ""} onChange={e => setFormSupplier(p => ({ ...p, gst_number: e.target.value }))} /></div>
              </div>
              <div><Label>Payment Terms</Label><Select value={formSupplier.payment_terms || "Net 30"} onValueChange={v => setFormSupplier(p => ({ ...p, payment_terms: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COD">COD</SelectItem><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select></div>
              <div><Label>Notes</Label><Textarea value={formSupplier.notes || ""} onChange={e => setFormSupplier(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setSupplierModal({ open: false })}>Cancel</Button><Button onClick={handleSaveSupplier}>{supplierModal.editing ? "Update" : "Add"} Supplier</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== ITEM MODAL ====== */}
      <Dialog open={itemModal.open} onOpenChange={(o) => { setItemModal({ open: o }); if (!o) setFormItem({}); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{itemModal.editing ? "Edit" : "Add"} Item</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div><Label>Name *</Label><Input value={formItem.name || ""} onChange={e => setFormItem(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>SKU</Label><Input value={formItem.sku || ""} onChange={e => setFormItem(p => ({ ...p, sku: e.target.value }))} /></div>
                <div><Label>Category</Label><Select value={formItem.category || "Other"} onValueChange={v => setFormItem(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Current Stock</Label><Input type="number" value={formItem.current_stock || 0} onChange={e => setFormItem(p => ({ ...p, current_stock: +e.target.value }))} /></div>
                <div><Label>Min Stock</Label><Input type="number" value={formItem.min_stock || 5} onChange={e => setFormItem(p => ({ ...p, min_stock: +e.target.value }))} /></div>
                <div><Label>Max Stock</Label><Input type="number" value={formItem.max_stock || 100} onChange={e => setFormItem(p => ({ ...p, max_stock: +e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Unit</Label><Select value={formItem.unit || "pieces"} onValueChange={v => setFormItem(p => ({ ...p, unit: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pieces">Pieces</SelectItem><SelectItem value="kg">Kg</SelectItem><SelectItem value="liters">Liters</SelectItem><SelectItem value="bottles">Bottles</SelectItem><SelectItem value="rolls">Rolls</SelectItem><SelectItem value="boxes">Boxes</SelectItem><SelectItem value="packets">Packets</SelectItem></SelectContent></Select></div>
                <div><Label>Unit Cost (₹)</Label><Input type="number" value={formItem.unit_cost || 0} onChange={e => setFormItem(p => ({ ...p, unit_cost: +e.target.value }))} /></div>
              </div>
              <div><Label>Supplier</Label><Select value={formItem.supplier || ""} onValueChange={v => setFormItem(p => ({ ...p, supplier: v }))}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Location</Label><Input value={formItem.location || ""} onChange={e => setFormItem(p => ({ ...p, location: e.target.value }))} placeholder="Store Room A" /></div>
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setItemModal({ open: false })}>Cancel</Button><Button onClick={handleSaveItem}>{itemModal.editing ? "Update" : "Add"} Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== PR MODAL ====== */}
      <Dialog open={prModal.open} onOpenChange={(o) => { setPrModal({ open: o }); if (!o) setFormPR({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{prModal.editing ? "Edit" : "New"} Purchase Request</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Requested By *</Label><Input value={formPR.requested_by_name || ""} onChange={e => setFormPR(p => ({ ...p, requested_by_name: e.target.value }))} /></div>
                <div><Label>Department</Label><Select value={formPR.department || "general"} onValueChange={v => setFormPR(p => ({ ...p, department: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="housekeeping">Housekeeping</SelectItem><SelectItem value="maintenance">Maintenance</SelectItem><SelectItem value="kitchen">Kitchen</SelectItem><SelectItem value="front_desk">Front Desk</SelectItem><SelectItem value="inventory">Inventory</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priority</Label><Select value={formPR.priority || "medium"} onValueChange={v => setFormPR(p => ({ ...p, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                <div><Label>Required Date</Label><Input type="date" value={formPR.required_date || ""} onChange={e => setFormPR(p => ({ ...p, required_date: e.target.value }))} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={formPR.notes || ""} onChange={e => setFormPR(p => ({ ...p, notes: e.target.value }))} /></div>
              <Separator />
              <div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addPRItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
              {(formPR.items || []).map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4"><Label className="text-xs">Item Name</Label><Input value={item.item_name} onChange={e => updatePRItem(item.id, "item_name", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updatePRItem(item.id, "quantity", +e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updatePRItem(item.id, "unit", e.target.value)} /></div>
                  <div className="col-span-3"><Label className="text-xs">Est. Cost</Label><Input type="number" value={item.estimated_cost} onChange={e => updatePRItem(item.id, "estimated_cost", +e.target.value)} /></div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePRItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setPrModal({ open: false })}>Cancel</Button><Button onClick={handleSavePR}>{prModal.editing ? "Update" : "Create"} Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== PO MODAL ====== */}
      <Dialog open={poModal.open} onOpenChange={(o) => { setPoModal({ open: o }); if (!o) setFormPO({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{poModal.editing ? "Edit" : "New"} Purchase Order</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Supplier *</Label><Select value={formPO.supplier_id || ""} onValueChange={v => { const s = suppliers.find(s => s.id === v); setFormPO(p => ({ ...p, supplier_id: v, supplier_name: s?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Expected Delivery</Label><Input type="date" value={formPO.expected_delivery || ""} onChange={e => setFormPO(p => ({ ...p, expected_delivery: e.target.value }))} /></div>
              </div>
              <div><Label>Payment Terms</Label><Select value={formPO.payment_terms || "Net 30"} onValueChange={v => setFormPO(p => ({ ...p, payment_terms: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COD">COD</SelectItem><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem></SelectContent></Select></div>
              <Separator />
              <div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addPOItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
              {(formPO.items || []).map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3"><Label className="text-xs">Item</Label><Input value={item.item_name} onChange={e => updatePOItem(item.id, "item_name", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updatePOItem(item.id, "quantity", +e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updatePOItem(item.id, "unit", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Price</Label><Input type="number" value={item.unit_price} onChange={e => updatePOItem(item.id, "unit_price", +e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Total</Label><Input value={item.total_price} disabled /></div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePOItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              ))}
              {(formPO.items?.length || 0) > 0 && (
                <div className="text-right space-y-1 text-sm">
                  <p>Subtotal: ₹{(formPO.items || []).reduce((s, i) => s + i.total_price, 0).toLocaleString()}</p>
                  <p>Tax (18%): ₹{((formPO.items || []).reduce((s, i) => s + i.total_price, 0) * 0.18).toLocaleString()}</p>
                  <p className="font-bold">Total: ₹{((formPO.items || []).reduce((s, i) => s + i.total_price, 0) * 1.18).toLocaleString()}</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setPoModal({ open: false })}>Cancel</Button><Button onClick={handleSavePO}>{poModal.editing ? "Update" : "Create"} PO</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== QUOTATION MODAL ====== */}
      <Dialog open={qtModal.open} onOpenChange={(o) => { setQtModal({ open: o }); if (!o) setFormQT({ items: [] }); }}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{qtModal.editing ? "Edit" : "Add"} Quotation</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Supplier *</Label><Select value={formQT.supplier_id || ""} onValueChange={v => { const s = suppliers.find(s => s.id === v); setFormQT(p => ({ ...p, supplier_id: v, supplier_name: s?.name || "" })); }}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Valid Until</Label><Input type="date" value={formQT.valid_until || ""} onChange={e => setFormQT(p => ({ ...p, valid_until: e.target.value }))} /></div>
              </div>
              <div><Label>Delivery Days</Label><Input type="number" value={formQT.delivery_days || 7} onChange={e => setFormQT(p => ({ ...p, delivery_days: +e.target.value }))} /></div>
              <Separator />
              <div className="flex justify-between items-center"><Label className="text-base font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addQTItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add Item</Button></div>
              {(formQT.items || []).map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3"><Label className="text-xs">Item</Label><Input value={item.item_name} onChange={e => updateQTItem(item.id, "item_name", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={e => updateQTItem(item.id, "quantity", +e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Unit</Label><Input value={item.unit} onChange={e => updateQTItem(item.id, "unit", e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Price</Label><Input type="number" value={item.unit_price} onChange={e => updateQTItem(item.id, "unit_price", +e.target.value)} /></div>
                  <div className="col-span-2"><Label className="text-xs">Total</Label><Input value={item.total_price} disabled /></div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeQTItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
              ))}
            </div>
          </ScrollArea>
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
        </DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {viewModal.type === "pr" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Department:</span> <span className="capitalize font-medium">{viewModal.data.department}</span></div>
                  <div><span className="text-muted-foreground">Priority:</span> <Badge variant={getPriorityColor(viewModal.data.priority)} className="capitalize ml-1">{viewModal.data.priority}</Badge></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Required:</span> <span className="font-medium">{viewModal.data.required_date}</span></div>
                </div>
                {viewModal.data.notes && <p className="text-sm bg-muted p-2 rounded">{viewModal.data.notes}</p>}
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Unit</TableHead><TableHead>Est. Cost</TableHead></TableRow></TableHeader>
                  <TableBody>{viewModal.data.items?.map((item: PRItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.unit}</TableCell><TableCell>₹{item.estimated_cost.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                </Table>
              </div>
            )}
            {viewModal.type === "po" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Delivery:</span> <span className="font-medium">{viewModal.data.expected_delivery}</span></div>
                  <div><span className="text-muted-foreground">Terms:</span> <span className="font-medium">{viewModal.data.payment_terms}</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead><TableHead>Received</TableHead></TableRow></TableHeader>
                  <TableBody>{viewModal.data.items?.map((item: POItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>₹{item.unit_price}</TableCell><TableCell>₹{item.total_price.toLocaleString()}</TableCell><TableCell>{item.received_quantity}/{item.quantity}</TableCell></TableRow>))}</TableBody>
                </Table>
                <div className="text-right text-sm space-y-1"><p>Subtotal: ₹{viewModal.data.subtotal.toLocaleString()}</p><p>Tax: ₹{viewModal.data.tax_amount.toLocaleString()}</p><p className="font-bold text-base">Total: ₹{viewModal.data.total_amount.toLocaleString()}</p></div>
              </div>
            )}
            {viewModal.type === "qt" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusColor(viewModal.data.status)} className="capitalize ml-1">{viewModal.data.status}</Badge></div>
                  <div><span className="text-muted-foreground">Valid Until:</span> <span className="font-medium">{viewModal.data.valid_until}</span></div>
                  <div><span className="text-muted-foreground">Delivery:</span> <span className="font-medium">{viewModal.data.delivery_days} days</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                  <TableBody>{viewModal.data.items?.map((item: QTItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>₹{item.unit_price}</TableCell><TableCell>₹{item.total_price.toLocaleString()}</TableCell></TableRow>))}</TableBody>
                </Table>
                <p className="text-right font-bold">Total: ₹{viewModal.data.total_amount.toLocaleString()}</p>
              </div>
            )}
            {viewModal.type === "grn" && viewModal.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">PO:</span> <span className="font-medium">{viewModal.data.po_number}</span></div>
                  <div><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{viewModal.data.supplier_name}</span></div>
                  <div><span className="text-muted-foreground">Received By:</span> <span className="font-medium">{viewModal.data.received_by_name}</span></div>
                  <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewModal.data.received_date}</span></div>
                </div>
                <Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead><TableHead>Accepted</TableHead><TableHead>Rejected</TableHead></TableRow></TableHeader>
                  <TableBody>{viewModal.data.items?.map((item: GRNItem) => (<TableRow key={item.id}><TableCell>{item.item_name}</TableCell><TableCell>{item.ordered_quantity}</TableCell><TableCell>{item.received_quantity}</TableCell><TableCell className="text-green-600">{item.accepted_quantity}</TableCell><TableCell className="text-destructive">{item.rejected_quantity}{item.rejection_reason && ` (${item.rejection_reason})`}</TableCell></TableRow>))}</TableBody>
                </Table>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
