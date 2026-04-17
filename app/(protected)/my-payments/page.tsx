import { Metadata } from "next";
import { CreditCard, Calendar, Download, Filter, Package, Users, DollarSign, CheckCircle } from "lucide-react";

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
    const isPlan = p.paymentType === 'Subscription';
    return {
      id: p.id,
      type: isPlan ? "plan" : "session",
      plan: isPlan ? (p.amount === 299 ? 'Premium Plan' : 'Basic Plan') : null,
      consultant: !isPlan && p.session?.consultant?.user?.name ? p.session.consultant.user.name : "Consultant",
      sessionType: !isPlan && p.session?.consultant?.specialization ? p.session.consultant.specialization : "Session",
      amount: `$${p.amount.toFixed(2)}`,
      date: new Date(p.transDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Completed",
      paymentMethod: p.paymentMethod === 'card' ? 'Visa •••• 4242' : 'Mobile Billing',
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Payments</h1>
        <p className="text-gray-600 dark:text-gray-400">View all your payment history and invoices</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Plan Payments</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{planPayments}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Session Payments</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{sessionPayments}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div className="flex gap-2">
            <Link
              href="?filter=all"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterType === "all"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              All
            </Link>
            <Link
              href="?filter=plan"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterType === "plan"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Plans Only
            </Link>
            <Link
              href="?filter=session"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterType === "session"
                  ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              Sessions Only
            </Link>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No payments found.</div>
          ) : (
             <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {payment.type === "plan" ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full text-xs font-medium">
                          <Package className="w-3 h-3" />
                          Plan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                          <Users className="w-3 h-3" />
                          Session
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.type === "plan" ? (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{payment.plan}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{payment.sessionType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">with {payment.consultant}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">{payment.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{payment.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
