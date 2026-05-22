'use client';

import { Calendar, User, Clock, ExternalLink, MessageSquare, History, Tag } from "lucide-react";
import Link from "next/link";

interface Session {
  id: number;
  consultantName: string;
  date: Date;
  status: string;
  meetingLink?: string | null;
}

interface MySessionsClientProps {
  sessions: Session[];
}

export function MySessionsClient({ sessions }: MySessionsClientProps) {
  const now = new Date();
  
  const upcomingSessions = sessions.filter(s => new Date(s.date) > now);
  const pastSessions = sessions.filter(s => new Date(s.date) <= now);

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
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl transition-all duration-300 font-bold text-sm shadow-lg shadow-teal-500/25"
          >
            <ExternalLink className="w-4 h-4" />
            Join Meeting
          </a>
        )}
        <Link 
          href={`/ai-chatbot`} 
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all duration-300 font-bold text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Prep with StartBot
        </Link>
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Past Consultations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastSessions.map(s => renderSessionCard(s, false))}
          </div>
        </section>
      )}
    </div>
  );
}
