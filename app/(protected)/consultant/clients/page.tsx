import { getConsultantClients } from '@/app/actions/consultant';
import { redirect } from 'next/navigation';
import { Users, Briefcase, BarChart3, Calendar, Mail } from 'lucide-react';

export default async function ConsultantClientsPage() {
  const clients = await getConsultantClients();
  if (clients === null) redirect('/logout');

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Clients</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {clients.length > 0
            ? `You have ${clients.length} client${clients.length > 1 ? 's' : ''} who have booked sessions with you.`
            : 'No clients yet. Clients will appear here once they book a session with you.'}
        </p>
      </div>

      {clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map(client => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-teal-500/5 to-blue-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{client.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="font-medium">{client.businessName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{client.businessSector}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{client.totalSessions} session{client.totalSessions !== 1 ? 's' : ''} with you</span>
                </div>
                {client.lastBudgetAnalysis && (
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg mt-2">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">Last Budget Analysis</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">${client.lastBudgetAnalysis.totalBudget.toLocaleString()}</p>
                        <p>Total</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">${client.lastBudgetAnalysis.fixedCost.toLocaleString()}</p>
                        <p>Fixed</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">${client.lastBudgetAnalysis.variableCost.toLocaleString()}</p>
                        <p>Variable</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5">
                <a
                  href={`mailto:${client.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-bold hover:bg-teal-500/10 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Client
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center">
          <Users className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Clients Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Once startup founders book sessions with you, their profiles will appear here with their budget analyses.
          </p>
        </div>
      )}
    </div>
  );
}
