"use client";

import { useEffect, useState } from "react";
import {
  complaintsApi,
  departmentsApi,
  usersApi,
  Complaint,
  Department,
  User,
} from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import GrievanceDetailModal from "@/components/GrievanceDetailModal";
import ImageLightbox from "@/components/ImageLightbox";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

const STATUSES = ["Submitted", "Assigned", "In Progress", "Verified", "Resolved", "Closed"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Triage
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [hasPhotoOnly, setHasPhotoOnly] = useState(false);

  // Grievance Inspection Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Standalone Quick Lightbox (from table thumbnail click)
  const [lightboxImages, setLightboxImages] = useState<Complaint["images"]>([]);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxId, setLightboxId] = useState<number | undefined>();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [c, d, u] = await Promise.all([
        complaintsApi.list(),
        departmentsApi.list(),
        usersApi.list().catch(() => []),
      ]);
      setComplaints(c);
      setDepartments(d);
      setUsers(u);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch grievances from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filtered = complaints.filter((c) => {
    // Quick tabs
    if (activeTab === "submitted" && c.status !== "Submitted") return false;
    if (activeTab === "assigned" && c.status !== "Assigned") return false;
    if (activeTab === "in_progress" && c.status !== "In Progress") return false;
    if (activeTab === "resolved" && c.status !== "Resolved" && c.status !== "Closed") return false;
    if (activeTab === "urgent" && c.priority !== "High") return false;

    // Search query
    if (search) {
      const q = search.toLowerCase();
      const docket = `grv-2026-${String(c.complaint_id).padStart(5, "0")}`;
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !String(c.complaint_id).includes(q) &&
        !docket.includes(q) &&
        !(c.address ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (statusFilter && c.status !== statusFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    if (deptFilter && String(c.department_id) !== deptFilter) return false;
    if (hasPhotoOnly && c.images.length === 0) return false;

    return true;
  });

  const getDeptName = (id: number | null) => {
    if (!id) return "Unassigned / General";
    return departments.find((d) => d.department_id === id)?.department_name ?? `Dept #${id}`;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await complaintsApi.delete(deleteTarget.complaint_id);
      setDeleteTarget(null);
      if (selectedComplaint?.complaint_id === deleteTarget.complaint_id) {
        setDetailOpen(false);
      }
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Export to CSV (Government Official Format)
  const exportToCSV = () => {
    if (filtered.length === 0) {
      alert("No grievances match the current filter to export.");
      return;
    }

    const headers = [
      "Docket ID",
      "System ID",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Department",
      "Citizen ID",
      "Upvotes",
      "Has Images",
      "Address",
      "Latitude",
      "Longitude",
      "Registration Date",
    ];

    const rows = filtered.map((c) => [
      `GRV-2026-${String(c.complaint_id).padStart(5, "0")}`,
      c.complaint_id,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category || "General"}"`,
      c.status || "Submitted",
      c.priority || "Medium",
      `"${getDeptName(c.department_id).replace(/"/g, '""')}"`,
      c.citizen_id,
      c.upvotes,
      c.images.length > 0 ? "YES" : "NO",
      `"${(c.address || "").replace(/"/g, '""')}"`,
      c.latitude || "",
      c.longitude || "",
      c.created_at ? new Date(c.created_at).toISOString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `NIC-Grievance-Register-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Next / Prev Triage navigation
  const currentIndex = selectedComplaint
    ? filtered.findIndex((c) => c.complaint_id === selectedComplaint.complaint_id)
    : -1;
  const hasNext = currentIndex >= 0 && currentIndex < filtered.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelectedComplaint(filtered[currentIndex + 1]);
  };
  const handlePrev = () => {
    if (hasPrev) setSelectedComplaint(filtered[currentIndex - 1]);
  };

  if (loading) return <TableSkeleton rows={8} cols={7} />;
  if (error)
    return (
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-rose-700 font-bold text-sm">Failed to connect to Grievance Database</p>
        <p className="text-slate-500 text-xs max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  // Tab counts
  const countSubmitted = complaints.filter((c) => c.status === "Submitted").length;
  const countAssigned = complaints.filter((c) => c.status === "Assigned").length;
  const countInProgress = complaints.filter((c) => c.status === "In Progress").length;
  const countResolved = complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;
  const countUrgent = complaints.filter((c) => c.priority === "High").length;

  return (
    <div className="space-y-4">
      {/* 1. Official Administrative Triage Strip */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs flex items-center justify-between gap-3 overflow-x-auto select-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2 border-r border-slate-300 mr-1">
            Triage Filter:
          </span>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-[#0b3c68] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>All Grievances</span>
            <span className="bg-slate-200/60 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {complaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "submitted"
                ? "bg-[#e65100] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Pending Review</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {countSubmitted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("assigned")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "assigned"
                ? "bg-[#0284c7] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Assigned</span>
            <span className="bg-sky-100 text-sky-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {countAssigned}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("in_progress")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "in_progress"
                ? "bg-amber-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Under Investigation</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {countInProgress}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "resolved"
                ? "bg-[#138808] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Disposed / Resolved</span>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {countResolved}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("urgent")}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              activeTab === "urgent"
                ? "bg-rose-700 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <span>Urgent / High SLA</span>
            <span className="bg-rose-200 text-rose-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {countUrgent}
            </span>
          </button>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs"
            title="Download CSV for administrative records"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchData}
            className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50"
            title="Refresh Grievance Records"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Detailed Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Docket #, Grievance Subject, Location, or Description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto sm:!w-40 text-xs font-medium"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input w-auto sm:!w-36 text-xs font-medium"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input w-auto sm:!w-48 text-xs font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={String(d.department_id)}>
                {d.department_name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none border border-slate-300 px-3 py-2 rounded bg-slate-50 hover:bg-slate-100 shrink-0">
            <input
              type="checkbox"
              checked={hasPhotoOnly}
              onChange={(e) => setHasPhotoOnly(e.target.checked)}
              className="rounded text-[#0b3c68]"
            />
            <span>Photos Only</span>
          </label>

          <div className="text-xs text-slate-500 font-mono self-center ml-auto">
            Displaying <span className="font-bold text-slate-900">{filtered.length}</span> of {complaints.length} records
          </div>
        </div>
      </div>

      {/* 3. Official Grievances Register Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-28">Docket No</th>
                <th className="w-28 text-center">Photographs</th>
                <th>Grievance Subject & Narration</th>
                <th className="w-28">Status</th>
                <th className="w-24">Priority</th>
                <th>Department</th>
                <th className="w-20 text-center">Upvotes</th>
                <th className="w-28">Filed Date</th>
                <th className="w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const docketNo = `GRV-2026-${String(c.complaint_id).padStart(5, "0")}`;
                const hasImages = c.images && c.images.length > 0;
                const primaryImage = hasImages ? c.images[0] : null;

                return (
                  <tr key={c.complaint_id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Docket Number */}
                    <td>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setDetailOpen(true);
                        }}
                        className="font-mono text-xs font-bold text-[#0b3c68] hover:text-[#e65100] underline text-left block"
                        title="Open Official Grievance Dossier"
                      >
                        {docketNo}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        ID #{c.complaint_id}
                      </span>
                    </td>

                    {/* Photographic Evidence Preview (Key Admin Workflow Requirement) */}
                    <td className="text-center">
                      {hasImages && primaryImage ? (
                        <div className="inline-block relative group">
                          <button
                            onClick={() => {
                              setLightboxImages(c.images);
                              setLightboxTitle(c.title);
                              setLightboxId(c.complaint_id);
                              setLightboxOpen(true);
                            }}
                            className="w-14 h-11 rounded border border-slate-300 overflow-hidden shadow-xs hover:border-[#0b3c68] hover:scale-105 transition-all block relative bg-slate-900"
                            title="Click to Zoom Photographic Evidence"
                          >
                            <img
                              src={primaryImage.image_url}
                              alt="Evidence thumbnail"
                              className="w-full h-full object-cover"
                            />
                            {c.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-slate-950/80 text-white text-[9px] font-bold px-1 rounded-tl">
                                +{c.images.length - 1}
                              </span>
                            )}
                          </button>
                          <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                            {c.images.length} {c.images.length === 1 ? "Photo" : "Photos"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] text-slate-400 border border-slate-200 bg-slate-50">
                          No Photo
                        </span>
                      )}
                    </td>

                    {/* Subject & Description */}
                    <td className="max-w-md">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setDetailOpen(true);
                        }}
                        className="text-left font-bold text-xs text-slate-900 hover:text-[#0b3c68] line-clamp-1 block transition-colors"
                      >
                        {c.title}
                      </button>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                        {c.description}
                      </p>
                      {c.address && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-medium">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="truncate max-w-xs">{c.address}</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>
                      <StatusBadge status={c.status ?? "Submitted"} />
                    </td>

                    {/* Priority Badge */}
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Department */}
                    <td className="text-xs text-slate-700 font-medium">
                      {getDeptName(c.department_id)}
                    </td>

                    {/* Community Upvotes */}
                    <td className="text-center font-mono text-xs font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        {c.upvotes}
                      </span>
                    </td>

                    {/* Registration Date */}
                    <td className="text-[11px] font-mono text-slate-600 whitespace-nowrap">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Action Buttons */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setDetailOpen(true);
                          }}
                          className="px-2 py-1 bg-[#0b3c68] hover:bg-[#072847] text-white text-[11px] font-bold rounded shadow-xs transition-colors"
                          title="Inspect Dossier & Action"
                        >
                          Dossier
                        </button>

                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete Grievance Record"
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
                  <td colSpan={9} className="text-center text-slate-500 py-12">
                    <p className="font-semibold text-xs text-slate-700">No civic grievances match the specified criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing filters or resetting the search keywords.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grievance Inspection & Action Center Modal */}
      <GrievanceDetailModal
        complaint={selectedComplaint}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        departments={departments}
        users={users}
        onUpdated={() => {
          fetchData();
        }}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />

      {/* Standalone Lightbox for table thumbnail clicks */}
      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        complaintTitle={lightboxTitle}
        complaintId={lightboxId}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Grievance Record"
        message={`Are you sure you want to permanently delete grievance docket GRV-2026-${String(deleteTarget?.complaint_id).padStart(5, "0")}? This official record will be purged from the portal.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
