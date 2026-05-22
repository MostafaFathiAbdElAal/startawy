import { NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await authorizeUser();
  if (!auth.authorized || auth.role !== "FOUNDER") {
    return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status || 403 });
  }

  try {
    const founder = await prisma.startupFounder.findUnique({
      where: { userId: auth.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        budgetAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        sessions: {
          take: 5,
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

    const stats = {
      totalAnalyses: await prisma.budgetAnalysis.count({ where: { founderId: founder.id } }),
      totalSessions: await prisma.session.count({ where: { founderId: founder.id } }),
      totalStrategies: await prisma.recommendation.count({ where: { founderId: founder.id } }),
    };

    const recentReports = await prisma.founderReport.findMany({
      where: { founderId: founder.id },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    return NextResponse.json({
      user: founder.user,
      stats,
      recentSessions: founder.sessions.map(s => ({
        id: s.id,
        consultantName: s.consultant.user.name,
        date: s.date,
        status: s.paymentStatus,
      })),
      latestAnalysis: founder.budgetAnalyses[0] || null,
      recentReports
    });
  } catch (error) {
    console.error("API Founder Dashboard GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
