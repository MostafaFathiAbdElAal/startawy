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

    // Map sessions to a detailed financial ledger
    const records = paidSessions.map((s) => {
      const amount = s.payment?.amount ?? 0;

      return {
        id: s.id,
        founderName: s.founder.user.name,
        businessName: s.founder.businessName,
        date: s.date,
        amount,
      };
    });

    // Calculate aggregated total
    const totalEarnings = records.reduce((sum, r) => sum + r.amount, 0);

    return NextResponse.json({
      records,
      totalEarnings,
      totalSessions: records.length,
    });
  } catch (error) {
    console.error('API Error [Consultant Earnings]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
