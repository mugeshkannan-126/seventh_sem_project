"use client";

import { useState, useEffect } from "react";
import { ComplaintImage } from "@/lib/api";

interface ImageLightboxProps {
  images: ComplaintImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  complaintTitle?: string;
  complaintId?: number;
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  complaintTitle,
  complaintId,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setRotation(0);
  }, [initialIndex, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentIndex, images.length]);

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Grievance-${complaintId ?? "Evidence"}-Img-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(currentImage.image_url, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Official Control Bar */}
      <div
        className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-700/80 text-white shrink-0 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff9933] ring-2 ring-[#ff9933]/30" />
          <div className="truncate">
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              <span>Grievance Photographic Evidence</span>
              {complaintId && (
                <span className="font-mono text-xs bg-slate-800 text-[#ff9933] px-2 py-0.5 rounded border border-slate-700">
                  GRV-#{complaintId}
                </span>
              )}
            </h3>
            {complaintTitle && (
              <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">
                {complaintTitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 mr-2">
              Photo {currentIndex + 1} of {images.length}
            </span>
          )}

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* Zoom Level Indicator / Reset */}
          <button
            onClick={() => setZoom(1)}
            className="text-xs px-2 py-1 rounded hover:bg-slate-800 text-slate-300 font-mono"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Rotate 90° Clockwise"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>

          {/* Download Evidence */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a3663] hover:bg-[#13497e] text-white text-xs font-medium rounded-md transition-colors border border-[#1b528a]"
            title="Download Official Record"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </button>

          {/* Open full in new tab */}
          <a
            href={currentImage.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Open Original Image in New Window"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors ml-2"
            title="Close Lightbox (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 relative flex items-center justify-center p-6 overflow-hidden"
        onClick={onClose}
      >
        {/* Navigation Arrow Left */}
        {images.length > 1 && (
          <button
            disabled={currentIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={`absolute left-6 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-xl ${
              currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Display Image with Pan & Transform */}
        <div
          className="max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.image_url}
            alt={complaintTitle || "Complaint photographic evidence"}
            className="max-h-[78vh] max-w-[85vw] object-contain rounded-md shadow-2xl border border-slate-700/60"
          />
        </div>

        {/* Navigation Arrow Right */}
        {images.length > 1 && (
          <button
            disabled={currentIndex === images.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={`absolute right-6 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white transition-all shadow-xl ${
              currentIndex === images.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip (if multi-image) & Status */}
      <div
        className="px-6 py-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Attachment Status: Verified Citizen Upload</span>
          {currentImage.image_type && (
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              Type: {currentImage.image_type}
            </span>
          )}
        </div>

        {/* Thumbnail selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-2">
            {images.map((img, idx) => (
              <button
                key={img.image_id || idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                  setRotation(0);
                }}
                className={`w-11 h-11 rounded border overflow-hidden transition-all ${
                  currentIndex === idx
                    ? "border-[#ff9933] ring-2 ring-[#ff9933]/50 scale-105"
                    : "border-slate-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.image_url}
                  alt={`thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="text-right text-[11px] text-slate-500">
          Use ← / → keys to navigate • Esc to exit
        </div>
      </div>
    </div>
  );
}
