import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "accent" | "success" | "warning" | "danger" | "info" | "violet";
}

const COLOR_MAP = {
  accent: { bg: "bg-accent-dim", text: "text-accent" },
  success: { bg: "bg-success-dim", text: "text-success" },
  warning: { bg: "bg-warning-dim", text: "text-warning" },
  danger: { bg: "bg-danger-dim", text: "text-danger" },
  info: { bg: "bg-info-dim", text: "text-info" },
  violet: { bg: "bg-violet-dim", text: "text-violet" },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "accent",
}: StatsCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className="glass p-5 hover:border-border-light transition-all duration-300 group cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {trend && (
            <p className="text-xs text-text-dim mt-1">{trend}</p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
