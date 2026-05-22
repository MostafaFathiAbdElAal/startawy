"use client";

import React from "react";

export function MyPlanSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Current Plan Card Skeleton */}
      <div className="bg-gray-200 dark:bg-slate-800 rounded-2xl p-8 h-[340px] relative overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        
        <div className="flex justify-between mb-8">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
            <div className="h-10 w-64 bg-gray-300 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-10 w-40 bg-gray-300 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div className="h-8 w-24 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-gray-300/20 dark:border-slate-700/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-gray-300 dark:bg-slate-700 rounded-full"></div>
              <div className="h-5 w-32 bg-gray-300 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="h-12 w-40 bg-gray-300 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-12 w-48 bg-gray-300 dark:bg-slate-700 rounded-lg opacity-50"></div>
        </div>
      </div>

      {/* Available Plans Section Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 space-y-6">
              <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-4 w-full bg-gray-100 dark:bg-slate-800/50 rounded-lg"></div>
              <div className="h-12 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
              
              <div className="space-y-4 pt-6">
                <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800/50 rounded-full mb-4"></div>
                {[1, 2, 3, 4].map((f) => (
                  <div key={f} className="flex gap-3">
                    <div className="h-4 w-4 bg-gray-100 dark:bg-slate-800/50 rounded-full shrink-0"></div>
                    <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/30 rounded-lg"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 h-12 w-full bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
