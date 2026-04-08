import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumnMeta, DataTableAction, DataTableBulkAction, DataTableGlobalFilterConfig } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  status: "active" | "inactive" | "draft" | "archived";
  price: number;
  stock: number;
  supplier: string;
  createdAt: string;
  description: string;
}

const demoData: Product[] = [
  { id: "1", name: "Premium Egyptian Cotton Towels - Extra Large Bath Sheet", sku: "TWL-001", category: "Linen", subCategory: "Towels", status: "active", price: 24.99, stock: 450, supplier: "TextileCo International", createdAt: "2025-12-01", description: "High quality 600 GSM Egyptian cotton towels, perfect for luxury hotel bathrooms" },
  { id: "2", name: "Organic Shampoo 300ml", sku: "AMN-002", category: "Amenities", subCategory: "Toiletries", status: "active", price: 8.50, stock: 1200, supplier: "GreenCare Products", createdAt: "2025-11-15", description: "Eco-friendly organic shampoo with lavender essential oils" },
  { id: "3", name: "King Size Pillow - Memory Foam", sku: "BED-003", category: "Bedding", subCategory: "Pillows", status: "active", price: 45.00, stock: 200, supplier: "DreamSleep Inc", createdAt: "2025-10-20", description: "Premium memory foam pillow with cooling gel layer" },
  { id: "4", name: "LED Desk Lamp", sku: "ELC-004", category: "Electronics", subCategory: "Lighting", status: "inactive", price: 35.00, stock: 0, supplier: "BrightLife Electronics", createdAt: "2025-09-10", description: "Adjustable LED desk lamp with USB charging port" },
  { id: "5", name: "Luxury Bath Robe - White", sku: "TWL-005", category: "Linen", subCategory: "Robes", status: "active", price: 65.00, stock: 150, supplier: "TextileCo International", createdAt: "2025-11-28", description: "Premium terry cloth bath robe in classic white" },
  { id: "6", name: "Room Service Tray - Silver", sku: "FNB-006", category: "F&B Equipment", subCategory: "Service", status: "draft", price: 120.00, stock: 30, supplier: "HotelSupply Pro", createdAt: "2025-08-05", description: "Stainless steel room service tray with cloche cover" },
  { id: "7", name: "Mini Bar Snack Pack", sku: "FNB-007", category: "F&B Equipment", subCategory: "Minibar", status: "active", price: 12.00, stock: 800, supplier: "SnackWorld Ltd", createdAt: "2026-01-10", description: "Assorted premium snack selection for minibar restocking" },
  { id: "8", name: "Bathroom Vanity Mirror", sku: "FUR-008", category: "Furniture", subCategory: "Mirrors", status: "active", price: 89.99, stock: 45, supplier: "GlassWorks Studio", createdAt: "2025-07-22", description: "LED backlit vanity mirror with anti-fog coating" },
  { id: "9", name: "Eco Laundry Detergent 5L", sku: "CLN-009", category: "Cleaning", subCategory: "Detergents", status: "active", price: 18.50, stock: 320, supplier: "GreenCare Products", createdAt: "2025-12-12", description: "Concentrated eco-friendly laundry detergent for commercial use" },
  { id: "10", name: "Smart Door Lock System", sku: "ELC-010", category: "Electronics", subCategory: "Security", status: "draft", price: 250.00, stock: 10, supplier: "SecureTech Solutions", createdAt: "2026-02-01", description: "RFID enabled smart door lock with mobile app integration" },
  { id: "11", name: "Duvet Cover Set - Queen", sku: "BED-011", category: "Bedding", subCategory: "Covers", status: "active", price: 55.00, stock: 180, supplier: "DreamSleep Inc", createdAt: "2025-11-05", description: "300 thread count sateen duvet cover with matching pillow shams" },
  { id: "12", name: "Hand Soap Dispenser", sku: "AMN-012", category: "Amenities", subCategory: "Dispensers", status: "archived", price: 15.00, stock: 0, supplier: "HotelSupply Pro", createdAt: "2025-06-18", description: "Wall-mounted automatic soap dispenser - brushed nickel finish" },
  { id: "13", name: "Conference Table 12-Seat", sku: "FUR-013", category: "Furniture", subCategory: "Tables", status: "active", price: 1200.00, stock: 5, supplier: "OfficePrime Furniture", createdAt: "2025-05-30", description: "Large oval conference table in walnut veneer finish" },
  { id: "14", name: "Swimming Pool Chlorine Tabs", sku: "CLN-014", category: "Cleaning", subCategory: "Pool", status: "active", price: 45.00, stock: 100, supplier: "AquaChem Supplies", createdAt: "2026-01-20", description: "Stabilized chlorine tablets for swimming pool maintenance" },
  { id: "15", name: "Guest Slippers - Disposable", sku: "AMN-015", category: "Amenities", subCategory: "Slippers", status: "active", price: 2.50, stock: 5000, supplier: "TextileCo International", createdAt: "2026-03-01", description: "Wrapped disposable guest slippers in universal size" },
  { id: "16", name: "Emergency Exit Sign LED", sku: "ELC-016", category: "Electronics", subCategory: "Safety", status: "inactive", price: 32.00, stock: 25, supplier: "BrightLife Electronics", createdAt: "2025-04-15", description: "Battery backup LED emergency exit sign - UL listed" },
  { id: "17", name: "Iron & Ironing Board Set", sku: "HSK-017", category: "Housekeeping", subCategory: "Equipment", status: "active", price: 75.00, stock: 60, supplier: "HotelSupply Pro", createdAt: "2025-10-10", description: "Compact steam iron with folding ironing board for guest rooms" },
  { id: "18", name: "Coffee Machine Pods - Assorted", sku: "FNB-018", category: "F&B Equipment", subCategory: "Beverages", status: "active", price: 0.85, stock: 3000, supplier: "BrewMaster Ltd", createdAt: "2026-02-15", description: "Variety pack of premium coffee pods compatible with in-room machines" },
  { id: "19", name: "Yoga Mat - Premium", sku: "SPA-019", category: "Spa & Wellness", subCategory: "Fitness", status: "draft", price: 28.00, stock: 40, supplier: "WellnessGear Co", createdAt: "2026-01-05", description: "Non-slip premium yoga mat with carrying strap for fitness center" },
  { id: "20", name: "Fire Extinguisher ABC 5kg", sku: "SAF-020", category: "Safety", subCategory: "Fire", status: "active", price: 55.00, stock: 80, supplier: "SafetyFirst Equipment", createdAt: "2025-03-20", description: "Multi-purpose ABC dry chemical fire extinguisher with wall bracket" },
];

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  inactive: "bg-red-500/10 text-red-700 border-red-200",
  draft: "bg-amber-500/10 text-amber-700 border-amber-200",
  archived: "bg-muted text-muted-foreground border-border",
};

