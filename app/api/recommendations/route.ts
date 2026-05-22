import { NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth-utils";
import { RecommendationService } from "@/lib/services/recommendationService";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await authorizeUser();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let data;
    if (auth.role === "FOUNDER") {
      const founder = await prisma.startupFounder.findUnique({
        where: { userId: auth.id }
      });
      if (!founder) return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });
      data = await RecommendationService.getRecommendationsForFounder(founder.id);
    } else if (auth.role === "CONSULTANT") {
      const consultant = await prisma.consultant.findUnique({
        where: { userId: auth.id }
      });
      if (!consultant) return NextResponse.json({ error: "Consultant profile not found" }, { status: 404 });
      data = await RecommendationService.getRecommendationsByConsultant(consultant.id);
    } else {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Recommendations GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await authorizeUser();
  if (!auth.authorized || auth.role !== "CONSULTANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const consultant = await prisma.consultant.findUnique({
      where: { userId: auth.id }
    });

    if (!consultant) return NextResponse.json({ error: "Consultant not found" }, { status: 404 });

    const result = await RecommendationService.createRecommendation({
      ...body,
      consultantId: consultant.id,
      founderId: Number(body.founderId)
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API Recommendations POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
