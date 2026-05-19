import { useSyncExternalStore } from "react";

export type Permission = "view" | "create" | "update" | "delete" | "export" | "approve";
export const ALL_PERMS: Permission[] = ["view", "create", "update", "delete", "export", "approve"];

export type AclRole = {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  color?: string;
};

export type AclModule = {
  id: string;
  key: string;       // unique route key e.g. "bookings"
  label: string;
  route: string;     // e.g. "/app/calendar"
  group: string;     // e.g. "Reservations"
  icon?: string;
};

export type AclUser = {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
  active: boolean;
};

// roleId -> moduleId -> perm -> boolean
export type PermMatrix = Record<string, Record<string, Partial<Record<Permission, boolean>>>>;

export type AuditEntry = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  target?: string;
};

export type AclState = {
  roles: AclRole[];
  modules: AclModule[];
  users: AclUser[];
  matrix: PermMatrix;
  audit: AuditEntry[];
};

const KEY = "acl_state_v1";

const seed: AclState = {
  roles: [
    { id: "r_master", name: "Master Admin", description: "Platform owner with full power", isSystem: true, color: "amber" },
    { id: "r_admin", name: "Hotel Admin", description: "Tenant owner / property admin", isSystem: true, color: "violet" },
    { id: "r_fd", name: "Front Desk", description: "Reception and reservations", color: "sky" },
    { id: "r_hk", name: "Housekeeping", description: "Cleaning and room status", color: "emerald" },
    { id: "r_acc", name: "Accountant", description: "Finance, folios, invoices", color: "rose" },
  ],
  modules: [
    { id: "m_dash", key: "dashboard", label: "Front Desk", route: "/app/dashboard", group: "Overview" },
    { id: "m_cal", key: "calendar", label: "Booking Calendar", route: "/app/calendar", group: "Reservations" },
    { id: "m_kanban", key: "kanban", label: "Booking Kanban", route: "/app/kanban", group: "Reservations" },
    { id: "m_arr", key: "arrivals", label: "Arrivals Today", route: "/app/arrivals", group: "Front Desk" },
    { id: "m_dep", key: "departures", label: "Departures Today", route: "/app/departures", group: "Front Desk" },
    { id: "m_ci", key: "check-in", label: "Check-in", route: "/app/check-in", group: "Front Desk" },
    { id: "m_co", key: "check-out", label: "Checkout", route: "/app/check-out", group: "Front Desk" },
    { id: "m_hk", key: "housekeeping", label: "Housekeeping", route: "/app/housekeeping", group: "Operations" },
    { id: "m_mt", key: "maintenance", label: "Maintenance", route: "/app/maintenance", group: "Operations" },
    { id: "m_inv", key: "invoices", label: "Invoices", route: "/app/invoices", group: "Finance" },
    { id: "m_pay", key: "payments", label: "Payments", route: "/app/payments", group: "Finance" },
    { id: "m_rep", key: "report-revenue", label: "Revenue Report", route: "/app/report-revenue", group: "Reporting" },
  ],
  users: [
    { id: "u_1", name: "Master Owner", email: "owner@platform.io", roleIds: ["r_master"], active: true },
    { id: "u_2", name: "Asha Patel", email: "asha@hotel.io", roleIds: ["r_admin"], active: true },
    { id: "u_3", name: "Rahul Verma", email: "rahul@hotel.io", roleIds: ["r_fd"], active: true },
    { id: "u_4", name: "Sita Kumari", email: "sita@hotel.io", roleIds: ["r_hk"], active: true },
    { id: "u_5", name: "Neeraj Singh", email: "neeraj@hotel.io", roleIds: ["r_acc"], active: false },
  ],
  matrix: {
    r_master: {}, // wildcard
    r_admin: {},
    r_fd: {
      m_dash: { view: true }, m_cal: { view: true, create: true, update: true },
      m_kanban: { view: true, update: true }, m_arr: { view: true }, m_dep: { view: true },
      m_ci: { view: true, create: true, update: true }, m_co: { view: true, update: true },
    },
    r_hk: { m_hk: { view: true, create: true, update: true }, m_mt: { view: true, create: true } },
    r_acc: { m_inv: { view: true, create: true, update: true, export: true }, m_pay: { view: true, export: true }, m_rep: { view: true, export: true } },
  },
  audit: [],
};

let state: AclState = load();
const listeners = new Set<() => void>();

