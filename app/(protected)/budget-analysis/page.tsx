import { BudgetDashboard } from "@/components/analysis/BudgetDashboard";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function BudgetAnalysisPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userPayload.id as string) },
    include: { founder: true }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  // Get budget data if exists (using first for simplicity)
  const budgetData = await prisma.budgetAnalysis.findFirst({
    where: { founderId: user.founder.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate or mock metrics based on DB state
  const metrics = budgetData ? {
    income: budgetData.totalBudget + 15000, 
    expenses: budgetData.fixedCost + budgetData.variableCost,
    profit: budgetData.totalBudget + 15000 - (budgetData.fixedCost + budgetData.variableCost),
    incomeGrowth: 15.3,
    expenseGrowth: 8.2
  } : {
    income: 67000,
    expenses: 50000,
    profit: 17000,
    incomeGrowth: 15.3,
    expenseGrowth: 28.2
  };

  // Mocking detailed breakdown which usually comes from CSV upload
  const expenseData = [
    { category: "Marketing", amount: metrics.expenses * 0.3, percentage: 30 },
    { category: "Operations", amount: metrics.expenses * 0.2, percentage: 20 },
    { category: "Salaries", amount: metrics.expenses * 0.4, percentage: 40 },
    { category: "Technology", amount: metrics.expenses * 0.1, percentage: 10 },
  ];

  const monthlyData = [
    { month: "Jan", income: metrics.income * 0.7, expenses: metrics.expenses * 0.7 },
    { month: "Feb", income: metrics.income * 0.75, expenses: metrics.expenses * 0.75 },
    { month: "Mar", income: metrics.income * 0.8, expenses: metrics.expenses * 0.8 },
    { month: "Apr", income: metrics.income * 0.9, expenses: metrics.expenses * 0.85 },
    { month: "May", income: metrics.income * 0.95, expenses: metrics.expenses * 0.9 },
    { month: "Jun", income: metrics.income, expenses: metrics.expenses },
  ];

  return (
    <BudgetDashboard 
      metrics={metrics}
      expenseData={expenseData}
      monthlyData={monthlyData}
    />
  );
}
