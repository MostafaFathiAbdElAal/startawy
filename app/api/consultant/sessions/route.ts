import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * GET /api/consultant/sessions
 * Returns all sessions for the authenticated consultant using explicit selections
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the consultant record linked to this user
    const consultant = await prisma.consultant.findUnique({
      where: { userId: userPayload.id },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Fetch all sessions with explicit select for guaranteed field availability
    const sessions = await prisma.session.findMany({
      where: { consultantId: consultant.id },
      select: {
        id: true,
        date: true,
        duration: true,
        notes: true,
        paymentStatus: true,
        founder: {
          select: {
            businessName: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Map data to a clean JSON structure
    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      founderName: s.founder?.user?.name || 'Unknown',
      businessName: s.founder?.businessName || 'N/A',
      date: s.date,
      duration: s.duration,
      notes: s.notes,
      paymentStatus: s.paymentStatus,
      amount: s.payment?.amount ?? 0,
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('API Error [Consultant Sessions]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/consultant/sessions
 * Updates session notes (Follow-up plan)
 */
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, notes } = await req.json();

    if (!sessionId || notes === undefined) {
      return NextResponse.json({ error: 'Missing sessionId or notes' }, { status: 400 });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { userId: userPayload.id },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Convert sessionId to number to ensure database match
    const sId = Number(sessionId);

    // Verify ownership and update
    const session = await prisma.session.findFirst({
      where: { id: sId, consultantId: consultant.id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found or permission denied' }, { status: 404 });
    }

    await prisma.session.update({
      where: { id: sId },
      data: { notes },
    });

    return NextResponse.json({ success: true, message: 'Follow-up plan updated successfully' });
  } catch (error) {
    console.error('API Error [Update Session Notes]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
