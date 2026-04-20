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
  phone?: string;
  // Founder fields
  businessName?: string;
  businessSector?: string;
  foundingDate?: string;
  description?: string;
  // Consultant fields
  yearsOfExp?: string | number;
  specialization?: string;
  sessionRate?: string | number;
  bio?: string;
}
