export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass overflow-hidden">
      <div className="p-4">
        {/* Header skeleton */}
        <div className="flex gap-4 mb-6">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="skeleton h-4 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 mb-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="skeleton h-3 w-20 mb-2" />
          <div className="skeleton h-7 w-16 mb-1" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-6">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="skeleton h-48 w-full" />
        </div>
        <div className="glass p-6">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
