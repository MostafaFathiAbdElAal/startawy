import { getConsultantEarnings } from '@/app/actions/consultant';
import { redirect } from 'next/navigation';
import { DollarSign, TrendingDown, TrendingUp, Calendar, Receipt } from 'lucide-react';

export default async function ConsultantEarningsPage() {
  const data = await getConsultantEarnings();
  if (data === null) redirect('/logout');

  const { records, totalGross, totalNet, totalFee } = data;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Earnings</h1>
        <p className="text-gray-600 dark:text-gray-400">Detailed breakdown of your income from completed sessions.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg shadow-teal-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg uppercase">Net</span>
          </div>
          <p className="text-3xl font-black mb-1">
            ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-teal-100 text-sm">Total Net Earnings (after 15% fee)</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg uppercase">Gross</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Gross Earnings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-lg uppercase">Fee</span>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            ${totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platform Commission (15%)</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Receipt className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Earnings Ledger</h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{records.length} transactions</span>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                  <th className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-right">Gross</th>
                  <th className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-right">Platform Fee</th>
                  <th className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-right">Net Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{r.founderName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.businessName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(r.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 font-medium">
                      ${r.gross.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-red-500 dark:text-red-400 font-medium">
                      -${r.platformFee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-teal-600 dark:text-teal-400">
                        ${r.net.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Row */}
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600">
                  <td className="px-6 py-4 font-black text-gray-900 dark:text-white" colSpan={2}>Total</td>
                  <td className="px-6 py-4 text-right font-black text-gray-900 dark:text-white">${totalGross.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-black text-red-500">-${totalFee.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-black text-teal-600 dark:text-teal-400">${totalNet.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <DollarSign className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Earnings Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Your earnings from paid sessions will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
