import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import { RecommendationService } from '@/lib/services/recommendationService';

/**
 * GET /api/consultant/recommendations
 * Retrieves all recommendations authored by the authenticated consultant
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { userId: Number(userPayload.id) },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Use service layer to fetch authored recommendations
    const recommendations = await RecommendationService.getRecommendationsByConsultant(consultant.id);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('API Error [Get Recommendations]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/consultant/recommendations
 * Creates a new strategic recommendation for a founder
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { founderId, title, content, category, priority, impact } = body;

    if (!founderId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { userId: Number(userPayload.id) },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Call service layer to persist the recommendation
    const newRecommendation = await RecommendationService.createRecommendation({
      consultantId: consultant.id,
      founderId: Number(founderId),
      title,
      content,
      category,
      priority: priority || 'MEDIUM',
      impact: impact || 'MEDIUM',
    });

    return NextResponse.json({ success: true, recommendation: newRecommendation });
  } catch (error) {
    console.error('API Error [Create Recommendation]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
