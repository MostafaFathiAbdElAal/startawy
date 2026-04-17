import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * GET /api/consultant/availability
 * Retrieves current availability string for the authenticated consultant
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
      select: { availability: true }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    return NextResponse.json({ availability: consultant.availability || '' });
  } catch (error) {
    console.error('API Error [Get Availability]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/consultant/availability
 * Updates the weekly availability string for the consultant
 */
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { availability } = await req.json();

    if (availability === undefined) {
      return NextResponse.json({ error: 'Missing availability data' }, { status: 400 });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { userId: Number(userPayload.id) },
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Update the availability string in the record
    await prisma.consultant.update({
      where: { id: consultant.id },
      data: { availability }
    });

    return NextResponse.json({ success: true, message: 'Availability schedule updated' });
  } catch (error) {
    console.error('API Error [Update Availability]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
