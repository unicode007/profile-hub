import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search, Plus, Package, MapPin, User, Clock, CheckCircle2, AlertCircle,
  Eye, Edit, Trash2, MoreVertical, Archive, Phone, Mail, XCircle, HandCoins
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface LostItem {
  id: string;
  category: "electronics" | "clothing" | "documents" | "jewelry" | "bags" | "personal" | "other";
  itemName: string;
  description: string;
  foundLocation: string;
  roomNumber?: string;
  foundBy: string;
  foundDate: Date;
  status: "stored" | "claimed" | "disposed" | "donated" | "pending-claim";
  claimant?: { name: string; phone: string; email?: string; idProof?: string };
  storageLocation: string;
  images?: string[];
  notes?: string;
  claimedDate?: Date;
  disposedDate?: Date;
  reportedBy?: string;
}

const categoryConfig: Record<LostItem["category"], { label: string; icon: string; color: string }> = {
  electronics: { label: "Electronics", icon: "📱", color: "text-blue-600" },
  clothing: { label: "Clothing", icon: "👕", color: "text-purple-600" },
  documents: { label: "Documents", icon: "📄", color: "text-amber-600" },
  jewelry: { label: "Jewelry", icon: "💍", color: "text-yellow-600" },
  bags: { label: "Bags/Luggage", icon: "🎒", color: "text-green-600" },
  personal: { label: "Personal Items", icon: "🔑", color: "text-orange-600" },
  other: { label: "Other", icon: "📦", color: "text-gray-600" },
};

