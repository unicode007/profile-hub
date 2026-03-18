import { useState } from "react";
import { useTableQuery, useTableMutation } from "@/hooks/useSupabaseQuery";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Loader2, Users, Trash2, UserPlus } from "lucide-react";

const ALL_ROLES: { value: AppRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "hotel_admin", label: "Hotel Admin" },
  { value: "front_desk", label: "Front Desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "restaurant", label: "Restaurant" },
  { value: "inventory", label: "Inventory" },
  { value: "laundry", label: "Laundry" },
  { value: "guest_comm", label: "Guest Comm" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "staff", label: "Staff" },
];

export function StaffModule() {
  const { currentHotelId, isAdmin } = useAuth();
  const { data: profiles, isLoading } = useTableQuery("profiles");
  const { data: userRoles, isLoading: rolesLoading } = useTableQuery("user_roles");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>("staff");
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) { toast.error("Select user and role"); return; }
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: selectedRole,
        hotel_id: currentHotelId,
      });
      if (error) throw error;
      toast.success("Role assigned");
      setIsDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign role");
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
      toast.success("Role removed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getRolesForUser = (userId: string) => userRoles?.filter((r: any) => r.user_id === userId) ?? [];

  if (isLoading || rolesLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Staff & Roles</h2>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Assign Role</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Role to User</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      {profiles?.map((p: any) => <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Role</Label>
                  <Select value={selectedRole} onValueChange={v => setSelectedRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignRole} className="w-full">Assign Role</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roles</TableHead>
            {isAdmin && <TableHead>Actions</TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {profiles?.map((p: any) => {
              const roles = getRolesForUser(p.user_id);
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {roles.map((r: any) => (
                        <Badge key={r.id} variant="secondary" className="text-xs">
                          {r.role?.replace("_", " ")}
                          {isAdmin && (
                            <button onClick={() => handleRemoveRole(r.id)} className="ml-1 hover:text-destructive">×</button>
                          )}
                        </Badge>
                      ))}
                      {roles.length === 0 && <span className="text-muted-foreground text-sm">No roles</span>}
                    </div>
                  </TableCell>
                  {isAdmin && <TableCell><Button variant="ghost" size="sm" onClick={() => { setSelectedUserId(p.user_id); setIsDialogOpen(true); }}><Plus className="h-4 w-4" /></Button></TableCell>}
                </TableRow>
              );
            })}
            {(!profiles || profiles.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No staff members</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
