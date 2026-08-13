"use client";

import { useEffect, useState } from "react";
import { statsApi, DashboardStats } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    statsApi
      .dashboard()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="glass p-8 text-center">
        <p className="text-danger mb-2">Failed to load dashboard</p>
        <p className="text-text-dim text-sm">{error}</p>
      </div>
    );
  if (!stats) return null;

  const statusData = stats.by_status;
  const priorityData = stats.by_priority;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
        <StatsCard
          title="Total Complaints"
          value={stats.total_complaints}
          color="accent"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatsCard
          title="Submitted"
          value={statusData["Submitted"] ?? 0}
          color="info"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatsCard
          title="In Progress"
          value={statusData["In Progress"] ?? 0}
          color="warning"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          }
        />
        <StatsCard
          title="Resolved"
          value={statusData["Resolved"] ?? 0}
          color="success"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatsCard
          title="Total Users"
          value={stats.total_users}
          color="violet"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard
          title="Departments"
          value={stats.total_departments}
          color="danger"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Complaints by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(statusData).map(([status, count]) => {
              const pct =
                stats.total_complaints > 0
                  ? (count / stats.total_complaints) * 100
                  : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={status} />
                    <span className="text-xs text-text-muted">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: getStatusColor(status),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Complaints by Priority
          </h3>
          <div className="space-y-3">
            {Object.entries(priorityData).map(([priority, count]) => {
              const pct =
                stats.total_complaints > 0
                  ? (count / stats.total_complaints) * 100
                  : 0;
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <PriorityBadge priority={priority} />
                    <span className="text-xs text-text-muted">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: getPriorityColor(priority),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Users by Role */}
          <h3 className="text-sm font-semibold text-text mt-6 mb-4">
            Users by Role
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className="glass-sm p-3 text-center">
                <p className="text-xl font-bold text-text">{count}</p>
                <p className="text-xs text-text-muted mt-0.5">{role}s</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      {stats.by_department.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Complaints by Department
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {stats.by_department.map((dept) => (
              <div
                key={dept.name}
                className="glass-sm p-4 text-center hover:border-accent/30 transition-colors"
              >
                <p className="text-2xl font-bold gradient-text">{dept.count}</p>
                <p className="text-xs text-text-muted mt-1 truncate" title={dept.name}>
                  {dept.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="glass overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">
            Recent Complaints
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_complaints.map((c) => (
                <tr key={c.complaint_id}>
                  <td className="text-text-muted">#{c.complaint_id}</td>
                  <td className="font-medium max-w-xs truncate">{c.title}</td>
                  <td>
                    <StatusBadge status={c.status ?? "Unknown"} />
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="text-text-muted">{c.category ?? "—"}</td>
                  <td className="text-text-dim text-xs">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {stats.recent_complaints.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-text-dim py-8">
                    No complaints yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Submitted: "#06b6d4",
    Assigned: "#a78bfa",
    "In Progress": "#f59e0b",
    Verified: "#6366f1",
    Resolved: "#22c55e",
    Closed: "#5e6380",
  };
  return map[status] ?? "#5e6380";
}

function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#ef4444",
  };
  return map[priority] ?? "#5e6380";
}
