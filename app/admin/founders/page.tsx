import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Startup Founders",
};

import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export default async function ManageFoundersPage() {
  const dbUsers = await prisma.user.findMany({
    where: { type: 'FOUNDER' },
    include: { 
      founder: {
        include: {
          payments: {
            orderBy: { transDate: 'desc' }
          }
        }
      } 
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers = dbUsers.map(u => {
    const payments = u.founder?.payments || [];
    const latestSub = payments.find(p => p.paymentType === 'Subscription');
    const planName = latestSub ? (latestSub.amount >= 299 ? 'Premium' : 'Basic') : 'Free Trial';
    
    return {
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      company: u.founder?.businessName || "Unknown",
      businessSector: u.founder?.businessSector || "General",
      plan: planName,
      status: u.isSuspended ? "SUSPENDED" : (u.isEmailVerified ? "ACTIVE" : "PENDING"),
      joinedDate: new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt)),
      sessions: 0,
      revenue: `$${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      image: u.image || undefined,
      phone: u.phone || ""
    };
  });

  const totalRevenue = formattedUsers.reduce((sum, u) => {
    const rev = parseFloat(u.revenue.replace('$', ''));
    return sum + (isNaN(rev) ? 0 : rev);
  }, 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Startup Founders</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and monitor all registered startup founders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Founders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formattedUsers.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Users</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formattedUsers.filter((f) => f.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Premium Users</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {formattedUsers.filter((f) => f.plan === "Premium").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <AdminUsersTable data={formattedUsers} roleType="Founder" />
    </div>
  );
}
