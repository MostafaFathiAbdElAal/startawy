import { prisma } from '@/lib/prisma';

export class ConsultantService {
  /**
   * Fetch specific consultant data and recent sessions
   */
  static async getConsultantDashboard(userId: number) {
    const consultant = await prisma.consultant.findUnique({
      where: { userId },
      include: {
        user: true,
        sessions: {
          include: {
            founder: {
              include: { user: true }
            },
            payment: true
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!consultant) return null;

    // Calculate performance metrics
    const totalSessions = consultant.sessions.length;
    const grossEarnings = consultant.sessions
      .filter(s => s.paymentStatus === 'PAID' && s.payment)
      .reduce((sum, s) => sum + (s.payment?.amount || 0), 0);
    
    const platformCommission = 0.15; // 15%
    const netEarnings = grossEarnings * (1 - platformCommission);

    return {
      consultant,
      metrics: {
        totalSessions,
        grossEarnings,
        netEarnings,
        activeClients: new Set(consultant.sessions.map(s => s.founderId)).size
      }
    };
  }

  /**
   * Update weekly availability string
   */
  static async updateAvailability(userId: number, availability: string) {
    return await prisma.consultant.update({
      where: { userId },
      data: { availability }
    });
  }

  /**
   * Fetch all clients (Founders) who have booked with this consultant
   */
  static async getConsultantClients(userId: number) {
    const consultant = await prisma.consultant.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!consultant) return [];

    const sessions = await prisma.session.findMany({
      where: { consultantId: consultant.id },
      include: {
        founder: {
          include: {
            user: true,
            budgetAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    // Unique founders
    const foundersMap = new Map();
    sessions.forEach(s => {
      if (!foundersMap.has(s.founderId)) {
        foundersMap.set(s.founderId, s.founder);
      }
    });

    return Array.from(foundersMap.values());
  }
}
