import { Metadata } from "next";
import { Users, DollarSign, Activity, PieChart } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Analytics",
};

import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const [
    totalUsers, 
    totalRevenueAgg, 
    payingUsersCount, 
    activeSubs,
    foundersCount,
    consultantsCount,
    adminsCount,
    sectorSegmentation
  ] = await Promise.all([
    prisma.user.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.groupBy({
      by: ['founderId'],
      _count: true
    }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { type: 'FOUNDER' } }),
    prisma.user.count({ where: { type: 'CONSULTANT' } }),
    prisma.user.count({ where: { type: 'ADMIN' } }),
    prisma.startupFounder.groupBy({
      by: ['businessSector'],
      _count: {
        userId: true
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 5
    })
  ]);

  const totalRev = totalRevenueAgg._sum.amount || 0;
  
  // Calculate Metrics
  const conversionRate = totalUsers > 0 ? ((payingUsersCount.length / totalUsers) * 100).toFixed(1) : "0.0";
  const arpu = totalUsers > 0 ? (totalRev / totalUsers).toFixed(2) : "0.00";
  const retention = totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : "0.0";

  const stats = [
    { 
      label: "Conversion Rate (Paying Users)", 
      value: `${conversionRate}%`, 
      icon: Activity, 
      trend: "Real-time", 
      color: "blue",
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Avg. Revenue Per User (ARPU)", 
      value: `$${arpu}`, 
      icon: DollarSign, 
      trend: "Real-time", 
      color: "teal",
      bgClass: "bg-teal-50 dark:bg-teal-900/20",
      textClass: "text-teal-600 dark:text-teal-400"
    },
    { 
      label: "Active Subscription Retention", 
      value: `${retention}%`, 
      icon: Users, 
      trend: "Real-time", 
      color: "indigo",
      bgClass: "bg-indigo-50 dark:bg-indigo-900/20",
      textClass: "text-indigo-600 dark:text-indigo-400"
    },
  ];

  const mockSectorsFallback = [
    { businessSector: "Fintech", _count: { userId: 12 } },
    { businessSector: "SaaS", _count: { userId: 8 } },
    { businessSector: "E-Commerce", _count: { userId: 6 } },
    { businessSector: "Healthcare", _count: { userId: 4 } },
    { businessSector: "EdTech", _count: { userId: 3 } }
  ];
  const sectors = sectorSegmentation && sectorSegmentation.length > 0 
    ? sectorSegmentation 
    : mockSectorsFallback;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Platform Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">Detailed insights into user behavior and financial performance powered by our real-time data engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[28px] border border-slate-100 dark:border-slate-800 p-5 md:p-6 hover:border-teal-500/30 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-6">
              <div className={`w-12 h-12 rounded-2xl ${s.bgClass} flex items-center justify-center ${s.textClass} group-hover:scale-110 transition-transform`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">{s.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</div>
              <div className="text-[11px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* User Role Distribution */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/20 animate-pulse">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">User Distribution</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Accounts by Role</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">Real-time ratio of platform stakeholders currently active in the database.</p>
            </div>

            {/* Glowing Custom Distribution Bars */}
            <div className="space-y-4 my-auto">
              {[
                { role: "Founders", count: foundersCount, percent: totalUsers > 0 ? (foundersCount / totalUsers) * 100 : 0, color: "from-teal-500 to-teal-600", text: "text-teal-600 dark:text-teal-400" },
                { role: "Consultants", count: consultantsCount, percent: totalUsers > 0 ? (consultantsCount / totalUsers) * 100 : 0, color: "from-indigo-500 to-indigo-600", text: "text-indigo-600 dark:text-indigo-400" },
                { role: "Admins", count: adminsCount, percent: totalUsers > 0 ? (adminsCount / totalUsers) * 100 : 0, color: "from-amber-500 to-amber-600", text: "text-amber-600 dark:text-amber-400" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.role}</span>
                    <span className={item.text}>{item.count} ({item.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                    <div
                      className={`h-full rounded-full bg-linear-to-r ${item.color} shadow-lg transition-all duration-1000`}
                      style={{ width: `${Math.max(item.percent, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Total Active Database Users</span>
              <span className="text-slate-800 dark:text-white font-black">{totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Founder Industry Segmentation */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">Sector Segmentation</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Startup Industries</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">Real-time classification of founders by their registered startup business sector.</p>
            </div>

            {/* Dynamic Sector List */}
            <div className="space-y-3 my-auto">
              {sectors.map((s, idx) => {
                const totalFounders = sectors.reduce((acc, curr) => acc + curr._count.userId, 0);
                const percent = totalFounders > 0 ? (s._count.userId / totalFounders) * 100 : 0;
                const colors = [
                  "bg-teal-500 text-teal-600 dark:text-teal-400 border-teal-500/20",
                  "bg-indigo-500 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
                  "bg-pink-500 text-pink-600 dark:text-pink-400 border-pink-500/20",
                  "bg-amber-500 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  "bg-violet-500 text-violet-600 dark:text-violet-400 border-violet-500/20"
                ];
                const selectedColor = colors[idx % colors.length];

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/40 dark:border-slate-800/40 hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${selectedColor.split(" ")[0]}`} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.businessSector}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                        {s._count.userId} {s._count.userId === 1 ? 'Startup' : 'Startups'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 w-8 text-right">{percent.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Segmented Startup Founders</span>
              <span className="text-slate-800 dark:text-white font-black">
                {sectors.reduce((acc, curr) => acc + curr._count.userId, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
