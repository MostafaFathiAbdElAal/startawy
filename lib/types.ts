import type { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
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
        }
      }
    },
    consultant: true,
    admin: {
      include: {
        user: true
      }
    }
  }
}>;

export interface UpdateProfileData {
  name: string;
  email: string;
  businessName?: string;
  businessSector?: string;
  description?: string;
}
