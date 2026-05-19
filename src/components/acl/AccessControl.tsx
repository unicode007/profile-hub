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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  Plus, Trash2, Pencil, ShieldCheck, KeyRound, Route as RouteIcon, Users, History,
  FlaskConical, RefreshCw, Lock, Unlock, Copy, Download, Upload, Star, Save, LogOut,
  Building2, AlertTriangle, GitBranch, Settings, Inbox, Activity, FileWarning, Search,
  ShieldAlert, ClockIcon
} from "lucide-react";
import { PageShell, KpiGrid } from "@/components/modules/ModuleKit";
import {
  acl, useAcl, ALL_PERMS, CORE_PERMS, permissionStats, effectiveRoleIds, getSoDConflicts, userHasPerm,
  type AclRole, type AclModule, type AclUser, type RiskLevel, type ModuleStatus,
} from "./aclStore";
import { toast } from "sonner";

/* ------------------ helpers ------------------ */
const riskTone: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-sky-100 text-sky-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};
const statusTone: Record<ModuleStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  beta: "bg-violet-100 text-violet-700",
  deprecated: "bg-amber-100 text-amber-700",
  disabled: "bg-muted text-muted-foreground",
};
function RoleBadge({ role }: { role: AclRole }) {
  const tones: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700", violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700", emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700", indigo: "bg-indigo-100 text-indigo-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${tones[role.color || "sky"] || "bg-muted"}`}>{role.name}</span>;
}
function timeAgo(ts?: number) {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ===================== ROLES TAB ===================== */
function RolesTab() {
  const { roles, modules, matrix } = useAcl();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclRole | null>(null);
  const blank = { name: "", description: "", color: "sky", parentId: "", priority: 50, require2FA: false, sessionTimeoutMin: 60, riskLevel: "medium" as RiskLevel, ipAllowlist: "" };
  const [form, setForm] = useState<any>(blank);

  const filtered = roles.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (r: AclRole) => { setEditing(r); setForm({ ...blank, ...r, parentId: r.parentId || "", ipAllowlist: (r.ipAllowlist || []).join(", ") }); setOpen(true); };
  const save = () => {
    if (!form.name.trim()) { toast.error("Role name required"); return; }
    const payload = { ...form, parentId: form.parentId || undefined, ipAllowlist: form.ipAllowlist ? form.ipAllowlist.split(",").map((x: string) => x.trim()).filter(Boolean) : [] };
    if (editing) { acl.updateRole(editing.id, payload); toast.success("Role updated"); }
    else { acl.addRole(payload); toast.success("Role created"); }
    setOpen(false);
  };

  const ruleCount = (rid: string) => Object.values(matrix[rid] || {}).reduce((a, p) => a + Object.values(p).filter((c: any) => c?.allow).length, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search roles..." value={q} onChange={(e) => setQ(e.target.value)} className="h-9" />
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New Role</Button>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Role</TableHead><TableHead>Inherits</TableHead><TableHead>Risk</TableHead>
            <TableHead>2FA</TableHead><TableHead>Rules</TableHead><TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const parent = roles.find(p => p.id === r.parentId);
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={r} />
                      {r.isSystem && <Badge variant="outline" className="text-[10px]">SYSTEM</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.description}</div>
                  </TableCell>
                  <TableCell>{parent ? <RoleBadge role={parent} /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                  <TableCell><Badge className={riskTone[r.riskLevel || "low"]} variant="secondary">{r.riskLevel || "low"}</Badge></TableCell>
                  <TableCell>{r.require2FA ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground text-xs">off</span>}</TableCell>
                  <TableCell><Badge variant="secondary">{ruleCount(r.id)}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" title="Clone" onClick={() => { acl.cloneRole(r.id); toast.success("Role cloned"); }}><Copy className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" disabled={r.isSystem} onClick={() => { if (confirm("Delete role?")) { acl.deleteRole(r.id); toast.success("Deleted"); } }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Role" : "New Role"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Color</Label>
              <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["amber","violet","sky","emerald","rose","indigo","slate"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Inherit from (parent role)</Label>
              <Select value={form.parentId || "none"} onValueChange={(v) => setForm({ ...form, parentId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {roles.filter(r => r.id !== editing?.id).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Risk Level</Label>
              <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["low","medium","high","critical"] as RiskLevel[]).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Priority ({form.priority})</Label><Slider value={[form.priority]} max={100} min={0} step={5} onValueChange={(v) => setForm({ ...form, priority: v[0] })} /></div>
            <div><Label>Session Timeout (min)</Label><Input type="number" value={form.sessionTimeoutMin} onChange={(e) => setForm({ ...form, sessionTimeoutMin: +e.target.value })} /></div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Require 2FA</Label><Switch checked={form.require2FA} onCheckedChange={(v) => setForm({ ...form, require2FA: v })} /></div>
            <div className="col-span-2"><Label>IP Allowlist (comma-separated)</Label><Input placeholder="10.0.0.0/24, 182.74.10.4" value={form.ipAllowlist} onChange={(e) => setForm({ ...form, ipAllowlist: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===================== MODULES TAB ===================== */
function ModulesTab() {
  const { modules } = useAcl();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclModule | null>(null);
  const blank = { key: "", label: "", route: "", group: "Custom", status: "active" as ModuleStatus, riskLevel: "low" as RiskLevel, pii: false, description: "" };
  const [form, setForm] = useState<any>(blank);

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (m: AclModule) => { setEditing(m); setForm({ ...blank, ...m }); setOpen(true); };
  const save = () => {
    if (!form.key || !form.label || !form.route) { toast.error("Key, label, route required"); return; }
    if (editing) { acl.updateModule(editing.id, form); toast.success("Module updated"); }
    else { acl.addModule(form); toast.success("Module created"); }
    setOpen(false);
  };

  const filtered = modules.filter(m => (m.label + m.key + m.route).toLowerCase().includes(q.toLowerCase()));
  const grouped = useMemo(() => {
    const map: Record<string, AclModule[]> = {};
    filtered.forEach((m) => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search modules / routes..." value={q} onChange={(e) => setQ(e.target.value)} className="h-9" />
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New Module</Button>
      </div>
      {Object.entries(grouped).map(([g, list]) => (
        <Card key={g}>
          <CardHeader className="py-3"><CardTitle className="text-sm flex items-center justify-between">{g}<Badge variant="secondary">{list.length}</Badge></CardTitle></CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader><TableRow><TableHead></TableHead><TableHead>Label</TableHead><TableHead>Key</TableHead><TableHead>Route</TableHead><TableHead>Status</TableHead><TableHead>Risk</TableHead><TableHead>Flags</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><Star className={`h-4 w-4 cursor-pointer ${m.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} onClick={() => acl.toggleStar(m.id)} /></TableCell>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell><code className="text-xs">{m.key}</code></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.route}</TableCell>
                    <TableCell><Badge className={statusTone[m.status || "active"]} variant="secondary">{m.status || "active"}</Badge></TableCell>
                    <TableCell><Badge className={riskTone[m.riskLevel || "low"]} variant="secondary">{m.riskLevel || "low"}</Badge></TableCell>
                    <TableCell className="space-x-1">
                      {m.pii && <Badge variant="outline" className="text-[10px]">PII</Badge>}
                      {m.customActions?.length ? <Badge variant="outline" className="text-[10px]">+{m.customActions.length} actions</Badge> : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete module?")) { acl.deleteModule(m.id); toast.success("Deleted"); } }}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Module" : "New Module"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
            <div><Label>Key (unique)</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="bookings" /></div>
            <div><Label>Route</Label><Input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="/app/calendar" /></div>
            <div><Label>Group</Label><Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["active","beta","deprecated","disabled"] as ModuleStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Risk Level</Label>
              <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["low","medium","high","critical"] as RiskLevel[]).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2 col-span-2"><Label className="m-0">Contains PII data</Label><Switch checked={form.pii} onCheckedChange={(v) => setForm({ ...form, pii: v })} /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Module</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===================== USERS TAB ===================== */
