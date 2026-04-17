'use server';

import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

interface GrowthPoint {
  month: string;
  value: number;
}

export async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) {
    return null;
  }

  // Fetch full user data including relations
  const userData = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { 
      founder: true,
      consultant: true,
      admin: true
    }
  });

  if (!userData) {
    return null;
  }

  const role = userData.type;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // --- Logic for STARTUP FOUNDER ---
  if (role === 'FOUNDER' && userData.founder) {
    const founderId = userData.founder.id;

    // 1. Stats
    const totalPayments = await prisma.payment.aggregate({
      where: { founderId },
      _sum: { amount: true }
    });

    const upcomingSessionsCount = await prisma.session.count({
      where: { founderId, date: { gte: new Date() } }
    });

    const budgetAnalyses = await prisma.budgetAnalysis.findMany({
      where: { founderId },
      orderBy: { createdAt: 'desc' },
      take: 2
    });

    // 2. Activities & Upcoming
    const recentPayments = await prisma.payment.findMany({
      where: { founderId },
      take: 3,
      orderBy: { transDate: 'desc' }
    });

    const upcomingSessions = await prisma.session.findMany({
      where: { founderId, date: { gte: new Date() } },
      take: 2,
      include: { consultant: { include: { user: true } } },
      orderBy: { date: 'asc' }
    });

    // 3. Charts Data
    const payments = await prisma.payment.findMany({
      where: { founderId, transDate: { gte: sixMonthsAgo } },
      select: { amount: true, transDate: true }
    });

    const revenueData = [];
    const growthData = [];
    let currentTotal = 0;
    let prevTotal = 0;

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthStr = monthNames[m];

      const monthPayments = payments.filter(p => p.transDate.getMonth() === m && p.transDate.getFullYear() === y);
      const amountSpent = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      revenueData.push({ month: monthStr, revenue: amountSpent, expenses: amountSpent * 0.2 });
      
      const prevVal: number = growthData.length > 0 ? (growthData[growthData.length - 1] as GrowthPoint).value : 0;
      growthData.push({ month: monthStr, value: prevVal + (monthPayments.length * 10) });

      if (i === 0) currentTotal = amountSpent;
      else if (i === 1) prevTotal = amountSpent;
    }

    const growth = prevTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - prevTotal) / prevTotal) * 100;

    return {
      user: userData,
      stats: {
        totalRevenue: totalPayments._sum.amount || 0,
        monthlyProfit: (budgetAnalyses[0]?.totalBudget || 0), // Mapping budget for founders
        activeClients: upcomingSessionsCount, // Mapping upcoming sessions as "Active" for founders
        targetAchievement: budgetAnalyses[1] ? ((budgetAnalyses[0].totalBudget / budgetAnalyses[1].totalBudget) * 100) : 100,
        revenueGrowth: Number(growth.toFixed(1)),
        profitGrowth: 0,
        clientsGrowth: upcomingSessionsCount > 0 ? 100 : 0,
        targetGrowth: 0
      },
      recentActivities: recentPayments.map(p => ({
        id: p.id,
        type: 'PAYMENT',
        title: 'Payment processed',
        description: `$${p.amount} for ${p.paymentType}`,
        date: p.transDate
      })),
      upcomingSessions: upcomingSessions.map(s => ({
        id: s.id,
        title: 'Strategy Session',
        consultant: s.consultant.user.name,
        date: s.date,
        status: 'Upcoming'
      })),
      revenueData,
      growthData
    };
  }

  // --- Logic for FINANCIAL CONSULTANT ---
  if (role === 'CONSULTANT' && userData.consultant) {
    const consultantId = userData.consultant.id;

    // 1. Fetch sessions with payments
    const sessions = await prisma.session.findMany({
      where: { consultantId },
      include: { 
        payment: true,
        founder: { include: { user: true } }
      },
      orderBy: { date: 'desc' }
    });

    const completedSessions = sessions.filter(s => new Date(s.date) < new Date());
    const upcomingSessions = sessions.filter(s => new Date(s.date) >= new Date());
    
    // 2. Stats Calculation
    const totalEarnings = sessions.reduce((sum, s) => sum + (s.payment?.amount || 0), 0);
    const uniqueClientsCount = new Set(sessions.map(s => s.founderId)).size;
    
    // Calculate Monthly Growth (Last 30 days vs Previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const currentMonthSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
    const earningsGrowth = sessions.length > 0 ? (currentMonthSessions.length / sessions.length) * 100 : 0;

    // 3. Charts Data
    const revenueData = [];
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const monthStr = monthNames[m];
      
      const monthSessions = sessions.filter(s => new Date(s.date).getMonth() === m);
      const monthEarnings = monthSessions.reduce((sum, s) => sum + (s.payment?.amount || 0), 0);
      
      revenueData.push({ month: monthStr, revenue: monthEarnings, expenses: 0 }); // Consultants don't have platform expenses here
      const prevVal: number = growthData.length > 0 ? (growthData[growthData.length - 1] as GrowthPoint).value : 0;
      growthData.push({ month: monthStr, value: prevVal + monthSessions.length });
    }

    return {
      user: userData,
      stats: {
        totalRevenue: totalEarnings,
        monthlyProfit: completedSessions.length, // Mapping completed sessions here
        activeClients: uniqueClientsCount,
        targetAchievement: 0,
        revenueGrowth: Number(earningsGrowth.toFixed(1)),
        profitGrowth: 0,
        clientsGrowth: uniqueClientsCount > 0 ? 100 : 0,
        targetGrowth: 0
      },
      recentActivities: completedSessions.slice(0, 3).map(s => ({
        id: s.id,
        type: 'SESSION',
        title: 'Session Completed',
        description: `Consultation with ${s.founder.user.name}`,
        date: s.date
      })),
      upcomingSessions: upcomingSessions.slice(0, 2).map(s => ({
        id: s.id,
        title: 'Founder Consultation',
        consultant: s.founder.user.name, // In consultant view, we show the founder name in this field
        date: s.date,
        status: s.paymentStatus === 'PAID' ? 'Confirmed' : 'Pending'
      })),
      revenueData,
      growthData
    };
  }

  // --- Logic for ADMIN (Default fallback to global) ---
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true }
  });

  const activeClients = await prisma.startupFounder.count();

  const recentPayments = await prisma.payment.findMany({
    take: 3,
    orderBy: { transDate: 'desc' },
    include: { founder: { include: { user: true } } }
  });

  const upcomingSessions = await prisma.session.findMany({
    take: 2,
    where: { date: { gte: new Date() } },
    include: { consultant: { include: { user: true } } },
    orderBy: { date: 'asc' }
  });

  const recentAllPayments = await prisma.payment.findMany({
    where: { transDate: { gte: sixMonthsAgo } },
    select: { amount: true, transDate: true }
  });

  const recentUsers = await prisma.startupFounder.findMany({
    include: { user: { select: { createdAt: true } } }
  });

  const revenueData = [];
  const growthData = [];
  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;
  let currentMonthClients = 0;
  let previousMonthClients = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthStr = monthNames[m];

    const monthPayments = recentAllPayments.filter(p => p.transDate.getMonth() === m && p.transDate.getFullYear() === y);
    const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const monthFounders = recentUsers.filter(f => 
       f.user && f.user.createdAt.getMonth() === m && f.user.createdAt.getFullYear() === y
    );
    const newClients = monthFounders.length;

    revenueData.push({ month: monthStr, revenue, expenses: revenue * 0.3 });
    
    const prevValue: number = growthData.length > 0 ? (growthData[growthData.length - 1] as GrowthPoint).value : 0;
    growthData.push({ month: monthStr, value: prevValue + (newClients * 100) }); 

    if (i === 0) {
      currentMonthRevenue = revenue;
      currentMonthClients = newClients;
    } else if (i === 1) {
      previousMonthRevenue = revenue;
      previousMonthClients = newClients;
    }
  }

  const calcGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    user: userData,
    stats: {
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyProfit: (totalRevenue._sum.amount || 0) * 0.15,
      activeClients,
      targetAchievement: 85,
      revenueGrowth: Number(calcGrowth(currentMonthRevenue, previousMonthRevenue).toFixed(1)),
      profitGrowth: 0,
      clientsGrowth: Number(calcGrowth(currentMonthClients, previousMonthClients).toFixed(1)),
      targetGrowth: 0,
    },
    recentActivities: recentPayments.map(p => ({
      id: p.id,
      type: 'PAYMENT',
      title: 'New payment',
      description: `$${p.amount} from ${p.founder.user.name}`,
      date: p.transDate,
    })),
    upcomingSessions: upcomingSessions.map(s => ({
      id: s.id,
      title: 'Global Review',
      consultant: s.consultant.user.name,
      date: s.date,
      status: 'Upcoming',
    })),
    revenueData,
    growthData,
  };
}
