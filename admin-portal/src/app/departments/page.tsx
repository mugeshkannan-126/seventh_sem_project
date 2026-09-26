"use client";

import { useEffect, useState } from "react";
import { departmentsApi, complaintsApi, Department, Complaint } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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
      const [d, c] = await Promise.all([
        departmentsApi.list(),
        complaintsApi.list().catch(() => []),
      ]);
      setDepartments(d);
      setComplaints(c);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getComplaintCount = (deptId: number) => {
    return complaints.filter((c) => c.department_id === deptId).length;
  };

  const filtered = departments.filter((d) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        d.department_name.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q) ||
        String(d.department_id).includes(q)
      );
    }
    return true;
  });

  const handleCreate = async () => {
    if (!formName.trim()) {
      alert("Please provide department title.");
      return;
    }
    setCreating(true);
    try {
      await departmentsApi.create({
        department_name: formName,
        description: formDesc || undefined,
      });
      setCreateOpen(false);
      setFormName("");
      setFormDesc("");
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

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error)
    return (
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <p className="text-rose-700 font-bold text-sm">Failed to load departments</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by Department Title or Function..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:!w-80 text-xs"
          />
          <span className="text-xs text-slate-500 font-mono">
            {filtered.length} of {departments.length} Municipal Wings
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
          Add Nodal Department
        </button>
      </div>

      {/* Departments Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-20">Code</th>
                <th>Department Name</th>
                <th>Charter &amp; Responsibilities</th>
                <th className="w-32 text-center">Active Caseload</th>
                <th className="w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const count = getComplaintCount(d.department_id);
                return (
                  <tr key={d.department_id} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-[#0b3c68]">
                      DEPT-#{d.department_id}
                    </td>

                    <td>
                      <span className="font-bold text-xs text-slate-900 block">
                        {d.department_name}
                      </span>
                    </td>

                    <td className="text-xs text-slate-600 max-w-md">
                      {d.description || (
                        <span className="text-slate-400 italic">No formal charter description filed.</span>
                      )}
                    </td>

                    <td className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                          count > 0
                            ? "bg-blue-50 text-[#0b3c68] border-blue-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {count} Grievances
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-slate-500 hover:text-[#0b3c68] rounded hover:bg-slate-100"
                          title="Edit Department"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(d)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete Department"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 py-10 text-xs">
                    No departments found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Register Nodal Municipal Department">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Department Title *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Directorate of Water Supply and Sanitation"
              className="input text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Jurisdiction &amp; Responsibilities</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Brief description of municipal domain, complaint escalation terms, and public services."
              className="input text-xs min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleCreate} disabled={creating}>
              {creating ? "Saving..." : "Add Department"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Department Details">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Department Title *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Jurisdiction &amp; Responsibilities</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="input text-xs min-h-[80px]"
            />
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
        title="Deregister Municipal Department"
        message={`Are you sure you want to remove '${deleteTarget?.department_name}'? Please ensure all active complaints assigned to this department are safely rerouted.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
