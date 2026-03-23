import { Users, UserCheck, Package, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart"; // We will create this client component next

export default async function AdminDashboardPage() {
  const [totalUsersCount, activeSubs, totalReports, revenueAggregate, allPayments] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.startawyReport.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.payment.findMany({ select: { amount: true, transDate: true } })
  ]);

  const totalRevenue = revenueAggregate._sum.amount || 0;

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
      trend: "+12 this month",
      bgColor: "bg-teal-50 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: UserCheck,
      label: "Active Subscriptions",
      value: activeSubs.toLocaleString(),
      trend: "+3% vs last month",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      trend: "Measured in real-time",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: Package,
      label: "Global Library Reports",
      value: totalReports.toLocaleString(),
      trend: "+1 this month",
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
      createdAt: true
    }
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Here&apos;s your system status and top metrics today.</p>
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{stat.label}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Area Chart Component */}
      <AdminRevenueChart data={chartData} />

      {/* Recent Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Registrations</h2>
          <Link href="/admin/founders" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            View All Founders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      {u.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                      {u.isEmailVerified ? "ACTIVE" : "PENDING"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
