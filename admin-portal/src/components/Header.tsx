"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/complaints": "Complaints",
  "/users": "Users",
  "/departments": "Departments",
  "/assignments": "Assignments",
  "/feedback": "Feedback",
  "/notifications": "Notifications",
};

export default function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Admin Portal";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-text">{title}</h1>
        <p className="text-xs text-text-dim">
          Smart Civic Platform Administration
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 !w-56 !bg-surface-2 text-sm"
          />
        </div>

        {/* Admin avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-text">Admin</div>
            <div className="text-[10px] text-text-dim">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
