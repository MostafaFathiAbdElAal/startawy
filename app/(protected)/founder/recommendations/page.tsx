import { Metadata } from "next";
import { getFounderRecommendations } from "@/app/actions/recommendation";
import { getProfileData } from "@/app/actions/user";
import SectionHeader from "@/components/ui/SectionHeader";
import { Lightbulb, Calendar, User, ArrowRight, Clock, ShieldCheck, UserCheck, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";

export const metadata: Metadata = {
  title: "Strategic Recommendations",
};

export const dynamic = 'force-dynamic';

export default async function RecommendationsPage() {
  const [recommendations, profile] = await Promise.all([
    getFounderRecommendations(),
    getProfileData()
  ]);
  
  if (!profile) {
    redirect("/logout");
  }

  // Recommendations can be empty, but should be []
  const safeRecommendations = recommendations || [];
  const assignedConsultant = profile.founder?.followUpConsultant;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <SectionHeader 
        title="Strategic Recommendations"
        description="Actionable insights and professional advice from your consultants."
      />

      {/* Assigned Consultant Info Card (Only if premium and assigned) */}
      {assignedConsultant && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-teal-500/10 to-emerald-500/5 dark:from-teal-500/20 dark:to-emerald-500/10 border border-teal-100 dark:border-teal-900/30 rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
              <div className="relative shrink-0">
                  <UserAvatar 
                    name={assignedConsultant.user.name}
                    image={assignedConsultant.user.image}
                    size="lg"
                    isVerified={true}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-1 rounded-full shadow-lg">
                      <UserCheck className="w-3 h-3" />
                  </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Your Dedicated Advisor</h4>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{assignedConsultant.user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This advisor is monitoring your startup and will send recommendations shortly.</p>
              </div>
          </div>

          {/* Strategy Blueprint Section (Follow-up Plan) */}
          {profile.founder?.followUpNotes && (
            <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/20 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-xl shadow-teal-500/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                <ShieldCheck className="w-24 h-24 text-teal-500" />
              </div>
              
              <div className="relative z-10 space-y-5 sm:space-y-6">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-xl shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Active Strategy Blueprint</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Long-term Follow-up Plan</p>
                  </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                    {profile.founder.followUpNotes}
                  </div>
                </div>

                {profile.founder?.followUpUpdatedAt && (
                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-500/5 w-fit px-3 py-1.5 rounded-full border border-teal-500/10">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="flex flex-wrap gap-1">
                      <span>Last updated:</span>
                      <span>{new Date(profile.founder.followUpUpdatedAt).toLocaleDateString('en-GB')}</span>
                      <span className="opacity-40">|</span>
                      <span>{new Date(profile.founder.followUpUpdatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                )}
                {!profile.founder?.followUpUpdatedAt && (
                   <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-500/5 w-fit px-3 py-1.5 rounded-full border border-teal-500/10">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Last updated by your advisor</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {safeRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeRecommendations.map((rec) => (
            <div key={rec.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 relative overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-6 right-6 font-bold uppercase tracking-widest text-[10px]">
                {rec.status === 'PENDING' && <span className="px-3 py-1 bg-amber-500 text-white rounded-full">PENDING</span>}
                {rec.status === 'ADOPTED' && <span className="px-3 py-1 bg-emerald-500 text-white rounded-full">ADOPTED</span>}
                {rec.status === 'REJECTED' && <span className="px-3 py-1 bg-red-500 text-white rounded-full">REJECTED</span>}
              </div>

              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Lightbulb className="w-7 h-7 text-teal-500" />
              </div>
              
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-2">{rec.category}</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-teal-500 transition-colors">{rec.title}</h3>
              
              <div className="flex flex-col gap-3 py-6 border-y border-slate-50 dark:border-slate-800/50 mb-6 font-medium">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                  <span>{rec.consultant.user.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                </div>
                {rec.impact && (
                   <div className="flex items-center gap-3 text-sm text-teal-600 dark:text-teal-400 font-bold">
                   <Clock className="w-4 h-4" />
                   <span>Target: {rec.impact}</span>
                 </div>
                )}
              </div>

              <Link 
                href={`/founder/recommendations/${rec.id}`} 
                className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-slate-800 hover:bg-teal-500 hover:text-white rounded-2xl transition-all duration-300 group/btn"
              >
                <span className="font-bold text-sm">Read Full Strategy</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] sm:rounded-[40px] p-10 sm:p-20 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {profile.founder?.followUpNotes ? "Specific Advice Pending" : "No Recommendations Yet"}
          </h3>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
            {profile.founder?.followUpNotes 
                ? "Your advisor has provided a general strategy blueprint above. Individual actionable recommendations will appear here shortly."
                : (profile.hasPremiumPlan 
                    ? "Your assigned premium consultant will provide strategic advice and cost optimization plans here after analyzing your business."
                    : "Upgrade to Premium to get a dedicated consultant who will provide weekly strategic recommendations for your startup.")
            }
          </p>
          {!profile.hasPremiumPlan && (
              <Link href="/my-plan" className="mt-8 inline-block px-8 py-3 bg-teal-500 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-teal-500/20">
                  Upgrade to Premium
              </Link>
          )}
        </div>
      )}
    </div>
  );
}
