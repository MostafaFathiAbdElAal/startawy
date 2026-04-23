import { Metadata } from "next";
import { Users, UserCheck, Package, DollarSign, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart"; // We will create this client component next

export default async function AdminDashboardPage() {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsersCount, usersThisMonth,
    activeSubs, activeSubsThisMonth, activeSubsLastMonth,
    totalReports, reportsThisMonth,
    allPayments
  ] = await Promise.all([
    prisma.user.count({ where: { type: { notIn: ['ADMIN'] } } }),
    prisma.user.count({ where: { type: { notIn: ['ADMIN'] }, createdAt: { gte: firstDayThisMonth } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { gte: firstDayThisMonth } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE', startDate: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
    prisma.startawyReport.count(),
    prisma.startawyReport.count({ where: { uploadDate: { gte: firstDayThisMonth } } }),
    prisma.payment.findMany({ select: { amount: true, transDate: true } })
  ]);

  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  let revenueThisMonth = 0;
  let revenueLastMonth = 0;
  allPayments.forEach(p => {
    const d = new Date(p.transDate);
    if (d >= firstDayThisMonth) {
      revenueThisMonth += p.amount;
    } else if (d >= firstDayLastMonth && d < firstDayThisMonth) {
      revenueLastMonth += p.amount;
    }
  });

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100% vs last month" : "0% vs last month";
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}% vs last month`;
  };

  // Calculate monthly revenue for the chart
  const monthlyDataMap = new Map<string, number>();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  allPayments.forEach(p => {
    const monthName = months[new Date(p.transDate).getMonth()];
    monthlyDataMap.set(monthName, (monthlyDataMap.get(monthName) || 0) + p.amount);
  });

  const chartData = Array.from(monthlyDataMap.entries()).map(([month, rev], i) => ({
    id: `rev-${i}`,
    month,
    revenue: rev
  }));

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: totalUsersCount.toLocaleString(),
      trend: `+${usersThisMonth} this month`,
      bgColor: "bg-teal-50 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: UserCheck,
      label: "Active Subscriptions",
      value: activeSubs.toLocaleString(),
      trend: calculateTrend(activeSubsThisMonth, activeSubsLastMonth),
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      trend: calculateTrend(revenueThisMonth, revenueLastMonth),
      bgColor: "bg-green-50 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Package,
      label: "Global Library Reports",
      value: totalReports.toLocaleString(),
      trend: `+${reportsThisMonth} this month`,
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  // Fetch recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      isEmailVerified: true,
      isSuspended: true,
      image: true,
      createdAt: true
    }
  });

  // Fetch recent feedbacks
  const recentFeedbacks = await prisma.feedback.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Platform Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Here&apos;s your system status and top metrics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-2 uppercase tracking-wider">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Area Chart Component - Left Column (Large) */}
        <div className="xl:col-span-2">
          <AdminRevenueChart data={chartData} />

          {/* Recent Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/10">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Recent Registrations</h2>
              <div className="flex gap-2">
                <Link href="/admin/founders" className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  Founders
                </Link>
                <Link href="/admin/consultants" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  Consultants
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${!u.image ? 'bg-teal-100 dark:bg-teal-900/30' : 'bg-transparent'} text-teal-600 dark:text-teal-400 rounded-full flex flex-col items-center justify-center font-bold text-sm shrink-0 overflow-hidden`}>
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name ? u.name.charAt(0).toUpperCase() : "U"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-tight">{u.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-[10px] font-black uppercase tracking-wider">
                          {u.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          u.isSuspended
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            : u.isEmailVerified || u.type === 'ADMIN'
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}>
                          {u.isSuspended ? "SUSPENDED" : (u.isEmailVerified || u.type === 'ADMIN' ? "ACTIVE" : "PENDING")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400 font-mono text-center">
                        {new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Feedbacks - Right Column (Narrow) */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 h-full">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/10">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Recent Feedback</h2>
              <Link href="/admin/feedback" className="text-xs font-black text-teal-600 hover:text-teal-700 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg transition-colors">
                All
              </Link>
            </div>
            <div className="p-6 space-y-6">
              {recentFeedbacks.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-12">No feedback received yet.</p>
              ) : (
                recentFeedbacks.map((f) => (
                  <div key={f.id} className="space-y-3 pb-6 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                          {f.user.name.charAt(0)}
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs uppercase">{f.user.name}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-800'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium italic">
                      &ldquo;{f.comment}&rdquo;
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {new Intl.DateTimeFormat('en-GB').format(new Date(f.createdAt))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
