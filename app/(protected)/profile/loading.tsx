// Skeleton loading screen for the profile page.
// Next.js renders this automatically while the page server data is being fetched.

// ─── Shared skeleton pulse block ────────────────────────────────────────────

function Bone({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

// ─── Section skeletons ───────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="mb-10 bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
      {/* Banner */}
      <div className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse" />

      <div className="px-8 pb-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-8 -mt-12 relative z-10">
          {/* Avatar circle */}
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse border-4 border-white dark:border-slate-900 flex-shrink-0" />

          {/* Name + badges */}
          <div className="flex-1 space-y-3 pt-14 md:pt-0">
            <Bone className="h-7 w-48" />
            <div className="flex gap-3">
              <Bone className="h-7 w-32" />
              <Bone className="h-7 w-36" />
            </div>
          </div>

          {/* Edit button */}
          <Bone className="h-12 w-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5"
        >
          {/* Icon box */}
          <Bone className="w-14 h-14 rounded-2xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Bone className="h-3 w-16" />
            <Bone className="h-8 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-8">
        <Bone className="w-5 h-5 rounded-full" />
        <Bone className="h-6 w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 4 field rows */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-14 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Bio block */}
      <div className="mt-8 space-y-2">
        <Bone className="h-3 w-28" />
        <Bone className="h-28 w-full rounded-[24px]" />
      </div>
    </div>
  );
}

function SecuritySkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <Bone className="w-5 h-5 rounded-full" />
        <Bone className="h-6 w-40" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-48" />
            </div>
          </div>
          <Bone className="h-9 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function PlanCardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-[32px] p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Bone className="w-6 h-6 rounded-full bg-slate-700" />
        <Bone className="h-5 w-24 bg-slate-700" />
      </div>
      <div className="space-y-2">
        <Bone className="h-3 w-20 bg-slate-700" />
        <Bone className="h-9 w-40 bg-slate-700" />
      </div>
      <div className="py-4 border-y border-white/10 flex items-center justify-between">
        <Bone className="h-3 w-20 bg-slate-700" />
        <Bone className="h-3 w-24 bg-slate-700" />
      </div>
      <Bone className="h-14 w-full rounded-2xl bg-slate-700" />
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      {/* Muted decorative blurs to match the real page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Bone className="h-9 w-64" />
            <Bone className="h-4 w-52" />
          </div>
        </div>

        {/* Header card */}
        <HeaderSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Stats strip */}
          <StatsSkeleton />

          {/* Main content */}
          <div className="lg:col-span-8 space-y-10">
            <DetailsSkeleton />
            <SecuritySkeleton />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <PlanCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