function UsersTab() {
  const state = useAcl();
  const { users, roles, departments } = state;
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AclUser | null>(null);
  const blank = { name: "", email: "", phone: "", active: true, twoFAEnabled: false, departmentId: "", roleIds: [] as string[], notes: "" };
  const [form, setForm] = useState<any>(blank);
  const [bulkRole, setBulkRole] = useState("");

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (u: AclUser) => { setEditing(u); setForm({ ...blank, ...u, departmentId: u.departmentId || "" }); setOpen(true); };
  const save = () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    if (editing) { acl.updateUser(editing.id, form); toast.success("Updated"); }
    else { acl.addUser(form); toast.success("Created"); }
    setOpen(false);
  };
  const filtered = users.filter(u => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next); };
  const exportCsv = () => {
    const rows = ["Name,Email,Department,Roles,Active,2FA,Last Login"];
    users.forEach(u => {
      const dept = departments.find(d => d.id === u.departmentId)?.name || "";
      const rn = u.roleIds.map(r => roles.find(x => x.id === r)?.name || "").join(";");
      rows.push(`${u.name},${u.email},${dept},${rn},${u.active},${!!u.twoFAEnabled},${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : ""}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "users.csv"; a.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={q} onChange={(e) => setQ(e.target.value)} className="h-9" />
        </div>
        <div className="flex gap-2 items-center">
          {selected.size > 0 && (
            <>
              <Badge>{selected.size} selected</Badge>
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Assign role..." /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" variant="outline" disabled={!bulkRole} onClick={() => { acl.bulkAssignRole(Array.from(selected), bulkRole); toast.success("Bulk role assigned"); setSelected(new Set()); }}>Apply</Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete ${selected.size} users?`)) { acl.bulkDeleteUsers(Array.from(selected)); setSelected(new Set()); } }}><Trash2 className="h-4 w-4" /></Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New User</Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-8"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={(v) => setSelected(v ? new Set(filtered.map(u => u.id)) : new Set())} /></TableHead>
            <TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Roles</TableHead>
            <TableHead>2FA</TableHead><TableHead>Last Login</TableHead><TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const conflicts = getSoDConflicts(state, u.id);
              return (
                <TableRow key={u.id}>
                  <TableCell><Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggle(u.id)} /></TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">{u.name}
                      {conflicts.length > 0 && <span title={conflicts.map(c => c.name).join(", ")}><AlertTriangle className="h-3.5 w-3.5 text-rose-600" /></span>}
                      {u.locked && <Lock className="h-3.5 w-3.5 text-rose-600" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{departments.find(d => d.id === u.departmentId)?.name || "—"}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{u.roleIds.map(rid => { const r = roles.find(x => x.id === rid); return r ? <RoleBadge key={rid} role={r} /> : null; })}</div></TableCell>
                  <TableCell>{u.twoFAEnabled ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <span className="text-xs text-muted-foreground">off</span>}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(u.lastLoginAt)}</TableCell>
                  <TableCell><Switch checked={u.active} onCheckedChange={(v) => acl.updateUser(u.id, { active: v })} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" title={u.locked ? "Unlock" : "Lock"} onClick={() => acl.lockUser(u.id, !u.locked)}>{u.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button>
                    <Button size="sm" variant="ghost" title="Force logout" onClick={() => { acl.forceLogout(u.id); toast.success("Sessions killed"); }}><LogOut className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" title="Reset 2FA" onClick={() => { acl.resetUser2FA(u.id); toast.success("2FA reset"); }}><ShieldAlert className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete user?")) acl.deleteUser(u.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Department</Label>
              <Select value={form.departmentId || "none"} onValueChange={(v) => setForm({ ...form, departmentId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Active</Label><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">2FA Enabled</Label><Switch checked={form.twoFAEnabled} onCheckedChange={(v) => setForm({ ...form, twoFAEnabled: v })} /></div>
            <div className="col-span-2">
              <Label>Assign Roles</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {roles.map(r => (
                  <label key={r.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={form.roleIds.includes(r.id)} onCheckedChange={(v) => setForm({ ...form, roleIds: v ? [...form.roleIds, r.id] : form.roleIds.filter((x: string) => x !== r.id) })} />
                    <RoleBadge role={r} />
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save User</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===================== MATRIX TAB ===================== */
function MatrixTab() {
  const { roles, modules, matrix } = useAcl();
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [copyFrom, setCopyFrom] = useState("");
  const [permSet, setPermSet] = useState<"core" | "all">("core");
  const role = roles.find(r => r.id === roleId);
  const visible = permSet === "core" ? CORE_PERMS : ALL_PERMS;

  const grouped = useMemo(() => {
    const map: Record<string, AclModule[]> = {};
    modules.forEach(m => { (map[m.group] = map[m.group] || []).push(m); });
    return map;
  }, [modules]);
  const cell = (mid: string, p: string) => matrix[roleId]?.[mid]?.[p] || {};

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 py-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
            {role?.isSystem && <Badge>Wildcard — all permissions</Badge>}
            {role?.parentId && <Badge variant="outline">Inherits {roles.find(r => r.id === role.parentId)?.name}</Badge>}
            <Select value={permSet} onValueChange={(v: any) => setPermSet(v)}>
              <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="core">Core perms</SelectItem><SelectItem value="all">All perms</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={copyFrom} onValueChange={setCopyFrom}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Copy from..." /></SelectTrigger>
              <SelectContent>{roles.filter(r => r.id !== roleId).map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={!copyFrom || role?.isSystem} onClick={() => { acl.copyRolePerms(copyFrom, roleId); toast.success("Permissions copied"); }}><Copy className="h-4 w-4 mr-1" />Copy</Button>
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
                  <TableHead className="min-w-[220px]">Module</TableHead>
                  {visible.map(p => <TableHead key={p} className="capitalize text-center text-[11px]">{p}</TableHead>)}
                  <TableHead className="text-right">All</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">{m.label} {m.pii && <Badge variant="outline" className="text-[10px]">PII</Badge>}</div>
                      <div className="text-xs text-muted-foreground">{m.route}</div>
                    </TableCell>
                    {visible.map(p => {
                      const c = cell(m.id, p);
                      const eff = !!c.allow && !c.deny;
                      return (
                        <TableCell key={p} className="text-center">
                          <button
                            type="button"
                            disabled={role?.isSystem}
                            onClick={() => acl.setPerm(roleId, m.id, p, !c.allow)}
                            onContextMenu={(e) => { e.preventDefault(); acl.setDeny(roleId, m.id, p, !c.deny); }}
                            title="Click = toggle allow, right-click = toggle DENY"
                            className={`h-5 w-5 rounded border ${c.deny ? "bg-rose-500 border-rose-500" : eff ? "bg-emerald-500 border-emerald-500" : c.allow ? "bg-emerald-200 border-emerald-300" : "bg-muted border-border"}`}
                          />
                        </TableCell>
                      );
                    })}
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
      <Card><CardContent className="text-xs text-muted-foreground py-3 flex gap-4 flex-wrap">
        <span><span className="inline-block h-3 w-3 bg-emerald-500 rounded mr-1 align-middle" />Allow</span>
        <span><span className="inline-block h-3 w-3 bg-rose-500 rounded mr-1 align-middle" />Deny (overrides allow)</span>
        <span>Tip: <kbd className="px-1 border rounded">Right-click</kbd> a cell to toggle DENY.</span>
      </CardContent></Card>
    </div>
  );
}

/* ===================== TESTER ===================== */
function TesterTab() {
  const state = useAcl();
  const [userId, setUserId] = useState(state.users[0]?.id || "");
  const user = state.users.find(u => u.id === userId);
  const eff = user ? effectiveRoleIds(state, userId).map(r => state.roles.find(x => x.id === r)).filter(Boolean) as AclRole[] : [];
  const conflicts = user ? getSoDConflicts(state, userId) : [];

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="h-4 w-4" />Permission Simulator</CardTitle>
          <CardDescription>Pick a user and see resolved access (with inheritance + deny rules).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>{state.users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} — {u.email}</SelectItem>)}</SelectContent>
          </Select>
          {user && (
            <div className="text-sm flex flex-wrap items-center gap-2">
              <span>Effective roles:</span>
              {eff.map(r => <RoleBadge key={r.id} role={r} />)}
              {!user.active && <Badge variant="destructive">Inactive</Badge>}
              {user.locked && <Badge variant="destructive">Locked</Badge>}
              {conflicts.map(c => <Badge key={c.id} variant="destructive">SoD: {c.name}</Badge>)}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead>{CORE_PERMS.map(p => <TableHead key={p} className="capitalize text-center">{p}</TableHead>)}<TableHead>Access</TableHead></TableRow></TableHeader>
              <TableBody>
                {state.modules.map(m => {
                  const cells = CORE_PERMS.map(p => userHasPerm(state, userId, m.key, p));
                  const any = cells.some(Boolean);
                  return (
                    <TableRow key={m.id}>
                      <TableCell><div className="font-medium">{m.label}</div><div className="text-xs text-muted-foreground">{m.route}</div></TableCell>
                      {cells.map((ok, i) => <TableCell key={i} className="text-center">{ok ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-muted-foreground">—</span>}</TableCell>)}
                      <TableCell>{any ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Allowed</Badge> : <Badge variant="destructive">Denied</Badge>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== APPROVALS ===================== */
function ApprovalsTab() {
  const { requests, users, modules } = useAcl();
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Inbox className="h-4 w-4" />Access Requests</CardTitle><CardDescription>Approve or reject just-in-time access requests.</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>User</TableHead><TableHead>Module</TableHead><TableHead>Perms</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {requests.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No pending requests</TableCell></TableRow>}
            {requests.map(r => {
              const u = users.find(x => x.id === r.userId); const m = modules.find(x => x.id === r.moduleId);
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{timeAgo(r.createdAt)}</TableCell>
                  <TableCell>{u?.name}</TableCell>
                  <TableCell>{m?.label}</TableCell>
                  <TableCell><div className="flex gap-1 flex-wrap">{r.perms.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}</div></TableCell>
                  <TableCell className="text-xs">{r.reason}</TableCell>
                  <TableCell>{r.status === "pending" ? <Badge>Pending</Badge> : r.status === "approved" ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Approved</Badge> : <Badge variant="destructive">Rejected</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {r.status === "pending" && <>
                      <Button size="sm" variant="outline" onClick={() => { acl.decideRequest(r.id, true); toast.success("Approved"); }}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => { acl.decideRequest(r.id, false); }}>Reject</Button>
                    </>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ===================== SoD ===================== */
function SoDTab() {
  const state = useAcl();
  const { sodRules, roles, users } = state;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", conflictRoleIds: [] as string[], severity: "high" as RiskLevel });
  const violators = useMemo(() => users.map(u => ({ user: u, conflicts: getSoDConflicts(state, u.id) })).filter(x => x.conflicts.length), [state]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between"><p className="text-sm text-muted-foreground">Define mutually exclusive role combinations (Segregation of Duties).</p><Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />New Rule</Button></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Rule</TableHead><TableHead>Conflicting Roles</TableHead><TableHead>Severity</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sodRules.map(r => (
              <TableRow key={r.id}>
                <TableCell><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.description}</div></TableCell>
                <TableCell><div className="flex gap-1 flex-wrap">{r.conflictRoleIds.map(rid => { const ro = roles.find(x => x.id === rid); return ro ? <RoleBadge key={rid} role={ro} /> : null; })}</div></TableCell>
                <TableCell><Badge className={riskTone[r.severity]} variant="secondary">{r.severity}</Badge></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => acl.deleteSoD(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Violators ({violators.length})</CardTitle></CardHeader>
        <CardContent>
          {violators.length === 0 ? <p className="text-sm text-muted-foreground">No SoD violations.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Violated Rules</TableHead></TableRow></TableHeader>
              <TableBody>
                {violators.map(v => <TableRow key={v.user.id}><TableCell>{v.user.name}</TableCell><TableCell><div className="flex gap-1 flex-wrap">{v.conflicts.map(c => <Badge key={c.id} variant="destructive">{c.name}</Badge>)}</div></TableCell></TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New SoD Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v: any) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["low","medium","high","critical"] as RiskLevel[]).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Conflicting Roles (select 2+)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {roles.map(r => (
                  <label key={r.id} className="flex items-center gap-2 border rounded-md px-2 py-1.5 cursor-pointer">
                    <Checkbox checked={form.conflictRoleIds.includes(r.id)} onCheckedChange={(v) => setForm({ ...form, conflictRoleIds: v ? [...form.conflictRoleIds, r.id] : form.conflictRoleIds.filter(x => x !== r.id) })} />
                    <RoleBadge role={r} />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { if (form.conflictRoleIds.length < 2) { toast.error("Pick at least 2 roles"); return; } acl.addSoD(form); setOpen(false); setForm({ name: "", description: "", conflictRoleIds: [], severity: "high" }); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===================== SESSIONS ===================== */
function SessionsTab() {
  const { sessions, users } = useAcl();
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Active Sessions</CardTitle><CardDescription>Monitor and terminate user sessions in real time.</CardDescription></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Device</TableHead><TableHead>IP</TableHead><TableHead>Started</TableHead><TableHead>Last Seen</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {sessions.map(s => { const u = users.find(x => x.id === s.userId); return (
              <TableRow key={s.id}>
                <TableCell>{u?.name}</TableCell>
                <TableCell className="text-xs">{s.device}</TableCell>
                <TableCell className="text-xs"><code>{s.ip}</code></TableCell>
                <TableCell className="text-xs">{timeAgo(s.createdAt)}</TableCell>
                <TableCell className="text-xs">{timeAgo(s.lastSeenAt)}</TableCell>
                <TableCell>{s.active ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Active</Badge> : <Badge variant="outline">Ended</Badge>}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="destructive" disabled={!s.active} onClick={() => { acl.killSession(s.id); toast.success("Session terminated"); }}>Terminate</Button></TableCell>
              </TableRow>
            ); })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ===================== API KEYS ===================== */
function ApiKeysTab() {
  const { users, modules } = useAcl();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", label: "", scopes: [] as string[], expiresDays: 90 });
  const create = () => {
    if (!form.userId || !form.label) { toast.error("User and label required"); return; }
    const prefix = acl.createApiKey(form.userId, { label: form.label, scopes: form.scopes, expiresAt: Date.now() + form.expiresDays * 86400000 });
    toast.success(`Key created: ${prefix}`);
    setOpen(false); setForm({ userId: "", label: "", scopes: [], expiresDays: 90 });
  };
  const rows = users.flatMap(u => (u.apiKeys || []).map(k => ({ user: u, key: k })));
  return (
    <div className="space-y-3">
      <div className="flex justify-between"><p className="text-sm text-muted-foreground">Issue scoped API keys for users or integrations.</p><Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />New Key</Button></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Owner</TableHead><TableHead>Label</TableHead><TableHead>Prefix</TableHead><TableHead>Scopes</TableHead><TableHead>Created</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No keys yet</TableCell></TableRow>}
            {rows.map(({ user, key }) => (
              <TableRow key={key.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{key.label}</TableCell>
                <TableCell><code className="text-xs">{key.prefix}…</code></TableCell>
                <TableCell><div className="flex gap-1 flex-wrap">{key.scopes.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}</div></TableCell>
                <TableCell className="text-xs">{timeAgo(key.createdAt)}</TableCell>
                <TableCell className="text-xs">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>{key.revoked ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Active</Badge>}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="destructive" disabled={key.revoked} onClick={() => { acl.revokeApiKey(user.id, key.id); toast.success("Revoked"); }}>Revoke</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue API Key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Owner</Label>
              <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                <SelectTrigger><SelectValue placeholder="Pick user..." /></SelectTrigger>
                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. OTA Sync" /></div>
            <div><Label>Expires in (days)</Label><Input type="number" value={form.expiresDays} onChange={(e) => setForm({ ...form, expiresDays: +e.target.value })} /></div>
            <div><Label>Scopes</Label>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto mt-1 border rounded p-2">
                {modules.map(m => (
                  <label key={m.id} className="flex items-center gap-2 text-xs"><Checkbox checked={form.scopes.includes(m.key)} onCheckedChange={(v) => setForm({ ...form, scopes: v ? [...form.scopes, m.key] : form.scopes.filter(x => x !== m.key) })} />{m.label}</label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Issue Key</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===================== SNAPSHOTS / VERSIONING ===================== */
function SnapshotsTab() {
  const { snapshots } = useAcl();
  const [label, setLabel] = useState("");
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><GitBranch className="h-4 w-4" />Policy Snapshots</CardTitle><CardDescription>Save versions of your ACL config and roll back instantly.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Snapshot label e.g. before-q4-audit" value={label} onChange={(e) => setLabel(e.target.value)} />
            <Button onClick={() => { if (!label) return; acl.saveSnapshot(label); setLabel(""); toast.success("Snapshot saved"); }}><Save className="h-4 w-4 mr-1" />Save</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Label</TableHead><TableHead>When</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {snapshots.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No snapshots</TableCell></TableRow>}
              {snapshots.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.label}</TableCell>
                  <TableCell className="text-xs">{new Date(s.ts).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => { if (confirm("Restore this snapshot? Current state will be replaced.")) { acl.restoreSnapshot(s.id); toast.success("Restored"); } }}>Restore</Button>
                    <Button size="sm" variant="ghost" onClick={() => acl.deleteSnapshot(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== DEPARTMENTS ===================== */
function DepartmentsTab() {
  const { departments, users } = useAcl();
  const [name, setName] = useState("");
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Departments</CardTitle><CardDescription>Group users by department for reporting and bulk actions.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" />
          <Button onClick={() => { if (!name) return; acl.addDepartment({ name }); setName(""); toast.success("Created"); }}><Plus className="h-4 w-4" /></Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Users</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {departments.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell><Badge variant="secondary">{users.filter(u => u.departmentId === d.id).length}</Badge></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => acl.deleteDepartment(d.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ===================== COMPARE ===================== */
function CompareTab() {
  const { roles, modules, matrix } = useAcl();
  const [a, setA] = useState(roles[0]?.id || "");
  const [b, setB] = useState(roles[1]?.id || "");
  const has = (rid: string, mid: string, p: string) => {
    const role = roles.find(r => r.id === rid);
    if (role?.isSystem) return true;
    return !!matrix[rid]?.[mid]?.[p]?.allow && !matrix[rid]?.[mid]?.[p]?.deny;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Role Comparison</CardTitle>
        <div className="flex gap-3 pt-2">
          <Select value={a} onValueChange={setA}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
          <span className="self-center text-muted-foreground">vs</span>
          <Select value={b} onValueChange={setB}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Module</TableHead>{CORE_PERMS.map(p => <TableHead key={p} className="text-center capitalize">{p}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {modules.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.label}</TableCell>
                {CORE_PERMS.map(p => {
                  const aH = has(a, m.id, p); const bH = has(b, m.id, p);
                  const diff = aH !== bH;
                  return <TableCell key={p} className={`text-center text-xs ${diff ? "bg-amber-100" : ""}`}>{aH ? "✓" : "—"} / {bH ? "✓" : "—"}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ===================== AUDIT ===================== */
function AuditTab() {
  const { audit } = useAcl();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const filtered = audit.filter(a => (cat === "all" || a.category === cat) && (a.action + (a.target || "")).toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => {
    const rows = ["When,Actor,Category,Action,Target"];
    filtered.forEach(a => rows.push(`${new Date(a.ts).toISOString()},${a.actor},${a.category},${a.action},${a.target || ""}`));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "audit.csv"; link.click();
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" />Audit Log</CardTitle>
        <CardDescription>Tamper-evident trail of every ACL change.</CardDescription>
        <div className="flex gap-2 pt-2 flex-wrap">
          <Input placeholder="Search action / target..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
          <Select value={cat} onValueChange={setCat}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All categories</SelectItem>{["role","module","user","permission","session","key","system","approval"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm("Clear audit log?")) acl.clearAudit(); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Category</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Actor</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No entries</TableCell></TableRow>}
            {filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell className="text-xs">{new Date(a.ts).toLocaleString()}</TableCell>
                <TableCell><Badge variant="secondary" className="text-[10px]">{a.category}</Badge></TableCell>
                <TableCell className="text-sm">{a.action}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.target || "—"}</TableCell>
                <TableCell className="text-xs">{a.actor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ===================== SETTINGS ===================== */
function SettingsTab() {
  const { settings } = useAcl();
  const update = (patch: any) => acl.updateSettings(patch);
  const [imp, setImp] = useState("");
  const handleExport = () => {
    const blob = new Blob([acl.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "acl-export.json"; a.click();
  };
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />Global Policy Settings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Enforce Segregation of Duties</Label><Switch checked={settings.enforceSoD} onCheckedChange={(v) => update({ enforceSoD: v })} /></div>
          <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Force 2FA for Critical modules</Label><Switch checked={settings.enforce2FAForCritical} onCheckedChange={(v) => update({ enforce2FAForCritical: v })} /></div>
          <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Auto-revoke expired grants</Label><Switch checked={settings.autoRevokeExpired} onCheckedChange={(v) => update({ autoRevokeExpired: v })} /></div>
          <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Require justification (critical)</Label><Switch checked={settings.requireJustificationForCritical} onCheckedChange={(v) => update({ requireJustificationForCritical: v })} /></div>
          <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label className="m-0">Email on permission change</Label><Switch checked={settings.emailOnPermissionChange} onCheckedChange={(v) => update({ emailOnPermissionChange: v })} /></div>
          <div><Label>Default session timeout (min)</Label><Input type="number" value={settings.defaultSessionMin} onChange={(e) => update({ defaultSessionMin: +e.target.value })} /></div>
          <div><Label>Password min length</Label><Input type="number" value={settings.passwordMinLength} onChange={(e) => update({ passwordMinLength: +e.target.value })} /></div>
          <div><Label>Lockout threshold (failed attempts)</Label><Input type="number" value={settings.lockoutThreshold} onChange={(e) => update({ lockoutThreshold: +e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileWarning className="h-4 w-4" />Backup & Restore</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2"><Button onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export JSON</Button>
          <Button variant="outline" onClick={() => { if (acl.importJson(imp)) { toast.success("Imported"); setImp(""); } else toast.error("Invalid JSON"); }}><Upload className="h-4 w-4 mr-1" />Import</Button></div>
          <Textarea rows={6} placeholder="Paste exported ACL JSON here to import..." value={imp} onChange={(e) => setImp(e.target.value)} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== MAIN ===================== */
export default function AccessControl() {
  const state = useAcl();
  const stats = permissionStats(state);
  const kpis = [
    { label: "Roles", value: state.roles.length, tone: "info" as const },
    { label: "Modules", value: state.modules.length },
    { label: "Active Users", value: state.users.filter(u => u.active).length, tone: "success" as const },
    { label: "Allow Rules", value: stats.totalRules },
    { label: "Deny Rules", value: stats.denyRules, tone: "warning" as const },
    { label: "Locked Users", value: stats.lockedUsers, tone: "danger" as const },
    { label: "Without 2FA", value: stats.without2FA, tone: "warning" as const },
    { label: "PII Modules", value: stats.piiModules, tone: "info" as const },
    { label: "Pending Requests", value: state.requests.filter(r => r.status === "pending").length, tone: "warning" as const },
    { label: "Active Sessions", value: state.sessions.filter(s => s.active).length, tone: "success" as const },
    { label: "Audit Entries", value: state.audit.length },
    { label: "Snapshots", value: state.snapshots.length },
  ];

  return (
    <PageShell
      title="Access Control — Production ACL"
      description="Roles + inheritance, dynamic modules, allow/deny matrix, SoD rules, JIT approvals, API keys, sessions, snapshots, audit and compliance settings."
      action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { acl.saveSnapshot("auto-" + new Date().toISOString().slice(0,16)); toast.success("Snapshot saved"); }}><Save className="h-4 w-4 mr-1" />Snapshot</Button>
          <Button size="sm" variant="outline" onClick={() => { if (confirm("Reset all ACL data?")) acl.resetAll(); }}><RefreshCw className="h-4 w-4 mr-1" />Reset</Button>
        </div>
      }
    >
      <KpiGrid kpis={kpis} />

      <Tabs defaultValue="roles" className="space-y-3">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="roles"><ShieldCheck className="h-4 w-4 mr-1" />Roles</TabsTrigger>
          <TabsTrigger value="modules"><RouteIcon className="h-4 w-4 mr-1" />Modules</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="matrix"><KeyRound className="h-4 w-4 mr-1" />Matrix</TabsTrigger>
          <TabsTrigger value="compare"><GitBranch className="h-4 w-4 mr-1" />Compare</TabsTrigger>
          <TabsTrigger value="tester"><FlaskConical className="h-4 w-4 mr-1" />Tester</TabsTrigger>
          <TabsTrigger value="approvals"><Inbox className="h-4 w-4 mr-1" />Approvals</TabsTrigger>
          <TabsTrigger value="sod"><AlertTriangle className="h-4 w-4 mr-1" />SoD</TabsTrigger>
          <TabsTrigger value="sessions"><Activity className="h-4 w-4 mr-1" />Sessions</TabsTrigger>
          <TabsTrigger value="keys"><KeyRound className="h-4 w-4 mr-1" />API Keys</TabsTrigger>
          <TabsTrigger value="departments"><Building2 className="h-4 w-4 mr-1" />Departments</TabsTrigger>
          <TabsTrigger value="snapshots"><ClockIcon className="h-4 w-4 mr-1" />Snapshots</TabsTrigger>
          <TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Audit</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" />Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="roles"><RolesTab /></TabsContent>
        <TabsContent value="modules"><ModulesTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="matrix"><MatrixTab /></TabsContent>
        <TabsContent value="compare"><CompareTab /></TabsContent>
        <TabsContent value="tester"><TesterTab /></TabsContent>
        <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
        <TabsContent value="sod"><SoDTab /></TabsContent>
        <TabsContent value="sessions"><SessionsTab /></TabsContent>
        <TabsContent value="keys"><ApiKeysTab /></TabsContent>
        <TabsContent value="departments"><DepartmentsTab /></TabsContent>
        <TabsContent value="snapshots"><SnapshotsTab /></TabsContent>
        <TabsContent value="audit"><AuditTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </PageShell>
  );
}
