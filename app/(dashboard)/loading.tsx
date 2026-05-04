export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-36 bg-white/5 rounded-full" />
          <div className="h-9 w-40 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-white/5 rounded" />
              <div className="w-10 h-10 rounded-full bg-white/5" />
            </div>
            <div className="h-8 w-20 bg-white/5 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + Side Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-6">
          <div className="h-5 w-40 bg-white/5 rounded" />
          <div className="h-[300px] bg-white/[0.02] rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
          <div className="h-5 w-36 bg-white/5 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-1.5 w-full bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
