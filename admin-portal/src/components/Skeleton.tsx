export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="gov-card p-4 overflow-hidden animate-pulse">
      <div className="flex gap-4 mb-4 pb-2 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-5 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="gov-card p-4 animate-pulse border-t-4 border-t-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-7 bg-slate-300 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-24" />
        </div>
        <div className="w-10 h-10 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gov-card p-5 h-64 bg-white" />
        <div className="gov-card p-5 h-64 bg-white" />
      </div>
    </div>
  );
}
