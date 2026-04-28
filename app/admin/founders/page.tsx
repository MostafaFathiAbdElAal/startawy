import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Users, CheckCircle, Zap, DollarSign } from "lucide-react";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = {
  title: "Founders Hub | Startup Management",
};

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

  const stats = [
    { label: "Total Founders", value: formattedUsers.length, icon: Users, color: "teal" },
    { label: "Active Network", value: formattedUsers.filter((f) => f.status === "ACTIVE").length, icon: CheckCircle, color: "emerald" },
    { label: "Premium Tier", value: formattedUsers.filter((f) => f.plan === "Premium").length, icon: Zap, color: "purple" },
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: "teal" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-12">
      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
          Founders <span className="text-teal-600">Hub</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
          The central command for monitoring startup growth, subscription health, and ecosystem engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${stat.color}-500/20 transition-colors z-0`} />
            <div className="relative z-10">
              <div className={`w-14 h-14 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${stat.color}-500/10 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <AdminUsersTable data={formattedUsers} roleType="Founder" />
    </div>
  );
}
