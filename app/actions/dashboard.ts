'use server';

import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) {
    return null;
  }

  // Fetch full user data including name
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userPayload.id) },
    select: { name: true, email: true }
  });

  if (!user) return null;

  // Fetch basic stats
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true }
  });

  const activeClients = await prisma.startupFounder.count();

  // Fetch recent payments for activities
  const recentPayments = await prisma.payment.findMany({
    take: 3,
    orderBy: { transDate: 'desc' },
    include: {
      founder: {
        include: { user: true }
      }
    }
  });

  // Fetch upcoming sessions
  const upcomingSessions = await prisma.session.findMany({
    take: 2,
    where: {
      date: { gte: new Date() }
    },
    include: {
      consultant: {
        include: { user: true }
      }
    },
    orderBy: { date: 'asc' }
  });

  // Mock revenue data for chart (in a real app, this would be aggregated by month)
  const revenueData = [
    { month: "Jan", revenue: 12000, expenses: 8000 },
    { month: "Feb", revenue: 19000, expenses: 9500 },
    { month: "Mar", revenue: 15000, expenses: 10000 },
    { month: "Apr", revenue: 25000, expenses: 11000 },
    { month: "May", revenue: 22000, expenses: 10500 },
    { month: "Jun", revenue: 30000, expenses: 12000 },
  ];

  const growthData = [
    { month: "Jan", value: 4000 },
    { month: "Feb", value: 9500 },
    { month: "Mar", value: 5000 },
    { month: "Apr", value: 14000 },
    { month: "May", value: 11500 },
    { month: "Jun", value: 18000 },
  ];

  return {
    user,
    stats: {
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyProfit: (totalRevenue._sum.amount || 0) * 0.15, // Mock profit for now
      activeClients,
      targetAchievement: 87.5, // Mock achievement
    },
    recentActivities: recentPayments.map(p => ({
      id: p.id,
      type: 'PAYMENT',
      title: 'New payment received',
      description: `$${p.amount} from ${p.founder.user.name}`,
      date: p.transDate,
    })),
    upcomingSessions: upcomingSessions.map(s => ({
      id: s.id,
      title: 'Financial Review',
      consultant: s.consultant.user.name,
      date: s.date,
      status: 'Tomorrow', // Logic to determine this can be added
    })),
    revenueData,
    growthData,
  };
}
