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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    // Only current Owner/Super Admin can transfer ownership
    if (!userPayload || !userPayload.isOwner) {
      return NextResponse.json({ error: 'Unauthorized. Only the Platform Owner can transfer ownership.' }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(context.params);
    const targetUserId = parseInt(resolvedParams.id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const currentOwnerId = Number(userPayload.id);

    if (targetUserId === currentOwnerId) {
      return NextResponse.json({ error: 'You are already the Platform Owner.' }, { status: 400 });
    }

    // Verify target user is an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { admin: true }
    });

    if (!targetUser || targetUser.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Target user is not an administrator.' }, { status: 404 });
    }

    // Execute transfer in a database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Demote current owner to a regular admin
      await tx.admin.update({
        where: { userId: currentOwnerId },
        data: { isOwner: false }
      });

      // 2. Promote target admin to owner
      await tx.admin.update({
        where: { userId: targetUserId },
        data: { isOwner: true }
      });
    });

    // Re-create the session for the demoted user to update their JWT cookie immediately
    const currentUser = await prisma.user.findUnique({
      where: { id: currentOwnerId }
    });
    if (currentUser) {
      const { createSession } = await import('@/lib/auth-utils');
      await createSession({
        id: currentUser.id,
        role: currentUser.type,
        email: currentUser.email,
        name: currentUser.name
      });
    }

    return NextResponse.json({ success: true, message: 'Ownership transferred successfully.' });
  } catch (error) {
    console.error('Transfer Ownership API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
