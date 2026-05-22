import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    const isOwner = !!userPayload?.isOwner;

    if (!userPayload || (userPayload.role !== 'ADMIN' && userPayload.role !== 'SYSTEM_ADMIN' && !isOwner)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: feedbacks }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_GET_FEEDBACKS_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feedbacks.' }, { status: 500 });
  }
}
