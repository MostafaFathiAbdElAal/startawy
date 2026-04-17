import { getConsultantSessions } from '@/app/actions/consultant';
import { redirect } from 'next/navigation';
import { Calendar, Clock, DollarSign, FileText } from 'lucide-react';

export default async function ConsultantSessionsPage() {
  const sessions = await getConsultantSessions();
  if (sessions === null) redirect('/logout');

  const now = new Date();

  const upcoming = sessions.filter(s => s.date > now);
  const completed = sessions.filter(s => s.date <= now);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  };

  const SessionCard = ({ s }: { s: typeof sessions[0] }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{s.founderName}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{s.businessName}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${statusBadge(s.paymentStatus)}`}>
          {s.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4 text-teal-500" />
          <span>{new Date(s.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 text-teal-500" />
          <span>{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{s.duration}</span>
        </div>
        {s.amount > 0 && (
          <div className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400">
            <DollarSign className="w-4 h-4" />
            <span>${s.amount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {s.notes && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{s.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Sessions</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all your consulting sessions.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-black text-gray-900 dark:text-white">{sessions.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-black text-teal-600">{upcoming.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-black text-blue-600">{completed.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full" />
            Upcoming ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map(s => <SessionCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Completed ({completed.length})
        </h2>
        {completed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map(s => <SessionCard key={s.id} s={s} />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No completed sessions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
