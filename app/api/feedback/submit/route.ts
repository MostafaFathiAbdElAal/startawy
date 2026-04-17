import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }

    const data = await req.json();

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    if (!data.comment || data.comment.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Please provide a constructive comment (at least 5 characters).' }, { status: 400 });
    }

    await prisma.feedback.create({
      data: {
        userId: Number(userPayload.id),
        rating: data.rating,
        comment: data.comment.trim(),
      },
    });

    return NextResponse.json({ success: true, message: 'Thank you for your feedback! We truly appreciate your support.' }, { status: 201 });
  } catch (error) {
    console.error('[FEEDBACK_SUBMIT_API_ERROR]', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback. Please try again later.' }, { status: 500 });
  }
}
