"use client";

import { useEffect, useState } from "react";
import { feedbackApi, Feedback } from "@/lib/api";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TableSkeleton } from "@/components/Skeleton";

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-text-dim text-xs">No rating</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={star <= rating ? "text-warning" : "text-text-dim"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-text-muted ml-1">{rating}/5</span>
    </div>
  );
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const f = await feedbackApi.list();
      setFeedbacks(f);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  // Calculate average rating
  const rated = feedbacks.filter((f) => f.rating !== null);
  const avgRating = rated.length > 0
    ? (rated.reduce((acc, f) => acc + (f.rating ?? 0), 0) / rated.length).toFixed(1)
    : "—";

  if (loading) return <TableSkeleton rows={6} cols={5} />;
  if (error)
    return (
      <div className="glass p-8 text-center space-y-3">
        <p className="text-danger font-medium">Failed to load feedback</p>
        <p className="text-text-dim text-sm max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-sm mt-2" onClick={fetchData}>
          Retry Connection
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div className="glass p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Total Feedback</p>
          <p className="text-2xl font-bold text-text">{feedbacks.length}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-warning">{avgRating}</p>
            {avgRating !== "—" && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
          </div>
        </div>
        <div className="glass p-5">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">With Comments</p>
          <p className="text-2xl font-bold text-text">
            {feedbacks.filter((f) => f.comments).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Complaint</th>
                <th>Citizen</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((f) => (
                <tr key={f.feedback_id}>
                  <td className="text-text-muted font-mono">#{f.feedback_id}</td>
                  <td className="text-text-muted">Complaint #{f.complaint_id}</td>
                  <td className="text-text-muted">User #{f.citizen_id}</td>
                  <td><StarRating rating={f.rating} /></td>
                  <td className="max-w-xs">
                    <p className="text-sm text-text-muted truncate">{f.comments ?? "—"}</p>
                  </td>
                  <td className="text-text-dim text-xs whitespace-nowrap">
                    {f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button className="btn btn-ghost !p-1.5 hover:!text-danger" title="Delete" onClick={() => setDeleteTarget(f)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-text-dim py-12">No feedback yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Feedback"
        message={`Delete feedback #${deleteTarget?.feedback_id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
