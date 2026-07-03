import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const userPayload = await verifyAuth(token);

    const isOwner = !!userPayload?.isOwner;

    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "SYSTEM_ADMIN" && !isOwner)) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    // Update Consultant verification status in DB
    await prisma.consultant.update({
      where: { userId: userId },
      data: { isVerified: true },
    });

    return NextResponse.json({ success: true, message: "Consultant verified successfully." });
  } catch (error) {
    console.error("[ADMIN_CONSULTANT_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
