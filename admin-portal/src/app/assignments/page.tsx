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
import GrievanceDetailModal from "@/components/GrievanceDetailModal";

const ASSIGNMENT_STATUSES = ["Assigned", "Accepted", "Completed"];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create Work Order
  const [createOpen, setCreateOpen] = useState(false);
  const [formComplaint, setFormComplaint] = useState("");
  const [formOfficial, setFormOfficial] = useState("");
  const [formEngineer, setFormEngineer] = useState("");
  const [formRemarks, setFormRemarks] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit Work Order
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

  // Inspect Grievance Dossier from Work Order
  const [inspectedComplaint, setInspectedComplaint] = useState<Complaint | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

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
      setError(e instanceof Error ? e.message : "Failed to fetch work orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserName = (id: number | null) => {
    if (!id) return "—";
    const u = users.find((u) => u.user_id === id);
    return u ? u.name : `#${id}`;
  };

  const getComplaint = (id: number) => {
    return complaints.find((c) => c.complaint_id === id);
  };

  const handleCreate = async () => {
    if (!formComplaint) {
      alert("Please select a grievance to assign.");
      return;
    }
    setCreating(true);
    try {
      await assignmentsApi.create({
        complaint_id: parseInt(formComplaint),
        official_id: formOfficial ? parseInt(formOfficial) : undefined,
        engineer_id: formEngineer ? parseInt(formEngineer) : undefined,
        remarks: formRemarks || undefined,
      });
      setCreateOpen(false);
      setFormComplaint("");
      setFormOfficial("");
      setFormEngineer("");
      setFormRemarks("");
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (a: Assignment) => {
    setEditTarget(a);
    setEditStatus(a.assignment_status ?? "Assigned");
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
      if (editStatus) payload.assignment_status = editStatus;
      payload.official_id = editOfficial ? parseInt(editOfficial) : null;
      payload.engineer_id = editEngineer ? parseInt(editEngineer) : null;
      payload.remarks = editRemarks || null;

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

  const filtered = assignments.filter((a) => {
    if (statusFilter && a.assignment_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const wo = `wo-2026-${String(a.assignment_id).padStart(4, "0")}`;
      const c = getComplaint(a.complaint_id);
      const cTitle = c?.title.toLowerCase() ?? "";
      const off = getUserName(a.official_id).toLowerCase();
      const eng = getUserName(a.engineer_id).toLowerCase();
      if (
        !wo.includes(q) &&
        !cTitle.includes(q) &&
        !off.includes(q) &&
        !eng.includes(q) &&
        !(a.remarks ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  if (loading) return <TableSkeleton rows={7} cols={6} />;
  if (error)
    return (
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <p className="text-rose-700 font-bold text-sm">Failed to load work orders</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search by Work Order #, Grievance, or Officer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full sm:!w-72 text-xs"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto sm:!w-44 text-xs font-semibold"
          >
            <option value="">All Assignment Stages</option>
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 font-mono">
            {filtered.length} of {assignments.length} Work Orders
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
          Issue Work Order
        </button>
      </div>

      {/* Work Orders Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-28">Work Order</th>
                <th>Target Grievance Docket</th>
                <th>Designated Official</th>
                <th>Field Engineer</th>
                <th className="w-28">Status</th>
                <th>Field Directives &amp; Remarks</th>
                <th className="w-28">Date Issued</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const woNo = `WO-2026-${String(a.assignment_id).padStart(4, "0")}`;
                const c = getComplaint(a.complaint_id);

                return (
                  <tr key={a.assignment_id} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-[#0b3c68]">
                      {woNo}
                    </td>

                    <td>
                      {c ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setInspectedComplaint(c);
                              setDossierOpen(true);
                            }}
                            className="text-left font-bold text-xs text-slate-900 hover:text-[#0b3c68] underline max-w-xs truncate block"
                            title="Inspect Grievance & Attached Photographs"
                          >
                            GRV-#{c.complaint_id}: {c.title}
                          </button>
                          {c.images && c.images.length > 0 && (
                            <span className="text-[10px] font-bold bg-[#e65100] text-white px-1.5 py-0.2 rounded shrink-0">
                              📷 {c.images.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">
                          Grievance #{a.complaint_id}
                        </span>
                      )}
                    </td>

                    <td className="text-xs text-slate-800 font-medium">
                      {getUserName(a.official_id)}
                    </td>

                    <td className="text-xs text-slate-800 font-medium">
                      {getUserName(a.engineer_id)}
                    </td>

                    <td>
                      <StatusBadge status={a.assignment_status ?? "Assigned"} />
                    </td>

                    <td className="text-xs text-slate-600 max-w-xs truncate">
                      {a.remarks || "—"}
                    </td>

                    <td className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {a.assigned_at
                        ? new Date(a.assigned_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 text-slate-500 hover:text-[#0b3c68] rounded hover:bg-slate-100"
                          title="Edit Work Order"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Cancel / Delete Order"
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
                  <td colSpan={8} className="text-center text-slate-500 py-10 text-xs">
                    No field work orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Work Order Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Issue Official Field Work Order">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Target Grievance Docket *</label>
            <select
              value={formComplaint}
              onChange={(e) => setFormComplaint(e.target.value)}
              className="input text-xs"
            >
              <option value="">— Select Pending Grievance —</option>
              {complaints.map((c) => (
                <option key={c.complaint_id} value={String(c.complaint_id)}>
                  GRV-#{c.complaint_id}: {c.title} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Designated Official</label>
              <select
                value={formOfficial}
                onChange={(e) => setFormOfficial(e.target.value)}
                className="input text-xs"
              >
                <option value="">— Select Official —</option>
                {officials.map((o) => (
                  <option key={o.user_id} value={String(o.user_id)}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Field Engineer</label>
              <select
                value={formEngineer}
                onChange={(e) => setFormEngineer(e.target.value)}
                className="input text-xs"
              >
                <option value="">— Select Engineer —</option>
                {engineers.map((en) => (
                  <option key={en.user_id} value={String(en.user_id)}>
                    {en.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Field Directives &amp; Work Scope</label>
            <textarea
              value={formRemarks}
              onChange={(e) => setFormRemarks(e.target.value)}
              placeholder="e.g. Inspect site coordinates, prepare estimate, and remediate road depression."
              className="input text-xs min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setCreateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleCreate} disabled={creating}>
              {creating ? "Issuing..." : "Issue Work Order"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Work Order Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Update Work Order">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Work Order Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="input text-xs font-semibold"
            >
              {ASSIGNMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Designated Official</label>
              <select
                value={editOfficial}
                onChange={(e) => setEditOfficial(e.target.value)}
                className="input text-xs"
              >
                <option value="">— Unassigned —</option>
                {officials.map((o) => (
                  <option key={o.user_id} value={String(o.user_id)}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Field Engineer</label>
              <select
                value={editEngineer}
                onChange={(e) => setEditEngineer(e.target.value)}
                className="input text-xs"
              >
                <option value="">— Unassigned —</option>
                {engineers.map((en) => (
                  <option key={en.user_id} value={String(en.user_id)}>
                    {en.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Status Remarks / Completion Note</label>
            <textarea
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              className="input text-xs min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button className="btn btn-secondary text-xs" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary text-xs" onClick={handleEdit} disabled={editing}>
              {editing ? "Updating..." : "Save Work Order"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Grievance Dossier Modal for Quick Inspection */}
      <GrievanceDetailModal
        complaint={inspectedComplaint}
        open={dossierOpen}
        onClose={() => setDossierOpen(false)}
        departments={[]}
        users={users}
        onUpdated={fetchData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Revoke Work Order"
        message={`Are you sure you want to cancel and remove Work Order #WO-2026-${String(deleteTarget?.assignment_id).padStart(4, "0")}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
