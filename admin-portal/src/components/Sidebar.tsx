"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AshokaEmblem } from "@/components/Emblem";

const NAV_SECTIONS = [
  {
    title: "Core Modules",
    items: [
      { href: "/", label: "Dashboard", sub: "Executive Overview", icon: DashboardIcon },
      { href: "/complaints", label: "Public Grievances", sub: "Redressal & Evidence", icon: ComplaintsIcon },
      { href: "/assignments", label: "Work Orders & Field", sub: "Personnel Allocation", icon: AssignmentsIcon },
    ],
  },
  {
    title: "Governance & Directorate",
    items: [
      { href: "/departments", label: "Nodal Departments", sub: "Municipal Wings", icon: DepartmentsIcon },
      { href: "/users", label: "Users & Officials", sub: "Authorized Registry", icon: UsersIcon },
    ],
  },
  {
    title: "Citizen Engagement",
    items: [
      { href: "/feedback", label: "Citizen Ratings (GRSI)", sub: "Redressal Index", icon: FeedbackIcon },
      { href: "/notifications", label: "Official Gazettes", sub: "Directives & Alerts", icon: NotificationsIcon },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("sidebar-collapsed", next);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out select-none bg-[#072847] border-r border-[#0f3d64] text-slate-100 ${
        collapsed ? "w-[72px]" : "w-[270px]"
      }`}
    >
      {/* 1. Official Seal Header */}
      <div className="flex items-center gap-3 px-4 h-[72px] border-b border-[#0f3d64] shrink-0 bg-[#051b30]">
        <AshokaEmblem className="w-8 h-10 shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden leading-tight">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Government of India
            </span>
            <span className="font-extrabold text-sm text-white tracking-tight block">
              CPGRAMS CIVIC
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">
              Admin Governance Cell
            </span>
          </div>
        )}
      </div>

      {/* 2. Navigation Modules */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-[#0b3c68] text-white shadow-inner border-l-4 border-l-[#ff9933]"
                      : "text-slate-300 hover:text-white hover:bg-[#0c3359]"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-amber-400" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && (
                    <div className="truncate flex-1">
                      <span>{item.label}</span>
                      <span className="block text-[9px] text-slate-400 font-normal">
                        {item.sub}
                      </span>
                    </div>
                  )}
                  {isActive && !collapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9933]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 3. Official Regulatory & Helpline Footer */}
      {!collapsed && (
        <div className="p-3 bg-[#051b30] border-t border-[#0f3d64] text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-mono">
            <span>PORTAL VER: 4.2.1-NIC</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <p className="text-[9px] text-slate-400">
            Toll-Free Helpline: <span className="font-bold text-amber-300">1800-11-4000</span>
          </p>
          <p className="text-[9px] text-slate-500">
            GIGW 3.0 Compliant • NIC Hosted
          </p>
        </div>
      )}

      {/* 4. Collapse Toggle */}
      <div className="px-3 py-2 border-t border-[#0f3d64] bg-[#051b30]">
        <button
          onClick={toggleCollapsed}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded text-slate-400 hover:text-white hover:bg-[#0b3c68] transition-all text-xs"
          title="Toggle Navigation Menu Width"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!collapsed && <span className="text-[11px] font-medium">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Icons ─────────────────────────────────────────────────────────

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function ComplaintsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DepartmentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function AssignmentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function FeedbackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function NotificationsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
