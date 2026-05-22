import { Metadata } from "next";
import { Users, CheckCircle, Calendar, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Consultants",
};

import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AddConsultantModal } from "@/components/admin/modals/AddConsultantModal";

export default async function ManageConsultantsPage() {
  const dbUsers = await prisma.user.findMany({
    where: { type: 'CONSULTANT' },
    include: { consultant: true },
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers = dbUsers.map(u => ({
    id: u.id,
    name: u.name || "Unknown",
    email: u.email,
    specialty: u.consultant?.specialization || "Consulting",
    status: u.isSuspended ? "SUSPENDED" : "ACTIVE",
    joinedDate: new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt)),
    sessions: 0,
    revenue: "$0",
    rating: 0,
    yearsOfExp: u.consultant?.yearsOfExp || 0,
    sessionRate: u.consultant?.sessionRate || 150,
    image: u.image || undefined
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-12">
      <div className="mb-10 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
            Consultants <span className="text-teal-600">Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-sm md:text-base leading-relaxed">
            Monitor, manage, and scale your network of elite financial consultants with precision and real-time analytics.
          </p>
        </div>
        <div className="w-full lg:w-auto">
          <AddConsultantModal />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Consultants", value: formattedUsers.length, icon: Users, color: "teal" },
          { label: "Active Experts", value: formattedUsers.filter((c) => c.status === "ACTIVE").length, icon: CheckCircle, color: "emerald" },
          { label: "Total Sessions", value: "0", icon: Calendar, color: "blue" },
          { label: "Total Earnings", value: "$0", icon: DollarSign, color: "indigo" },
        ].map((stat, i) => (
          <div key={i} className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${stat.color}-500/20 transition-colors z-0`} />
            <div className="relative z-10">
              <div className={`w-14 h-14 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${stat.color}-500/10 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <AdminUsersTable data={formattedUsers} roleType="Consultant" />
    </div>
  );
}
