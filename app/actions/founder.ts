import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function getFounderDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "FOUNDER") {
    return null;
  }

  const founder = await prisma.startupFounder.findUnique({
    where: { userId: Number(decoded.id) },
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

  if (!founder) return null;

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

  return {
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
  };
}

export async function getFounderReports() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "FOUNDER") {
    return null;
  }

  const founder = await prisma.startupFounder.findUnique({
    where: { userId: Number(decoded.id) }
  });

  if (!founder) return null;

  return await prisma.founderReport.findMany({
    where: { founderId: founder.id },
    orderBy: { createdAt: "desc" }
  });
}

export async function getFounderSessions() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "FOUNDER") {
    return null;
  }

  const founder = await prisma.startupFounder.findUnique({
    where: { userId: Number(decoded.id) },
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

  if (!founder) return null;

  return founder.sessions.map(s => ({
    id: s.id,
    consultantName: s.consultant.user.name,
    date: s.date,
    status: s.paymentStatus,
    meetingLink: s.notes // Temporarily repurposing notes for link if URL model absent
  }));
}
