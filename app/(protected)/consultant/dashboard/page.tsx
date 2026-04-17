import { getConsultantDashboardData } from '@/app/actions/consultant';
import { redirect } from 'next/navigation';
import {
  DollarSign, Users, Calendar, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { ConsultantCharts } from './ConsultantCharts';

export default async function ConsultantDashboardPage() {
  const data = await getConsultantDashboardData();

  if (!data) {
    redirect('/logout');
  }

  const { user, stats, upcomingSessions, recentCompletedSessions, earningsData } = data;

  const renderIndicator = (growth: number) => {
    if (growth === 0) {
      return (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm font-medium">
          <span>0.0%</span>
        </div>
      );
    }
    const isPositive = growth > 0;
    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{isPositive ? '+' : ''}{growth}%</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name?.split(' ')[0] || 'Consultant'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here&apos;s your consulting activity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Net Earnings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            {renderIndicator(stats.earningsGrowth)}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${stats.totalNetEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Net Earnings</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
              <span>Total</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.activeClients}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Active Clients</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
              <span>All time</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalSessions}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Sessions</p>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
              <span>Scheduled</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.upcomingSessions}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Upcoming Sessions</p>
        </div>
      </div>

      {/* Charts */}
      <ConsultantCharts earningsData={earningsData} />

      {/* Lower Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Upcoming Sessions Panel */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Sessions</h3>
            </div>
            <Link href="/consultant/sessions" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 px-3 py-1.5 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          <div className="p-4 flex-1">
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.founderName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.businessName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${getStatusBadge(s.paymentStatus)}`}>
                        {s.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-60">
                <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Sessions */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Completed</h3>
            </div>
            <Link href="/consultant/earnings" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 px-3 py-1.5 rounded-lg transition-colors">
              View Earnings
            </Link>
          </div>
          <div className="p-4 flex-1">
            {recentCompletedSessions.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{s.founderName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.businessName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(s.date).toLocaleDateString()}</p>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        +${(s.amount * 0.85).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 opacity-60">
                <DollarSign className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No completed sessions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
