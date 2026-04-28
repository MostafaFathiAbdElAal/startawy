import { Metadata } from "next";
import { CreditCard, Calendar, Filter, Package, Users, DollarSign, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "My Payments",
};

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MyPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { founder: true }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  const resolvedParams = await searchParams;
  const filterType = (resolvedParams.filter as string) || "all";

  // Fetch from DB
  const dbPayments = await prisma.payment.findMany({
    where: { founderId: user.founder.id },
    include: {
      session: {
        include: { consultant: { include: { user: true } } }
      },
      subscription: true
    },
    orderBy: { transDate: 'desc' }
  });

  const payments = dbPayments.map((p) => {
    const isPlan = p.paymentType === 'Subscription' || p.paymentType?.includes('Plan');
    const paymentMethodLabel = p.paymentMethod === 'Stripe' ? 'Stripe / Card' : 
                               p.paymentMethod === 'card' ? 'Visa •••• 4242' : 
                               'Mobile Billing';

    return {
      id: p.id,
      type: isPlan ? "plan" : "session",
      plan: isPlan ? p.paymentType : null,
      consultant: !isPlan && p.session?.consultant?.user?.name ? p.session.consultant.user.name : "Consultant",
      sessionType: !isPlan ? `${p.session?.consultant?.specialization || "Consultation"} Session` : "Plan Subscription",
      amount: `$${p.amount.toFixed(2)}`,
      date: new Date(p.transDate).toLocaleDateString("en-GB"),
      status: "Completed",
      paymentMethod: paymentMethodLabel,
      invoice: `INV-${new Date(p.transDate).getFullYear()}-${String(p.id).padStart(3, '0')}`,
    };
  });


  const filteredPayments = filterType === "all" 
    ? payments 
    : payments.filter(p => p.type === filterType);

  const totalSpent = payments.reduce((sum, p) => {
    const amount = parseFloat(p.amount.replace('$', '').replace(',', ''));
    return sum + amount;
  }, 0);

  const planPayments = payments.filter(p => p.type === "plan").length;
  const sessionPayments = payments.filter(p => p.type === "session").length;

  return (
    <div className="p-3 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center md:text-left px-1 sm:px-0">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">My Payments</h1>
        <p className="text-[11px] sm:text-base text-gray-600 dark:text-gray-400 font-medium">View all your payment history and invoices</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[10px] sm:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Spent</p>
          </div>
          <p className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md hover:border-teal-200 dark:hover:border-teal-900/50 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center border border-teal-100 dark:border-teal-800/50 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-[10px] sm:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Plans</p>
          </div>
          <p className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{planPayments}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-[10px] sm:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sessions</p>
          </div>
          <p className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{sessionPayments}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-800/50 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-[10px] sm:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Orders</p>
          </div>
          <p className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-gray-100 dark:border-slate-800 p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-500 shrink-0" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
            <Link
              href="?filter=all"
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                filterType === "all"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20"
                  : "bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              All
            </Link>
            <Link
              href="?filter=plan"
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                filterType === "plan"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20"
                  : "bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Plans
            </Link>
            <Link
              href="?filter=session"
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                filterType === "session"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20"
                  : "bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              Sessions
            </Link>
          </div>
        </div>
      </div>
 
      {/* Payments List */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Payment History</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredPayments.length} Items</span>
        </div>
 
        <div className="p-0 sm:p-0">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">No payments found in your records.</div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="p-4 active:bg-gray-50 dark:active:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col gap-1">
                        {payment.type === "plan" ? (
                          <span className="w-fit inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-200/50 dark:border-teal-800/50">
                            <Package className="w-2.5 h-2.5" />
                            Plan Subscription
                          </span>
                        ) : (
                          <span className="w-fit inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-800/50">
                            <Users className="w-2.5 h-2.5" />
                            Consultation
                          </span>
                        )}
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-1">
                          {payment.type === "plan" ? payment.plan : payment.sessionType}
                        </h3>
                        {payment.type !== "plan" && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">with {payment.consultant}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{payment.amount}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-tighter font-black opacity-50">Date</span>
                          <span className="text-[10px] font-bold">{payment.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl">
                        <CreditCard className="w-3.5 h-3.5 text-purple-500" />
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-tighter font-black opacity-50">Method</span>
                          <span className="text-[10px] font-bold truncate max-w-[80px]">{payment.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest">{payment.invoice}</span>
                      <button className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">View Invoice</button>
                    </div>
                  </div>
                ))}
              </div>
 
              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Type</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Description</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Method</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          {payment.type === "plan" ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                              <Package className="w-3 h-3" />
                              Plan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                              <Users className="w-3 h-3" />
                              Session
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {payment.type === "plan" ? payment.plan : payment.sessionType}
                            </p>
                            {payment.type !== "plan" && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">with {payment.consultant}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="font-black text-slate-900 dark:text-white">{payment.amount}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold">{payment.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-bold">{payment.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle className="w-3 h-3" />
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
