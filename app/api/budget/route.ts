import { NextRequest, NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth-utils";
import { UserService } from "@/lib/services/userService";
import { prisma } from "@/lib/prisma";
import { BudgetAnalysisDetails } from "@/lib/services/budgetService";

export async function GET(req: NextRequest) {
  try {
    const auth = await authorizeUser(req, ["FOUNDER"]);
    if (!auth.authorized || !auth.user) return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status });

    const founder = await UserService.getFounderByUserId(auth.user.id);
    if (!founder) {
      return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });
    }

    // Get the latest analysis
    const currentAnalysis = await prisma.budgetAnalysis.findFirst({
      where: { founderId: founder.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!currentAnalysis) {
      return NextResponse.json({ success: true, hasData: false });
    }

    const analysisData = currentAnalysis.analysisData as unknown as BudgetAnalysisDetails;

    return NextResponse.json({
      success: true,
      hasData: true,
      expenseData: analysisData?.expenseBreakdown || [],
      monthlyData: analysisData?.monthlyTrend || [],
      recommendations: analysisData?.recommendations || [],
      metrics: {
        income: analysisData?.income || currentAnalysis.totalBudget,
        expenses: currentAnalysis.fixedCost + currentAnalysis.variableCost,
        profit: (analysisData?.income || currentAnalysis.totalBudget) - (currentAnalysis.fixedCost + currentAnalysis.variableCost),
        // Growth is optional or can be calculated here
      }
    });
  } catch (error: unknown) {
    console.error("Budget GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
