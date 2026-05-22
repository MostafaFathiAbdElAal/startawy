import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/userService";
import { BudgetService } from "@/lib/services/budgetService";
import { authorizeUser } from "@/lib/auth-utils";
import { BudgetAIAnalyst } from "@/lib/ai-analyst";

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeUser(req, ["FOUNDER"]);
    if (!auth.authorized || !auth.user) return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status });

    const founder = await UserService.getFounderByUserId(auth.user.id);
    if (!founder) {
      return NextResponse.json({ error: "Founder profile not found" }, { status: 404 });
    }

    const { csvText } = await req.json();
    if (!csvText) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 });
    }

    // 1. Call real AI Analyst
    const analyst = new BudgetAIAnalyst();
    const result = await analyst.analyzeCSV(csvText);

    // 2. Save to DB
    const analysis = await BudgetService.createAnalysis(founder.id, {
      fixedCost: result.fixedCost,
      variableCost: result.variableCost,
      totalBudget: result.totalBudget,
      analysisData: {
        income: result.income,
        metrics: result.metrics,
        expenseBreakdown: result.expenseBreakdown,
        monthlyTrend: result.monthlyTrend,
        recommendations: result.recommendations
      }
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    console.error("Budget API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
