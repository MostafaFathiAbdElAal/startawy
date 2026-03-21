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
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // 3. Find User with all relations
    const user = await prisma.user.findUnique({
      where: { id: Number(session.id) },
      include: {
        admin: true,
        founder: true,
        consultant: true,
      }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User not found or using social login' }, { status: 404 });
    }

    // 4. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
    }

    // 5. Delete everything in a transaction
    await prisma.$transaction(async (tx) => {
      const userId = user.id;

      if (user.founder) {
        const founderId = user.founder.id;

        // Delete Subscriptions linked to Payments of this founder
        await tx.subscription.deleteMany({
          where: {
            payment: {
              founderId: founderId
            }
          }
        });

        // Delete Payments
        await tx.payment.deleteMany({
          where: { founderId: founderId }
        });

        // Delete Budget Analyses
        await tx.budgetAnalysis.deleteMany({
          where: { founderId: founderId }
        });

        // Delete AI Chat History
        await tx.aIChatbot.deleteMany({
          where: { founderId: founderId }
        });

        // Delete Founder Reports
        await tx.founderReport.deleteMany({
          where: { founderId: founderId }
        });

        // Delete Sessions
        await tx.session.deleteMany({
          where: { founderId: founderId }
        });

        // Delete StartupFounder record
        await tx.startupFounder.delete({
          where: { id: founderId }
        });
      }

      if (user.consultant) {
        const consultantId = user.consultant.id;

        // Delete Sessions linked to this consultant
        await tx.session.deleteMany({
          where: { consultantId: consultantId }
        });

        // Delete Consultant record
        await tx.consultant.delete({
          where: { id: consultantId }
        });
      }

      if (user.admin) {
        await tx.admin.delete({
          where: { id: user.admin.id }
        });
      }

      // Finally delete the User
      await tx.user.delete({
        where: { id: userId }
      });
    });

    // 6. Clear Cookie
    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
    response.cookies.delete('auth-token');
    
    return response;
  } catch (error) {
    console.error('Delete Account API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
