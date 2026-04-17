import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MyReportsClient } from "@/components/library/MyReportsClient";

export default async function MyReportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { founder: true }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  // Fetch from DB
  const dbReports = await prisma.founderReport.findMany({
    where: { founderId: user.founder.id },
    orderBy: { createdAt: 'desc' }
  });

  // Merge with dummy
  const myReports = dbReports.length > 0 ? dbReports.map((r) => ({
    id: r.id,
    title: `Custom Budget Forecast Report #${r.id}`,
    date: new Date(r.createdAt).toLocaleDateString(),
    type: "Financial",
    status: "Ready",
  })) : [
    {
      id: 901,
      title: "Quarterly Financial Analysis - Q1",
      date: "March 15, 2026",
      type: "Financial",
      status: "Ready",
    },
    {
      id: 902,
      title: "Competitor Market Positioning",
      date: "February 22, 2026",
      type: "Market Research",
      status: "Ready",
    },
    {
      id: 903,
      title: "AI Chatbot Strategy Export",
      date: "January 14, 2026",
      type: "Advisory",
      status: "Ready",
    }
  ];

  return (
    <MyReportsClient initialReports={myReports} />
  );
}
