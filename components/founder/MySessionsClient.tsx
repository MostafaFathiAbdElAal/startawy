'use client';

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, ExternalLink, MessageSquare, History, Tag, AlertTriangle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { rescheduleSession, cancelSession } from "@/app/actions/founder";
import { useToast } from "@/components/providers/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import DateInput from "@/components/ui/DateInput";

interface Session {
  id: number;
  consultantName: string;
  consultantId: number;
  consultantAvailability: string;
  date: Date;
  status: string;
  meetingLink?: string | null;
}

interface MySessionsClientProps {
  sessions: Session[];
}

export function MySessionsClient({ sessions }: MySessionsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const [rescheduleSessionId, setRescheduleSessionId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const [cancelSessionItem, setCancelSessionItem] = useState<Session | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  
  const upcomingSessions = sessions.filter(s => new Date(s.date) > now && s.status !== 'CANCELLED');
  const pastSessions = sessions.filter(s => new Date(s.date) <= now || s.status === 'CANCELLED');

  const handleOpenReschedule = (session: Session) => {
    const sDate = new Date(session.date);
    
    // Format to YYYY-MM-DD safely
    const y = sDate.getFullYear();
    const m = String(sDate.getMonth() + 1).padStart(2, '0');
    const d = String(sDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    // Format to 12-hour AM/PM matching availableTimes list
    let hours = sDate.getHours();
    const minutes = String(sDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    setRescheduleSessionId(session.id);
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime || rescheduleSessionId === null) return;
    
    setRescheduleLoading(true);
    try {
      let time24 = rescheduleTime;
      if (rescheduleTime.includes("AM") || rescheduleTime.includes("PM")) {
        const [time, modifier] = rescheduleTime.split(' ');
        const [hours, minutes] = time.split(':');
        let hrs = parseInt(hours, 10);
        if (modifier === 'PM' && hrs < 12) {
          hrs += 12;
        } else if (modifier === 'AM' && hrs === 12) {
          hrs = 0;
        }
        time24 = `${String(hrs).padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      
      const combinedDate = new Date(`${rescheduleDate}T${time24}:00`);
      const res = await rescheduleSession(rescheduleSessionId, combinedDate.toISOString());
      
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Session Rescheduled',
          message: 'The session has been successfully rescheduled.',
        });
        setRescheduleSessionId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        showToast({
          type: 'error',
          title: 'Reschedule Failed',
          message: res.error || 'Failed to reschedule the session.',
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred.',
      });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelSessionItem) return;
    
    setCancelLoading(true);
    try {
      const res = await cancelSession(cancelSessionItem.id);
      
      if (res.success) {
        showToast({
          type: 'warning',
          title: cancelSessionItem.status === 'PAID' ? 'Session Cancelled' : 'Session Removed',
          message: cancelSessionItem.status === 'PAID' 
            ? 'The paid session has been marked as cancelled.' 
            : 'The session booking has been deleted.',
        });
        setCancelSessionItem(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        showToast({
          type: 'error',
          title: 'Cancellation Failed',
          message: res.error || 'Failed to cancel the session.',
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred.',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const renderSessionCard = (session: Session, isUpcoming: boolean) => (
    <div 
      key={session.id} 
      className={`group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 transition-all duration-500 hover:shadow-2xl ${isUpcoming ? 'hover:shadow-teal-500/10 hover:border-teal-500/30' : 'opacity-80 hover:opacity-100'}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isUpcoming ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
            <User className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors leading-tight">
              Session with {session.consultantName}
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-bold">Session ID: #{session.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase border ${
            session.status === 'PAID' 
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
              : session.status === 'CANCELLED'
              ? 'bg-red-500/10 text-red-600 border-red-500/20'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          }`}>
            {session.status}
          </span>
          {isUpcoming && (
            <span className="px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse">
              Upcoming
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8">
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
          <Calendar className="w-5 h-5 text-teal-500" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</span>
            <span className="font-bold text-sm">{new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
          <Clock className="w-5 h-5 text-teal-500" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</span>
            <span className="font-bold text-sm">{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isUpcoming && session.status === 'PAID' && (
          <a 
            href={session.meetingLink || "#"} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl transition-all duration-300 font-bold text-sm shadow-lg shadow-teal-500/25"
          >
            <ExternalLink className="w-4 h-4" />
            Join Meeting
          </a>
        )}
        {isUpcoming && (
          <>
            <button 
              onClick={() => handleOpenReschedule(session)}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all duration-300 font-bold text-sm"
            >
              <Calendar className="w-4 h-4 text-teal-500" />
              Reschedule
            </button>
            <button 
              onClick={() => setCancelSessionItem(session)}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all duration-300 font-bold text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Cancel Session
            </button>
          </>
        )}
        {session.status === 'CANCELLED' ? (
          <div 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 rounded-2xl cursor-not-allowed opacity-75 font-bold text-sm border border-slate-100 dark:border-slate-800/50 hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group/prep"
            title="Preparation unavailable for cancelled sessions"
          >
            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/prep:text-red-500 dark:group-hover/prep:text-red-400 transition-colors" />
            Prep Unavailable (Cancelled)
          </div>
        ) : (
          <Link 
            href={`/ai-chatbot`} 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-all duration-300 font-bold text-sm"
          >
            <MessageSquare className="w-4 h-4 text-teal-500" />
            Prep with StartBot
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section>
        <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
          <Calendar className="w-6 h-6 text-teal-500" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upcoming Confirmations</h2>
        </div>
        
        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {upcomingSessions.map(s => renderSessionCard(s, true))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" strokeWidth={1} />
            <p className="text-slate-500 font-medium">No upcoming sessions scheduled.</p>
            <Link href="/book-consultant" className="text-teal-500 font-bold text-sm mt-4 hover:underline block">
              Book your first session →
            </Link>
          </div>
        )}
      </section>

      {pastSessions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <History className="w-6 h-6 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Past & Cancelled Consultations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastSessions.map(s => renderSessionCard(s, false))}
          </div>
        </section>
      )}

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleSessionId !== null && mounted && (() => {
          const activeSession = sessions.find(s => s.id === rescheduleSessionId);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRescheduleSessionId(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-[32px] p-8 shadow-2xl overflow-hidden z-10"
              >
                <button 
                  onClick={() => setRescheduleSessionId(null)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Reschedule Session</h3>
                </div>

                {activeSession && (
                  <div className="mb-6 p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl text-left">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Consultant Weekly Availability:
                    </p>
                    <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">
                      {activeSession.consultantAvailability}
                    </p>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Date</label>
                    <DateInput 
                      value={rescheduleDate}
                      onChange={(val) => {
                        setRescheduleDate(val);
                        // Reset time selection when date changes to force valid selection
                        setRescheduleTime("");
                      }}
                      disablePast={true}
                      placeholder="Select New Date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Time</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableTimes.map((time) => {
                        const isSelected = rescheduleTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setRescheduleTime(time)}
                            className={`py-3 px-2 border-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 scale-[1.02] shadow-md shadow-teal-500/10"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/50 hover:text-teal-500"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0 text-teal-500" />
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveReschedule}
                    disabled={rescheduleLoading || !rescheduleDate || !rescheduleTime}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {rescheduleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm New Schedule'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Cancellation Confirmation Dialog */}
      <AnimatePresence>
        {cancelSessionItem !== null && mounted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelSessionItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setCancelSessionItem(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Cancel Consultation</h3>
              </div>

              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {cancelSessionItem.status === 'PAID' ? (
                    <>
                      This session is <strong>already paid</strong>. Rescheduling is 100% free and highly recommended to keep your strategy booking! If you cancel, the session will be archived as <strong>CANCELLED</strong> in our logs.
                    </>
                  ) : (
                    <>
                      Are you sure you want to cancel this unpaid session? This will permanently delete the booking from your schedule.
                    </>
                  )}
                </p>

                <div className="flex flex-col gap-3">
                  {cancelSessionItem.status === 'PAID' && (
                    <button 
                      onClick={() => {
                        const item = cancelSessionItem;
                        setCancelSessionItem(null);
                        handleOpenReschedule(item);
                      }}
                      className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Reschedule Instead (Recommended)
                    </button>
                  )}
                  
                  <button 
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Cancellation'}
                  </button>

                  <button 
                    onClick={() => setCancelSessionItem(null)}
                    disabled={cancelLoading}
                    className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all font-bold text-sm"
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
