import { useSyncExternalStore } from "react";

/* Production-grade ACL store */

export type Permission =
  | "view" | "create" | "update" | "delete"
  | "export" | "import" | "approve" | "publish"
  | "share" | "print" | "manage" | "audit";

export const ALL_PERMS: Permission[] = [
  "view", "create", "update", "delete",
  "export", "import", "approve", "publish",
  "share", "print", "manage", "audit",
];

export const CORE_PERMS: Permission[] = ["view", "create", "update", "delete", "export", "approve"];

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ModuleStatus = "active" | "beta" | "deprecated" | "disabled";
export type Compliance = "SOC2" | "GDPR" | "PCI" | "HIPAA" | "ISO27001";

export type AclRole = {
  id: string; name: string; description?: string;
  isSystem?: boolean; color?: string; parentId?: string;
  tags?: string[]; priority?: number; require2FA?: boolean;
  sessionTimeoutMin?: number; passwordMinLength?: number;
  ipAllowlist?: string[]; riskLevel?: RiskLevel;
  maxConcurrentSessions?: number; compliance?: Compliance[]; createdAt?: number;
};

export type AclModule = {
  id: string; key: string; label: string; route: string; group: string;
  icon?: string; status?: ModuleStatus; riskLevel?: RiskLevel;
  dependsOn?: string[]; customActions?: string[]; description?: string;
  pii?: boolean; starred?: boolean;
};

export type AclDepartment = { id: string; name: string; head?: string };

export type UserRoleGrant = {
  roleId: string; validFrom?: number; validTo?: number;
  scope?: string[]; grantedBy?: string; grantedAt?: number; note?: string;
};

export type ApiKey = {
  id: string; label: string; prefix: string;
  createdAt: number; lastUsedAt?: number; expiresAt?: number;
  scopes: string[]; revoked?: boolean;
};

export type AclUser = {
  id: string; name: string; email: string; phone?: string; avatarUrl?: string;
  active: boolean; locked?: boolean; failedAttempts?: number;
  lastLoginAt?: number; lastIp?: string; twoFAEnabled?: boolean;
  departmentId?: string; managerId?: string;
  roleIds: string[]; grants?: UserRoleGrant[];
  apiKeys?: ApiKey[]; notes?: string; tags?: string[]; createdAt?: number;
};

export type PermCell = { allow?: boolean; deny?: boolean };
export type PermMatrix = Record<string, Record<string, Record<string, PermCell>>>;

export type AuditCategory = "role" | "module" | "user" | "permission" | "session" | "key" | "system" | "approval";
export type AuditEntry = {
  id: string; ts: number; actor: string;
  category: AuditCategory; action: string; target?: string;
  meta?: Record<string, any>;
};

export type AccessRequest = {
  id: string; userId: string; moduleId: string;
  perms: string[]; reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number; decidedAt?: number; decidedBy?: string;
};

export type SoDRule = {
  id: string; name: string; description?: string;
  conflictRoleIds: string[]; severity: RiskLevel;
};

export type Session = {
  id: string; userId: string; device: string; ip: string;
  createdAt: number; lastSeenAt: number; active: boolean;
};

export type AclSettings = {
  enforceSoD: boolean;
  enforce2FAForCritical: boolean;
  defaultSessionMin: number;
  passwordMinLength: number;
  lockoutThreshold: number;
  autoRevokeExpired: boolean;
  requireJustificationForCritical: boolean;
  emailOnPermissionChange: boolean;
};

export type Snapshot = {
  id: string; label: string; ts: number;
  data: Omit<AclState, "snapshots" | "audit" | "requests">;
};

export type AclState = {
  roles: AclRole[];
  modules: AclModule[];
  departments: AclDepartment[];
  users: AclUser[];
  matrix: PermMatrix;
  audit: AuditEntry[];
  requests: AccessRequest[];
  sodRules: SoDRule[];
  sessions: Session[];
  snapshots: Snapshot[];
  settings: AclSettings;
};

const KEY = "acl_state_v2";
const now = () => Date.now();
const uid = (p: string) => p + "_" + Math.random().toString(36).slice(2, 9);

