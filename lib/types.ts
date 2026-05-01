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
        budgetAnalyses: true,
        followUpConsultant: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          }
        }
      }
    },
    consultant: {
      include: {
        sessions: true,
        recommendations: true
      }
    },
    admin: true
  }
}>;

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  isSuspended?: boolean;
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
  availability?: string;
}
