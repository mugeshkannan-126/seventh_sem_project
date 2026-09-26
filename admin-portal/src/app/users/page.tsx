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

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !String(u.user_id).includes(q) &&
        !(u.phone ?? "").includes(q)
      ) {
        return false;
      }
    }
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const getDeptName = (id: number | null) => {
    if (!id) return "—";
    return departments.find((d) => d.department_id === id)?.department_name ?? `#${id}`;
  };

  const resetCreateForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormRole("Citizen");
    setFormDept("");
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) {
      alert("Name, Email, and Password are required.");
      return;
    }
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
      const deptVal = editDept ? parseInt(editDept) : null;
      if (deptVal !== editTarget.department_id) payload.department_id = deptVal;

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
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <p className="text-rose-700 font-bold text-sm">Failed to load users directory</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by Name, Email, ID, or Contact Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:!w-80 text-xs"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-auto sm:!w-44 text-xs font-semibold"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}s
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-mono">
            {filtered.length} of {users.length} Accounts
          </span>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="px-3.5 py-2 bg-[#0b3c68] hover:bg-[#072847] text-white text-xs font-bold rounded shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Register Official / User
        </button>
      </div>

      {/* Users Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-20">UID</th>
                <th>Full Name &amp; Contact</th>
                <th className="w-32">Official Role</th>
                <th>Department Assignment</th>
                <th className="w-28">Phone Number</th>
                <th className="w-28">Registered</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50">
                  <td className="font-mono text-xs font-bold text-[#0b3c68]">
                    #{u.user_id}
                  </td>

                  <td>
                    <span className="font-bold text-xs text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                  </td>

                  <td>
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="text-xs text-slate-700 font-medium">
                    {getDeptName(u.department_id)}
                  </td>

                  <td className="text-xs font-mono text-slate-600">
                    {u.phone || "—"}
                  </td>

                  <td className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-[#0b3c68] rounded hover:bg-slate-100"
                        title="Edit Account"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete User"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <td colSpan={7} className="text-center text-slate-500 py-10 text-xs">
                    No users match the search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Register Official / Citizen Account">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. S. Meenakshi Sundaram"
                className="input text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Official Role *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="input text-xs font-semibold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Official Email Address *</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="officer@nic.gov.in"
                className="input text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Department</label>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className="input text-xs"
              >
                <option value="">— Unassigned / General —</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={String(d.department_id)}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Initial Password *</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                className="input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleCreate} disabled={creating}>
              {creating ? "Registering..." : "Create Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Update Account Information">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="input text-xs font-semibold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
            <select
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              className="input text-xs"
            >
              <option value="">— Unassigned —</option>
              {departments.map((d) => (
                <option key={d.department_id} value={String(d.department_id)}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleEdit} disabled={editing}>
              {editing ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Deregister User Account"
        message={`Are you sure you want to remove ${deleteTarget?.name} (${deleteTarget?.email}) from the municipal registry?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
