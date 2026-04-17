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
    { label: "Conversion Rate (Paying USers)", value: `${conversionRate}%`, icon: Activity, trend: "Real-time", color: "blue" },
    { label: "Avg. Revenue Per User (ARPU)", value: `$${arpu}`, icon: DollarSign, trend: "Real-time", color: "teal" },
    { label: "Active Subscription Retention", value: `${retention}%`, icon: Users, trend: "Real-time", color: "indigo" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Detailed insights into user behavior and financial performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-${s.color}-50 dark:bg-${s.color}-900/20 rounded-xl`}>
                <s.icon className={`w-6 h-6 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              <span className="text-green-500 text-xs font-bold">{s.trend}</span>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 h-[400px] flex items-center justify-center text-center">
          <div className="max-w-xs">
            <BarChart3 className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Traffic Distribution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed traffic source analytics will be available once the tracking pixel is deployed to production.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8 h-[400px] flex items-center justify-center text-center">
          <div className="max-w-xs">
            <PieChart className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Detailed Segmentation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Segmentation of data by industry and region is currently being processed by the data engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
