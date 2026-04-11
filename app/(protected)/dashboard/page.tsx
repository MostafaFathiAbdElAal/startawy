import { getDashboardData } from "@/app/actions/dashboard";
import { redirect } from "next/navigation";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  Clock,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "./DashboardCharts";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const { stats, recentActivities, upcomingSessions, revenueData, growthData, user } = data;

  return (
    <div className="p-4 sm:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here&apos;s what&apos;s happening with your startup today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8.2%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${stats.monthlyProfit.toLocaleString()}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Profit</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
              <span>+15.3%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.activeClients}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Active Clients</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
              <ArrowDownRight className="w-4 h-4" />
              <span>-2.4%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.targetAchievement}%</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Target Achievement</p>
        </div>
      </div>

      {/* Charts Section (Client Component) */}
      <DashboardCharts revenueData={revenueData} growthData={growthData} />

      {/* Recent Activities & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Recent Activities */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl p-0 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activities</h3>
            </div>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">Live Updates</span>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: { id: number; title: string; description: string; date: Date }) => (
                  <div key={activity.id} className="flex items-start gap-4 group cursor-default">
                    <div className="relative mt-1">
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 transition-colors">
                        <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{activity.title}</p>
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 opacity-60">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/30 rounded-full flex items-center justify-center mb-3">
                    <History className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent activity found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl p-0 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Sessions</h3>
            </div>
            <Link 
              href="/my-sessions" 
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="p-4 flex-1">
            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session: { id: number; title: string; status: string; consultant: string; date: Date }) => (
                  <div key={session.id} className="relative group overflow-hidden border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 bg-gray-50/30 dark:bg-gray-800/40 hover:border-teal-500/50 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-teal-500/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {session.consultant.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{session.title}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">with {session.consultant}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-teal-100/50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-md uppercase">
                        {session.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        <span>{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">No sessions scheduled</p>
                  <Link 
                    href="/book-consultant"
                    className="mt-4 px-5 py-2 bg-linear-to-r from-teal-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/25 hover:scale-105 transition-transform"
                  >
                    Book a Session
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
