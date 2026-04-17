'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Calendar, Receipt, TrendingUp, Users } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface EarningRecord {
  id: number;
  founderName: string;
  businessName: string;
  date: string;
  amount: number;
}

interface EarningData {
  records: EarningRecord[];
  totalEarnings: number;
  totalSessions: number;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const EarningsSkeleton = () => (
  <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-pulse">
    <div className="mb-10 space-y-3">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {[1, 2].map(i => (
        <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
      ))}
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden h-96"></div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConsultantEarningsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<EarningData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultant/earnings');
      
      if (res.status === 404 || res.status === 401) {
          setData({ records: [], totalEarnings: 0, totalSessions: 0 });
          return;
      }

      if (!res.ok) throw new Error('Failed to load financial records');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      showToast({
        type: "error",
        title: "Finance Sync Error",
        message: "Could not sync your financial data."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <EarningsSkeleton />;
  if (!data) return null;

  const { records = [], totalEarnings = 0, totalSessions = 0 } = data;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Professional Earnings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Overview of your consulting revenue and session history.</p>
      </div>

      {/* Summary Stats Grid - Moderated Radius & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Total Earnings Card */}
        <div className="bg-linear-to-br from-teal-600 to-teal-800 text-white p-6 rounded-2xl shadow-xl shadow-teal-900/10 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-md uppercase tracking-wider">Total Income</span>
            </div>
            <p className="text-4xl font-black mb-1 tabular-nums">
              ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-teal-50/70 text-xs font-medium">Cumulative revenue from all sessions</p>
          </div>
        </div>

        {/* Total Sessions Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl group hover:border-teal-500/30 transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400 dark:text-gray-400" />
            </div>
            <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tabular-nums">
            {totalSessions}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sessions Documented</p>
        </div>
      </div>

      {/* Ledger Section - Cleaned up lines & Radius */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 bg-gray-50/30 dark:bg-transparent">
          <div className="p-2.5 bg-gray-900 dark:bg-teal-500 rounded-xl">
            <Receipt className="w-5 h-5 text-white dark:text-gray-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Financial Records</h2>
          </div>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/20 text-left">
                  <th className="px-6 py-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Founder & Business</th>
                  <th className="px-6 py-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">Date</th>
                  <th className="px-6 py-4 font-bold text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{r.founderName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{r.businessName}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        <span>{new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg border border-teal-100/50 dark:border-teal-800/30 tabular-nums">
                        ${r.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50/50 dark:bg-gray-700/10 border-t border-gray-100 dark:border-gray-700">
                <tr>
                  <td className="px-6 py-6 font-bold text-gray-900 dark:text-white uppercase text-xs" colSpan={2}>Total</td>
                  <td className="px-6 py-6 text-right font-black text-teal-600 dark:text-teal-400 tabular-nums text-xl">
                    ${totalEarnings.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <DollarSign className="w-16 h-16 text-gray-100 dark:text-gray-700 mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-1">No earnings yet</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto text-sm">
              Your session revenue will be automatically tracked here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
