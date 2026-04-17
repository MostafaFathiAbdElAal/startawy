import { prisma } from "@/lib/prisma";
import type { UserWithRelations, UpdateProfileData } from "@/lib/types";

export class UserService {
  static async getFullProfile(userId: number): Promise<UserWithRelations | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        founder: true,
        consultant: true,
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
        founder: data.businessName ? {
          update: {
            businessName: data.businessName,
            businessSector: data.businessSector,
            description: data.description
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
