"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ConsultationFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All Specializations" && value !== "Any Price" && value !== "Any Time" && value !== "Any Rating") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
          <select 
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            defaultValue={searchParams.get('specialization') || "All Specializations"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option>All Specializations</option>
            <option>Budget Optimization</option>
            <option>Growth Strategy</option>
            <option>Risk Management</option>
            <option>Investment Strategy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
          <select 
            onChange={(e) => handleFilterChange('price', e.target.value)}
            defaultValue={searchParams.get('price') || "Any Price"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option>Any Price</option>
            <option>$100 - $150</option>
            <option>$150 - $200</option>
            <option>$200+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
          <select 
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            defaultValue={searchParams.get('availability') || "Any Time"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option>Any Time</option>
            <option>Available Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
          <select 
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            defaultValue={searchParams.get('rating') || "Any Rating"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option>Any Rating</option>
            <option>4.5+ Stars</option>
            <option>4.8+ Stars</option>
            <option>5 Stars</option>
          </select>
        </div>
      </div>
    </div>
  );
}
