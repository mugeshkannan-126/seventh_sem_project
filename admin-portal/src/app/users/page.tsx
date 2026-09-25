"use client";

import { useEffect, useState } from "react";
import { usersApi, departmentsApi, User, Department } from "@/lib/api";
import { RoleBadge } from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

const ROLES = ["Citizen", "Official", "Engineer", "Admin"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Citizen");
  const [formDept, setFormDept] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [u, d] = await Promise.all([usersApi.list(), departmentsApi.list()]);
      setUsers(u);
      setDepartments(d);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !String(u.user_id).includes(q)
      )
        return false;
    }
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const getDeptName = (id: number | null) => {
    if (!id) return "—";
    return departments.find((d) => d.department_id === id)?.department_name ?? `#${id}`;
  };

  const resetCreateForm = () => {
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormPassword("");
    setFormRole("Citizen"); setFormDept("");
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await usersApi.create({
        name: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone || undefined,
        role: formRole,
        department_id: formDept ? parseInt(formDept) : undefined,
      });
      setCreateOpen(false);
      resetCreateForm();
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: User) => {
    setEditTarget(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone ?? "");
    setEditRole(u.role);
    setEditDept(u.department_id ? String(u.department_id) : "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      const payload: Record<string, unknown> = {};
      if (editName !== editTarget.name) payload.name = editName;
      if (editEmail !== editTarget.email) payload.email = editEmail;
      if (editPhone !== (editTarget.phone ?? "")) payload.phone = editPhone || null;
      if (editRole !== editTarget.role) payload.role = editRole;
      if (editDept !== String(editTarget.department_id ?? ""))
        payload.department_id = editDept ? parseInt(editDept) : null;
      await usersApi.update(editTarget.user_id, payload);
      setEditOpen(false);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget.user_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={6} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load users</p>
        <p className="text-text-dim text-sm max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-sm mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input !w-40"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-text-dim">{filtered.length} users</span>
            <button className="btn btn-primary" onClick={() => { resetCreateForm(); setCreateOpen(true); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id}>
                  <td className="text-text-muted font-mono">#{u.user_id}</td>
                  <td className="font-medium">{u.name}</td>
                  <td className="text-text-muted">{u.email}</td>
                  <td className="text-text-muted">{u.phone ?? "—"}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-text-muted text-sm">{getDeptName(u.department_id)}</td>
                  <td className="text-text-dim text-xs whitespace-nowrap">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-ghost !p-1.5" title="Edit" onClick={() => openEdit(u)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-ghost !p-1.5 hover:!text-danger" title="Delete" onClick={() => setDeleteTarget(u)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-text-dim py-12">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New User">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Name *</label>
            <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Email *</label>
            <input className="input" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Password *</label>
            <input className="input" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Phone</label>
            <input className="input" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 ..." />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Role</label>
            <select className="input" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Department</label>
            <select className="input" value={formDept} onChange={(e) => setFormDept(e.target.value)}>
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.department_id} value={String(d.department_id)}>{d.department_name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !formName || !formEmail || !formPassword}>
              {creating ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit User #${editTarget?.user_id}`}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Name</label>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Email</label>
            <input className="input" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Phone</label>
            <input className="input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Role</label>
            <select className="input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Department</label>
            <select className="input" value={editDept} onChange={(e) => setEditDept(e.target.value)}>
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.department_id} value={String(d.department_id)}>{d.department_name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEdit} disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteTarget?.name}"? This will also delete all their complaints and related data.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
