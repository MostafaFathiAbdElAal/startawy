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
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-4 bg-gray-50/30 dark:bg-slate-800/50">
          <div className="p-3 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Financial Records</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Transaction Ledger</p>
          </div>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-left">
                  <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 dark:border-gray-700/50">Founder & Business</th>
                  <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 dark:border-gray-700/50">Date</th>
                  <th className="px-8 py-5 font-black text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100 dark:border-gray-700/50 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-teal-500/[0.02] dark:hover:bg-teal-500/[0.02] transition-colors border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">{r.founderName}</p>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-black uppercase tracking-tighter mt-0.5">{r.businessName}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 font-bold text-xs">
                        <Calendar className="w-4 h-4 text-teal-500/50" />
                        <span>{new Date(r.date).toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-xl border border-teal-100 dark:border-teal-800/50 tabular-nums shadow-xs">
                        ${r.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50/50 dark:bg-slate-900/50 border-t-2 border-gray-100 dark:border-gray-700">
                <tr>
                  <td className="px-8 py-8 font-black text-gray-900 dark:text-white uppercase text-xs tracking-[0.2em]" colSpan={2}>Grand Total</td>
                  <td className="px-8 py-8 text-right">
                    <span className="font-black text-teal-600 dark:text-teal-400 tabular-nums text-2xl tracking-tighter">
                      ${totalEarnings.toFixed(2)}
                    </span>
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
