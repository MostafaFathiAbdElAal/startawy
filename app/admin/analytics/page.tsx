import { Metadata } from "next";
import { BarChart3, Users, DollarSign, Activity, PieChart } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Analytics",
};

import { prisma } from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const [totalUsers, totalRevenueAgg, payingUsersCount, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.groupBy({
      by: ['founderId'],
      _count: true
    }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } })
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
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 h-[350px] md:h-[450px] flex items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="max-w-xs relative z-10">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Traffic Distribution</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Detailed traffic source analytics will be available once the tracking pixel is deployed to production.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 h-[350px] md:h-[450px] flex items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="max-w-xs relative z-10">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-700">
              <PieChart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Detailed Segmentation</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Segmentation of data by industry and region is currently being processed by our AI data engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
