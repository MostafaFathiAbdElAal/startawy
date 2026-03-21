import { Calendar, Award, Globe } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    sessions: number;
    reports: number;
    projects: number;
  };
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    { label: 'Sessions', value: stats.sessions, icon: Calendar, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Reports', value: stats.reports, icon: Award, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Projects', value: stats.projects, icon: Globe, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:border-teal-500/30 transition-colors group"
        >
          <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
            <stat.icon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-1">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
