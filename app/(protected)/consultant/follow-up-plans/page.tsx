import { getConsultantSessions } from '@/app/actions/consultant';
import { redirect } from 'next/navigation';
import { FileText, Calendar, User, Search } from 'lucide-react';
import Link from 'next/link';

export default async function ConsultantFollowUpPlansPage() {
  const sessions = await getConsultantSessions();
  if (sessions === null) redirect('/logout');

  // We only show follow-up plans for COMPLETED sessions
  const now = new Date();
  const completedSessions = sessions.filter(s => s.date <= now);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Follow-Up Plans</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and edit action plans for your completed sessions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {completedSessions.length > 0 ? (
          completedSessions.map((session) => (
            <div 
              key={session.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{session.founderName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{session.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold text-xs uppercase">
                      Completed
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-teal-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white">Current Plan / Notes</h4>
                  </div>
                  {session.notes ? (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {session.notes}
                    </p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                      No follow-up plan has been created for this session yet.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-500/20">
                    <FileText className="w-4 h-4" />
                    Edit Follow-Up Plan
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
            <Search className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Plans to Manage</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Follow-up plans are associated with completed sessions. Once you finish a session, you can create a plan here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
