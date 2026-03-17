import { useState } from "react";
import { Hotel, Booking } from "./types";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  MessageSquare, Phone, Bell, AlertCircle, CheckCircle2, Clock, Plus, Search,
  Star, ThumbsUp, ThumbsDown, Edit, Trash2, MoreVertical, AlarmClock, Coffee,
  Headphones, ShieldAlert, CircleDot, Send, X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface GuestRequest {
  id: string;
  bookingId?: string;
  guestName: string;
  roomNumber: string;
  type: "wake-up" | "room-service" | "concierge" | "complaint" | "feedback" | "amenity" | "special";
  status: "new" | "acknowledged" | "in-progress" | "resolved" | "escalated" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  subject: string;
  description: string;
  assignedTo?: string;
  response?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  scheduledTime?: Date; // for wake-up calls
}

const typeConfig: Record<GuestRequest["type"], { label: string; icon: any; color: string }> = {
  "wake-up": { label: "Wake-up Call", icon: AlarmClock, color: "text-purple-600" },
  "room-service": { label: "Room Service", icon: Coffee, color: "text-amber-600" },
  concierge: { label: "Concierge", icon: Headphones, color: "text-blue-600" },
  complaint: { label: "Complaint", icon: ShieldAlert, color: "text-red-600" },
  feedback: { label: "Feedback", icon: Star, color: "text-yellow-600" },
  amenity: { label: "Amenity Request", icon: CircleDot, color: "text-green-600" },
  special: { label: "Special Request", icon: Bell, color: "text-indigo-600" },
};

