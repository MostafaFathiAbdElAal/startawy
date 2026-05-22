export default function LibraryLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-64 bg-gray-200 dark:bg-slate-800 rounded-lg mb-2" />
          <div className="h-5 w-80 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Featured Report Skeleton */}
      <div className="h-80 w-full bg-gray-200 dark:bg-slate-800 rounded-2xl mb-8" />

      {/* Category Filter Skeleton */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-28 bg-gray-100 dark:bg-slate-800/50 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Reports Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden h-[450px]">
            <div className="h-48 w-full bg-gray-200 dark:bg-slate-800" />
            <div className="p-6 space-y-4">
              <div className="h-6 w-full bg-gray-200 dark:bg-slate-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-16 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-12 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
                <div className="h-5 w-12 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
              </div>
              <div className="flex gap-2 pt-4">
                <div className="h-10 flex-1 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-10 w-24 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
