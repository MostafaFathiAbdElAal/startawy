import React from 'react';

/**
 * Loading Skeleton for the Consultant Dashboard
 * Mimics the look of stats cards, charts, and activity panels
 */
export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-8 animate-pulse">
      {/* Welcome Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 w-12 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-8 h-80">
        <div className="h-6 w-48 bg-gray-100 dark:bg-gray-700 rounded-md mb-6"></div>
        <div className="h-full w-full bg-gray-50 dark:bg-gray-700/20 rounded-xl"></div>
      </div>

      {/* Lower Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-72">
            <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between">
              <div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded-md"></div>
              <div className="h-6 w-16 bg-gray-50 dark:bg-gray-700 rounded-md"></div>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 w-full bg-gray-50/50 dark:bg-gray-700/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
