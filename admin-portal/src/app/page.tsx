"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { statsApi, DashboardStats, Complaint, departmentsApi, usersApi, Department, User } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { DashboardSkeleton } from "@/components/Skeleton";
import GrievanceDetailModal from "@/components/GrievanceDetailModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Quick Grievance Inspection Modal from Dashboard
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      statsApi.dashboard(),
      departmentsApi.list().catch(() => []),
      usersApi.list().catch(() => []),
    ])
      .then(([s, d, u]) => {
        setStats(s);
        setDepartments(d);
        setUsers(u);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="gov-card p-8 text-center bg-white border border-slate-300">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-rose-700 font-bold text-sm mb-1">Failed to load Executive Dashboard</p>
        <p className="text-slate-500 text-xs max-w-md mx-auto">{error}</p>
        <button className="btn btn-primary text-xs mt-3" onClick={fetchDashboardData}>
          Reconnect to National Server
        </button>
      </div>
    );
  if (!stats) return null;

  const statusData = stats.by_status;
  const priorityData = stats.by_priority;
  const highPriorityCount = priorityData["High"] ?? 0;
  const resolvedCount = (statusData["Resolved"] ?? 0) + (statusData["Closed"] ?? 0);
  const resolutionRate =
    stats.total_complaints > 0
      ? ((resolvedCount / stats.total_complaints) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* 1. Official Government Advisory & Executive Notice */}
      <div className="bg-white border-l-4 border-l-[#0b3c68] border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Public Grievance Monitoring &amp; Redressal Cell
          </span>
          <h2 className="text-sm font-black text-slate-900">
            Centralised Public Grievance Redress &amp; Monitoring System
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time status of civic complaints across municipal jurisdictions. Redressal performance index:{" "}
            <span className="font-bold text-[#138808]">{resolutionRate}% Disposed</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/complaints"
            className="px-3.5 py-1.5 bg-[#0b3c68] hover:bg-[#072847] text-white text-xs font-bold rounded shadow-xs transition-colors"
          >
            Review All Grievances ({stats.total_complaints})
          </Link>
          <Link
            href="/assignments"
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded shadow-2xs transition-colors"
          >
            Field Work Orders
          </Link>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatsCard
          title="Total Registered"
          subtitle="Cumulative Grievances"
          value={stats.total_complaints}
          color="accent"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
        />
        <StatsCard
          title="Submitted / New"
          subtitle="Pending Review"
          value={statusData["Submitted"] ?? 0}
          color="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <StatsCard
          title="Under Action"
          subtitle="Field In Progress"
          value={(statusData["In Progress"] ?? 0) + (statusData["Assigned"] ?? 0)}
          color="warning"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          }
        />
        <StatsCard
          title="Disposed / Resolved"
          subtitle="Cases Closed"
          value={resolvedCount}
          color="success"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatsCard
          title="Citizens & Staff"
          subtitle="Total Personnel"
          value={stats.total_users}
          color="violet"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatsCard
          title="Departments"
          subtitle="Municipal Wings"
          value={stats.total_departments}
          color="danger"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
      </div>

      {/* 3. Urgent SLA Escalation Notice (If any High Priority Grievances) */}
      {highPriorityCount > 0 && (
        <div className="bg-rose-50 border-l-4 border-l-rose-700 border border-rose-200 rounded p-4 text-xs flex items-center justify-between text-rose-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-rose-700 text-white font-black flex items-center justify-center shrink-0">
              !
            </span>
            <div>
              <p className="font-bold text-rose-950 text-sm">
                Priority Directive: {highPriorityCount} Urgent Grievance(s) require immediate field attention.
              </p>
              <p className="text-rose-700 mt-0.5">
                Under municipal guidelines, high priority hazards (e.g. hazardous open potholes, electrical lines, water main bursts) require same-day officer deployment.
              </p>
            </div>
          </div>
          <Link
            href="/complaints"
            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded shadow-xs shrink-0"
          >
            Triage Urgent Cases
          </Link>
        </div>
      )}

      {/* 4. Analytics Breakdown: Status & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="gov-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Grievances by Processing Stage
              </h3>
              <p className="text-[11px] text-slate-500">
                Categorized by workflow progress
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold">
              {stats.total_complaints} Total
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(statusData).map(([status, count]) => {
              const pct =
                stats.total_complaints > 0
                  ? (count / stats.total_complaints) * 100
                  : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={status} />
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {count} <span className="font-normal text-slate-400">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: getGovStatusColor(status),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Role Distribution */}
        <div className="gov-card p-5 bg-white space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Administrative Priority Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">
                  Triage severity categorization
                </p>
              </div>
            </div>

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
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {count} <span className="font-normal text-slate-400">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded overflow-hidden border border-slate-200">
                      <div
                        className="h-full rounded transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: getGovPriorityColor(priority),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users by Role */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Authorized Personnel Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-center">
                  <p className="text-lg font-black text-slate-900 font-mono">{count}</p>
                  <p className="text-[10px] text-slate-600 font-semibold uppercase">{role}s</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Department Performance & Complaint Load */}
      {stats.by_department.length > 0 && (
        <div className="gov-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Departmental Caseload Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Caseload per municipal division
              </p>
            </div>
            <Link href="/departments" className="text-xs text-[#0b3c68] font-bold hover:underline">
              Manage Departments →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {stats.by_department.map((dept) => (
              <div
                key={dept.name}
                className="p-3 bg-slate-50 rounded border border-slate-200 text-center hover:border-[#0b3c68] transition-colors"
              >
                <p className="text-xl font-black text-[#0b3c68] font-mono">{dept.count}</p>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={dept.name}>
                  {dept.name}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Grievances</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent Grievances Docket Register */}
      <div className="gov-card overflow-hidden bg-white max-w-full">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Recent Grievances Registered
            </h3>
            <p className="text-[10px] text-slate-500">
              Latest incoming public grievances
            </p>
          </div>
          <Link
            href="/complaints"
            className="text-xs font-bold text-[#0b3c68] hover:text-[#e65100] underline"
          >
            View Complete Grievance Register ({stats.total_complaints}) →
          </Link>
        </div>

        <div className="overflow-x-auto w-full min-w-0">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th className="w-28">Docket ID</th>
                <th>Grievance Subject</th>
                <th className="w-28">Status</th>
                <th className="w-24">Priority</th>
                <th>Category</th>
                <th className="w-28">Filed Date</th>
                <th className="w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_complaints.map((c) => {
                const docketNo = `GRV-2026-${String(c.complaint_id).padStart(5, "0")}`;
                return (
                  <tr key={c.complaint_id} className="hover:bg-slate-50">
                    <td className="font-mono text-xs font-bold text-[#0b3c68]">
                      {docketNo}
                    </td>
                    <td className="font-semibold text-xs text-slate-900 max-w-sm truncate">
                      {c.title}
                    </td>
                    <td>
                      <StatusBadge status={c.status ?? "Submitted"} />
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="text-xs text-slate-600 font-medium">
                      {c.category ?? "General"}
                    </td>
                    <td className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setDetailOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#0b3c68] hover:bg-[#072847] text-white text-[11px] font-bold rounded shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {stats.recent_complaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-8 text-xs">
                    No grievance records present on the server.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grievance Inspection Modal from Dashboard */}
      <GrievanceDetailModal
        complaint={selectedComplaint}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        departments={departments}
        users={users}
        onUpdated={fetchDashboardData}
      />
    </div>
  );
}

function getGovStatusColor(status: string): string {
  const map: Record<string, string> = {
    Submitted: "#0284c7",
    Assigned: "#4f46e5",
    "In Progress": "#e65100",
    Verified: "#0b3c68",
    Resolved: "#138808",
    Closed: "#64748b",
  };
  return map[status] ?? "#64748b";
}

function getGovPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Low: "#138808",
    Medium: "#e65100",
    High: "#dc2626",
  };
  return map[priority] ?? "#64748b";
}
