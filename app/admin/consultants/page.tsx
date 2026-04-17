import { Metadata } from "next";
import { Users, CheckCircle, Calendar, DollarSign, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Consultants",
};

import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AddConsultantModal } from "@/components/admin/modals/AddConsultantModal";

export default async function ManageConsultantsPage() {
  const dbUsers = await prisma.user.findMany({
    where: { type: 'CONSULTANT' },
    include: { consultant: true },
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers = dbUsers.map(u => ({
    id: u.id,
    name: u.name || "Unknown",
    email: u.email,
    specialty: u.consultant?.specialization || "Consulting",
    status: u.isEmailVerified ? "ACTIVE" : "PENDING",
    joinedDate: new Intl.DateTimeFormat('en-GB').format(new Date(u.createdAt)),
    sessions: 0,
    revenue: "$0",
    rating: 0
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Consultants</h1>
          <p className="text-gray-600 dark:text-gray-400">Oversee consultant performance and availability</p>
        </div>
        <AddConsultantModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Consultants</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formattedUsers.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formattedUsers.filter((c) => c.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">$0</p>
        </div>
      </div>

      <AdminUsersTable data={formattedUsers} roleType="Consultant" />
    </div>
  );
}