const statusConfig: Record<GuestRequest["status"], { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  acknowledged: { label: "Acknowledged", color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  "in-progress": { label: "In Progress", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  resolved: { label: "Resolved", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  escalated: { label: "Escalated", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  closed: { label: "Closed", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30" },
};

const priorityConfig: Record<GuestRequest["priority"], { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-600" },
  medium: { label: "Medium", color: "text-blue-600" },
  high: { label: "High", color: "text-orange-600" },
  urgent: { label: "Urgent", color: "text-red-600" },
};

const demoRequests: GuestRequest[] = [
  { id: "req-1", guestName: "John Smith", roomNumber: "101", type: "wake-up", status: "new", priority: "medium", subject: "Wake-up call at 6:30 AM", description: "Please give me a wake-up call tomorrow at 6:30 AM, I have an early flight.", scheduledTime: new Date(Date.now() + 36000000), createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000) },
  { id: "req-2", guestName: "Maria Garcia", roomNumber: "205", type: "complaint", status: "in-progress", priority: "high", subject: "Noisy AC unit", description: "The air conditioning unit is making a loud humming noise and it's impossible to sleep.", assignedTo: "Maintenance Team", createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(Date.now() - 1800000) },
  { id: "req-3", guestName: "Raj Patel", roomNumber: "302", type: "room-service", status: "acknowledged", priority: "medium", subject: "Late night dinner", description: "Would like to order club sandwich and a pot of tea delivered to room.", createdAt: new Date(Date.now() - 5400000), updatedAt: new Date(Date.now() - 4800000) },
  { id: "req-4", guestName: "Sarah Lee", roomNumber: "410", type: "amenity", status: "resolved", priority: "low", subject: "Extra pillows", description: "Could we get 2 extra pillows please?", response: "2 extra pillows delivered to room 410.", resolvedAt: new Date(Date.now() - 1200000), createdAt: new Date(Date.now() - 10800000), updatedAt: new Date(Date.now() - 1200000) },
  { id: "req-5", guestName: "James Wilson", roomNumber: "118", type: "concierge", status: "new", priority: "medium", subject: "Restaurant recommendation", description: "Looking for a fine dining restaurant nearby for 4 people tonight.", createdAt: new Date(Date.now() - 900000), updatedAt: new Date(Date.now() - 900000) },
  { id: "req-6", guestName: "Emma Brown", roomNumber: "505", type: "complaint", status: "escalated", priority: "urgent", subject: "Hot water not working", description: "No hot water in the bathroom for the past 2 hours. Very unhappy!", assignedTo: "Maintenance Supervisor", createdAt: new Date(Date.now() - 14400000), updatedAt: new Date(Date.now() - 600000) },
  { id: "req-7", guestName: "Chen Wei", roomNumber: "203", type: "feedback", status: "closed", priority: "low", subject: "Excellent breakfast", description: "The breakfast buffet was amazing! Loved the variety.", rating: 5, createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 82800000), resolvedAt: new Date(Date.now() - 82800000) },
  { id: "req-8", guestName: "Priya Sharma", roomNumber: "315", type: "special", status: "acknowledged", priority: "high", subject: "Anniversary celebration", description: "It's our 10th anniversary tomorrow. Can you arrange cake, flowers and a bottle of champagne?", createdAt: new Date(Date.now() - 21600000), updatedAt: new Date(Date.now() - 18000000) },
];

interface GuestCommunicationProps {
  bookings: Booking[];
}

export const GuestCommunication = ({ bookings }: GuestCommunicationProps) => {
  const [requests, setRequests] = useState<GuestRequest[]>(demoRequests);
  const [activeTab, setActiveTab] = useState<"requests" | "wakeup" | "complaints" | "feedback">("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<GuestRequest | null>(null);
  const [responseText, setResponseText] = useState("");

  const [newRequest, setNewRequest] = useState({
    guestName: "", roomNumber: "", type: "amenity" as GuestRequest["type"],
    priority: "medium" as GuestRequest["priority"], subject: "", description: "", scheduledTime: "",
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === "new").length,
    inProgress: requests.filter(r => r.status === "in-progress" || r.status === "acknowledged").length,
    resolved: requests.filter(r => r.status === "resolved" || r.status === "closed").length,
    escalated: requests.filter(r => r.status === "escalated").length,
    complaints: requests.filter(r => r.type === "complaint" && r.status !== "resolved" && r.status !== "closed").length,
    avgRating: (() => { const rated = requests.filter(r => r.rating); return rated.length > 0 ? (rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length).toFixed(1) : "N/A"; })(),
  };

  const filtered = requests.filter(r => {
    const matchSearch = !searchQuery || r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || r.roomNumber.includes(searchQuery) || r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    if (activeTab === "wakeup") return r.type === "wake-up" && matchSearch && matchStatus;
    if (activeTab === "complaints") return r.type === "complaint" && matchSearch && matchStatus;
    if (activeTab === "feedback") return r.type === "feedback" && matchSearch;
    return matchSearch && matchStatus && matchType;
  });

  const handleCreate = () => {
    if (!newRequest.guestName || !newRequest.roomNumber || !newRequest.subject) {
      toast.error("Please fill required fields"); return;
    }
    const req: GuestRequest = {
      id: `req-${Date.now()}`, ...newRequest,
      status: "new", createdAt: new Date(), updatedAt: new Date(),
      scheduledTime: newRequest.scheduledTime ? new Date(newRequest.scheduledTime) : undefined,
    };
    setRequests([req, ...requests]);
    setIsCreateOpen(false);
    setNewRequest({ guestName: "", roomNumber: "", type: "amenity", priority: "medium", subject: "", description: "", scheduledTime: "" });
    toast.success("Request created!");
  };

  const handleUpdateStatus = (id: string, status: GuestRequest["status"]) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status, updatedAt: new Date(), resolvedAt: status === "resolved" ? new Date() : r.resolvedAt } : r));
    toast.success(`Status updated to ${statusConfig[status].label}`);
  };

  const handleRespond = (id: string) => {
    if (!responseText.trim()) return;
    setRequests(requests.map(r => r.id === id ? { ...r, response: responseText, status: "resolved" as const, updatedAt: new Date(), resolvedAt: new Date() } : r));
    setResponseText("");
    setSelectedRequest(null);
    toast.success("Response sent!");
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    toast.success("Request deleted");
  };

  const handleEdit = (req: GuestRequest) => {
    setEditingRequest({ ...req });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRequest) return;
    setRequests(requests.map(r => r.id === editingRequest.id ? { ...editingRequest, updatedAt: new Date() } : r));
    setIsEditOpen(false);
    setEditingRequest(null);
    toast.success("Request updated!");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.total, icon: MessageSquare, color: "bg-primary/10 text-primary" },
          { label: "New", value: stats.new, icon: Bell, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Escalated", value: stats.escalated, icon: AlertCircle, color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
          { label: "Complaints", value: stats.complaints, icon: ShieldAlert, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600" },
          { label: "Avg Rating", value: stats.avgRating, icon: Star, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
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
            <TabsTrigger value="requests" className="gap-2"><MessageSquare className="h-4 w-4" />All Requests</TabsTrigger>
            <TabsTrigger value="wakeup" className="gap-2"><AlarmClock className="h-4 w-4" />Wake-up Calls</TabsTrigger>
            <TabsTrigger value="complaints" className="gap-2"><ShieldAlert className="h-4 w-4" />Complaints</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2"><Star className="h-4 w-4" />Feedback</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4" />New Request</Button>
        </div>

        {["requests", "wakeup", "complaints", "feedback"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search guest, room, subject..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {tab === "requests" && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground"><MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />No requests found</CardContent></Card>
              ) : filtered.map(req => {
                const TypeIcon = typeConfig[req.type].icon;
                return (
                  <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(req)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-muted`}><TypeIcon className={`h-5 w-5 ${typeConfig[req.type].color}`} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{req.subject}</span>
                              <Badge className={`${statusConfig[req.status].bg} ${statusConfig[req.status].color} text-xs`}>{statusConfig[req.status].label}</Badge>
                              <Badge variant="outline" className={`text-xs ${priorityConfig[req.priority].color}`}>{priorityConfig[req.priority].label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>👤 {req.guestName}</span>
                              <span>🚪 Room {req.roomNumber}</span>
                              <span>⏰ {formatDistanceToNow(req.createdAt, { addSuffix: true })}</span>
                              {req.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{req.rating}/5</span>}
                              {req.scheduledTime && <span>🔔 {format(req.scheduledTime, "hh:mm a")}</span>}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleEdit(req); }}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            {req.status === "new" && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleUpdateStatus(req.id, "acknowledged"); }}>Acknowledge</DropdownMenuItem>}
                            {(req.status === "acknowledged" || req.status === "new") && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleUpdateStatus(req.id, "in-progress"); }}>Start Working</DropdownMenuItem>}
                            {req.status !== "resolved" && req.status !== "closed" && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleUpdateStatus(req.id, "resolved"); }}>Mark Resolved</DropdownMenuItem>}
                            {req.status !== "escalated" && req.status !== "resolved" && req.status !== "closed" && <DropdownMenuItem onClick={e => { e.stopPropagation(); handleUpdateStatus(req.id, "escalated"); }} className="text-red-600">Escalate</DropdownMenuItem>}
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); handleDelete(req.id); }} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader><DialogTitle>{selectedRequest.subject}</DialogTitle></DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`${statusConfig[selectedRequest.status].bg} ${statusConfig[selectedRequest.status].color}`}>{statusConfig[selectedRequest.status].label}</Badge>
                    <Badge variant="outline">{typeConfig[selectedRequest.type].label}</Badge>
                    <Badge variant="outline" className={priorityConfig[selectedRequest.priority].color}>{priorityConfig[selectedRequest.priority].label}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><Label className="text-muted-foreground">Guest</Label><p className="font-medium">{selectedRequest.guestName}</p></div>
                    <div><Label className="text-muted-foreground">Room</Label><p className="font-medium">{selectedRequest.roomNumber}</p></div>
                    <div><Label className="text-muted-foreground">Created</Label><p className="font-medium">{format(selectedRequest.createdAt, "MMM dd, hh:mm a")}</p></div>
                    {selectedRequest.assignedTo && <div><Label className="text-muted-foreground">Assigned</Label><p className="font-medium">{selectedRequest.assignedTo}</p></div>}
                    {selectedRequest.scheduledTime && <div><Label className="text-muted-foreground">Scheduled</Label><p className="font-medium">{format(selectedRequest.scheduledTime, "MMM dd, hh:mm a")}</p></div>}
                  </div>
                  <div><Label className="text-muted-foreground">Description</Label><p className="text-sm mt-1">{selectedRequest.description}</p></div>
                  {selectedRequest.response && <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"><Label className="text-green-600">Response</Label><p className="text-sm mt-1">{selectedRequest.response}</p></div>}
                  {selectedRequest.status !== "resolved" && selectedRequest.status !== "closed" && (
                    <div>
                      <Label>Send Response</Label>
                      <div className="flex gap-2 mt-1">
                        <Textarea placeholder="Type your response..." value={responseText} onChange={e => setResponseText(e.target.value)} className="flex-1" />
                      </div>
                      <Button className="mt-2 gap-2" onClick={() => handleRespond(selectedRequest.id)} size="sm"><Send className="h-4 w-4" />Send & Resolve</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Guest Request</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Guest Name *</Label><Input value={newRequest.guestName} onChange={e => setNewRequest({ ...newRequest, guestName: e.target.value })} placeholder="Guest name" /></div>
              <div><Label>Room Number *</Label><Input value={newRequest.roomNumber} onChange={e => setNewRequest({ ...newRequest, roomNumber: e.target.value })} placeholder="101" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={newRequest.type} onValueChange={v => setNewRequest({ ...newRequest, type: v as GuestRequest["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Priority</Label>
                <Select value={newRequest.priority} onValueChange={v => setNewRequest({ ...newRequest, priority: v as GuestRequest["priority"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Subject *</Label><Input value={newRequest.subject} onChange={e => setNewRequest({ ...newRequest, subject: e.target.value })} placeholder="Brief subject" /></div>
            <div><Label>Description</Label><Textarea value={newRequest.description} onChange={e => setNewRequest({ ...newRequest, description: e.target.value })} placeholder="Details..." /></div>
            {newRequest.type === "wake-up" && <div><Label>Scheduled Time</Label><Input type="datetime-local" value={newRequest.scheduledTime} onChange={e => setNewRequest({ ...newRequest, scheduledTime: e.target.value })} /></div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Request</DialogTitle></DialogHeader>
          {editingRequest && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Guest Name</Label><Input value={editingRequest.guestName} onChange={e => setEditingRequest({ ...editingRequest, guestName: e.target.value })} /></div>
                <div><Label>Room</Label><Input value={editingRequest.roomNumber} onChange={e => setEditingRequest({ ...editingRequest, roomNumber: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label>
                  <Select value={editingRequest.type} onValueChange={v => setEditingRequest({ ...editingRequest, type: v as GuestRequest["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={editingRequest.priority} onValueChange={v => setEditingRequest({ ...editingRequest, priority: v as GuestRequest["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Subject</Label><Input value={editingRequest.subject} onChange={e => setEditingRequest({ ...editingRequest, subject: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editingRequest.description} onChange={e => setEditingRequest({ ...editingRequest, description: e.target.value })} /></div>
              <div><Label>Status</Label>
                <Select value={editingRequest.status} onValueChange={v => setEditingRequest({ ...editingRequest, status: v as GuestRequest["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
