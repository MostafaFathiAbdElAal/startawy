import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * GET /api/consultant/clients
 * Returns a list of unique founders who have booked sessions with the authenticated consultant
 * Includes business details and latest budget analysis for each client
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Identify the consultant from user context
    const consultant = await prisma.consultant.findUnique({
      where: { userId: Number(userPayload.id) },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Fetch sessions to identify linked founders
    const sessions = await prisma.session.findMany({
      where: { consultantId: consultant.id },
      include: {
        founder: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
                createdAt: true,
              },
            },
            budgetAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            sessions: {
              where: { consultantId: consultant.id },
            },
          },
        },
      },
    });
    // Deduplicate founders using a Map to ensure unique records
    const foundersMap = new Map();

    // Also fetch Premium Follow-Up founders assigned to this consultant
    const followUpFounders = await prisma.startupFounder.findMany({
      where: {
        followUpConsultantId: consultant.id,
        followUpEndDate: { gt: new Date() } // Active only
      },
      include: {
        user: {
          select: { name: true, email: true, image: true, createdAt: true }
        },
        budgetAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        sessions: {
          where: { consultantId: consultant.id },
        },
      },
    });

    // Merge session-based founders into map
    for (const s of sessions) {
      if (!foundersMap.has(s.founderId)) {
        foundersMap.set(s.founderId, s.founder);
      }
    }

    // Merge premium follow-up founders (avoid duplicates)
    for (const f of followUpFounders) {
      if (!foundersMap.has(f.id)) {
        foundersMap.set(f.id, f);
      }
    }

    // Format the response for the client UI
    const formattedClients = Array.from(foundersMap.values()).map((f) => ({
      id: f.id,
      name: f.user.name,
      email: f.user.email,
      businessName: f.businessName,
      businessSector: f.businessSector,
      totalSessions: f.sessions?.length ?? 0,
      lastBudgetAnalysis: f.budgetAnalyses?.[0] ?? null,
      image: f.user.image,
      joinedAt: f.user.createdAt,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('API Error [Consultant Clients]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
