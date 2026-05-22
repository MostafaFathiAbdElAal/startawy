'use client';

import { useState } from 'react';
import { 
  Calendar, Clock, Search, 
  MessageSquare, 
  CheckCircle2, AlertCircle, X, Save, Loader2,
  Briefcase
} from 'lucide-react';
import { updateSessionNotes } from '@/app/actions/consultant';
import { useToast } from '@/components/providers/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Session {
  id: number;
  founderName: string;
  businessName: string;
  date: Date;
  duration: number | string;
  notes: string | null;
  paymentStatus: string;
  amount: number;
}

export default function SessionsClient({ initialSessions }: { initialSessions: Session[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [search, setSearch] = useState('');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const now = new Date();

  const filteredSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'upcoming' ? sessionDate > now :
      sessionDate <= now;
    
    const matchesSearch = 
      s.founderName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenNotes = (session: Session) => {
    setEditingSession(session);
    setNoteText(session.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingSession) return;
    setIsSaving(true);
    const res = await updateSessionNotes(editingSession.id, noteText);
    setIsSaving(false);

    if (res.success) {
      showToast({ type: 'success', title: 'Success', message: 'Session notes updated successfully.' });
      setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, notes: noteText } : s));
      setEditingSession(null);
    } else {
      showToast({ type: 'error', title: 'Error', message: res.error || 'Failed to save notes.' });
    }
  };

  const getDurationLabel = (duration: number | string) => {
    if (typeof duration === 'string') return duration;
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${duration} mins`;
  };

  const getStatusBadge = (status: string, date: Date) => {
    const isPast = new Date(date) < now;
    
    if (status === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          {isPast ? 'Completed' : 'Paid'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
        <AlertCircle className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Consultation Sessions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Manage your scheduled meetings, review client information, and add follow-up notes for each session.
          </p>
        </div>
        
        <div className="w-full md:w-auto flex bg-white dark:bg-slate-900 p-1 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {(['all', 'upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 md:flex-none px-4 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${
                filter === t
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
          <Search className="w-4 h-4 sm:w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-11 sm:pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/50 text-slate-900 dark:text-white text-sm sm:text-base font-medium transition-all shadow-sm group-hover:shadow-md"
        />
      </div>

      {/* Sessions List - Desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300">
              <Calendar className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No sessions found</p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search query.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client / Business</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-black text-sm border border-teal-500/20">
                          {session.founderName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{session.founderName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{session.businessName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
                          <Calendar className="w-3.5 h-3.5 text-teal-500" />
                          {new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{getDurationLabel(session.duration)}</span>
                    </td>
                    <td className="px-6 py-6">
                      {getStatusBadge(session.paymentStatus, session.date)}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => handleOpenNotes(session)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          session.notes 
                            ? "bg-slate-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-500/10"
                            : "bg-teal-600 text-white shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {session.notes ? "View Notes" : "Add Note"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
             <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
             <p className="text-slate-500 font-bold">No sessions found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-black text-sm border border-teal-500/20">
                    {session.founderName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{session.founderName}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{session.businessName}</p>
                  </div>
                </div>
                {getStatusBadge(session.paymentStatus, session.date)}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Date</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Time</span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500">{getDurationLabel(session.duration)}</span>
                </div>
                <button
                  onClick={() => handleOpenNotes(session)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  {session.notes ? "View Notes" : "Add Note"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Modal */}
      <AnimatePresence>
        {editingSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingSession(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Session Notes</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Follow-up with {editingSession.founderName}</p>
                  </div>
                  <button
                    onClick={() => setEditingSession(null)}
                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Date</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {new Date(editingSession.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Follow-up Summary</label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter follow-up instructions, recommendations, or summary of the meeting..."
                      className="w-full min-h-[180px] p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all text-slate-900 dark:text-white font-medium resize-none shadow-inner"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditingSession(null)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="flex-1 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
