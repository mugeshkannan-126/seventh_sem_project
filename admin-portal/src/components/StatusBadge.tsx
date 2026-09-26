interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-amber-50 text-amber-900 border border-amber-300",
  Assigned: "bg-blue-50 text-blue-900 border border-blue-300",
  "In Progress": "bg-orange-50 text-orange-900 border border-orange-300",
  Verified: "bg-indigo-50 text-indigo-900 border border-indigo-300",
  Resolved: "bg-emerald-50 text-emerald-900 border border-emerald-300",
  Closed: "bg-slate-100 text-slate-700 border border-slate-300",
  // Assignment statuses
  Accepted: "bg-blue-50 text-blue-900 border border-blue-300",
  Completed: "bg-emerald-50 text-emerald-900 border border-emerald-300",
  // Notification statuses
  Unread: "bg-amber-100 text-amber-900 border border-amber-300",
  Read: "bg-slate-100 text-slate-600 border border-slate-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span className={`badge ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: string | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-800 border border-emerald-300",
  Medium: "bg-amber-50 text-amber-800 border border-amber-300",
  High: "bg-rose-50 text-rose-800 border border-rose-300 font-bold",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) return <span className="text-slate-400 text-xs">—</span>;
  const style =
    PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span className={`badge ${style}`}>
      {priority === "High" && (
        <span className="text-rose-600 font-black">!</span>
      )}
      {priority}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
}

const ROLE_STYLES: Record<string, string> = {
  Admin: "bg-[#072847] text-amber-300 border border-[#1a4a75]",
  Official: "bg-blue-100 text-blue-900 border border-blue-300",
  Engineer: "bg-amber-100 text-amber-900 border border-amber-300",
  Citizen: "bg-slate-100 text-slate-800 border border-slate-300",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const style =
    ROLE_STYLES[role] ?? "bg-slate-100 text-slate-700 border border-slate-200";
  return <span className={`badge ${style}`}>{role}</span>;
}
