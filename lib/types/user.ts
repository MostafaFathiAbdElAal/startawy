import { Prisma } from '@prisma/client';

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
    admin: true,
  }
}>;

export interface UpdateProfileData {
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessSector?: string;
  bio?: string; // Generic field used by form
  description?: string; // DB field for Founder
  availability?: string; // DB field for Consultant
  yearsOfExp?: string | number;
  specialization?: string;
  sessionRate?: string | number;
  foundingDate?: string;
  isSuspended?: boolean;
}

export interface RegistrationData {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: string;
  businessName?: string;
  businessSector?: string;
  foundingDate?: string | Date;
  yearsOfExp?: string | number;
  specialization?: string;
  availability?: string;
  adminLevel?: string;
  adminScope?: string;
}
