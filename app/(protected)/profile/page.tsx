import { Metadata } from "next";
import { getProfileData } from "@/app/actions/user";

export const metadata: Metadata = {
  title: "My Profile",
};

import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileDetails from "./ProfileDetails";
import ProfileEditForm from "./ProfileEditForm";
import SecurityActions from "./SecurityActions";
import { Award } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const data = await getProfileData();
  const params = await searchParams;
  const isEditing = params.edit === 'true';

  if (!data) {
    redirect("/login");
  }

  const { user, stats, subscription, activePlan } = data;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      {/* Dynamic Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Account <span className="text-teal-500 font-extrabold">Settings</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
              Customize your profile and secure your account
            </p>
          </div>
        </div>

        {/* Profile Header (Server) */}
        <ProfileHeader user={user} isEditing={isEditing} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Stats Strip (Server) */}
          <ProfileStats stats={stats} userType={user.type} />

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-8 space-y-10">
            {/* Toggle between Edit Form and Static Details */}
            {isEditing ? (
              <ProfileEditForm user={user} />
            ) : (
              <ProfileDetails user={user} />
            )}

            {/* Security Actions (Client) */}
            <SecurityActions user={user} />
          </div>

          {/* SIDEBAR WIDGETS (Server) */}
          <div className="lg:col-span-4 space-y-10">
            {/* PLAN CARD */}
            {user.type === 'FOUNDER' && (
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                {/* Dynamic background blur based on plan type */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${activePlan.includes('Premium') || activePlan === 'Subscription'
                    ? 'bg-[#BF953F]/10 dark:bg-[#BF953F]/20'
                    : 'bg-teal-500/10 dark:bg-teal-500/20'
                  }`}
                />

                <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
                  <Award className={`w-6 h-6 ${activePlan.includes('Premium') || activePlan === 'Subscription'
                      ? 'text-[#BF953F]'
                      : 'text-teal-500 dark:text-teal-400'
                    }`} />
                  Your Plan
                </h3>

                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Active Plan</p>
                    <p className="text-3xl font-black mt-1">
                      {/* Handle previously recorded 'Subscription' as Premium fallback */}
                      {(activePlan === 'Subscription' ? 'Premium Plan' : activePlan).split(' ').map((word, idx) => {
                        // Style first word white, second word colored
                        if (idx === 0) return <span key={idx} className="text-slate-900 dark:text-white">{word} </span>;

                        const isPremium = activePlan.includes('Premium') || activePlan === 'Subscription';
                        return (
                          <span key={idx} className={isPremium ? "text-transparent bg-clip-text bg-linear-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]" : "text-teal-600 dark:text-teal-400"}>
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-white/10 uppercase tracking-tighter font-black text-sm">
                    <span className="text-slate-400 dark:text-slate-500">Next Bill</span>
                    <span className="text-slate-900 dark:text-white">{subscription ? formatDate(subscription.endDate) : 'N/A'}</span>
                  </div>
                  <Link
                    href="/my-plan"
                    className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center ${activePlan.includes('Premium') || activePlan === 'Subscription'
                        ? 'bg-linear-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-slate-900 hover:opacity-90'
                        : 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-900 hover:bg-teal-700 dark:hover:bg-teal-400 shadow-teal-500/20'
                      }`}
                  >
                    Manage Plan
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
