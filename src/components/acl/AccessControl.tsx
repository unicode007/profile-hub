import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, ShieldCheck, KeyRound, Route as RouteIcon, Users, History, FlaskConical, RefreshCw } from "lucide-react";
import { PageShell, KpiGrid } from "@/components/modules/ModuleKit";
import { acl, useAcl, ALL_PERMS, type Permission, type AclRole, type AclModule, type AclUser, userHasPerm } from "./aclStore";
import { toast } from "sonner";

function RoleBadge({ role }: { role: AclRole }) {
  const tones: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${tones[role.color || "sky"] || "bg-muted text-foreground"}`}>{role.name}</span>;
}

/* ---------------- Roles tab ---------------- */
function RolesTab() {
  const { roles } = useAcl();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclRole | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; color: string }>({ name: "", description: "", color: "sky" });

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", color: "sky" }); setOpen(true); };
  const openEdit = (r: AclRole) => { setEditing(r); setForm({ name: r.name, description: r.description || "", color: r.color || "sky" }); setOpen(true); };
  const save = () => {
    if (!form.name.trim()) { toast.error("Role name required"); return; }
    if (editing) { acl.updateRole(editing.id, form); toast.success("Role updated"); }
    else { acl.addRole(form); toast.success("Role created"); }
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Define dynamic roles. Master roles get a wildcard pass to every module.</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New Role</Button>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell><RoleBadge role={r} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.description}</TableCell>
                <TableCell>{r.isSystem ? <Badge>System</Badge> : <Badge variant="secondary">Custom</Badge>}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" disabled={r.isSystem} onClick={() => { acl.deleteRole(r.id); toast.success("Role deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Role" : "New Role"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Color</Label>
              <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["amber", "violet", "sky", "emerald", "rose"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Modules tab ---------------- */
function ModulesTab() {
  const { modules } = useAcl();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclModule | null>(null);
  const [form, setForm] = useState<{ key: string; label: string; route: string; group: string }>({ key: "", label: "", route: "", group: "Custom" });

  const openNew = () => { setEditing(null); setForm({ key: "", label: "", route: "", group: "Custom" }); setOpen(true); };
  const openEdit = (m: AclModule) => { setEditing(m); setForm({ key: m.key, label: m.label, route: m.route, group: m.group }); setOpen(true); };
  const save = () => {
    if (!form.key || !form.label || !form.route) { toast.error("Key, label, route required"); return; }
    if (editing) { acl.updateModule(editing.id, form); toast.success("Module updated"); }
    else { acl.addModule(form); toast.success("Module created"); }
    setOpen(false);
  };

  const grouped = useMemo(() => {
    const map: Record<string, AclModule[]> = {};
    modules.forEach((m) => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [modules]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Define modules / routes that can be permission-gated.</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New Module</Button>
      </div>
      {Object.entries(grouped).map(([g, list]) => (
        <Card key={g}>
          <CardHeader className="py-3"><CardTitle className="text-sm">{g}</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader><TableRow><TableHead>Label</TableHead><TableHead>Key</TableHead><TableHead>Route</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell><code className="text-xs">{m.key}</code></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.route}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { acl.deleteModule(m.id); toast.success("Module deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Module" : "New Module"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><Label>Key (unique)</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="bookings" /></div>
            <div><Label>Route</Label><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="/app/calendar" /></div>
            <div><Label>Group</Label><Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Users tab ---------------- */
function UsersTab() {
  const { users, roles } = useAcl();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclUser | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; active: boolean; roleIds: string[] }>({ name: "", email: "", active: true, roleIds: [] });

  const openNew = () => { setEditing(null); setForm({ name: "", email: "", active: true, roleIds: [] }); setOpen(true); };
  const openEdit = (u: AclUser) => { setEditing(u); setForm({ name: u.name, email: u.email, active: u.active, roleIds: u.roleIds }); setOpen(true); };
  const save = () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (editing) { acl.updateUser(editing.id, form); toast.success("User updated"); }
    else { acl.addUser(form); toast.success("User created"); }
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Assign one or more roles per user. Roles aggregate (union of permissions).</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New User</Button>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Roles</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell><div className="flex flex-wrap gap-1">{u.roleIds.map((rid) => { const r = roles.find((x) => x.id === rid); return r ? <RoleBadge key={rid} role={r} /> : null; })}</div></TableCell>
                <TableCell><Switch checked={u.active} onCheckedChange={(v) => acl.updateUser(u.id, { active: v })} /></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { acl.deleteUser(u.id); toast.success("User deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></div>
            <div>
              <Label>Assign Roles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={form.roleIds.includes(r.id)} onCheckedChange={(v) => setForm({ ...form, roleIds: v ? [...form.roleIds, r.id] : form.roleIds.filter((x) => x !== r.id) })} />
                    <RoleBadge role={r} />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Matrix tab ---------------- */
function MatrixTab() {
  const { roles, modules, matrix } = useAcl();
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const role = roles.find((r) => r.id === roleId);
  const grouped = useMemo(() => {
    const map: Record<string, AclModule[]> = {};
    modules.forEach((m) => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [modules]);
  const isOn = (mid: string, p: Permission) => !!matrix[roleId]?.[mid]?.[p] || !!role?.isSystem;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Label className="text-xs">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
            {role?.isSystem && <Badge variant="default">Wildcard — all permissions</Badge>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={role?.isSystem} onClick={() => acl.setAllModulesForRole(roleId, true)}>Grant all</Button>
            <Button size="sm" variant="outline" disabled={role?.isSystem} onClick={() => acl.setAllModulesForRole(roleId, false)}>Revoke all</Button>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(grouped).map(([g, list]) => (
        <Card key={g}>
          <CardHeader className="py-2"><CardTitle className="text-sm">{g}</CardTitle></CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  {ALL_PERMS.map((p) => <TableHead key={p} className="capitalize text-center">{p}</TableHead>)}
                  <TableHead className="text-right">All</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><div className="font-medium">{m.label}</div><div className="text-xs text-muted-foreground">{m.route}</div></TableCell>
                    {ALL_PERMS.map((p) => (
                      <TableCell key={p} className="text-center">
                        <Checkbox disabled={role?.isSystem} checked={isOn(m.id, p)} onCheckedChange={(v) => acl.setPerm(roleId, m.id, p, !!v)} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" disabled={role?.isSystem} onClick={() => acl.setAllForRoleModule(roleId, m.id, true)}>✓</Button>
                      <Button size="sm" variant="ghost" disabled={role?.isSystem} onClick={() => acl.setAllForRoleModule(roleId, m.id, false)}>✗</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Tester tab ---------------- */
function TesterTab() {
  const state = useAcl();
  const [userId, setUserId] = useState(state.users[0]?.id || "");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4" />Permission Simulator</CardTitle>
        <CardDescription>Pick a user and see exactly which modules/permissions resolve to true.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Select user" /></SelectTrigger>
          <SelectContent>{state.users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} — {u.email}</SelectItem>)}</SelectContent>
        </Select>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Module</TableHead>{ALL_PERMS.map((p) => <TableHead key={p} className="capitalize text-center">{p}</TableHead>)}<TableHead>Access</TableHead></TableRow></TableHeader>
            <TableBody>
              {state.modules.map((m) => {
                const cells = ALL_PERMS.map((p) => userHasPerm(state, userId, m.key, p));
                const anyAccess = cells.some(Boolean);
                return (
                  <TableRow key={m.id}>
                    <TableCell><div className="font-medium">{m.label}</div><div className="text-xs text-muted-foreground">{m.route}</div></TableCell>
                    {cells.map((ok, i) => <TableCell key={i} className="text-center">{ok ? <span className="text-emerald-600">✓</span> : <span className="text-muted-foreground">—</span>}</TableCell>)}
                    <TableCell>{anyAccess ? <Badge>Allowed</Badge> : <Badge variant="destructive">Denied</Badge>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Audit tab ---------------- */
function AuditTab() {
  const { audit } = useAcl();
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" />Audit Log</CardTitle><CardDescription>Last 200 ACL changes.</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead></TableRow></TableHeader>
          <TableBody>
            {audit.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No activity yet</TableCell></TableRow>}
            {audit.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-xs">{new Date(a.ts).toLocaleString()}</TableCell>
                <TableCell>{a.actor}</TableCell>
                <TableCell>{a.action}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.target || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ---------------- Main ---------------- */
export default function AccessControl() {
  const state = useAcl();
  const kpis = [
    { label: "Roles", value: state.roles.length, tone: "info" as const },
    { label: "Modules / Routes", value: state.modules.length },
    { label: "Users", value: state.users.length, tone: "success" as const },
    { label: "Active Users", value: state.users.filter((u) => u.active).length },
    { label: "Permission Rules", value: Object.values(state.matrix).reduce((acc, m) => acc + Object.values(m).reduce((a, p) => a + Object.values(p).filter(Boolean).length, 0), 0) },
    { label: "Audit Entries", value: state.audit.length, tone: "warning" as const },
  ];

  return (
    <PageShell
      title="Access Control (ACL)"
      description="Dynamic roles, routes & module registry, user-role assignment, and a full permission matrix. Master role has wildcard access."
      action={<Button size="sm" variant="outline" onClick={() => { if (confirm("Reset all ACL data to defaults?")) acl.resetAll(); }}><RefreshCw className="h-4 w-4 mr-1" />Reset</Button>}
    >
      <KpiGrid kpis={kpis} />

      <Tabs defaultValue="roles" className="space-y-3">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="roles"><ShieldCheck className="h-4 w-4 mr-1" />Roles</TabsTrigger>
          <TabsTrigger value="modules"><RouteIcon className="h-4 w-4 mr-1" />Routes & Modules</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users & Assignment</TabsTrigger>
          <TabsTrigger value="matrix"><KeyRound className="h-4 w-4 mr-1" />Permission Matrix</TabsTrigger>
          <TabsTrigger value="tester"><FlaskConical className="h-4 w-4 mr-1" />Tester</TabsTrigger>
          <TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="modules"><ModulesTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="matrix"><MatrixTab /></TabsContent>
        <TabsContent value="tester"><TesterTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="text-base">How to test the flow</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Roles tab</strong> → click <em>New Role</em>, create e.g. <em>"Night Auditor"</em>.</li>
            <li><strong>Routes & Modules</strong> → add a new module (key: <code>night-audit</code>, route: <code>/app/night-audit</code>).</li>
            <li><strong>Permission Matrix</strong> → pick "Night Auditor", check <em>view</em> + <em>export</em> on Night Audit row. Try <em>Grant all</em> / <em>Revoke all</em>.</li>
            <li><strong>Users tab</strong> → create a user, assign the "Night Auditor" role with the checkboxes.</li>
            <li><strong>Tester tab</strong> → pick that user; matrix shows green ticks only where allowed. Switch the user inactive and observe everything turns Denied.</li>
            <li><strong>Audit tab</strong> → every action is logged with timestamp.</li>
            <li>Refresh the browser — state persists via localStorage. Hit <em>Reset</em> to restore seed data.</li>
          </ol>
        </CardContent>
      </Card>
    </PageShell>
  );
}