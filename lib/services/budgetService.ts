import { prisma } from '@/lib/prisma';

export type BudgetAnalysisDetails = {
  income: number;
  metrics: {
    incomeGrowth: number;
    expenseGrowth: number;
  };
  recommendations: { title: string; description: string; type: "marketing" | "revenue" | "expense" | "health" }[];
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
};

export interface BudgetAnalysisData {
  fixedCost: number;
  variableCost: number;
  totalBudget: number;
  analysisData?: BudgetAnalysisDetails;
}

export class BudgetService {
  /**
   * Create a new budget analysis record
   */
  static async createAnalysis(founderId: number, data: BudgetAnalysisData) {
    return await prisma.budgetAnalysis.create({
      data: {
        founderId,
        ...data
      }
    });
  }

  /**
   * Get all analyses for a founder
   */
  static async getFounderAnalyses(founderId: number) {
    return await prisma.budgetAnalysis.findMany({
      where: { founderId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