function load(): AclState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    return { ...seed, ...parsed };
  } catch { return seed; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { listeners.forEach((l) => l()); }
function update(mutator: (s: AclState) => void) {
  const next = JSON.parse(JSON.stringify(state)) as AclState;
  mutator(next);
  state = next; persist(); emit();
}
function log(action: string, target?: string) {
  update((s) => {
    s.audit.unshift({ id: "a_" + Math.random().toString(36).slice(2, 9), ts: Date.now(), actor: "you", action, target });
    s.audit = s.audit.slice(0, 200);
  });
}

export const acl = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },

  // Roles
  addRole: (r: Omit<AclRole, "id">) => {
    const id = "r_" + Math.random().toString(36).slice(2, 8);
    update((s) => { s.roles.push({ ...r, id }); s.matrix[id] = {}; });
    log("Created role", r.name);
    return id;
  },
  updateRole: (id: string, patch: Partial<AclRole>) => {
    update((s) => { const r = s.roles.find((x) => x.id === id); if (r) Object.assign(r, patch); });
    log("Updated role", id);
  },
  deleteRole: (id: string) => {
    update((s) => {
      s.roles = s.roles.filter((r) => r.id !== id || r.isSystem);
      delete s.matrix[id];
      s.users.forEach((u) => (u.roleIds = u.roleIds.filter((x) => x !== id)));
    });
    log("Deleted role", id);
  },

  // Modules / routes
  addModule: (m: Omit<AclModule, "id">) => {
    const id = "m_" + Math.random().toString(36).slice(2, 8);
    update((s) => { s.modules.push({ ...m, id }); });
    log("Created module", m.label);
    return id;
  },
  updateModule: (id: string, patch: Partial<AclModule>) => {
    update((s) => { const m = s.modules.find((x) => x.id === id); if (m) Object.assign(m, patch); });
    log("Updated module", id);
  },
  deleteModule: (id: string) => {
    update((s) => {
      s.modules = s.modules.filter((m) => m.id !== id);
      Object.values(s.matrix).forEach((mods) => { delete mods[id]; });
    });
    log("Deleted module", id);
  },

  // Users
  addUser: (u: Omit<AclUser, "id">) => {
    const id = "u_" + Math.random().toString(36).slice(2, 8);
    update((s) => { s.users.push({ ...u, id }); });
    log("Created user", u.email);
    return id;
  },
  updateUser: (id: string, patch: Partial<AclUser>) => {
    update((s) => { const u = s.users.find((x) => x.id === id); if (u) Object.assign(u, patch); });
    log("Updated user", id);
  },
  deleteUser: (id: string) => {
    update((s) => { s.users = s.users.filter((u) => u.id !== id); });
    log("Deleted user", id);
  },
  toggleUserRole: (userId: string, roleId: string) => {
    update((s) => {
      const u = s.users.find((x) => x.id === userId); if (!u) return;
      u.roleIds = u.roleIds.includes(roleId) ? u.roleIds.filter((r) => r !== roleId) : [...u.roleIds, roleId];
    });
    log("Assigned role", `${userId} ↔ ${roleId}`);
  },

  // Permissions
  setPerm: (roleId: string, moduleId: string, perm: Permission, value: boolean) => {
    update((s) => {
      s.matrix[roleId] = s.matrix[roleId] || {};
      s.matrix[roleId][moduleId] = s.matrix[roleId][moduleId] || {};
      s.matrix[roleId][moduleId][perm] = value;
    });
  },
  setAllForRoleModule: (roleId: string, moduleId: string, value: boolean) => {
    update((s) => {
      s.matrix[roleId] = s.matrix[roleId] || {};
      s.matrix[roleId][moduleId] = Object.fromEntries(ALL_PERMS.map((p) => [p, value]));
    });
    log(value ? "Grant all perms" : "Revoke all perms", `${roleId}/${moduleId}`);
  },
  setAllModulesForRole: (roleId: string, value: boolean) => {
    update((s) => {
      s.matrix[roleId] = {};
      if (value) s.modules.forEach((m) => { s.matrix[roleId][m.id] = Object.fromEntries(ALL_PERMS.map((p) => [p, true])); });
    });
    log(value ? "Granted all modules" : "Cleared all modules", roleId);
  },

  resetAll: () => { state = seed; persist(); emit(); log("Reset ACL to defaults"); },
};

export function useAcl(): AclState {
  return useSyncExternalStore(acl.subscribe, acl.get, acl.get);
}

export function userHasPerm(state: AclState, userId: string, moduleKey: string, perm: Permission) {
  const u = state.users.find((x) => x.id === userId);
  if (!u || !u.active) return false;
  const mod = state.modules.find((m) => m.key === moduleKey);
  if (!mod) return false;
  for (const rid of u.roleIds) {
    const role = state.roles.find((r) => r.id === rid);
    if (!role) continue;
    if (role.isSystem) return true; // wildcard
    const perms = state.matrix[rid]?.[mod.id];
    if (perms?.[perm]) return true;
  }
  return false;
}