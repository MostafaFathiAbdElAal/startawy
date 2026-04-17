import { prisma } from '@/lib/prisma';

export interface BudgetAnalysisData {
  fixedCost: number;
  variableCost: number;
  totalBudget: number;
  analysisData?: any;
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