const seed: AclState = {
  roles: [
    { id: "r_master", name: "Master Admin", description: "Platform owner, wildcard access", isSystem: true, color: "amber", priority: 100, require2FA: true, riskLevel: "critical", compliance: ["SOC2", "GDPR"], createdAt: now() },
    { id: "r_admin", name: "Hotel Admin", description: "Property owner / tenant admin", isSystem: true, color: "violet", priority: 90, require2FA: true, riskLevel: "high", createdAt: now() },
    { id: "r_mgr", name: "General Manager", description: "Full hotel ops, inherits Admin", color: "indigo", priority: 80, parentId: "r_admin", riskLevel: "high", createdAt: now() },
    { id: "r_fd", name: "Front Desk", description: "Reception & reservations", color: "sky", priority: 50, createdAt: now() },
    { id: "r_hk", name: "Housekeeping", description: "Cleaning & room status", color: "emerald", priority: 40, createdAt: now() },
    { id: "r_acc", name: "Accountant", description: "Finance, folios, invoices", color: "rose", priority: 60, riskLevel: "high", compliance: ["SOC2", "PCI"], createdAt: now() },
    { id: "r_aud", name: "Auditor", description: "Read-only across modules", color: "slate", priority: 30, createdAt: now() },
  ],
  modules: [
    { id: "m_dash", key: "dashboard", label: "Dashboard", route: "/app/dashboard", group: "Overview", status: "active", riskLevel: "low" },
    { id: "m_cal", key: "calendar", label: "Booking Calendar", route: "/app/calendar", group: "Reservations", status: "active", riskLevel: "medium", pii: true },
    { id: "m_kanban", key: "kanban", label: "Booking Kanban", route: "/app/kanban", group: "Reservations", status: "active" },
    { id: "m_arr", key: "arrivals", label: "Arrivals Today", route: "/app/arrivals", group: "Front Desk", status: "active", pii: true },
    { id: "m_dep", key: "departures", label: "Departures Today", route: "/app/departures", group: "Front Desk", status: "active" },
    { id: "m_ci", key: "check-in", label: "Check-in", route: "/app/check-in", group: "Front Desk", status: "active", pii: true, riskLevel: "medium", customActions: ["walk-in", "id-scan"] },
    { id: "m_co", key: "check-out", label: "Checkout", route: "/app/check-out", group: "Front Desk", status: "active", riskLevel: "medium" },
    { id: "m_hk", key: "housekeeping", label: "Housekeeping", route: "/app/housekeeping", group: "Operations", status: "active" },
    { id: "m_mt", key: "maintenance", label: "Maintenance", route: "/app/maintenance", group: "Operations", status: "active" },
    { id: "m_inv", key: "invoices", label: "Invoices", route: "/app/invoices", group: "Finance", status: "active", riskLevel: "high", pii: true },
    { id: "m_pay", key: "payments", label: "Payments", route: "/app/payments", group: "Finance", status: "active", riskLevel: "critical", pii: true, customActions: ["refund", "void"] },
    { id: "m_rep", key: "report-revenue", label: "Revenue Report", route: "/app/report-revenue", group: "Reporting", status: "active", riskLevel: "high" },
    { id: "m_audit", key: "audit-log", label: "Audit Log", route: "/app/audit", group: "Compliance", status: "active", riskLevel: "high" },
    { id: "m_acl", key: "acl", label: "Access Control", route: "/app/access-control", group: "Administration", status: "active", riskLevel: "critical" },
  ],
  departments: [
    { id: "d_fd", name: "Front Office" },
    { id: "d_hk", name: "Housekeeping" },
    { id: "d_fin", name: "Finance" },
    { id: "d_mgmt", name: "Management" },
  ],
  users: [
    { id: "u_1", name: "Master Owner", email: "owner@platform.io", roleIds: ["r_master"], active: true, twoFAEnabled: true, departmentId: "d_mgmt", lastLoginAt: now() - 3600000, createdAt: now() },
    { id: "u_2", name: "Asha Patel", email: "asha@hotel.io", roleIds: ["r_admin"], active: true, twoFAEnabled: true, departmentId: "d_mgmt", lastLoginAt: now() - 86400000, createdAt: now() },
    { id: "u_3", name: "Rahul Verma", email: "rahul@hotel.io", roleIds: ["r_fd"], active: true, departmentId: "d_fd", lastLoginAt: now() - 7200000, createdAt: now() },
    { id: "u_4", name: "Sita Kumari", email: "sita@hotel.io", roleIds: ["r_hk"], active: true, departmentId: "d_hk", createdAt: now() },
    { id: "u_5", name: "Neeraj Singh", email: "neeraj@hotel.io", roleIds: ["r_acc"], active: false, locked: true, failedAttempts: 5, departmentId: "d_fin", createdAt: now() },
    { id: "u_6", name: "Priya Shah", email: "priya@hotel.io", roleIds: ["r_mgr"], active: true, twoFAEnabled: true, departmentId: "d_mgmt", createdAt: now() },
  ],
  matrix: {
    r_master: {}, r_admin: {},
    r_fd: {
      m_dash: { view: { allow: true } },
      m_cal: { view: { allow: true }, create: { allow: true }, update: { allow: true } },
      m_kanban: { view: { allow: true }, update: { allow: true } },
      m_arr: { view: { allow: true } }, m_dep: { view: { allow: true } },
      m_ci: { view: { allow: true }, create: { allow: true }, update: { allow: true } },
      m_co: { view: { allow: true }, update: { allow: true } },
    },
    r_hk: { m_hk: { view: { allow: true }, create: { allow: true }, update: { allow: true } }, m_mt: { view: { allow: true }, create: { allow: true } } },
    r_acc: { m_inv: { view: { allow: true }, create: { allow: true }, update: { allow: true }, export: { allow: true } }, m_pay: { view: { allow: true }, export: { allow: true } }, m_rep: { view: { allow: true }, export: { allow: true } } },
    r_aud: Object.fromEntries(["m_dash","m_cal","m_inv","m_pay","m_rep","m_audit"].map(m => [m, { view: { allow: true }, export: { allow: true } }])),
  },
  audit: [],
  requests: [
    { id: "ar_1", userId: "u_3", moduleId: "m_inv", perms: ["view"], reason: "Need to verify guest billing", status: "pending", createdAt: now() - 3600000 },
  ],
  sodRules: [
    { id: "sod_1", name: "No FD + Accountant", description: "Front desk staff cannot also hold accountant role.", conflictRoleIds: ["r_fd", "r_acc"], severity: "high" },
    { id: "sod_2", name: "Master vs Auditor", description: "Auditors must not also be platform masters.", conflictRoleIds: ["r_master", "r_aud"], severity: "critical" },
  ],
  sessions: [
    { id: "s_1", userId: "u_1", device: "Chrome - macOS", ip: "182.74.10.4", createdAt: now() - 3600000, lastSeenAt: now() - 60000, active: true },
    { id: "s_2", userId: "u_3", device: "Edge - Windows", ip: "182.74.10.55", createdAt: now() - 7200000, lastSeenAt: now() - 300000, active: true },
  ],
  snapshots: [],
  settings: {
    enforceSoD: true, enforce2FAForCritical: true,
    defaultSessionMin: 60, passwordMinLength: 10,
    lockoutThreshold: 5, autoRevokeExpired: true,
    requireJustificationForCritical: true, emailOnPermissionChange: false,
  },
};

