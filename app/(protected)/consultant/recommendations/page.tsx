import { getConsultantClients } from '@/app/actions/consultant';
import { getConsultantRecommendations } from '@/app/actions/recommendation';
import { redirect } from 'next/navigation';
import { Lightbulb, User, Clock, Send, Info } from 'lucide-react';
import RecommendationForm from './RecommendationForm';

export default async function ConsultantRecommendationsPage() {
  const [clients, recommendations] = await Promise.all([
    getConsultantClients(),
    getConsultantRecommendations()
  ]);

  if (!clients || !recommendations) {
    redirect('/logout');
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3 justify-center sm:justify-start">
          <Lightbulb className="w-8 h-8 text-orange-400" />
          Strategic Recommendations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Provide your professional advice and strategic recommendations to startup founders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-teal-500" />
              Writing Advice
            </h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Focus on immediate cash-flow improvements.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Suggest cost-cutting measures for high-burn departments.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-teal-500 font-bold">•</span>
                <span>Encourage diversified revenue streams for stability.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-black text-lg mb-2">Platform Goal</h4>
              <p className="text-sm text-teal-50/90 leading-relaxed">
                We aim to help founders optimize their budgets through your expert guidance. Every recommendation counts.
              </p>
            </div>
            <Lightbulb className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <RecommendationForm clients={clients} />

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-500" />
              Recently Sent
            </h3>
            
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((recItem) => (
                  <div key={recItem.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        {recItem.founder?.user?.name && (
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{recItem.founder.user.name}</p>
                        )}
                        <p className="text-xs text-gray-500">{new Date(recItem.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400">{recItem.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        recItem.status === 'ADOPTED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {recItem.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-50">
                <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={1} />
                <p className="text-sm">You haven&apos;t sent any recommendations yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
