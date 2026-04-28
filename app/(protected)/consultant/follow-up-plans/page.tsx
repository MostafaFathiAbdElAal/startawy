'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Calendar, User, Search, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface Session {
  id: number;
  founderName: string;
  businessName: string;
  date: string;
  duration: string;
  notes: string | null;
  paymentStatus: string;
}

/**
 * ConsultantFollowUpPlansPage - Client Component
 * Specialized hub to review and refine strategic action plans for completed sessions.
 * Communicates with /api/consultant/sessions (GET and PATCH)
 */
export default function ConsultantFollowUpPlansPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultant/sessions');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Filter for completed sessions only as per business logic
      const now = new Date();
      const completed = data.filter((s: Session) => new Date(s.date) <= now);
      setSessions(completed);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast({
        type: "error",
        title: "Load Failed",
        message: "Could not load follow-up plans."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateNotes = async (sessionId: number) => {
    try {
      setSaving(true);
      const res = await fetch('/api/consultant/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, notes: editNotes }),
      });

      if (!res.ok) throw new Error('Failed to update plan');
      
      showToast({
        type: "success",
        title: "Plan Updated",
        message: "Strategy plan updated successfully"
      });
      setEditingId(null);
      fetchSessions(); // Refresh list to show new data
    } catch (error) {
      showToast({
        type: "error",
        title: "Sync Error",
        message: "Failed to sync plan updates."
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter sessions based on founder or business name
  const filteredSessions = sessions.filter(s => 
    s.founderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Strategic Plans Skeleton
  const PlanSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] overflow-hidden animate-pulse">
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700/50 rounded-md"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="h-40 bg-gray-50 dark:bg-gray-700/20 rounded-2xl"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-10 space-y-3">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {[1, 2, 3].map(i => <PlanSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Follow-Up Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">Manage and refine strategic action plans for your completed sessions.</p>
        </div>

        {/* Dynamic Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by founder or startup..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div 
              key={session.id}
              className="bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-[2rem] overflow-hidden shadow-xl shadow-amber-900/5 dark:shadow-none hover:border-teal-500/30 transition-all duration-500 ring-1 ring-amber-50/50 dark:ring-amber-900/10"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
                      <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{session.founderName}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{session.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-black text-[10px] uppercase tracking-widest">
                      Completed
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 mb-8 relative group">
                  <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-teal-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Strategy Blueprint</h4>
                    </div>

                    {editingId !== session.id && (
                      <button 
                        onClick={() => { 
                          setEditingId(session.id); 
                          const template = `[CORE OBJECTIVE]:\n- \n\n[ACTION ITEMS]:\n1. \n2. \n\n[TIMELINE]:\n- Week 1: \n- Month 1: `;
                          setEditNotes(session.notes || template); 
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm text-teal-600 dark:text-teal-400 text-xs font-bold hover:scale-105 transition-transform"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {session.notes ? 'Refine Strategy' : 'Draft Strategy Blueprint'}
                      </button>
                    )}
                  </div>
                  
                  {editingId === session.id ? (
                    <div className="space-y-4">
                      <textarea 
                        className="w-full p-5 text-sm border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-900 focus:ring-4 focus:ring-teal-500/10 outline-none min-h-[150px] font-medium leading-relaxed"
                        placeholder="Detail your follow-up plans and strategic steps here..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleUpdateNotes(session.id)}
                          disabled={saving}
                          className="flex-1 bg-teal-500 text-white text-xs font-black py-3 rounded-xl hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                          Update Strategic Plan
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                          className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {session.notes ? (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {session.notes}
                        </p>
                      ) : (
                        <div className="py-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                          <p className="text-gray-400 dark:text-gray-500 text-xs italic font-bold">
                            No follow-up plan has been drafted yet for this founder.
                          </p>
                        </div>
                      )}
                      
                      {/* Refine button moved to header for better responsiveness */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-[3rem] p-24 text-center">
            <div className="w-24 h-24 bg-teal-500/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-12 h-12 text-teal-200 dark:text-teal-900" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Strategy Forge Empty</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
              Strategic blueprints only appear for completed sessions. Finalize your active consultations to begin forging the future for your founders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
