"use client";

import { useEffect, useState } from "react";
import {
  complaintsApi,
  departmentsApi,
  Complaint,
  Department,
} from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

const STATUSES = ["Submitted", "Assigned", "In Progress", "Verified", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Detail modal
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<Complaint | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatePriority, setUpdatePriority] = useState("");
  const [updateDept, setUpdateDept] = useState("");
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [c, d] = await Promise.all([
        complaintsApi.list(),
        departmentsApi.list(),
      ]);
      setComplaints(c);
      setDepartments(d);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = complaints.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !String(c.complaint_id).includes(q)
      )
        return false;
    }
    if (statusFilter && c.status !== statusFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    if (deptFilter && String(c.department_id) !== deptFilter) return false;
    return true;
  });

  const openUpdate = (c: Complaint) => {
    setUpdateTarget(c);
    setUpdateStatus(c.status ?? "");
    setUpdatePriority(c.priority ?? "");
    setUpdateDept(c.department_id ? String(c.department_id) : "");
    setUpdateRemarks("");
    setUpdateOpen(true);
  };

  const handleUpdate = async () => {
    if (!updateTarget) return;
    setUpdating(true);
    try {
      const payload: Record<string, unknown> = {};
      if (updateStatus && updateStatus !== updateTarget.status)
        payload.status = updateStatus;
      if (updatePriority && updatePriority !== updateTarget.priority)
        payload.priority = updatePriority;
      if (updateDept && updateDept !== String(updateTarget.department_id))
        payload.department_id = parseInt(updateDept);
      if (updateRemarks) payload.remarks = updateRemarks;

      await complaintsApi.update(updateTarget.complaint_id, payload);
      setUpdateOpen(false);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await complaintsApi.delete(deleteTarget.complaint_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const getDeptName = (id: number | null) => {
    if (!id) return "—";
    return departments.find((d) => d.department_id === id)?.department_name ?? `Dept #${id}`;
  };

  if (loading) return <TableSkeleton rows={8} cols={7} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load complaints</p>
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
            placeholder="Search by title, description, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input !w-44"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input !w-36"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input !w-48"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={String(d.department_id)}>
                {d.department_name}
              </option>
            ))}
          </select>
          <div className="ml-auto text-xs text-text-dim self-center">
            {filtered.length} of {complaints.length} complaints
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
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Upvotes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.complaint_id}>
                  <td className="text-text-muted font-mono">#{c.complaint_id}</td>
                  <td>
                    <button
                      className="text-left font-medium hover:text-accent transition-colors max-w-xs truncate block"
                      onClick={() => {
                        setSelected(c);
                        setDetailOpen(true);
                      }}
                    >
                      {c.title}
                    </button>
                    <p className="text-xs text-text-dim truncate max-w-xs mt-0.5">
                      {c.description}
                    </p>
                  </td>
                  <td><StatusBadge status={c.status ?? "Unknown"} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td className="text-text-muted text-sm">{getDeptName(c.department_id)}</td>
                  <td className="text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {c.upvotes}
                    </span>
                  </td>
                  <td className="text-text-dim text-xs whitespace-nowrap">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost !p-1.5"
                        title="Edit"
                        onClick={() => openUpdate(c)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-ghost !p-1.5 hover:!text-danger"
                        title="Delete"
                        onClick={() => setDeleteTarget(c)}
                      >
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
                  <td colSpan={8} className="text-center text-text-dim py-12">
                    No complaints found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Complaint #${selected?.complaint_id}`}
        width="max-w-2xl"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-text">{selected.title}</h3>
              <p className="text-sm text-text-muted mt-1">{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Status" value={<StatusBadge status={selected.status ?? "Unknown"} />} />
              <InfoRow label="Priority" value={<PriorityBadge priority={selected.priority} />} />
              <InfoRow label="Category" value={selected.category ?? "—"} />
              <InfoRow label="Department" value={getDeptName(selected.department_id)} />
              <InfoRow label="Citizen ID" value={`#${selected.citizen_id}`} />
              <InfoRow label="Upvotes" value={selected.upvotes} />
              <InfoRow label="Address" value={selected.address ?? "—"} />
              <InfoRow
                label="Created"
                value={selected.created_at ? new Date(selected.created_at).toLocaleString() : "—"}
              />
            </div>

            {/* Images */}
            {selected.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase mb-2">Images</p>
                <div className="flex flex-wrap gap-2">
                  {selected.images.map((img) => (
                    <a
                      key={img.image_id}
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-accent transition-colors"
                    >
                      <img
                        src={img.image_url}
                        alt="complaint"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status History */}
            {selected.status_histories.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase mb-2">
                  Status History
                </p>
                <div className="space-y-2">
                  {selected.status_histories.map((h) => (
                    <div key={h.status_id} className="glass-sm p-3 flex items-center gap-3">
                      <StatusBadge status={h.status} />
                      <span className="text-xs text-text-muted flex-1">
                        {h.remarks ?? "No remarks"}
                      </span>
                      <span className="text-xs text-text-dim">
                        {h.updated_at
                          ? new Date(h.updated_at).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-primary" onClick={() => { setDetailOpen(false); openUpdate(selected); }}>
                Edit Complaint
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title={`Update Complaint #${updateTarget?.complaint_id}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Status</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="input"
            >
              <option value="">— No change —</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Priority</label>
            <select
              value={updatePriority}
              onChange={(e) => setUpdatePriority(e.target.value)}
              className="input"
            >
              <option value="">— No change —</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Department</label>
            <select
              value={updateDept}
              onChange={(e) => setUpdateDept(e.target.value)}
              className="input"
            >
              <option value="">— No change —</option>
              {departments.map((d) => (
                <option key={d.department_id} value={String(d.department_id)}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Remarks</label>
            <textarea
              value={updateRemarks}
              onChange={(e) => setUpdateRemarks(e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Add remarks for this update..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-secondary" onClick={() => setUpdateOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update Complaint"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Complaint"
        message={`Are you sure you want to delete complaint #${deleteTarget?.complaint_id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-dim uppercase tracking-wide">{label}</p>
      <div className="text-sm text-text mt-0.5">{value}</div>
    </div>
  );
}
