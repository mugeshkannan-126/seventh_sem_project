"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AshokaEmblem, DigitalIndiaLogo, TricolorBar } from "@/components/Emblem";

const PAGE_TITLES: Record<string, string> = {
  "/": "Executive Overview & Grievance Statistics",
  "/complaints": "Public Grievances & Redressal Monitoring",
  "/users": "Authorized Personnel & Citizen Directory",
  "/departments": "Nodal Municipal Departments",
  "/assignments": "Field Work Orders & Inspection Orders",
  "/feedback": "Citizen Redressal Satisfaction Index (GRSI)",
  "/notifications": "Official Directives & Public Bulletins",
};

export default function Header() {
  const pathname = usePathname();
  const currentTitle = PAGE_TITLES[pathname] ?? "Administrative Console";

  const [currentTime, setCurrentTime] = useState("");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: 26 Sep 2026, 21:55:04 IST
      const str =
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        now.toLocaleTimeString("en-IN", { hour12: false }) +
        " IST";
      setCurrentTime(str);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeFontSize = (size: "sm" | "md" | "lg") => {
    setFontSize(size);
    document.body.classList.remove("font-sm", "font-md", "font-lg");
    document.body.classList.add(`font-${size}`);
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white border-b border-slate-300 shadow-sm shrink-0">
      {/* 1. National Tricolor Strip */}
      <TricolorBar />

      {/* 2. Top GIGW Accessibility & Ministry Strip */}
      <div className="bg-[#072847] text-slate-200 px-4 md:px-6 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 border-b border-[#0f3d64] select-none min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-semibold text-amber-300">Government of India</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-200 hidden sm:inline">
            Ministry of Housing and Urban Affairs (MoHUA)
          </span>
        </div>

        {/* Accessibility Tools (Standard Indian Government Requirement) */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-700 pr-3 font-mono text-[10px]">
            <button
              onClick={() => changeFontSize("sm")}
              className={`px-1 rounded hover:bg-slate-800 ${fontSize === "sm" ? "bg-slate-700 text-amber-300" : ""}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize("md")}
              className={`px-1 rounded hover:bg-slate-800 ${fontSize === "md" ? "bg-slate-700 text-amber-300" : ""}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => changeFontSize("lg")}
              className={`px-1 rounded hover:bg-slate-800 ${fontSize === "lg" ? "bg-slate-700 text-amber-300" : ""}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-300 font-mono">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{currentTime || "Loading IST..."}</span>
          </div>

          <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-semibold shrink-0">
            NIC SECURE
          </span>
        </div>
      </div>

      {/* 3. Main Institutional Department Header */}
      <div className="px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-white min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <AshokaEmblem className="w-8 h-10 md:w-9 md:h-11 shrink-0" />
          <div className="border-l-2 border-slate-300 pl-3 min-w-0">
            <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Administration Portal
            </p>
            <h1 className="text-xs sm:text-sm md:text-base font-black text-[#0b3c68] tracking-tight truncate">
              {currentTitle}
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-medium truncate">
              National Public Grievance Redress & Municipal Governance Directorate
            </p>
          </div>
        </div>

        {/* Officer Signature & Badges */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="hidden lg:flex items-center gap-2">
            <DigitalIndiaLogo className="w-8 h-8 opacity-90" />
          </div>

          {/* Officer Profile Card */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 shadow-xs shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#0b3c68] text-amber-300 font-black text-[10px] sm:text-xs flex items-center justify-center border border-[#082e50] shrink-0">
              GOI
            </div>
            <div className="text-right">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight">
                Shri Rajesh Kumar
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#e65100] font-semibold">
                Superintending Administrator (IAS)
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
