import { NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await authorizeUser();
  if (!auth.authorized || auth.role !== "FOUNDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const founder = await prisma.startupFounder.findUnique({
      where: { userId: auth.id },
      include: {
        sessions: {
          orderBy: { date: "desc" },
          include: {
            consultant: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!founder) return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });

    const sessions = founder.sessions.map(s => ({
      id: s.id,
      consultantName: s.consultant.user.name,
      date: s.date,
      status: s.paymentStatus,
      meetingLink: s.notes
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("API Founder Sessions GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