const columns: ColumnDef<Product, any>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    size: 110,
    meta: { copyable: true, nowrap: true, align: "left" } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "name",
    header: "Product Name",
    size: 280,
    meta: { truncate: true, truncateLength: 35, copyable: true } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 130,
    meta: { filterType: "select", filterOptions: [
      { label: "Linen", value: "Linen" },
      { label: "Amenities", value: "Amenities" },
      { label: "Bedding", value: "Bedding" },
      { label: "Electronics", value: "Electronics" },
      { label: "F&B Equipment", value: "F&B Equipment" },
      { label: "Furniture", value: "Furniture" },
      { label: "Cleaning", value: "Cleaning" },
      { label: "Housekeeping", value: "Housekeeping" },
      { label: "Spa & Wellness", value: "Spa & Wellness" },
      { label: "Safety", value: "Safety" },
    ]} satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    meta: { align: "center" } satisfies DataTableColumnMeta,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 capitalize ${statusColor[status] || ""}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 100,
    meta: { align: "right" } satisfies DataTableColumnMeta,
    cell: ({ row }) => <span className="font-medium tabular-nums">${(row.getValue("price") as number).toFixed(2)}</span>,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    size: 90,
    meta: { align: "center" } satisfies DataTableColumnMeta,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <span className={`tabular-nums font-medium ${stock === 0 ? "text-destructive" : stock < 50 ? "text-amber-600" : ""}`}>
          {stock.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    size: 180,
    meta: { truncate: true, truncateLength: 20 } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    size: 110,
    meta: { align: "center" } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 250,
    meta: { truncate: true, truncateLength: 30, copyable: true } satisfies DataTableColumnMeta,
  },
];

