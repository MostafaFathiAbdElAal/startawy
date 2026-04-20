'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/providers/ToastProvider";

interface Session {
  id: number;
  founderName: string;
  businessName: string;
  date: string;
  duration: string;
  notes: string | null;
  paymentStatus: string;
  amount: number;
  meetingLink: string | null;
}


// ─── Sub-Components ──────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
};

const SessionSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
      </div>
      <div className="h-6 w-16 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50/50 dark:bg-gray-700/20 rounded-xl">
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 space-y-2">
      <div className="h-2 w-20 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
      <div className="h-12 w-full bg-gray-50 dark:bg-gray-700/30 rounded-xl"></div>
    </div>
  </div>
);

const SessionCard = ({ 
  s, 
  now, 
  editingId, 
  editNotes, 
  saving, 
  setEditingId, 
  setEditNotes, 
  handleUpdateNotes 
}: { 
  s: Session; 
  now: Date;
  editingId: number | null;
  editNotes: string;
  saving: boolean;
  setEditingId: (id: number | null) => void;
  setEditNotes: (notes: string) => void;
  handleUpdateNotes: (id: number) => void;
}) => {
  const isUpcoming = new Date(s.date) > now;
  const isCompleted = !isUpcoming;
  const isEditing = editingId === s.id;

  return (
    <div className="bg-white dark:bg-gray-800 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group ring-1 ring-amber-50/50 dark:ring-amber-900/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {s.founderName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{s.businessName}</p>
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusBadge(s.paymentStatus)}`}>
          {s.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-linear-to-br from-teal-50/30 to-amber-50/30 dark:from-teal-900/5 dark:to-amber-900/5 rounded-xl border border-amber-100/20">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>{new Date(s.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
          <Clock className="w-4 h-4 text-teal-500" />
          <span>{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{s.duration}</span>
        </div>
        {s.amount > 0 && (
          <div className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400">
            <DollarSign className="w-4 h-4" />
            <span>${s.amount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {isUpcoming && s.meetingLink && (
        <a 
          href={s.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all duration-300 font-bold text-xs shadow-lg shadow-teal-500/25"
        >
          <Loader2 className="w-4 h-4 animate-pulse" />
          Join Meeting
        </a>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Follow-up Plan</span>
          </div>
          {isCompleted && !isEditing && (
            <button 
              onClick={() => { setEditingId(s.id); setEditNotes(s.notes || ''); }}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {s.notes ? 'Edit' : 'Create'}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea 
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-teal-500 outline-none min-h-[100px]"
              placeholder="Submit your strategic advice and follow-up steps..."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdateNotes(s.id)}
                disabled={saving}
                className="flex-1 bg-teal-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCircle2 className="w-3 h-3"/>}
                Save Plan
              </button>
              <button 
                onClick={() => setEditingId(null)}
                disabled={saving}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
            {s.notes ? (
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {s.notes}
              </p>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <AlertCircle className="w-3 h-3" />
                <p className="text-[10px] italic">No follow-up plan submitted yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ConsultantSessionsPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultant/sessions');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast({
        type: "error",
        title: "Load Failed",
        message: "Could not load sessions. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async (sessionId: number) => {
    try {
      setSaving(true);
      const res = await fetch('/api/consultant/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, notes: editNotes }),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      showToast({
        type: "success",
        title: "Plan Updated",
        message: "Follow-up plan updated successfully"
      });
      setEditingId(null);
      fetchSessions();
    } catch (error) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to save follow-up plan."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="mb-10 space-y-4">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SessionSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.date) > now);
  const completed = sessions.filter(s => new Date(s.date) <= now);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">My Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Manage your consulting sessions, track payments, and submit follow-up plans.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <p className="text-2xl font-black text-teal-600">{upcoming.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Upcoming</p>
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
            <p className="text-2xl font-black text-blue-600">{completed.length}</p>
            <p className="text-[10px] uppercase font-bold text-gray-400">Completed</p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active & Upcoming Sessions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(s => (
                <SessionCard 
                  key={s.id} 
                  s={s} 
                  now={now} 
                  editingId={editingId} 
                  editNotes={editNotes} 
                  saving={saving}
                  setEditingId={setEditingId}
                  setEditNotes={setEditNotes}
                  handleUpdateNotes={handleUpdateNotes}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Past Records & Follow-ups</h2>
          </div>
          {completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map(s => (
                <SessionCard 
                  key={s.id} 
                  s={s} 
                  now={now} 
                  editingId={editingId} 
                  editNotes={editNotes} 
                  saving={saving}
                  setEditingId={setEditingId}
                  setEditNotes={setEditNotes}
                  handleUpdateNotes={handleUpdateNotes}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-amber-100 dark:border-amber-900/30 rounded-3xl p-12 text-center shadow-inner shadow-amber-500/[0.02]">
              <Calendar className="w-16 h-16 text-amber-600/10 dark:text-amber-400/10 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No completed sessions found</h3>
              <p className="text-gray-500 text-sm mt-2">When you finish a session, it will appear here for follow-up submission.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
