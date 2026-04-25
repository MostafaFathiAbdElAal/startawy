'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Lightbulb, User, Clock, Send, Info, Loader2 } from 'lucide-react';
import RecommendationForm from './RecommendationForm';
import { useToast } from "@/components/providers/ToastProvider";

interface Client {
  id: number;
  name: string;
  businessName: string;
}

interface Recommendation {
  id: number;
  title: string;
  content: string;
  status: string;
  category?: string;
  priority?: string;
  createdAt: string | Date;
  founder?: {
    user?: {
      name: string;
    };
  };
}

/**
 * ConsultantRecommendationsPage - Client-side component
 * Manages strategic advice workflow using /api/consultant/recommendations and /api/consultant/clients
 */
export default function ConsultantRecommendationsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function to be reused
  const fetchData = useCallback(async () => {
    try {
      const [clientsRes, recsRes] = await Promise.all([
        fetch('/api/consultant/clients'),
        fetch('/api/consultant/recommendations')
      ]);

      if (!clientsRes.ok || !recsRes.ok) throw new Error('Failed to load data');

      const [clientsData, recsData] = await Promise.all([
        clientsRes.json(),
        recsRes.json()
      ]);

      setClients(clientsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Data sync error:', error);
      showToast({
        type: "error",
        title: "Sync Error",
        message: "Could not sync recommendations data."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Multi-segment Skeleton for Recommendations
  const RecommendationSkeleton = () => (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="mb-10 space-y-3">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2rem]"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-[2rem]"></div>
        </div>
        <div className="lg:col-span-2 space-y-10">
          <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-[2rem]"></div>
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-[2rem]"></div>
        </div>
      </div>
    </div>
  );

  if (loading) return <RecommendationSkeleton />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header with high-impact design */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-3 justify-center sm:justify-start tracking-tighter">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Lightbulb className="w-10 h-10 text-orange-500" strokeWidth={2.5} />
          </div>
          Strategic Recommendations
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
          Influence startup trajectories by providing professional financial advice and tactical recommendations to founders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Guidance Area */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] p-8 shadow-sm">
            <h3 className="font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase text-xs tracking-widest bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
              <Info className="w-5 h-5 text-teal-500" />
              Expert Guidelines
            </h3>
            <ul className="space-y-5 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-[10px] shrink-0">01</div>
                <p>Prioritize <strong>cash-flow optimization</strong> for early-stage clients.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-[10px] shrink-0">02</div>
                <p>Propose <strong>cost-efficiency</strong> measures for high-burn departments.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-[10px] shrink-0">03</div>
                <p>Advise on <strong>revenue diversification</strong> to ensure long-term stability.</p>
              </li>
            </ul>
          </div>

          {/* Inspirational CTA */}
          <div className="bg-linear-to-br from-teal-500 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-500/20 overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="font-black text-xl mb-3 tracking-tight">Mission Critical</h4>
              <p className="text-sm text-teal-50/90 leading-relaxed font-medium">
                Your guidance is the catalyst for founder success. Clear, actionable advice leads to better budget management and sustainable growth.
              </p>
            </div>
            <Lightbulb className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
          </div>
        </div>

        {/* Main Interaction Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Inject the Form with data refresh callback */}
          <RecommendationForm clients={clients} onSuccess={fetchData} />

          {/* History Section */}
          <div className="bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-[2rem] p-8 shadow-sm shadow-amber-900/5">
            <h3 className="font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 uppercase text-xs tracking-widest bg-linear-to-r from-teal-50 to-amber-50 dark:from-gray-700/50 dark:to-amber-900/20 p-3 rounded-xl w-fit border border-amber-100/20">
              <Clock className="w-5 h-5 text-teal-600" />
              Advice History
            </h3>
            
            {recommendations && recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((recItem) => (
                  <div key={recItem.id} className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-amber-100/20 dark:border-gray-700/50 hover:border-teal-500/40 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group shadow-xs hover:shadow-lg hover:shadow-amber-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white">{recItem.founder?.user?.name || 'Founder'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(recItem.createdAt).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                        recItem.status === 'ADOPTED' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                      }`}>
                        {recItem.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        recItem.priority === 'CRITICAL' || recItem.priority === 'URGENT'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : recItem.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {recItem.priority || 'MEDIUM'}
                      </span>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        {recItem.category?.replace(/_/g, ' ') || 'STRATEGY'}
                      </span>
                    </div>
                    <div className="pl-0">
                      <h4 className="text-md font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight">{recItem.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium">
                        {recItem.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/30 dark:bg-gray-900/20 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <Send className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" strokeWidth={1} />
                <h4 className="text-gray-400 font-bold">Your ledger is empty</h4>
                <p className="text-xs text-gray-500">Share your first strategic advice using the form above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
