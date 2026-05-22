import { Metadata } from "next";
import { BudgetDashboard } from "@/components/analysis/BudgetDashboard";
import { prisma } from "@/lib/prisma";
import { BudgetAnalysisDetails } from "@/lib/services/budgetService";

export const metadata: Metadata = {
  title: "Budget Analysis",
};

import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function BudgetAnalysisPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { 
      founder: {
        include: {
          payments: {
            include: { subscription: true },
            orderBy: { transDate: 'desc' },
            take: 1
          }
        }
      } 
    }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  // Subscription Guard: Handled by proxy.ts centrally
  const latestPayment = user.founder.payments?.[0];
  const subscription = latestPayment?.subscription;

  // Get the last two analyses to calculate growth
  const budgetAnalyses = await prisma.budgetAnalysis.findMany({
    where: { founderId: user.founder.id },
    orderBy: { createdAt: 'desc' },
    take: 2
  });

  const currentAnalysis = budgetAnalyses[0];
  const prevAnalysis = budgetAnalyses[1];

  // Calculate or mock metrics based on DB state
  const analysisData = (currentAnalysis?.analysisData as unknown as BudgetAnalysisDetails) || null;
  const hasData = !!currentAnalysis;

  // Real Growth Calculation
  let incomeGrowth = 0;
  let expenseGrowth = 0;

  if (currentAnalysis && prevAnalysis) {
    const currentIncome = analysisData?.income || currentAnalysis.totalBudget;
    const prevAnalysisData = prevAnalysis?.analysisData as unknown as BudgetAnalysisDetails | null;
    const prevIncome = prevAnalysisData?.income || prevAnalysis.totalBudget;
    const currentExp = currentAnalysis.fixedCost + currentAnalysis.variableCost;
    const prevExp = prevAnalysis.fixedCost + prevAnalysis.variableCost;

    incomeGrowth = Number(((currentIncome - prevIncome) / prevIncome * 100).toFixed(1));
    expenseGrowth = Number(((currentExp - prevExp) / prevExp * 100).toFixed(1));
  }

  const metrics = hasData ? {
    income: analysisData?.income || currentAnalysis.totalBudget,
    expenses: currentAnalysis.fixedCost + currentAnalysis.variableCost,
    profit: (analysisData?.income || currentAnalysis.totalBudget) - (currentAnalysis.fixedCost + currentAnalysis.variableCost),
    incomeGrowth: incomeGrowth || 0,
    expenseGrowth: expenseGrowth || 0
  } : {
    income: 0,
    expenses: 0,
    profit: 0,
    incomeGrowth: 0,
    expenseGrowth: 0
  };

  const expenseData = hasData ? (analysisData?.expenseBreakdown || []) : [];
  const monthlyData = hasData ? (analysisData?.monthlyTrend || []) : [];
  const recommendations = hasData ? (analysisData?.recommendations || []) : [];

  return (
    <BudgetDashboard
      metrics={metrics}
      expenseData={expenseData}
      monthlyData={monthlyData}
      recommendations={recommendations}
      founderInfo={{
        name: user.founder.businessName || "N/A",
        industry: user.founder.businessSector || "N/A",
      }}
    />
  );
}
