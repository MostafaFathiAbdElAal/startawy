import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userPayload.id as string) },
      include: { founder: true }
    });

    if (!user || user.type !== 'FOUNDER' || !user.founder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Usually we would parse FormData here for a CSV upload.
    // For this simulation, we'll generate analysis numbers.
    const fixedCost = Math.floor(Math.random() * 20000) + 10000;
    const variableCost = Math.floor(Math.random() * 30000) + 15000;
    const totalBudget = fixedCost + variableCost + Math.floor(Math.random() * 40000) + 10000;

    const analysis = await prisma.budgetAnalysis.create({
      data: {
        founderId: user.founder.id,
        fixedCost,
        variableCost,
        totalBudget,
      }
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Budget API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
