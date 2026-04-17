import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const userPayload = await verifyAuth(token);

    const isOwner = !!userPayload?.isOwner;

    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "SYSTEM_ADMIN" && !isOwner)) {
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, specialization, yearsOfExp, availability } = body;

    // Validation
    if (!name || !email || !password || !specialization) {
      return NextResponse.json({ error: "Missing required fields for onboarding." }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email is already registered in the system." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Atomic Operation: Create User + Consultant profile
    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          type: "CONSULTANT",
          isEmailVerified: true, // Admin created accounts are pre-verified
        },
      });

      await tx.consultant.create({
        data: {
          userId: u.id,
          specialization,
          yearsOfExp: parseInt(yearsOfExp) || 0,
          availability: availability || "Available",
        },
      });

      return u;
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("[ADMIN_CONSULTANT_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Onboarding failed." }, { status: 500 });
  }
}