let state: AclState = load();
const listeners = new Set<() => void>();

function load(): AclState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    return { ...seed, ...parsed, settings: { ...seed.settings, ...(parsed.settings || {}) } };
  } catch { return seed; }
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function emit() { listeners.forEach((l) => l()); }
function mutate(mutator: (s: AclState) => void) {
  const next = JSON.parse(JSON.stringify(state)) as AclState;
  mutator(next); state = next; persist(); emit();
}
function log(category: AuditCategory, action: string, target?: string, meta?: Record<string, any>) {
  mutate((s) => {
    s.audit.unshift({ id: uid("a"), ts: now(), actor: "you", category, action, target, meta });
    s.audit = s.audit.slice(0, 500);
  });
}

function ancestorRoleIds(s: AclState, roleId: string): string[] {
  const out: string[] = [];
  let cur = s.roles.find(r => r.id === roleId);
  const guard = new Set<string>();
  while (cur?.parentId && !guard.has(cur.parentId)) {
    guard.add(cur.parentId);
    out.push(cur.parentId);
    cur = s.roles.find(r => r.id === cur!.parentId);
  }
  return out;
}

export const acl = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },

  addRole: (r: Omit<AclRole, "id">) => { const id = uid("r"); mutate(s => { s.roles.push({ ...r, id, createdAt: now() }); s.matrix[id] = {}; }); log("role", "Created role", r.name); return id; },
  updateRole: (id: string, patch: Partial<AclRole>) => { mutate(s => { const r = s.roles.find(x => x.id === id); if (r) Object.assign(r, patch); }); log("role", "Updated role", id, patch); },
  deleteRole: (id: string) => { mutate(s => { s.roles = s.roles.filter(r => r.id !== id || r.isSystem); delete s.matrix[id]; s.users.forEach(u => { u.roleIds = u.roleIds.filter(x => x !== id); u.grants = (u.grants || []).filter(g => g.roleId !== id); }); }); log("role", "Deleted role", id); },
  cloneRole: (id: string) => { const r = state.roles.find(x => x.id === id); if (!r) return; const nid = uid("r"); mutate(s => { s.roles.push({ ...r, id: nid, name: r.name + " (Copy)", isSystem: false, createdAt: now() }); s.matrix[nid] = JSON.parse(JSON.stringify(s.matrix[id] || {})); }); log("role", "Cloned role", r.name); return nid; },

  addModule: (m: Omit<AclModule, "id">) => { const id = uid("m"); mutate(s => { s.modules.push({ ...m, id, status: m.status || "active" }); }); log("module", "Created module", m.label); return id; },
  updateModule: (id: string, patch: Partial<AclModule>) => { mutate(s => { const m = s.modules.find(x => x.id === id); if (m) Object.assign(m, patch); }); log("module", "Updated module", id, patch); },
  deleteModule: (id: string) => { mutate(s => { s.modules = s.modules.filter(m => m.id !== id); Object.values(s.matrix).forEach(mods => { delete mods[id]; }); }); log("module", "Deleted module", id); },
  toggleStar: (id: string) => { mutate(s => { const m = s.modules.find(x => x.id === id); if (m) m.starred = !m.starred; }); },

  addDepartment: (d: Omit<AclDepartment, "id">) => { const id = uid("d"); mutate(s => { s.departments.push({ ...d, id }); }); log("system", "Created department", d.name); return id; },
  deleteDepartment: (id: string) => { mutate(s => { s.departments = s.departments.filter(d => d.id !== id); }); log("system", "Deleted department", id); },

  addUser: (u: Omit<AclUser, "id">) => { const id = uid("u"); mutate(s => { s.users.push({ ...u, id, createdAt: now() }); }); log("user", "Created user", u.email); return id; },
  updateUser: (id: string, patch: Partial<AclUser>) => { mutate(s => { const u = s.users.find(x => x.id === id); if (u) Object.assign(u, patch); }); log("user", "Updated user", id, patch); },
  deleteUser: (id: string) => { mutate(s => { s.users = s.users.filter(u => u.id !== id); }); log("user", "Deleted user", id); },
  toggleUserRole: (userId: string, roleId: string) => { mutate(s => { const u = s.users.find(x => x.id === userId); if (!u) return; u.roleIds = u.roleIds.includes(roleId) ? u.roleIds.filter(r => r !== roleId) : [...u.roleIds, roleId]; }); log("user", "Toggled role", userId + " <-> " + roleId); },
  lockUser: (id: string, locked: boolean) => { mutate(s => { const u = s.users.find(x => x.id === id); if (u) { u.locked = locked; u.failedAttempts = 0; } }); log("user", locked ? "Locked user" : "Unlocked user", id); },
  forceLogout: (userId: string) => { mutate(s => { s.sessions.forEach(se => { if (se.userId === userId) se.active = false; }); }); log("session", "Force logout", userId); },
  resetUser2FA: (userId: string) => { mutate(s => { const u = s.users.find(x => x.id === userId); if (u) u.twoFAEnabled = false; }); log("user", "Reset 2FA", userId); },
  bulkAssignRole: (userIds: string[], roleId: string) => { mutate(s => { userIds.forEach(uId => { const u = s.users.find(x => x.id === uId); if (u && !u.roleIds.includes(roleId)) u.roleIds.push(roleId); }); }); log("user", "Bulk role assign", roleId, { users: userIds.length }); },
  bulkDeleteUsers: (userIds: string[]) => { mutate(s => { s.users = s.users.filter(u => !userIds.includes(u.id)); }); log("user", "Bulk delete users", String(userIds.length)); },

  addGrant: (userId: string, grant: UserRoleGrant) => { mutate(s => { const u = s.users.find(x => x.id === userId); if (!u) return; u.grants = u.grants || []; u.grants.push({ ...grant, grantedAt: now(), grantedBy: "you" }); if (!u.roleIds.includes(grant.roleId)) u.roleIds.push(grant.roleId); }); log("permission", "Added grant", userId + "/" + grant.roleId); },
  revokeGrant: (userId: string, index: number) => { mutate(s => { const u = s.users.find(x => x.id === userId); if (!u?.grants) return; const g = u.grants.splice(index, 1)[0]; if (g && !u.grants.some(x => x.roleId === g.roleId)) u.roleIds = u.roleIds.filter(r => r !== g.roleId); }); log("permission", "Revoked grant", userId); },

  setPerm: (roleId: string, moduleId: string, perm: string, allow: boolean) => { mutate(s => { s.matrix[roleId] = s.matrix[roleId] || {}; s.matrix[roleId][moduleId] = s.matrix[roleId][moduleId] || {}; s.matrix[roleId][moduleId][perm] = { allow }; }); },
  setDeny: (roleId: string, moduleId: string, perm: string, deny: boolean) => { mutate(s => { s.matrix[roleId] = s.matrix[roleId] || {}; s.matrix[roleId][moduleId] = s.matrix[roleId][moduleId] || {}; s.matrix[roleId][moduleId][perm] = { ...(s.matrix[roleId][moduleId][perm] || {}), deny }; }); log("permission", deny ? "Set deny" : "Clear deny", roleId + "/" + moduleId + "/" + perm); },
  setAllForRoleModule: (roleId: string, moduleId: string, allow: boolean) => { mutate(s => { s.matrix[roleId] = s.matrix[roleId] || {}; s.matrix[roleId][moduleId] = Object.fromEntries(ALL_PERMS.map(p => [p, { allow }])); }); log("permission", allow ? "Grant all" : "Revoke all", roleId + "/" + moduleId); },
  setAllModulesForRole: (roleId: string, allow: boolean) => { mutate(s => { s.matrix[roleId] = {}; if (allow) s.modules.forEach(m => { s.matrix[roleId][m.id] = Object.fromEntries(ALL_PERMS.map(p => [p, { allow: true }])); }); }); log("permission", allow ? "Granted all modules" : "Cleared all modules", roleId); },
  copyRolePerms: (fromId: string, toId: string) => { mutate(s => { s.matrix[toId] = JSON.parse(JSON.stringify(s.matrix[fromId] || {})); }); log("permission", "Copied permissions", fromId + " -> " + toId); },

  requestAccess: (req: Omit<AccessRequest, "id" | "status" | "createdAt">) => { const id = uid("ar"); mutate(s => { s.requests.unshift({ ...req, id, status: "pending", createdAt: now() }); }); log("approval", "Access requested", id); return id; },
  decideRequest: (id: string, approved: boolean) => { mutate(s => { const r = s.requests.find(x => x.id === id); if (!r) return; r.status = approved ? "approved" : "rejected"; r.decidedAt = now(); r.decidedBy = "you"; if (approved) { const user = s.users.find(u => u.id === r.userId); const roleId = user?.roleIds[0]; if (roleId) { s.matrix[roleId] = s.matrix[roleId] || {}; s.matrix[roleId][r.moduleId] = s.matrix[roleId][r.moduleId] || {}; r.perms.forEach(p => { s.matrix[roleId][r.moduleId][p] = { allow: true }; }); } } }); log("approval", approved ? "Approved request" : "Rejected request", id); },

  addSoD: (r: Omit<SoDRule, "id">) => { const id = uid("sod"); mutate(s => { s.sodRules.push({ ...r, id }); }); log("system", "Added SoD rule", r.name); return id; },
  deleteSoD: (id: string) => { mutate(s => { s.sodRules = s.sodRules.filter(r => r.id !== id); }); log("system", "Deleted SoD rule", id); },

  createApiKey: (userId: string, k: Omit<ApiKey, "id" | "createdAt" | "prefix">) => { const id = uid("k"); const prefix = "pk_" + Math.random().toString(36).slice(2, 10); mutate(s => { const u = s.users.find(x => x.id === userId); if (!u) return; u.apiKeys = u.apiKeys || []; u.apiKeys.push({ ...k, id, prefix, createdAt: now() }); }); log("key", "Created API key", userId + "/" + k.label); return prefix; },
  revokeApiKey: (userId: string, keyId: string) => { mutate(s => { const u = s.users.find(x => x.id === userId); const k = u?.apiKeys?.find(x => x.id === keyId); if (k) k.revoked = true; }); log("key", "Revoked API key", keyId); },

  killSession: (id: string) => { mutate(s => { const se = s.sessions.find(x => x.id === id); if (se) se.active = false; }); log("session", "Killed session", id); },

  saveSnapshot: (label: string) => { const id = uid("snap"); mutate(s => { const { audit, requests, snapshots, ...rest } = s; s.snapshots.unshift({ id, label, ts: now(), data: JSON.parse(JSON.stringify(rest)) }); s.snapshots = s.snapshots.slice(0, 20); }); log("system", "Saved snapshot", label); return id; },
  restoreSnapshot: (id: string) => { const snap = state.snapshots.find(s => s.id === id); if (!snap) return; mutate(s => { Object.assign(s, snap.data); }); log("system", "Restored snapshot", id); },
  deleteSnapshot: (id: string) => { mutate(s => { s.snapshots = s.snapshots.filter(x => x.id !== id); }); log("system", "Deleted snapshot", id); },

  updateSettings: (patch: Partial<AclSettings>) => { mutate(s => { s.settings = { ...s.settings, ...patch }; }); log("system", "Updated settings", undefined, patch); },

  exportJson: () => JSON.stringify(state, null, 2),
  importJson: (json: string) => { try { const parsed = JSON.parse(json); mutate(s => Object.assign(s, parsed)); log("system", "Imported ACL"); return true; } catch { return false; } },

  clearAudit: () => { mutate(s => { s.audit = []; }); },
  resetAll: () => { state = JSON.parse(JSON.stringify(seed)); persist(); emit(); log("system", "Reset ACL to defaults"); },
};

