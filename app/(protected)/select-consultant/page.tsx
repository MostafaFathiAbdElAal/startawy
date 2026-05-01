import { Metadata } from "next";
import { Star, DollarSign, Award, ShieldCheck, Info, Users, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import UserAvatar from "@/components/ui/UserAvatar";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AssignFollowUpButton from "@/components/consultants/AssignFollowUpButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Select Follow-up Consultant",
};

export default async function SelectConsultantPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload || userPayload.role !== 'FOUNDER') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { 
        founder: {
            include: { 
                followUpConsultant: {
                    include: { user: { select: { name: true, image: true } } }
                } 
            }
        } 
    }
  });

  if (!user || !user.founder) {
    redirect('/complete-profile');
  }

  // If already assigned, show the success state instead of selection
  if (user.founder.followUpConsultant) {
      const c = user.founder.followUpConsultant;
      return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto mt-10 sm:mt-20">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 sm:p-12 text-center border border-emerald-100 dark:border-emerald-900/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                
                <div className="relative mb-8 inline-block">
                    <UserAvatar name={c.user.name} image={c.user.image} size="xl" isVerified={true} />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">Consultant Assigned!</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                    You have successfully selected <span className="font-bold text-emerald-600 underline">{c.user.name}</span> as your dedicated 1-year advisor.
                    This expert will now monitor your progress and send strategic recommendations to your dashboard.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <Link href="/founder/recommendations" className="w-full py-4 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 group">
                        Go to Recommendations
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/dashboard" className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
      );
  }

  // 1. Verify Premium Plan
  const latestPayment = await prisma.payment.findFirst({
    where: { 
      founderId: user.founder.id,
      subscription: { isNot: null }
    },
    orderBy: { transDate: 'desc' },
    include: { subscription: true }
  });

  const subscription = latestPayment?.subscription;
  const isActive = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate);
  const isPremium = isActive && (latestPayment?.amount || 0) >= 299;

  if (!isPremium) {
    return (
      <div className="px-4 py-12 sm:p-8 text-center max-w-2xl mx-auto mt-10 sm:mt-20 bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-amber-100 dark:border-amber-900/20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">Premium Feature Locked</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
          The one-year follow-up consultant feature is exclusive to our **Premium Plan** subscribers. 
          Upgrade your plan today to unlock dedicated strategic guidance.
        </p>
        <Link href="/my-plan" className="inline-block w-full sm:w-auto px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:scale-105 transition-all">
            Explore Premium Plan
        </Link>
      </div>
    );
  }

  // Fetch all available consultants
  const dbConsultants = await prisma.consultant.findMany({
    include: { 
        user: {
            select: { name: true, image: true }
        } 
    }
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="text-center md:text-left relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2">
          Choose Your <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-amber-600">Premium Advisor</span>
        </h1>
        <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto md:mx-0 leading-relaxed">
          As a Premium member, you get 1 year of dedicated follow-up. Select the expert who will guide your startup journey.
        </p>
      </div>

      {/* Info Card - Adaptive Theme */}
      <div className="bg-slate-50 dark:bg-linear-to-r dark:from-slate-900 dark:to-slate-800 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-transparent text-slate-900 dark:text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 blur-3xl rounded-full" />
        <div className="p-4 bg-amber-100 dark:bg-white/10 rounded-2xl shrink-0">
            <Info className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center sm:text-left space-y-2 relative z-10">
            <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Direct Advisory Access</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
                Selecting a consultant links them to your startup for 1 year. This is a **one-time selection** that cannot be changed once confirmed.
            </p>
        </div>
      </div>

      {/* Consultants Grid or Empty State */}
      {dbConsultants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {dbConsultants.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 flex flex-col h-full group hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="p-6 sm:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 relative">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={c.user.name}
                        image={c.user.image}
                        size="xl"
                        isVerified={true}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="font-black text-gray-900 dark:text-white text-xl truncate tracking-tight">{c.user.name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-900 dark:text-white">{c.rating}</span>
                        <span className="text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">({c.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
    
                {/* Consultant Info */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-2 block">Specialization</span>
                      <p className="text-gray-900 dark:text-white font-black text-base sm:text-lg leading-tight truncate">
                        {c.specialization}
                      </p>
                  </div>
    
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="truncate">{c.yearsOfExp} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm font-medium">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex items-baseline gap-1">
                          <span className="font-black text-gray-900 dark:text-white text-base">${c.sessionRate}</span>
                          <span className="text-[10px] uppercase font-black">per session</span>
                      </div>
                    </div>
                  </div>
    
                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                    <AssignFollowUpButton 
                        consultantId={c.id} 
                        consultantName={c.user.name}
                        isCurrentlyAssigned={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
      ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" strokeWidth={1} />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Consultants Available</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed px-6">
                We are currently onboarding new advisors. Please check back shortly to select your premium consultant.
              </p>
          </div>
      )}
    </div>
  );
}
