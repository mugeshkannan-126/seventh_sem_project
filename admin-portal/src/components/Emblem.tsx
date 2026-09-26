export function AshokaEmblem({
  className = "w-9 h-11",
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center bg-white rounded-md p-1 shadow-xs border border-slate-200/80 shrink-0 ${className}`}
      title="State Emblem of India"
    >
      <img
        src="/emblem.png"
        alt="State Emblem of India"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function DigitalIndiaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center font-bold tracking-tighter ${className}`}>
      <span className="text-[#e65100] text-[9px] leading-none uppercase font-extrabold">Digital</span>
      <span className="text-[#0a3663] text-[11px] leading-none uppercase font-black">India</span>
    </div>
  );
}

export function TricolorBar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full flex h-1 shrink-0 ${className}`}>
      <div className="flex-1 bg-[#FF9933]" title="Saffron (Kesari)" />
      <div className="flex-1 bg-[#FFFFFF] border-y border-slate-200" title="White (Shwet)" />
      <div className="flex-1 bg-[#138808]" title="Green (Hara)" />
    </div>
  );
}
