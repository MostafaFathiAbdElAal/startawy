import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        rating: {
          gte: 4 // Only get positive feedbacks
        }
      },
      take: 3, // Get the latest 3
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: feedbacks }, { status: 200 });
  } catch (error) {
    console.error('[PUBLIC_FEEDBACK_GET_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