export function useAcl(): AclState {
  return useSyncExternalStore(acl.subscribe, acl.get, acl.get);
}

export function userHasPerm(s: AclState, userId: string, moduleKey: string, perm: string): boolean {
  const u = s.users.find(x => x.id === userId);
  if (!u || !u.active || u.locked) return false;
  const mod = s.modules.find(m => m.key === moduleKey);
  if (!mod || mod.status === "disabled") return false;

  const activeRoleIds = new Set<string>();
  for (const rid of u.roleIds) {
    const grant = u.grants?.find(g => g.roleId === rid);
    if (grant) {
      if (grant.validFrom && now() < grant.validFrom) continue;
      if (grant.validTo && now() > grant.validTo) continue;
    }
    activeRoleIds.add(rid);
    ancestorRoleIds(s, rid).forEach(a => activeRoleIds.add(a));
  }

  let allow = false; let deny = false;
  for (const rid of activeRoleIds) {
    const role = s.roles.find(r => r.id === rid);
    if (!role) continue;
    if (role.isSystem) allow = true;
    const cell = s.matrix[rid]?.[mod.id]?.[perm];
    if (cell?.allow) allow = true;
    if (cell?.deny) deny = true;
  }
  return allow && !deny;
}

export function getSoDConflicts(s: AclState, userId: string): SoDRule[] {
  const u = s.users.find(x => x.id === userId);
  if (!u) return [];
  return s.sodRules.filter(rule => rule.conflictRoleIds.every(rid => u.roleIds.includes(rid)));
}

