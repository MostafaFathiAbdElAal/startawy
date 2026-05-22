import { prisma } from "@/lib/prisma";

export class RecommendationService {
  static async getRecommendationsForFounder(founderId: number) {
    return await prisma.recommendation.findMany({
      where: { founderId },
      include: {
        consultant: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async getRecommendationsByConsultant(consultantId: number) {
    return await prisma.recommendation.findMany({
      where: { consultantId },
      include: {
        founder: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createRecommendation(data: {
    founderId: number;
    consultantId: number;
    title: string;
    content: string;
    category: string;
    priority: string;
    impact?: string;
  }) {
    return await prisma.recommendation.create({
      data: {
        founderId: data.founderId,
        consultantId: data.consultantId,
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        impact: data.impact,
      }
    });
  }
}
