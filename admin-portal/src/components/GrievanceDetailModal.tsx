"use client";

import { useState } from "react";
import {
  Complaint,
  Department,
  User,
  complaintsApi,
  assignmentsApi,
  statusApi,
} from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import ImageLightbox from "@/components/ImageLightbox";
import { AshokaEmblem } from "@/components/Emblem";

interface GrievanceDetailModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
  departments: Department[];
  users: User[];
  onUpdated: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const STATUS_OPTIONS = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Verified",
  "Resolved",
  "Closed",
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

export default function GrievanceDetailModal({
  complaint,
  open,
  onClose,
  departments,
  users,
  onUpdated,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: GrievanceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "action" | "timeline" | "slip">("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Status & Priority state
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [deptId, setDeptId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignment state
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [assignedEngineer, setAssignedEngineer] = useState("");
  const [assignmentRemarks, setAssignmentRemarks] = useState("");
  const [assigning, setAssigning] = useState(false);

  // When complaint changes or modal opens
  const [prevId, setPrevId] = useState<number | null>(null);
  if (complaint && complaint.complaint_id !== prevId) {
    setPrevId(complaint.complaint_id);
    setStatus(complaint.status ?? "Submitted");
    setPriority(complaint.priority ?? "Medium");
    setDeptId(complaint.department_id ? String(complaint.department_id) : "");
    setRemarks("");
  }

  if (!open || !complaint) return null;

  const officials = users.filter((u) => u.role === "Official");
  const engineers = users.filter((u) => u.role === "Engineer");
  const citizen = users.find((u) => u.user_id === complaint.citizen_id);

  const getDeptName = (id: number | null) => {
    if (!id) return "Unassigned / General Municipal Cell";
    return (
      departments.find((d) => d.department_id === id)?.department_name ??
      `Dept #${id}`
    );
  };

  const handleUpdateStatusAndPriority = async () => {
    setUpdatingStatus(true);
    try {
      const payload: Record<string, unknown> = {};
      if (status) payload.status = status;
      if (priority) payload.priority = priority;
      if (deptId) payload.department_id = parseInt(deptId);
      if (remarks) payload.remarks = remarks;

      await complaintsApi.update(complaint.complaint_id, payload);

      // Record in status history if remarks or status changed
      if (remarks || status !== complaint.status) {
        try {
          await statusApi.create({
            complaint_id: complaint.complaint_id,
            status: status || (complaint.status ?? "Updated"),
            remarks: remarks || "Official action status recorded by Admin.",
          });
        } catch (e) {
          console.warn("Status history log:", e);
        }
      }

      alert("Official Action & Status recorded successfully.");
      onUpdated();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to record status update.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignedOfficial && !assignedEngineer) {
      alert("Please select at least an Official or an Engineer to assign.");
      return;
    }
    setAssigning(true);
    try {
      await assignmentsApi.create({
        complaint_id: complaint.complaint_id,
        official_id: assignedOfficial ? parseInt(assignedOfficial) : undefined,
        engineer_id: assignedEngineer ? parseInt(assignedEngineer) : undefined,
        remarks:
          assignmentRemarks ||
          `Assigned for urgent field inspection & remediation.`,
      });

      // Also automatically update complaint status to "Assigned" if currently Submitted
      if (complaint.status === "Submitted") {
        await complaintsApi.update(complaint.complaint_id, {
          status: "Assigned",
          department_id: deptId ? parseInt(deptId) : complaint.department_id,
        });
      }

      alert("Grievance successfully assigned to designated officers.");
      setAssignedOfficial("");
      setAssignedEngineer("");
      setAssignmentRemarks("");
      onUpdated();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to assign grievance.");
    } finally {
      setAssigning(false);
    }
  };

  const docketNumber = `GRV-2026-${String(complaint.complaint_id).padStart(5, "0")}`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-fadeInUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Indian Government Header Stripe */}
          <div className="flex h-1.5 w-full shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white border-y border-slate-200" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          {/* Modal Official Header */}
          <div className="bg-[#0b3c68] text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-[#082e50]">
            <div className="flex items-center gap-3">
              <AshokaEmblem className="w-8 h-10 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#072847] text-amber-300 px-2 py-0.5 rounded border border-[#1b5082]">
                    {docketNumber}
                  </span>
                  <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                    Grievance Docket
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                  {complaint.title}
                </h2>
              </div>
            </div>

            {/* Quick Next/Prev & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#072847] rounded border border-[#1a4a75] p-0.5 mr-2">
                <button
                  disabled={!hasPrev}
                  onClick={onPrev}
                  title="Previous Grievance"
                  className={`p-1.5 rounded text-white ${
                    hasPrev
                      ? "hover:bg-[#123e66] text-white"
                      : "opacity-30 cursor-not-allowed"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <span className="text-[11px] text-blue-300 px-1 font-mono">Triage</span>
                <button
                  disabled={!hasNext}
                  onClick={onNext}
                  title="Next Grievance"
                  className={`p-1.5 rounded text-white ${
                    hasNext
                      ? "hover:bg-[#123e66] text-white"
                      : "opacity-30 cursor-not-allowed"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#072847] transition-colors"
                title="Close Window (Esc)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (NIC Official Docket Style) */}
          <div className="flex items-center px-5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-[#0b3c68] text-[#0b3c68] bg-white"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <span>Grievance Dossier & Evidence</span>
              {complaint.images.length > 0 && (
                <span className="bg-[#e65100] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {complaint.images.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("action")}
              className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "action"
                  ? "border-[#0b3c68] text-[#0b3c68] bg-white"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <span>Official Action & Assignment</span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "timeline"
                  ? "border-[#0b3c68] text-[#0b3c68] bg-white"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <span>Action Taken Report (ATR) History</span>
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
                {complaint.status_histories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("slip")}
              className={`py-2.5 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "slip"
                  ? "border-[#0b3c68] text-[#0b3c68] bg-white"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print Official Docket Slip</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-[#f8fafc]">
            {/* ── TAB 1: OVERVIEW & EVIDENCE ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Visual Evidence Showcase (Crucial Admin Requirement) */}
                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Photographic Evidence & Site Inspection Photos
                      </h3>
                      <span className="text-xs text-slate-500 font-normal">
                        ({complaint.images.length} {complaint.images.length === 1 ? "Photograph" : "Photographs"} attached)
                      </span>
                    </div>

                    {complaint.images.length > 0 && (
                      <button
                        onClick={() => {
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                        className="text-xs font-semibold text-[#0b3c68] hover:text-[#e65100] flex items-center gap-1 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        <span>Open High-Res Lightbox</span>
                      </button>
                    )}
                  </div>

                  {complaint.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {complaint.images.map((img, idx) => (
                        <div
                          key={img.image_id || idx}
                          onClick={() => {
                            setLightboxIndex(idx);
                            setLightboxOpen(true);
                          }}
                          className="group relative bg-slate-900 rounded-lg overflow-hidden border border-slate-300 cursor-pointer shadow hover:shadow-md transition-all hover:border-[#0b3c68]"
                        >
                          <div className="h-44 w-full overflow-hidden flex items-center justify-center bg-slate-950">
                            <img
                              src={img.image_url}
                              alt="Citizen grievance photographic evidence"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold flex items-center gap-1 shadow-lg border border-slate-700">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                              </svg>
                              Click to Zoom & Rotate
                            </span>
                          </div>

                          <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-medium text-slate-800">
                              Evidence Photo #{idx + 1}
                            </span>
                            <span className="font-mono text-slate-500">
                              {img.image_type || "Citizen Upload"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                      <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-xs font-semibold text-slate-600">
                        No Photographic Evidence Attached
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        The complainant submitted this grievance without site photographs.
                      </p>
                    </div>
                  )}
                </div>

                {/* Grievance Summary Dossier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column: Complaint Details */}
                  <div className="md:col-span-2 bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Subject / Grievance Subject Line
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {complaint.title}
                      </h3>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Grievance Narration / Citizen Description
                      </span>
                      <div className="mt-1 p-3.5 bg-slate-50 rounded border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {complaint.description}
                      </div>
                    </div>

                    {/* Location & Map Coordinates */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Incident Location & Site Address
                      </span>
                      <div className="mt-1 p-3 bg-amber-50/50 rounded border border-amber-200/80 flex items-start gap-2.5">
                        <svg className="w-5 h-5 text-[#e65100] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-slate-900">
                            {complaint.address || "Address not explicitly provided"}
                          </p>
                          {(complaint.latitude || complaint.longitude) && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Lat: {complaint.latitude?.toFixed(5)}, Lon: {complaint.longitude?.toFixed(5)}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#0b3c68] hover:text-[#e65100] underline flex items-center gap-1"
                              >
                                View on Map
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Metadata & Complainant Details */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                        Docket Status & Parameters
                      </h4>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Current Redressal Status
                        </span>
                        <div className="mt-1">
                          <StatusBadge status={complaint.status ?? "Submitted"} />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Administrative Priority
                        </span>
                        <div className="mt-1">
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Civic Category
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {complaint.category || "General Civic Complaint"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Nodal Department
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {getDeptName(complaint.department_id)}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Public Upvotes / Community Backing
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                          {complaint.upvotes} Citizens have upvoted
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Date of Registration
                        </span>
                        <p className="text-xs font-mono text-slate-700 mt-0.5">
                          {complaint.created_at
                            ? new Date(complaint.created_at).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Complainant Profile Box */}
                    <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-200">
                        Complainant Identity
                      </h4>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-slate-900">
                          {citizen?.name ?? `Citizen ID #${complaint.citizen_id}`}
                        </p>
                        {citizen?.email && (
                          <p className="text-slate-600 truncate">{citizen.email}</p>
                        )}
                        {citizen?.phone && (
                          <p className="text-slate-600 font-mono">Ph: {citizen.phone}</p>
                        )}
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-[10px] font-semibold mt-1">
                          Verified Citizen Account
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: OFFICIAL ACTION & ASSIGNMENT ── */}
            {activeTab === "action" && (
              <div className="space-y-6">
                {/* 1. Quick Status Update & ATR */}
                <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0b3c68]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Step 1: Update Grievance Status & Department
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Target Grievance Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Administrative Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Forward to Department
                      </label>
                      <select
                        value={deptId}
                        onChange={(e) => setDeptId(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                      >
                        <option value="">— Unassigned / General —</option>
                        {departments.map((d) => (
                          <option key={d.department_id} value={String(d.department_id)}>
                            {d.department_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Action Taken Remarks / Official Order Note
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter official redressal findings, dispatch order, or resolution summary..."
                      className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none min-h-[75px]"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleUpdateStatusAndPriority}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-[#0b3c68] hover:bg-[#082e50] text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      {updatingStatus ? "Saving Status..." : "Record Status & Dispatch Order"}
                    </button>
                  </div>
                </div>

                {/* 2. Direct Field Officer Assignment (Solves Admin Workflow Disconnect) */}
                <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#138808]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Step 2: Assign Grievance to Official or Field Engineer
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Designated Municipal Official
                      </label>
                      <select
                        value={assignedOfficial}
                        onChange={(e) => setAssignedOfficial(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                      >
                        <option value="">— Select Official —</option>
                        {officials.map((o) => (
                          <option key={o.user_id} value={String(o.user_id)}>
                            {o.name} ({o.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Designated Field Engineer / Inspector
                      </label>
                      <select
                        value={assignedEngineer}
                        onChange={(e) => setAssignedEngineer(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                      >
                        <option value="">— Select Engineer —</option>
                        {engineers.map((en) => (
                          <option key={en.user_id} value={String(en.user_id)}>
                            {en.name} ({en.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Field Instructions / Inspection Directives
                    </label>
                    <input
                      type="text"
                      value={assignmentRemarks}
                      onChange={(e) => setAssignmentRemarks(e.target.value)}
                      placeholder="e.g. Conduct on-site verification within 48 hours and submit photographic completion proof."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:border-[#0b3c68] outline-none"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleCreateAssignment}
                      disabled={assigning}
                      className="px-4 py-2 bg-[#138808] hover:bg-[#0f6806] text-white text-xs font-bold rounded shadow transition-colors"
                    >
                      {assigning ? "Issuing Work Order..." : "Issue Work Order & Assign Personnel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: STATUS TIMELINE (ATR) ── */}
            {activeTab === "timeline" && (
              <div className="bg-white p-5 rounded-lg border border-slate-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Chronological Action Taken Report (ATR) Audit Trail
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Total Records: {complaint.status_histories.length}
                  </span>
                </div>

                {complaint.status_histories.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-7">
                    {complaint.status_histories.map((h, i) => (
                      <div key={h.status_id || i} className="relative bg-slate-50 p-3.5 rounded border border-slate-200">
                        {/* Dot indicator */}
                        <div className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-[#0b3c68] border-2 border-white ring-1 ring-slate-300" />

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <StatusBadge status={h.status} />
                          <span className="text-[11px] font-mono text-slate-500">
                            {h.updated_at
                              ? new Date(h.updated_at).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 mt-1 font-medium">
                          {h.remarks || "Status updated without additional remarks."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No prior ATR updates recorded for this grievance yet.
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: OFFICIAL GRIEVANCE SLIP / DOCKET PRINT ── */}
            {activeTab === "slip" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-[#0b3c68] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Docket Slip
                  </button>
                </div>

                <div
                  id="printable-docket"
                  className="bg-white p-8 border-2 border-slate-400 rounded-sm shadow-md text-slate-900 max-w-2xl mx-auto space-y-5"
                >
                  {/* Government Header */}
                  <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                    <AshokaEmblem className="w-12 h-14 mx-auto" />
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-800">
                      Government of India
                    </p>
                    <h2 className="text-sm font-black uppercase text-slate-950">
                      Centralised Public Grievance Redress & Monitoring System
                    </h2>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Directorate of Municipal Civic Governance & Public Redressal
                    </p>
                  </div>

                  {/* Grievance Summary Box */}
                  <div className="border border-slate-400 p-4 space-y-3 bg-slate-50/50 text-xs">
                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-300">
                      <div>
                        <span className="font-bold text-slate-600 block text-[10px]">
                          REGISTRATION DOCKET NO:
                        </span>
                        <span className="font-mono font-bold text-slate-950 text-sm">
                          {docketNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-600 block text-[10px]">
                          DATE & TIME OF RECEIPT:
                        </span>
                        <span className="font-mono text-slate-900">
                          {complaint.created_at
                            ? new Date(complaint.created_at).toLocaleString("en-IN")
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-600 block text-[10px]">
                          COMPLAINANT NAME & ID:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {citizen?.name || `Citizen #${complaint.citizen_id}`}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-600 block text-[10px]">
                          CONCERNED DEPARTMENT:
                        </span>
                        <span className="font-semibold text-slate-900">
                          {getDeptName(complaint.department_id)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 block text-[10px]">
                        GRIEVANCE SUBJECT:
                      </span>
                      <span className="font-bold text-slate-950">
                        {complaint.title}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 block text-[10px]">
                        INCIDENT ADDRESS:
                      </span>
                      <span className="text-slate-800">
                        {complaint.address || "As per geo-coordinates recorded"}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 block text-[10px]">
                        CURRENT STATUS:
                      </span>
                      <span className="font-bold uppercase tracking-wider text-[#0b3c68]">
                        {complaint.status} (Priority: {complaint.priority || "Medium"})
                      </span>
                    </div>
                  </div>

                  {/* Stamp & Sign-off Block */}
                  <div className="pt-6 flex items-end justify-between text-xs text-slate-700">
                    <div className="border border-slate-300 p-3 rounded text-[10px] w-48 text-center bg-slate-50">
                      <span className="font-bold block uppercase">NIC Official Seal</span>
                      <span className="text-slate-500 font-mono">PORTAL VERIFIED</span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-40 border-b border-slate-600 mx-auto" />
                      <p className="text-[11px] font-bold text-slate-900">
                        Superintending Administrator
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Public Grievance Cell
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-500 font-mono text-[11px]">
              Platform Ref: NIC-DL-CIVIC-#{complaint.complaint_id}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for High-Resolution Image Inspection */}
      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={complaint.images}
        initialIndex={lightboxIndex}
        complaintTitle={complaint.title}
        complaintId={complaint.complaint_id}
      />
    </>
  );
}
