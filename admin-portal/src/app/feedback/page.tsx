"use client";

import { useEffect, useState } from "react";
import { feedbackApi, complaintsApi, Feedback, Complaint } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";
import GrievanceDetailModal from "@/components/GrievanceDetailModal";

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#e65100" : "none"}
          stroke={star <= rating ? "#e65100" : "#cbd5e1"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs font-mono font-bold text-slate-800 ml-1.5">{rating}/5</span>
    </div>
  );
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Inspect related grievance
  const [inspectedComplaint, setInspectedComplaint] = useState<Complaint | null>(null);
  const [dossierOpen, setDossierOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [f, c] = await Promise.all([
        feedbackApi.list(),
        complaintsApi.list().catch(() => []),
      ]);
      setFeedbacks(f);
      setComplaints(c);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch citizen feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getComplaint = (id: number) => {
    return complaints.find((c) => c.complaint_id === id);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await feedbackApi.delete(deleteTarget.feedback_id);
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const rated = feedbacks.filter((f) => f.rating !== null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((acc, f) => acc + (f.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";

  const satisfiedCount = rated.filter((f) => (f.rating ?? 0) >= 4).length;
  const satisfactionRate =
    rated.length > 0 ? ((satisfiedCount / rated.length) * 100).toFixed(0) : "—";

  const filtered = feedbacks.filter((f) => {
    if (ratingFilter && String(f.rating) !== ratingFilter) return false;
    return true;
  });

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error)
    return (
      <div className="gov-card p-8 text-center space-y-3 bg-white">
        <p className="text-rose-700 font-bold text-sm">Failed to load citizen feedback</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <button className="btn btn-primary text-xs mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-card border-t-4 border-t-[#0b3c68] p-4 bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responses Received</p>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total Responses Recorded</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{feedbacks.length}</p>
        </div>

        <div className="gov-card border-t-4 border-t-[#e65100] p-4 bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Satisfaction Index</p>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Average Redressal Rating (GRSI)</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{avgRating}</span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
        </div>

        <div className="gov-card border-t-4 border-t-[#138808] p-4 bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Metric</p>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Citizen Approval Rate (4★+)</p>
          <p className="text-2xl font-black text-[#138808] mt-1 font-mono">
            {satisfactionRate !== "—" ? `${satisfactionRate}%` : "—"}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="input w-auto sm:!w-44 text-xs font-semibold"
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Poor)</option>
            <option value="1">1 Star (Dissatisfied)</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filtered.length} of {feedbacks.length} Feedback Records
        </span>
      </div>

      {/* Feedback Table */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-20">FID</th>
                <th>Target Grievance Docket</th>
                <th className="w-28">Citizen UID</th>
                <th className="w-36">GRSI Rating</th>
                <th>Citizen Feedback Comments</th>
                <th className="w-28">Submitted Date</th>
                <th className="w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const c = getComplaint(f.complaint_id);
                return (
                  <tr key={f.feedback_id} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-[#0b3c68]">
                      #{f.feedback_id}
                    </td>

                    <td>
                      {c ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setInspectedComplaint(c);
                              setDossierOpen(true);
                            }}
                            className="font-bold text-xs text-slate-900 hover:text-[#0b3c68] underline truncate max-w-xs block text-left"
                            title="Inspect Grievance & Evidence"
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
                        <span className="font-mono text-xs text-slate-500">
                          Complaint #{f.complaint_id}
                        </span>
                      )}
                    </td>

                    <td className="font-mono text-xs text-slate-700">
                      Citizen #{f.citizen_id}
                    </td>

                    <td>
                      <StarRating rating={f.rating} />
                    </td>

                    <td className="text-xs text-slate-700 max-w-sm">
                      {f.comments || <span className="text-slate-400 italic">No verbal remark provided</span>}
                    </td>

                    <td className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {f.submitted_at
                        ? new Date(f.submitted_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => setDeleteTarget(f)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete Feedback Record"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-10 text-xs">
                    No citizen feedback records match specified filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Grievance Dossier Modal */}
      <GrievanceDetailModal
        complaint={inspectedComplaint}
        open={dossierOpen}
        onClose={() => setDossierOpen(false)}
        departments={[]}
        users={[]}
        onUpdated={fetchData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Citizen Feedback Record"
        message={`Are you sure you want to delete feedback entry #${deleteTarget?.feedback_id}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
