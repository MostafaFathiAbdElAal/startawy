import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || !userPayload.isOwner) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admins can perform this action.' }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(context.params);
    const targetUserId = parseInt(resolvedParams.id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (targetUserId === Number(userPayload.id)) {
      return NextResponse.json({ error: 'You cannot delete your own Super Admin account.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { admin: true }
    });

    if (!targetUser || targetUser.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Target user is not an administrator.' }, { status: 404 });
    }

    if (targetUser.admin?.isOwner) {
       return NextResponse.json({ error: 'Cannot delete another Super Admin. Demote them first.' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      if (targetUser.admin) {
        await tx.admin.delete({ where: { userId: targetUserId } });
      }
      await tx.user.delete({ where: { id: targetUserId } });
    });

    return NextResponse.json({ success: true, message: 'Administrator deleted successfully.' });
  } catch (error) {
    console.error('Delete Admin API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
