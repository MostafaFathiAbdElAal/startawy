import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * GET /api/consultant/earnings
 * Calculates total earnings for the authenticated consultant
 * Returns a ledger of all successful session payments
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the consultant profile
    const consultant = await prisma.consultant.findUnique({
      where: { userId: Number(userPayload.id) },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Fetch all paid sessions with their payments
    const paidSessions = await prisma.session.findMany({
      where: { 
        consultantId: consultant.id, 
        paymentStatus: 'PAID' 
      },
      include: {
        founder: {
          include: {
            user: { select: { name: true } },
          },
        },
        payment: true,
      },
      orderBy: { date: 'desc' },
    });

    // Fetch all followed founders (who chose this consultant as their advisor)
    const followers = await prisma.startupFounder.findMany({
      where: { followUpConsultantId: consultant.id },
    });
    const followerIds = followers.map(f => f.id);

    // Fetch all paid subscription payments from these followers
    const subscriptionPayments = followerIds.length > 0 ? await prisma.payment.findMany({
      where: {
        founderId: { in: followerIds },
        sessionId: null,
      },
      include: {
        founder: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { transDate: 'desc' },
    }) : [];

    // Deduplicate subscription payments to prevent duplicate commission payouts
    const uniqueSubsMap = new Map<string, typeof subscriptionPayments[0]>();
    for (const p of subscriptionPayments) {
      const key = p.paymentMethod || `${p.founderId}-${p.transDate.getTime()}-${p.amount}`;
      if (!uniqueSubsMap.has(key)) {
        uniqueSubsMap.set(key, p);
      }
    }
    const uniqueSubscriptionPayments = Array.from(uniqueSubsMap.values());

    const PLATFORM_FEE = 0.15; // 15% platform commission
    const ADVISOR_COMMISSION_RATE = 0.40; // 40% advisor commission on plans

    // Map sessions to detailed financial split records
    const sessionRecords = paidSessions.map((s) => {
      const gross = s.payment?.amount ?? 0;
      const platformFee = gross * PLATFORM_FEE;
      const net = gross - platformFee;

      return {
        id: `session-${s.id}`,
        founderName: s.founder.user.name,
        businessName: s.founder.businessName,
        date: s.date,
        type: 'SESSION',
        gross,
        rateInfo: '15% Platform Fee',
        feeAmount: platformFee,
        net,
      };
    });

    // Map subscription payments to detailed advisor commissions
    const subscriptionRecords = uniqueSubscriptionPayments.map((p) => {
      const gross = p.amount;
      const net = gross * ADVISOR_COMMISSION_RATE;
      const platformShare = gross - net;

      return {
        id: `sub-${p.id}`,
        founderName: p.founder.user.name,
        businessName: p.founder.businessName,
        date: p.transDate,
        type: 'SUBSCRIPTION',
        gross,
        rateInfo: '60% Platform Share',
        feeAmount: platformShare,
        net,
      };
    });

    // Merge and sort all records by date descending
    const records = [...sessionRecords, ...subscriptionRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate aggregated net details
    const sessionEarnings = sessionRecords.reduce((sum, r) => sum + r.net, 0);
    const commissionEarnings = subscriptionRecords.reduce((sum, r) => sum + r.net, 0);
    const totalEarnings = sessionEarnings + commissionEarnings;

    return NextResponse.json({
      records,
      sessionEarnings,
      commissionEarnings,
      totalEarnings,
      totalSessions: paidSessions.length,
    });
  } catch (error) {
    console.error('API Error [Consultant Earnings]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
