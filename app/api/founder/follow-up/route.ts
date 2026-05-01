import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'FOUNDER') {
      return NextResponse.json({ error: "Unauthorized. Founders only." }, { status: 401 });
    }

    const { consultantId } = await request.json();

    if (!consultantId) {
        return NextResponse.json({ error: "Consultant ID is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      include: { founder: true }
    });

    if (!user || !user.founder) {
      return NextResponse.json({ error: "Founder profile not found." }, { status: 404 });
    }

    // 0. Check if already assigned (One-time selection policy)
    if (user.founder.followUpConsultantId) {
        return NextResponse.json({ error: "You have already assigned a follow-up consultant. This is a one-time selection." }, { status: 400 });
    }

    // 1. Verify Premium Plan
    const latestPayment = await prisma.payment.findFirst({
      where: { 
        founderId: user.founder.id,
        subscription: { isNot: null }
      },
      orderBy: { transDate: 'desc' },
      include: { subscription: true }
    });

    const subscription = latestPayment?.subscription;
    const isActive = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate);
    const isPremium = isActive && (latestPayment?.amount || 0) >= 299;

    if (!isPremium) {
      return NextResponse.json({ error: "This feature requires an active Premium plan." }, { status: 403 });
    }

    // 2. Assign Consultant
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    await prisma.startupFounder.update({
      where: { id: user.founder.id },
      data: {
        followUpConsultantId: consultantId,
        followUpEndDate: oneYearFromNow
      }
    });

    return NextResponse.json({ success: true, message: "Consultant assigned successfully." });
  } catch (error) {
    console.error("[API] POST /api/founder/follow-up failed:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
