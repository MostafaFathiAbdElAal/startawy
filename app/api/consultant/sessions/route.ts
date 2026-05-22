import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

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

    // 1. Fetch all sessions
    const sessions = await prisma.session.findMany({
      where: { consultantId: consultant.id },
      select: {
        id: true,
        date: true,
        duration: true,
        notes: true,
        paymentStatus: true,
        meetingLink: true,
        founder: {
          select: {
            businessName: true,
            user: {
              select: {
                name: true,
                image: true,
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
      orderBy: { date: "desc" },
    });

    // 2. Fetch Founders assigned for 1-year follow-up (Premium)
    const followUpFounders = await prisma.startupFounder.findMany({
      where: {
        followUpConsultantId: consultant.id,
        followUpEndDate: { gt: new Date() } // Active only
      },
      select: {
        id: true,
        businessName: true,
        followUpNotes: true,
        user: {
          select: { name: true, image: true }
        }
      }
    });

    // Map data to a clean JSON structure
    const formattedSessions = sessions.map((s) => ({
      id: s.id.toString(),
      type: 'SESSION',
      founderName: s.founder?.user?.name || "Unknown",
      founderImage: s.founder?.user?.image || null,
      businessName: s.founder?.businessName || "No Business Name",
      date: s.date,
      duration: s.duration,
      notes: s.notes,
      paymentStatus: s.paymentStatus,
      amount: s.payment?.amount ?? 0,
      meetingLink: s.meetingLink,
    }));

    const formattedFollowUps = followUpFounders.map((f) => ({
      id: `fu-${f.id}`,
      type: 'FOLLOW_UP',
      founderName: f.user.name,
      founderImage: f.user.image || null,
      businessName: f.businessName || "No Business Name",
      date: new Date().toISOString(), // Use current date to ensure they show up in 'completed' lists if filtered by date
      duration: "1 Year",
      notes: f.followUpNotes,
      paymentStatus: "PAID",
      amount: 0,
      meetingLink: null,
    }));

    return NextResponse.json([...formattedSessions, ...formattedFollowUps]);
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

    const sessionIdStr = String(sessionId);

    // Handle Long-term Follow-up Notes (Strategy Blueprint)
    if (sessionIdStr.startsWith('fu-')) {
      const founderId = parseInt(sessionIdStr.replace('fu-', ''));

      const founder = await prisma.startupFounder.findFirst({
        where: { id: founderId, followUpConsultantId: consultant.id }
      });

      if (!founder) {
        return NextResponse.json({ error: 'Founder not found or permission denied' }, { status: 404 });
      }

      await prisma.startupFounder.update({
        where: { id: founderId },
        data: {
          followUpNotes: notes,
          followUpUpdatedAt: new Date()
        }
      });

      revalidatePath("/founder/recommendations");
      revalidatePath("/founder/dashboard");

      return NextResponse.json({ success: true, message: 'Premium follow-up plan updated successfully' });
    }

    // Handle Standard Session Notes
    const sId = Number(sessionId);
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

    revalidatePath("/founder/recommendations");
    revalidatePath("/founder/dashboard");
    revalidatePath("/founder/sessions");

    return NextResponse.json({ success: true, message: 'Session follow-up plan updated successfully' });
  } catch (error) {
    console.error('API Error [Update Session Notes]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
