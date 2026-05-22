'use client';

import React, { useEffect, useState } from 'react';
import { Clock, CalendarRange, Info } from 'lucide-react';
import AvailabilityForm from './AvailabilityForm';
import { useToast } from "@/components/providers/ToastProvider";

// ─── Sub-Components ──────────────────────────────────────────────────────────

const ScheduleSkeleton = () => (
  <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-pulse">
    <div className="mb-10 space-y-3">
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]"></div>
      <div className="space-y-6">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-[2.5rem]"></div>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl"></div>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConsultantAvailabilityPage() {
  const { showToast } = useToast();
  const [availability, setAvailability] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch initial availability data from backend API
  useEffect(() => {
    async function fetchAvailability() {
      try {
        setLoading(true);
        const res = await fetch('/api/consultant/availability');
        if (!res.ok) throw new Error('Failed to fetch availability');
        const data = await res.json();
        setAvailability(data.availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
        showToast({
          type: "error",
          title: "Schedule Sync Error",
          message: "Could not load your availability schedule."
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, []);

  if (loading) return <ScheduleSkeleton />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter flex items-center gap-3 justify-center sm:justify-start">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <CalendarRange className="w-10 h-10 text-teal-600" />
          </div>
          Availability Schedule
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">
          Coordinate your consulting hours effectively. Your schedule helps startup founders plan their sessions with you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-[2.5rem] p-8 shadow-sm shadow-amber-900/5 hover:border-amber-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
              <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Define Your Hours</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visible to all prospective founders</p>
            </div>
          </div>

          <AvailabilityForm current={availability} />
        </div>

        {/* Informational Guidance Section */}
        <div className="space-y-6">
          <div className="bg-linear-to-br from-gray-900 to-slate-800 dark:from-teal-950 dark:to-slate-900 border border-gray-800 dark:border-teal-500/20 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/30">
                <Info className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-black text-2xl mb-4 tracking-tight">Strategic Impact</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                A structured availability schedule is the cornerstone of professional consulting. By providing clear windows, you reduce friction for high-value founders, resulting in a <span className="text-teal-400 font-bold text-lg">40% increase</span> in booking conversion and superior platform ratings.
              </p>
            </div>
            <Clock className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Quick Notice Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-xs border-l-4 border-l-teal-500">
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              Confirmation Protocol
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              This schedule serves as your public commitment. All sessions remain subject to manual confirmation via the unified calendar, ensuring you maintain 100% control over your strategic time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
