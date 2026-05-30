'use server';

import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper: get authenticated consultant record
async function getAuthConsultant() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);
  if (!userPayload) return null;

  const consultant = await prisma.consultant.findUnique({
    where: { userId: Number(userPayload.id) },
    include: { user: true },
  });
  return consultant;
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export async function getConsultantDashboardData() {
  const consultant = await getAuthConsultant();
  if (!consultant) return null;

  // All sessions for this consultant
  const allSessions = await prisma.session.findMany({
    where: { consultantId: consultant.id },
    include: {
      founder: { include: { user: true } },
      payment: true,
    },
    orderBy: { date: 'desc' },
  });

  const now = new Date();

  // Upcoming/completed sessions & active client counts
  const upcomingSessions = allSessions.filter(s => s.date > now);
  const completedSessions = allSessions.filter(s => s.date <= now);
  const uniqueClientIds = new Set(allSessions.map(s => s.founderId));
  const activeClients = uniqueClientIds.size;

  const PLATFORM_FEE = 0.15; // 15% platform commission
  const ADVISOR_COMMISSION_RATE = 0.40; // 40% advisor commission on plans

  // 1. Session Earnings
  const sessionGross = allSessions
    .filter(s => s.paymentStatus === 'PAID' && s.payment)
    .reduce((sum, s) => sum + (s.payment?.amount ?? 0), 0);
  const sessionNet = sessionGross * (1 - PLATFORM_FEE);

  // 2. Subscription Commission Earnings (followers who chose this consultant)
  const followedFounders = await prisma.startupFounder.findMany({
    where: { followUpConsultantId: consultant.id },
  });
  const followedFounderIds = followedFounders.map(f => f.id);

  const rawSubscriptionPayments = followedFounderIds.length > 0 ? await prisma.payment.findMany({
    where: {
      founderId: { in: followedFounderIds },
      sessionId: null,
    },
  }) : [];

  // Deduplicate subscription payments
  const uniqueSubsMap = new Map<string, typeof rawSubscriptionPayments[0]>();
  for (const p of rawSubscriptionPayments) {
    const key = p.paymentMethod || `${p.founderId}-${p.transDate.getTime()}-${p.amount}`;
    if (!uniqueSubsMap.has(key)) {
      uniqueSubsMap.set(key, p);
    }
  }
  const subscriptionPayments = Array.from(uniqueSubsMap.values());

  const subscriptionGross = subscriptionPayments.reduce((sum, p) => sum + p.amount, 0);
  const subscriptionNet = subscriptionGross * ADVISOR_COMMISSION_RATE;

  // Combined Net Earnings
  const totalNetEarnings = sessionNet + subscriptionNet;

  // Monthly earnings chart – last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const earningsData = [];
  let currentMonthEarnings = 0;
  let previousMonthEarnings = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();

    // Calculate session net for this month
    const monthSessions = allSessions.filter(
      s => s.date.getMonth() === m && s.date.getFullYear() === y && s.paymentStatus === 'PAID' && s.payment
    );
    const mSessionGross = monthSessions.reduce((sum, s) => sum + (s.payment?.amount ?? 0), 0);
    const mSessionNet = mSessionGross * (1 - PLATFORM_FEE);

    // Calculate subscription commission net for this month
    const monthSubscriptions = subscriptionPayments.filter(
      p => p.transDate.getMonth() === m && p.transDate.getFullYear() === y
    );
    const mSubGross = monthSubscriptions.reduce((sum, p) => sum + p.amount, 0);
    const mSubNet = mSubGross * ADVISOR_COMMISSION_RATE;

    const net = mSessionNet + mSubNet;
    const gross = mSessionGross + mSubGross;

    earningsData.push({ month: monthNames[m], gross, net });

    if (i === 0) currentMonthEarnings = net;
    if (i === 1) previousMonthEarnings = net;
  }

  // Growth vs last month
  const calcGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const earningsGrowth = calcGrowth(currentMonthEarnings, previousMonthEarnings);

  return {
    user: consultant.user,
    consultant,
    stats: {
      totalNetEarnings,
      activeClients,
      totalSessions: allSessions.length,
      upcomingSessions: upcomingSessions.length,
      earningsGrowth: Number(earningsGrowth.toFixed(1)),
    },
    upcomingSessions: upcomingSessions.slice(0, 3).map(s => ({
      id: s.id,
      founderName: s.founder.user.name,
      businessName: s.founder.businessName,
      date: s.date,
      duration: s.duration,
      paymentStatus: s.paymentStatus,
    })),
    recentCompletedSessions: completedSessions.slice(0, 3).map(s => ({
      id: s.id,
      founderName: s.founder.user.name,
      businessName: s.founder.businessName,
      date: s.date,
      amount: s.payment?.amount ?? 0,
      paymentStatus: s.paymentStatus,
    })),
    earningsData,
  };
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getConsultantSessions() {
  const consultant = await getAuthConsultant();
  if (!consultant) return null;

  const sessions = await prisma.session.findMany({
    where: { consultantId: consultant.id },
    include: {
      founder: { include: { user: true } },
      payment: true,
    },
    orderBy: { date: 'desc' },
  });

  return sessions.map(s => ({
    id: s.id,
    founderName: s.founder.user.name,
    founderEmail: s.founder.user.email,
    founderImage: s.founder.user.image,
    businessName: s.founder.businessName,
    date: s.date,
    duration: s.duration,
    notes: s.notes,
    paymentStatus: s.paymentStatus,
    amount: s.payment?.amount ?? 0,
    meetingLink: s.meetingLink,
  }));
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getConsultantClients() {
  const consultant = await getAuthConsultant();
  if (!consultant) return null;

  const sessions = await prisma.session.findMany({
    where: { consultantId: consultant.id },
    include: {
      founder: {
        include: {
          user: true,
          budgetAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
          sessions: { where: { consultantId: consultant.id } },
        }
      },
    },
  });

  // Deduplicate by founderId
  const foundersMap = new Map<number, typeof sessions[0]['founder']>();
  for (const s of sessions) {
    if (!foundersMap.has(s.founderId)) {
      foundersMap.set(s.founderId, s.founder);
    }
  }

  return Array.from(foundersMap.values()).map(f => ({
    id: f.id,
    name: f.user.name,
    email: f.user.email,
    businessName: f.businessName,
    businessSector: f.businessSector,
    totalSessions: f.sessions.length,
    lastBudgetAnalysis: f.budgetAnalyses[0] ?? null,
    image: f.user.image,
    joinedAt: f.user.createdAt,
  }));
}

export async function getConsultantEarnings() {
  const consultant = await getAuthConsultant();
  if (!consultant) return null;

  const PLATFORM_FEE = 0.15; // 15% platform commission
  const ADVISOR_COMMISSION_RATE = 0.40; // 40% advisor commission on premium plans

  // 1. Paid Sessions
  const paidSessions = await prisma.session.findMany({
    where: { consultantId: consultant.id, paymentStatus: 'PAID' },
    include: {
      founder: { include: { user: true } },
      payment: true,
    },
    orderBy: { date: 'desc' },
  });

  // 2. Premium subscription commissions (followers who chose this consultant)
  const followers = await prisma.startupFounder.findMany({
    where: { followUpConsultantId: consultant.id },
  });
  const followerIds = followers.map(f => f.id);

  const rawSubscriptionPayments = followerIds.length > 0 ? await prisma.payment.findMany({
    where: {
      founderId: { in: followerIds },
      sessionId: null,
    },
    include: {
      founder: { include: { user: true } },
    },
    orderBy: { transDate: 'desc' },
  }) : [];

  // Deduplicate subscription payments
  const uniqueSubsMap = new Map<string, typeof rawSubscriptionPayments[0]>();
  for (const p of rawSubscriptionPayments) {
    const key = p.paymentMethod || `${p.founderId}-${p.transDate.getTime()}-${p.amount}`;
    if (!uniqueSubsMap.has(key)) {
      uniqueSubsMap.set(key, p);
    }
  }
  const subscriptionPayments = Array.from(uniqueSubsMap.values());

  // Map session earnings
  const sessionRecords = paidSessions.map(s => {
    const gross = s.payment?.amount ?? 0;
    const fee = gross * PLATFORM_FEE;
    const net = gross * (1 - PLATFORM_FEE);
    return {
      id: `session-${s.id}`,
      founderName: s.founder.user.name,
      businessName: `${s.founder.businessName} (Session)`,
      date: s.date,
      gross,
      platformFee: fee,
      net,
    };
  });

  // Map subscription commissions
  const subscriptionRecords = subscriptionPayments.map(p => {
    const gross = p.amount;
    const net = gross * ADVISOR_COMMISSION_RATE;
    return {
      id: `sub-${p.id}`,
      founderName: p.founder.user.name,
      businessName: `${p.founder.businessName} (${p.paymentType || 'Premium'} Plan Commission)`,
      date: p.transDate,
      gross: net, // For advisors, their gross and net premium income are their commission
      platformFee: 0,
      net,
    };
  });

  // Merge and sort by date descending
  const records = [...sessionRecords, ...subscriptionRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalGross = records.reduce((sum, r) => sum + r.gross, 0);
  const totalNet = records.reduce((sum, r) => sum + r.net, 0);
  const totalFee = records.reduce((sum, r) => sum + r.platformFee, 0);

  return { records, totalGross, totalNet, totalFee };
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function updateConsultantAvailability(availability: string): Promise<{ success: boolean; error?: string }> {
  const consultant = await getAuthConsultant();
  if (!consultant) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.consultant.update({
      where: { id: consultant.id },
      data: { availability },
    });
    revalidatePath('/consultant/availability');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update availability.' };
  }
}

// ─── Add Session Note (Follow-up) ─────────────────────────────────────────────

export async function updateSessionNotes(sessionId: number, notes: string): Promise<{ success: boolean; error?: string }> {
  const consultant = await getAuthConsultant();
  if (!consultant) return { success: false, error: 'Unauthorized' };

  const session = await prisma.session.findFirst({
    where: { id: sessionId, consultantId: consultant.id },
  });

  if (!session) return { success: false, error: 'Session not found.' };

  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { notes },
    });
    revalidatePath('/consultant/sessions');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save notes.' };
  }
}

// ─── Public Consultant Profile (For Founders) ─────────────────────────────────

export async function getPublicConsultantProfile(id: number) {
  try {
    const consultant = await prisma.consultant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: { sessions: { where: { paymentStatus: 'PAID' } } }
        }
      }
    });

    if (!consultant) return null;

    // Process availability: if it's stored as plain text, we might need to parse it later
    // but for now we return the whole object safely
    return {
      ...consultant,
      sessionsCompleted: consultant._count.sessions,
      // Fallbacks for missing data to maintain UI stability
      rating: consultant.rating ?? 5.0,
      reviewCount: consultant.reviewCount ?? 0,
      bio: consultant.bio || "No biography available yet.",
      expertise: consultant.expertise ? consultant.expertise.split(';') : [],
      certifications: consultant.certifications ? consultant.certifications.split(';') : [],
    };
  } catch (error) {
    console.error(`[ACTION] Error fetching public consultant profile:`, error);
    return null;
  }
}