const actions: DataTableAction<Product>[] = [
  { id: "view", label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (row) => toast.info(`Viewing: ${row.name}`), variant: "ghost" },
  { id: "edit", label: "Edit", icon: <Edit className="h-3.5 w-3.5" />, onClick: (row) => toast.info(`Editing: ${row.name}`), variant: "ghost" },
  { id: "delete", label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (row) => toast.error(`Deleted: ${row.name}`), variant: "destructive", separator: true },
];

const bulkActions: DataTableBulkAction<Product>[] = [
  { id: "delete", label: "Delete Selected", icon: <Trash2 className="h-4 w-4" />, variant: "destructive", confirmMessage: "Are you sure you want to delete {count} items? This action cannot be undone.", onClick: (rows) => toast.error(`Deleted ${rows.length} items`) },
  { id: "export", label: "Export Selected", icon: <Package className="h-4 w-4" />, onClick: (rows) => toast.success(`Exported ${rows.length} items`) },
];

const globalFilters: DataTableGlobalFilterConfig[] = [
  { id: "status", label: "Status", type: "checkbox", columnId: "status", options: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Draft", value: "draft" },
    { label: "Archived", value: "archived" },
  ]},
  { id: "category", label: "Category", type: "treeSelect", columnId: "category", options: [
    { label: "Room Supplies", value: "__room", children: [
      { label: "Linen", value: "Linen" },
      { label: "Bedding", value: "Bedding" },
      { label: "Amenities", value: "Amenities" },
    ]},
    { label: "Operations", value: "__ops", children: [
      { label: "Cleaning", value: "Cleaning" },
      { label: "Housekeeping", value: "Housekeeping" },
      { label: "Safety", value: "Safety" },
    ]},
    { label: "Guest Services", value: "__guest", children: [
      { label: "Electronics", value: "Electronics" },
      { label: "F&B Equipment", value: "F&B Equipment" },
      { label: "Furniture", value: "Furniture" },
      { label: "Spa & Wellness", value: "Spa & Wellness" },
    ]},
  ]},
  { id: "supplier", label: "Supplier", type: "select", columnId: "supplier", options: [
    { label: "TextileCo International", value: "TextileCo International" },
    { label: "GreenCare Products", value: "GreenCare Products" },
    { label: "DreamSleep Inc", value: "DreamSleep Inc" },
    { label: "HotelSupply Pro", value: "HotelSupply Pro" },
    { label: "BrightLife Electronics", value: "BrightLife Electronics" },
  ]},
  { id: "price", label: "Price Range", type: "number", columnId: "price" },
  { id: "date", label: "Created Date", type: "date", columnId: "createdAt" },
];

export default function DataTableDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">DataTable Component Demo</h1>
          <p className="text-sm text-muted-foreground">Production-grade ERP table with all features enabled</p>
        </div>
      </div>

      <DataTable<Product>
        title="Inventory Products"
        description="Complete product inventory with advanced filtering, sorting, and bulk operations"
        columns={columns}
        data={demoData}
        enableSorting
        enableFiltering
        enableGlobalFilter
        enableColumnResizing
        enableRowSelection
        enableMultiRowSelection
        enablePagination
        enableColumnVisibility
        enableExport
        enableRefresh
        enableDensityToggle
        enableFullscreen
        enableColumnDragDrop
        enableCellCopy
        actions={actions}
        bulkActions={bulkActions}
        globalFilters={globalFilters}
        pagination={{ position: "both", defaultPageSize: 10, pageSizes: [5, 10, 20, 50], showPageInfo: true }}
        striped
        stickyHeader
        maxHeight="65vh"
        onRefresh={() => toast.success("Data refreshed!")}
        onRowClick={(row) => toast.info(`Clicked: ${row.name}`)}
        getRowId={(row) => row.id}
        isRowDisabled={(row) => row.status === "archived"}
        emptyMessage="No products found"
        emptyDescription="Try adjusting your filters or add new products"
      />
    </div>
  );
}
