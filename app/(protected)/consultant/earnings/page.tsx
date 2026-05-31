'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, Calendar, Receipt, TrendingUp } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface EarningRecord {
  id: number | string;
  founderName: string;
  businessName: string;
  date: string;
  type: 'SESSION' | 'SUBSCRIPTION';
  gross: number;
  rateInfo: string;
  feeAmount: number;
  net: number;
}

interface EarningData {
  records: EarningRecord[];
  sessionEarnings: number;
  commissionEarnings: number;
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

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultant/earnings');
      
      if (res.status === 404 || res.status === 401) {
          setData({ records: [], sessionEarnings: 0, commissionEarnings: 0, totalEarnings: 0, totalSessions: 0 });
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
  }, [showToast]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  if (loading) return <EarningsSkeleton />;
  if (!data) return null;

  const { 
    records = [], 
    sessionEarnings = 0, 
    commissionEarnings = 0, 
    totalEarnings = 0, 
    totalSessions = 0 
  } = data;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Professional Earnings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Overview of your consulting revenue and session history.</p>
      </div>

      {/* Summary Stats Grid - 3 Premium Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Sessions Earnings Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xs group hover:border-teal-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-500" />
            </div>
            <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Sessions</span>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tabular-nums">
            ${sessionEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Session Revenue ({totalSessions} sessions)</p>
        </div>

        {/* Advisory Commissions Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-xs group hover:border-teal-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Advisory</span>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tabular-nums">
            ${commissionEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subscription Commissions</p>
        </div>

        {/* Grand Total Income Card */}
        <div className="bg-linear-to-br from-teal-600 to-teal-800 text-white p-6 rounded-2xl shadow-xl shadow-teal-900/10 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-md uppercase tracking-wider">Grand Total</span>
            </div>
            <p className="text-4xl font-black mb-1 tabular-nums">
              ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-teal-50/70 text-xs font-medium">Cumulative net revenue from all sources</p>
          </div>
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
          <div className="min-w-full">
            {/* Header - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-gray-700/50 px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">
              <div className="col-span-4">Founder & Business</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Gross Amount</div>
              <div className="col-span-2 text-right">Revenue Split</div>
              <div className="col-span-2 text-right">Net Take-Home</div>
            </div>

            {/* Records List */}
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {records.map(r => (
                <div key={r.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 px-8 py-6 hover:bg-teal-500/[0.02] transition-colors items-center">
                  {/* Founder & Business & Badge */}
                  <div className="col-span-12 md:col-span-4 space-y-1.5">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white text-base tracking-tight break-words leading-tight">{r.founderName}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{r.businessName}</p>
                    </div>
                    <span className={`inline-block text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      r.type === 'SESSION'
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}>
                      {r.type === 'SESSION' ? 'Consultation Session' : 'Subscription Split'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-12 md:col-span-2 flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold text-xs">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(r.date).toLocaleDateString('en-GB')}</span>
                  </div>

                  {/* Gross Amount */}
                  <div className="col-span-6 md:col-span-2 text-left md:text-right font-bold text-slate-600 dark:text-slate-300 text-sm tabular-nums">
                    ${r.gross.toFixed(2)}
                  </div>

                  {/* Revenue Split / Fee */}
                  <div className="col-span-6 md:col-span-2 text-left md:text-right space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.rateInfo}</p>
                    <p className="text-xs font-bold tabular-nums text-red-500">
                      -${r.feeAmount.toFixed(2)}
                    </p>
                  </div>

                  {/* Net Take-Home */}
                  <div className="col-span-12 md:col-span-2 text-left md:text-right">
                    <span className="inline-block font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-4 py-2 rounded-xl border border-teal-100 dark:border-teal-800/50 tabular-nums shadow-xs">
                      ${r.net.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="bg-gray-50/50 dark:bg-slate-900/50 border-t-2 border-gray-100 dark:border-gray-700 px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-[0.2em]">Grand Total</span>
                <span className="font-black text-teal-600 dark:text-teal-400 tabular-nums text-2xl md:text-3xl tracking-tighter">
                  ${totalEarnings.toFixed(2)}
                </span>
              </div>
            </div>
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
