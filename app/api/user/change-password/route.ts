import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const token = req.cookies.get('auth-token')?.value;
    const session = await verifyAuth(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // 3. Find User
    const user = await prisma.user.findUnique({
      where: { id: Number(session.id) }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or using social login' }, { status: 404 });
    }

    // 4. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // 5. Hash & Update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
