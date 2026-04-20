import { prisma } from "@/lib/prisma";
import type { UserWithRelations, UpdateProfileData } from "@/lib/types";

export class UserService {
  static async getFullProfile(userId: number): Promise<UserWithRelations | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        founder: {
          include: {
            payments: {
              include: {
                subscription: true
              },
              orderBy: {
                transDate: 'desc'
              },
              take: 1
            },
            sessions: true,
            reports: true,
            budgetAnalyses: true
          }
        },
        consultant: {
          include: {
            sessions: true
          }
        },
        admin: true
      }
    });
    
    return user as UserWithRelations | null;
  }

  static async getUserProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        phone: true,
        founder: true,
        consultant: true
      }
    });
  }

  static async updateUserProfile(userId: number, data: UpdateProfileData) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        founder: (data.businessName || data.businessSector || data.foundingDate) ? {
          update: {
            businessName: data.businessName,
            businessSector: data.businessSector,
            foundingDate: data.foundingDate ? new Date(data.foundingDate) : undefined,
            description: data.description || data.bio
          }
        } : undefined,
        consultant: data.specialization ? {
          update: {
            specialization: data.specialization,
            yearsOfExp: Number(data.yearsOfExp) || 0,
            sessionRate: Number(data.sessionRate) || 150.0,
            availability: data.bio || ""
          }
        } : undefined
      }
    });
  }

  static async getFounderByUserId(userId: number) {
    return await prisma.startupFounder.findUnique({
      where: { userId }
    });
  }

  static async deleteUser(userId: number) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  }
}
