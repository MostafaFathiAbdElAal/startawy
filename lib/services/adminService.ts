import { prisma } from '@/lib/prisma';
import { UserService } from './userService';

export class AdminService {
  /**
   * Get overall system statistics for admin dashboard
   */
  static async getSystemStats() {
    const totalUsers = await prisma.user.count();
    const totalFounders = await prisma.startupFounder.count();
    const totalConsultants = await prisma.consultant.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    return {
      totalUsers,
      totalFounders,
      totalConsultants,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  /**
   * Fetch all users with basic info for administrative table
   */
  static async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
          id: true,
          name: true,
          email: true,
          type: true,
          createdAt: true
      }
    });
  }

  /**
   * Administrative User Deletion
   */
  static async deleteUser(userId: number) {
    return await UserService.deleteUser(userId);
  }
}
