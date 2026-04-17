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
      where: { userId: auth.id }
    });

    if (!founder) return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });

    const reports = await prisma.founderReport.findMany({
      where: { founderId: founder.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("API Founder Reports GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
