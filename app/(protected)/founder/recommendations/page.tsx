import { Metadata } from "next";
import { getFounderRecommendations } from "@/app/actions/recommendation";

export const metadata: Metadata = {
  title: "Strategic Recommendations",
};

import SectionHeader from "@/components/ui/SectionHeader";
import { Lightbulb, Calendar, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RecommendationsPage() {
  const recommendations = await getFounderRecommendations();
  
  if (recommendations === null) {
    redirect("/logout");
  }

  return (
    <div className="p-8 space-y-8">
      <SectionHeader 
        title="Strategic Recommendations"
        description="Actionable insights and professional advice from your assigned consultants."
      />

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
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
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] p-20 text-center">
          <Lightbulb className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" strokeWidth={1} />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Recommendations Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Your assigned consultant will provide strategic advice and cost optimization plans here once they analyze your business.
          </p>
        </div>
      )}
    </div>
  );
}
