"use client";

import { useEffect, useState } from "react";
import { departmentsApi, Department } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await departmentsApi.list();
      setDepartments(d);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = departments.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      return d.department_name.toLowerCase().includes(q) || (d.description ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = async () => {
    setCreating(true);
    try {
      await departmentsApi.create({ department_name: formName, description: formDesc || undefined });
      setCreateOpen(false);
      setFormName(""); setFormDesc("");
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (d: Department) => {
    setEditTarget(d);
    setEditName(d.department_name);
    setEditDesc(d.description ?? "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      const payload: Record<string, unknown> = {};
      if (editName !== editTarget.department_name) payload.department_name = editName;
      if (editDesc !== (editTarget.description ?? "")) payload.description = editDesc || null;
      await departmentsApi.update(editTarget.department_id, payload);
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
      await departmentsApi.delete(deleteTarget.department_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <TableSkeleton rows={5} cols={3} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load departments</p>
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
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !w-64"
          />
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-text-dim">{filtered.length} departments</span>
            <button className="btn btn-primary" onClick={() => { setFormName(""); setFormDesc(""); setCreateOpen(true); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {filtered.map((d) => (
          <div key={d.department_id} className="glass p-5 hover:border-border-light transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-xs text-text-dim font-mono">#{d.department_id}</span>
            </div>
            <h3 className="text-sm font-semibold text-text mb-1">{d.department_name}</h3>
            <p className="text-xs text-text-muted line-clamp-2">{d.description ?? "No description"}</p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <button className="btn btn-ghost text-xs !px-2 !py-1" onClick={() => openEdit(d)}>
                Edit
              </button>
              <button className="btn btn-ghost text-xs !px-2 !py-1 hover:!text-danger" onClick={() => setDeleteTarget(d)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-text-dim py-12">
            No departments found
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Department">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Department Name *</label>
            <input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Water Supply" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Description</label>
            <textarea className="input min-h-[80px] resize-y" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What this department handles..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !formName}>
              {creating ? "Creating..." : "Create Department"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Department #${editTarget?.department_id}`}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Department Name</label>
            <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Description</label>
            <textarea className="input min-h-[80px] resize-y" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
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
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.department_name}"? Users and complaints linked to this department may be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
