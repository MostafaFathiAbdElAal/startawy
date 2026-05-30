'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateRecommendationStatus } from '@/app/actions/recommendation';
import { useToast } from "@/components/providers/ToastProvider";

interface RecommendationActionsProps {
  recommendationId: number;
  currentStatus: string;
}

export default function RecommendationActions({ 
  recommendationId, 
  currentStatus 
}: RecommendationActionsProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // If already Adopted or Rejected, no further actions can be taken
  if (currentStatus === 'ADOPTED' || currentStatus === 'REJECTED') {
    return null;
  }

  async function handleStatusUpdate(status: 'ADOPTED' | 'REJECTED') {
    setLoading(status);
    try {
      const res = await updateRecommendationStatus(recommendationId, status);
      if (res.success) {
        showToast({
          type: "success",
          title: status === 'ADOPTED' ? "Strategy Adopted" : "Strategy Rejected",
          message: status === 'ADOPTED' 
            ? "You have successfully adopted this recommendation!" 
            : "You have marked this recommendation as rejected."
        });
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Could not update status."
        });
      }
    } catch (error) {
      console.error("Action error:", error);
      showToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to the server."
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="text-center sm:text-left space-y-1">
        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Evaluate Strategy</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Adopt this plan to integrate it into your active growth metrics, or mark it as rejected.</p>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
        <button
          onClick={() => handleStatusUpdate('REJECTED')}
          disabled={loading !== null}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
        >
          {loading === 'REJECTED' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Reject
        </button>

        <button
          onClick={() => handleStatusUpdate('ADOPTED')}
          disabled={loading !== null}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-black shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50"
        >
          {loading === 'ADOPTED' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Adopt Strategy
        </button>
      </div>
    </div>
  );
}
