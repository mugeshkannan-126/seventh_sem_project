"use client";

import { useEffect, useState } from "react";
import {
  assignmentsApi,
  complaintsApi,
  usersApi,
  Assignment,
  Complaint,
  User,
} from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

const ASSIGNMENT_STATUSES = ["Assigned", "Accepted", "Completed"];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [formComplaint, setFormComplaint] = useState("");
  const [formOfficial, setFormOfficial] = useState("");
  const [formEngineer, setFormEngineer] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editOfficial, setEditOfficial] = useState("");
  const [editEngineer, setEditEngineer] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const officials = users.filter((u) => u.role === "Official");
  const engineers = users.filter((u) => u.role === "Engineer");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, c, u] = await Promise.all([
        assignmentsApi.list(),
        complaintsApi.list(),
        usersApi.list(),
      ]);
      setAssignments(a);
      setComplaints(c);
      setUsers(u);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getUserName = (id: number | null) => {
    if (!id) return "—";
    const u = users.find((u) => u.user_id === id);
    return u ? u.name : `#${id}`;
  };

  const getComplaintTitle = (id: number) => {
    const c = complaints.find((c) => c.complaint_id === id);
    return c ? c.title : `#${id}`;
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await assignmentsApi.create({
        complaint_id: parseInt(formComplaint),
        official_id: formOfficial ? parseInt(formOfficial) : undefined,
        engineer_id: formEngineer ? parseInt(formEngineer) : undefined,
        remarks: formRemarks || undefined,
      });
      setCreateOpen(false);
      setFormComplaint(""); setFormOfficial(""); setFormEngineer(""); setFormRemarks("");
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (a: Assignment) => {
    setEditTarget(a);
    setEditStatus(a.assignment_status ?? "");
    setEditOfficial(a.official_id ? String(a.official_id) : "");
    setEditEngineer(a.engineer_id ? String(a.engineer_id) : "");
    setEditRemarks(a.remarks ?? "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      const payload: Record<string, unknown> = {};
      if (editStatus && editStatus !== editTarget.assignment_status) payload.assignment_status = editStatus;
      if (editOfficial !== String(editTarget.official_id ?? "")) payload.official_id = editOfficial ? parseInt(editOfficial) : null;
      if (editEngineer !== String(editTarget.engineer_id ?? "")) payload.engineer_id = editEngineer ? parseInt(editEngineer) : null;
      if (editRemarks !== (editTarget.remarks ?? "")) payload.remarks = editRemarks;
      await assignmentsApi.update(editTarget.assignment_id, payload);
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
      await assignmentsApi.delete(deleteTarget.assignment_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <TableSkeleton rows={6} cols={6} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load assignments</p>
        <p className="text-text-dim text-sm max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-sm mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass p-4 flex items-center justify-between">
        <span className="text-xs text-text-dim">{assignments.length} assignments</span>
        <button className="btn btn-primary" onClick={() => { setFormComplaint(""); setFormOfficial(""); setFormEngineer(""); setFormRemarks(""); setCreateOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Assignment
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Complaint</th>
                <th>Official</th>
                <th>Engineer</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.assignment_id}>
                  <td className="text-text-muted font-mono">#{a.assignment_id}</td>
                  <td>
                    <span className="text-sm font-medium max-w-xs truncate block" title={getComplaintTitle(a.complaint_id)}>
                      {getComplaintTitle(a.complaint_id)}
                    </span>
                    <span className="text-xs text-text-dim">Complaint #{a.complaint_id}</span>
                  </td>
                  <td className="text-text-muted text-sm">{getUserName(a.official_id)}</td>
                  <td className="text-text-muted text-sm">{getUserName(a.engineer_id)}</td>
                  <td><StatusBadge status={a.assignment_status ?? "Unknown"} /></td>
                  <td className="text-text-dim text-xs whitespace-nowrap">
                    {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="btn btn-ghost !p-1.5" title="Edit" onClick={() => openEdit(a)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-ghost !p-1.5 hover:!text-danger" title="Delete" onClick={() => setDeleteTarget(a)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-text-dim py-12">No assignments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Assignment">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Complaint *</label>
            <select className="input" value={formComplaint} onChange={(e) => setFormComplaint(e.target.value)}>
              <option value="">Select a complaint...</option>
              {complaints.map((c) => (
                <option key={c.complaint_id} value={String(c.complaint_id)}>
                  #{c.complaint_id} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Official</label>
            <select className="input" value={formOfficial} onChange={(e) => setFormOfficial(e.target.value)}>
              <option value="">— None —</option>
              {officials.map((u) => <option key={u.user_id} value={String(u.user_id)}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Engineer</label>
            <select className="input" value={formEngineer} onChange={(e) => setFormEngineer(e.target.value)}>
              <option value="">— None —</option>
              {engineers.map((u) => <option key={u.user_id} value={String(u.user_id)}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Remarks</label>
            <textarea className="input min-h-[80px] resize-y" value={formRemarks} onChange={(e) => setFormRemarks(e.target.value)} placeholder="Optional remarks..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !formComplaint}>
              {creating ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Assignment #${editTarget?.assignment_id}`}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Status</label>
            <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              {ASSIGNMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Official</label>
            <select className="input" value={editOfficial} onChange={(e) => setEditOfficial(e.target.value)}>
              <option value="">— None —</option>
              {officials.map((u) => <option key={u.user_id} value={String(u.user_id)}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Engineer</label>
            <select className="input" value={editEngineer} onChange={(e) => setEditEngineer(e.target.value)}>
              <option value="">— None —</option>
              {engineers.map((u) => <option key={u.user_id} value={String(u.user_id)}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Remarks</label>
            <textarea className="input min-h-[80px] resize-y" value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} />
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
        title="Delete Assignment"
        message={`Are you sure you want to delete assignment #${deleteTarget?.assignment_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