const statusConfig: Record<LostItem["status"], { label: string; color: string; bg: string }> = {
  stored: { label: "Stored", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  "pending-claim": { label: "Pending Claim", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  claimed: { label: "Claimed", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  disposed: { label: "Disposed", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  donated: { label: "Donated", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const demoItems: LostItem[] = [
  { id: "lf-1", category: "electronics", itemName: "iPhone 15 Pro", description: "Black iPhone 15 Pro with clear case, found under bed", foundLocation: "Room 305", roomNumber: "305", foundBy: "Maria Garcia (Housekeeping)", foundDate: new Date(Date.now() - 86400000), status: "stored", storageLocation: "Front Desk Safe - Shelf A" },
  { id: "lf-2", category: "clothing", itemName: "Blue Winter Jacket", description: "Men's blue Northface winter jacket, size L", foundLocation: "Restaurant", foundBy: "Staff - Raj", foundDate: new Date(Date.now() - 172800000), status: "pending-claim", storageLocation: "Lost & Found Room - Rack 2", claimant: { name: "David Miller", phone: "+1 555-0123" } },
  { id: "lf-3", category: "jewelry", itemName: "Gold Bracelet", description: "Ladies gold bracelet with small diamond stones", foundLocation: "Pool Area", foundBy: "Pool Attendant", foundDate: new Date(Date.now() - 259200000), status: "stored", storageLocation: "Manager's Office Safe" },
  { id: "lf-4", category: "documents", itemName: "Passport (US)", description: "US passport belonging to Emily Johnson", foundLocation: "Room 412", roomNumber: "412", foundBy: "Housekeeping", foundDate: new Date(Date.now() - 345600000), status: "claimed", storageLocation: "Front Desk Safe", claimant: { name: "Emily Johnson", phone: "+1 555-0456", email: "emily@mail.com", idProof: "DL-12345" }, claimedDate: new Date(Date.now() - 172800000) },
  { id: "lf-5", category: "bags", itemName: "Laptop Bag", description: "Black leather laptop bag with HP laptop inside", foundLocation: "Conference Room B", foundBy: "Events Team", foundDate: new Date(Date.now() - 432000000), status: "stored", storageLocation: "Lost & Found Room - Rack 1" },
  { id: "lf-6", category: "personal", itemName: "Car Keys (BMW)", description: "BMW car keys with leather keychain", foundLocation: "Lobby", foundBy: "Bell Desk", foundDate: new Date(Date.now() - 518400000), status: "claimed", claimant: { name: "Michael Chang", phone: "+1 555-0789" }, storageLocation: "Front Desk", claimedDate: new Date(Date.now() - 432000000) },
  { id: "lf-7", category: "electronics", itemName: "AirPods Pro", description: "White Apple AirPods Pro in charging case", foundLocation: "Gym", foundBy: "Gym Staff", foundDate: new Date(Date.now() - 604800000 * 4), status: "disposed", storageLocation: "N/A", disposedDate: new Date(Date.now() - 86400000), notes: "Unclaimed for 30+ days" },
  { id: "lf-8", category: "clothing", itemName: "Child's Teddy Bear", description: "Brown teddy bear with a red bow tie, well-loved", foundLocation: "Room 201", roomNumber: "201", foundBy: "Housekeeping", foundDate: new Date(Date.now() - 604800000 * 5), status: "donated", storageLocation: "N/A", disposedDate: new Date(Date.now() - 604800000), notes: "Donated to local children's charity" },
];

export const LostAndFound = () => {
  const [items, setItems] = useState<LostItem[]>(demoItems);
  const [activeTab, setActiveTab] = useState<"all" | "stored" | "claimed" | "disposed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimItem, setClaimItem] = useState<LostItem | null>(null);
  const [claimInfo, setClaimInfo] = useState({ name: "", phone: "", email: "", idProof: "" });

  const [newItem, setNewItem] = useState({
    category: "personal" as LostItem["category"], itemName: "", description: "",
    foundLocation: "", roomNumber: "", foundBy: "", storageLocation: "", notes: "",
  });

  const stats = {
    total: items.length,
    stored: items.filter(i => i.status === "stored").length,
    pendingClaim: items.filter(i => i.status === "pending-claim").length,
    claimed: items.filter(i => i.status === "claimed").length,
    disposed: items.filter(i => i.status === "disposed" || i.status === "donated").length,
  };

  const filtered = items.filter(i => {
    const matchSearch = !searchQuery || i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()) || i.foundLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || i.category === categoryFilter;
    if (activeTab === "stored") return (i.status === "stored" || i.status === "pending-claim") && matchSearch && matchCategory;
    if (activeTab === "claimed") return i.status === "claimed" && matchSearch && matchCategory;
    if (activeTab === "disposed") return (i.status === "disposed" || i.status === "donated") && matchSearch && matchCategory;
    return matchSearch && matchCategory;
  });

  const handleCreate = () => {
    if (!newItem.itemName || !newItem.foundLocation || !newItem.foundBy) { toast.error("Fill required fields"); return; }
    const item: LostItem = {
      id: `lf-${Date.now()}`, ...newItem, foundDate: new Date(), status: "stored",
    };
    setItems([item, ...items]);
    setIsCreateOpen(false);
    setNewItem({ category: "personal", itemName: "", description: "", foundLocation: "", roomNumber: "", foundBy: "", storageLocation: "", notes: "" });
    toast.success("Item logged!");
  };

  const handleClaim = () => {
    if (!claimItem || !claimInfo.name || !claimInfo.phone) { toast.error("Fill claimant details"); return; }
    setItems(items.map(i => i.id === claimItem.id ? { ...i, status: "claimed" as const, claimant: claimInfo, claimedDate: new Date() } : i));
    setIsClaimOpen(false);
    setClaimItem(null);
    setClaimInfo({ name: "", phone: "", email: "", idProof: "" });
    toast.success("Item claimed!");
  };

  const handleDispose = (id: string, type: "disposed" | "donated") => {
    setItems(items.map(i => i.id === id ? { ...i, status: type, disposedDate: new Date() } : i));
    toast.success(`Item ${type}`);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    toast.success("Record deleted");
  };

  const handleEdit = (item: LostItem) => {
    setEditingItem({ ...item });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
    setIsEditOpen(false);
    setEditingItem(null);
    toast.success("Item updated!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Items", value: stats.total, icon: Package, color: "bg-primary/10 text-primary" },
          { label: "In Storage", value: stats.stored, icon: Archive, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "Pending Claim", value: stats.pendingClaim, icon: Clock, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" },
          { label: "Claimed", value: stats.claimed, icon: CheckCircle2, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Disposed/Donated", value: stats.disposed, icon: XCircle, color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
        ].map((s, i) => (
          <Card key={i}><CardContent className="py-3 px-4"><div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${s.color.split(" ")[0]}`}><s.icon className={`h-4 w-4 ${s.color.split(" ").slice(1).join(" ")}`} /></div>
            <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
          </div></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="stored">In Storage</TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
            <TabsTrigger value="disposed">Disposed</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Log Item</Button>
        </div>

        {["all", "stored", "claimed", "disposed"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" />No items found</CardContent></Card>
              ) : filtered.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">{categoryConfig[item.category].icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{item.itemName}</span>
                            <Badge className={`${statusConfig[item.status].bg} ${statusConfig[item.status].color} text-xs`}>{statusConfig[item.status].label}</Badge>
                            <Badge variant="outline" className="text-xs">{categoryConfig[item.category].label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.foundLocation}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(item.foundDate, { addSuffix: true })}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.foundBy}</span>
                            {item.claimant && <span className="flex items-center gap-1 text-green-600"><HandCoins className="h-3 w-3" />{item.claimant.name}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {(item.status === "stored" || item.status === "pending-claim") && (
                          <Button size="sm" variant="outline" onClick={() => { setClaimItem(item); setClaimInfo({ name: item.claimant?.name || "", phone: item.claimant?.phone || "", email: item.claimant?.email || "", idProof: item.claimant?.idProof || "" }); setIsClaimOpen(true); }}>
                            <HandCoins className="h-4 w-4 mr-1" />Claim
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedItem(item)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            {item.status === "stored" && <DropdownMenuItem onClick={() => handleDispose(item.id, "disposed")}>Dispose</DropdownMenuItem>}
                            {item.status === "stored" && <DropdownMenuItem onClick={() => handleDispose(item.id, "donated")}>Donate</DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              <DialogHeader><DialogTitle>{categoryConfig[selectedItem.category].icon} {selectedItem.itemName}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2"><Badge className={`${statusConfig[selectedItem.status].bg} ${statusConfig[selectedItem.status].color}`}>{statusConfig[selectedItem.status].label}</Badge></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label className="text-muted-foreground">Found At</Label><p className="font-medium">{selectedItem.foundLocation}</p></div>
                  <div><Label className="text-muted-foreground">Found Date</Label><p className="font-medium">{format(selectedItem.foundDate, "MMM dd, yyyy")}</p></div>
                  <div><Label className="text-muted-foreground">Found By</Label><p className="font-medium">{selectedItem.foundBy}</p></div>
                  <div><Label className="text-muted-foreground">Storage</Label><p className="font-medium">{selectedItem.storageLocation}</p></div>
                </div>
                <div><Label className="text-muted-foreground">Description</Label><p className="text-sm mt-1">{selectedItem.description}</p></div>
                {selectedItem.claimant && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Label className="text-green-600">Claimed By</Label>
                    <div className="mt-1 space-y-1 text-sm">
                      <p><strong>{selectedItem.claimant.name}</strong></p>
                      <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedItem.claimant.phone}</p>
                      {selectedItem.claimant.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedItem.claimant.email}</p>}
                      {selectedItem.claimant.idProof && <p>ID Proof: {selectedItem.claimant.idProof}</p>}
                      {selectedItem.claimedDate && <p>Claimed on: {format(selectedItem.claimedDate, "MMM dd, yyyy")}</p>}
                    </div>
                  </div>
                )}
                {selectedItem.notes && <div><Label className="text-muted-foreground">Notes</Label><p className="text-sm mt-1">{selectedItem.notes}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Found Item</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Item Name *</Label><Input value={newItem.itemName} onChange={e => setNewItem({ ...newItem, itemName: e.target.value })} placeholder="Item name" /></div>
              <div><Label>Category</Label>
                <Select value={newItem.category} onValueChange={v => setNewItem({ ...newItem, category: v as LostItem["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Detailed description..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Found Location *</Label><Input value={newItem.foundLocation} onChange={e => setNewItem({ ...newItem, foundLocation: e.target.value })} placeholder="Room 305 / Lobby" /></div>
              <div><Label>Room Number</Label><Input value={newItem.roomNumber} onChange={e => setNewItem({ ...newItem, roomNumber: e.target.value })} placeholder="Optional" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Found By *</Label><Input value={newItem.foundBy} onChange={e => setNewItem({ ...newItem, foundBy: e.target.value })} placeholder="Staff name" /></div>
              <div><Label>Storage Location</Label><Input value={newItem.storageLocation} onChange={e => setNewItem({ ...newItem, storageLocation: e.target.value })} placeholder="Front Desk Safe" /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Additional notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Log Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {editingItem && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Item Name</Label><Input value={editingItem.itemName} onChange={e => setEditingItem({ ...editingItem, itemName: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <Select value={editingItem.category} onValueChange={v => setEditingItem({ ...editingItem, category: v as LostItem["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Description</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Found Location</Label><Input value={editingItem.foundLocation} onChange={e => setEditingItem({ ...editingItem, foundLocation: e.target.value })} /></div>
                <div><Label>Storage Location</Label><Input value={editingItem.storageLocation} onChange={e => setEditingItem({ ...editingItem, storageLocation: e.target.value })} /></div>
              </div>
              <div><Label>Status</Label>
                <Select value={editingItem.status} onValueChange={v => setEditingItem({ ...editingItem, status: v as LostItem["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={editingItem.notes || ""} onChange={e => setEditingItem({ ...editingItem, notes: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Dialog */}
      <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Claim</DialogTitle></DialogHeader>
          {claimItem && (
            <div className="space-y-4 pt-2">
              <Card className="bg-muted/50"><CardContent className="py-3"><p className="font-medium">{categoryConfig[claimItem.category].icon} {claimItem.itemName}</p><p className="text-sm text-muted-foreground">{claimItem.description}</p></CardContent></Card>
              <div><Label>Claimant Name *</Label><Input value={claimInfo.name} onChange={e => setClaimInfo({ ...claimInfo, name: e.target.value })} placeholder="Full name" /></div>
              <div><Label>Phone *</Label><Input value={claimInfo.phone} onChange={e => setClaimInfo({ ...claimInfo, phone: e.target.value })} placeholder="+1 555-0123" /></div>
              <div><Label>Email</Label><Input value={claimInfo.email} onChange={e => setClaimInfo({ ...claimInfo, email: e.target.value })} placeholder="email@example.com" /></div>
              <div><Label>ID Proof</Label><Input value={claimInfo.idProof} onChange={e => setClaimInfo({ ...claimInfo, idProof: e.target.value })} placeholder="DL / Passport number" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClaimOpen(false)}>Cancel</Button>
            <Button onClick={handleClaim}>Process Claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
