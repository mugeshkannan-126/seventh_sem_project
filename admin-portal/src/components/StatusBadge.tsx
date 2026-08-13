interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-info-dim text-info",
  Assigned: "bg-violet-dim text-violet",
  "In Progress": "bg-warning-dim text-warning",
  Verified: "bg-accent-dim text-accent",
  Resolved: "bg-success-dim text-success",
  Closed: "bg-surface-3 text-text-dim",
  // Assignment statuses
  Accepted: "bg-accent-dim text-accent",
  Completed: "bg-success-dim text-success",
  // Notification statuses
  Unread: "bg-warning-dim text-warning",
  Read: "bg-surface-3 text-text-dim",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-surface-3 text-text-muted";
  return <span className={`badge ${style}`}>{status}</span>;
}

interface PriorityBadgeProps {
  priority: string | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-success-dim text-success",
  Medium: "bg-warning-dim text-warning",
  High: "bg-danger-dim text-danger",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) return <span className="text-text-dim text-xs">—</span>;
  const style = PRIORITY_STYLES[priority] ?? "bg-surface-3 text-text-muted";
  return <span className={`badge ${style}`}>{priority}</span>;
}

interface RoleBadgeProps {
  role: string;
}

const ROLE_STYLES: Record<string, string> = {
  Admin: "bg-danger-dim text-danger",
  Official: "bg-accent-dim text-accent",
  Engineer: "bg-warning-dim text-warning",
  Citizen: "bg-info-dim text-info",
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_STYLES[role] ?? "bg-surface-3 text-text-muted";
  return <span className={`badge ${style}`}>{role}</span>;
}
