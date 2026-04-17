import { Metadata } from "next";
import { getFounderDashboardData } from "@/app/actions/founder";

export const metadata: Metadata = {
  title: "Founder Dashboard",
};

import { redirect } from "next/navigation";
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Plus,
  PieChart,
  Lightbulb,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default async function FounderDashboardPage() {
  const data = await getFounderDashboardData();

  if (data === null) {
    redirect("/logout");
  }

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {data.user.name.split(' ')[0]}! Here&apos;s your business overview.</p>
        </div>
        <Link 
          href="/founder/budgets/new" 
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all shadow-xl active:scale-98"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6">
              <PieChart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Analyses</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.totalAnalyses}</h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full"></div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Sessions</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.totalSessions}</h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Strategies</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.totalStrategies}</h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[32px] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Next Session</p>
            <h3 className="text-lg font-bold text-white">{data.recentSessions[0] ? new Date(data.recentSessions[0].date).toLocaleDateString() : 'None Scheduled'}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Analysis</h2>
                <p className="text-sm text-slate-400">Quick view of your recent budget calculations.</p>
              </div>
              <Link href="/founder/budgets" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-teal-500 hover:text-white transition-all">
                <ArrowUpRight className="w-6 h-6" />
              </Link>
            </div>
            
            {data.latestAnalysis ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">EGP {data.latestAnalysis.totalBudget.toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/10">
                    <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Fixed Cost</p>
                    <p className="text-xl font-bold text-teal-600 dark:text-teal-400">EGP {data.latestAnalysis.fixedCost.toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Variable Cost</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">EGP {data.latestAnalysis.variableCost.toLocaleString()}</p>
                  </div>
               </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                No analysis data available yet.
              </div>
            )}
          </div>

          <div className="bg-linear-to-br from-teal-500 to-teal-400 rounded-[40px] p-10 text-white shadow-2xl shadow-teal-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 uppercase tracking-widest text-[10px] font-black opacity-80">
                <Sparkles className="w-4 h-4" />
                AI Business Coach
              </div>
              <h3 className="text-3xl font-bold mb-4 leading-tight">Need a financial strategy check?</h3>
              <p className="text-teal-50 text-base mb-8 opacity-90 max-w-sm">Our AI coach and expert consultants are ready to analyze your business potential.</p>
              <Link href="/founder/chat" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-2xl font-black text-sm hover:translate-x-1 transition-all shadow-xl">
                Start Chatting <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 blur-3xl rounded-full group-hover:scale-120 transition-transform duration-700"></div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
                <Link href="/founder/sessions" className="text-teal-500 font-bold text-xs uppercase tracking-widest hover:text-teal-600">View All</Link>
             </div>
             
             <div className="space-y-4">
               {data.recentSessions.map(session => (
                 <div key={session.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 dark:text-white">{session.consultantName}</p>
                      <span className={`text-[10px] font-black ${session.status === 'COMPLETED' ? 'text-green-500' : 'text-teal-500'}`}>{session.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                 </div>
               ))}
               {data.recentSessions.length === 0 && (
                 <div className="py-10 text-center text-slate-400 italic text-sm">No recent sessions.</div>
               )}
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-[32px] p-8">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Recent Reports</h4>
            <div className="space-y-4">
              {data.recentReports.map(report => (
                <div key={report.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-teal-500 transition-colors">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{report.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {data.recentReports.length === 0 && (
                <p className="text-xs text-slate-400 italic">No reports generated yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
