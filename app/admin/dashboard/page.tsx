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
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Section */}
      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
          Platform <span className="text-teal-600">Overview</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
          Monitor system health, analyze growth trends, and manage your community Consultants and Founders in real-time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color = stat.iconColor.includes('teal') ? 'teal' : stat.iconColor.includes('blue') ? 'blue' : stat.iconColor.includes('green') ? 'emerald' : 'purple';
          return (
            <div key={index} className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${color}-500/20 transition-colors z-0`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 ${stat.bgColor} ${stat.iconColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-500/10 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-black mt-3 uppercase tracking-widest bg-teal-500/5 inline-block px-3 py-1 rounded-full">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <AdminRevenueChart data={chartData} />

          {/* Recent Registrations Card */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Registrations</h2>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl">
                <Link href="/admin/founders" className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl">
                  Founders
                </Link>
                <Link href="/admin/consultants" className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-xl">
                  Consultants
                </Link>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Details</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="group hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white dark:border-slate-800 ${!u.image ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-sm">
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight group-hover:text-teal-600 transition-colors leading-none mb-1">{u.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                          {u.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          u.isSuspended ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-green-50 text-green-600 border border-green-100"
                        }`}>
                          {u.isSuspended ? "SUSPENDED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">
                        {new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden p-6 space-y-4">
              {recentUsers.map((u) => (
                <div key={u.id} className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                      {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-teal-600">{u.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight leading-none mb-1">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[8px] font-black uppercase">{u.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feedbacks Card */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 h-full overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Feedbacks</h2>
              <Link href="/admin/feedback" className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </Link>
            </div>
            <div className="p-8 space-y-8">
              {recentFeedbacks.length === 0 ? (
                <p className="text-center text-slate-400 py-12">No feedback received yet.</p>
              ) : (
                recentFeedbacks.map((f) => (
                  <div key={f.id} className="group relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-teal-600 text-xs uppercase shadow-sm">
                          {f.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-tight">{f.user.name}</p>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:border-teal-500/20 transition-colors">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                        &ldquo;{f.comment}&rdquo;
                      </p>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3 ml-2">
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
