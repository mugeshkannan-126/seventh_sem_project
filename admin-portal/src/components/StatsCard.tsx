import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "accent" | "success" | "warning" | "danger" | "info" | "violet";
}

const COLOR_MAP = {
  accent: { border: "border-t-[#0b3c68]", text: "text-[#0b3c68]", bg: "bg-blue-50" },
  success: { border: "border-t-[#138808]", text: "text-[#138808]", bg: "bg-emerald-50" },
  warning: { border: "border-t-[#e65100]", text: "text-[#e65100]", bg: "bg-amber-50" },
  danger: { border: "border-t-[#dc2626]", text: "text-[#dc2626]", bg: "bg-rose-50" },
  info: { border: "border-t-[#0284c7]", text: "text-[#0284c7]", bg: "bg-sky-50" },
  violet: { border: "border-t-[#4f46e5]", text: "text-[#4f46e5]", bg: "bg-indigo-50" },
};

export default function StatsCard({
  title,
  subtitle,
  value,
  icon,
  trend,
  color = "accent",
}: StatsCardProps) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.accent;

  return (
    <div
      className={`gov-card border-t-4 ${c.border} p-4 hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {subtitle && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {subtitle}
            </p>
          )}
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono tracking-tight">
            {value}
          </p>
          {trend && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {trend}
            </p>
          )}
        </div>

        <div
          className={`w-10 h-10 rounded-md ${c.bg} ${c.text} flex items-center justify-center shrink-0 border border-slate-200`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