export function effectiveRoleIds(s: AclState, userId: string): string[] {
  const u = s.users.find(x => x.id === userId);
  if (!u) return [];
  const set = new Set<string>();
  u.roleIds.forEach(rid => { set.add(rid); ancestorRoleIds(s, rid).forEach(a => set.add(a)); });
  return Array.from(set);
}

export function permissionStats(s: AclState) {
  const totalRules = Object.values(s.matrix).reduce((acc, mods) => acc + Object.values(mods).reduce((a, p) => a + Object.values(p || {}).filter((c: any) => c?.allow).length, 0), 0);
  const denyRules = Object.values(s.matrix).reduce((acc, mods) => acc + Object.values(mods).reduce((a, p) => a + Object.values(p || {}).filter((c: any) => c?.deny).length, 0), 0);
  const criticalModules = s.modules.filter(m => m.riskLevel === "critical").length;
  const piiModules = s.modules.filter(m => m.pii).length;
  const lockedUsers = s.users.filter(u => u.locked).length;
  const without2FA = s.users.filter(u => !u.twoFAEnabled && u.active).length;
  const expiringGrants = s.users.flatMap(u => u.grants || []).filter(g => g.validTo && g.validTo - now() < 7 * 86400000 && g.validTo > now()).length;
  return { totalRules, denyRules, criticalModules, piiModules, lockedUsers, without2FA, expiringGrants };
}
