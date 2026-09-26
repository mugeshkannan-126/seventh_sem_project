"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div
        className={`${width} w-full bg-white rounded-lg shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[85vh]`}
      >
        {/* Tricolor Ribbon */}
        <div className="flex h-1 w-full shrink-0">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white border-y border-slate-200" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Official Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0b3c68] text-white shrink-0">
          <h2 className="text-sm font-bold tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#072847] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto bg-[#f8fafc] text-slate-800 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
