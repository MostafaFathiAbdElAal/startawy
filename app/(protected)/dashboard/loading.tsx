export default function DashboardLoading() {
  return (
    <div className="p-8 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[400px]">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions Skeleton */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
