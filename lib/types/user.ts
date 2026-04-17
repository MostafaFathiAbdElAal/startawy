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
  phone?: string;
  businessName?: string;
  businessSector?: string;
  bio?: string;
  yearsOfExp?: string | number;
  specialization?: string;
  foundingDate?: string;
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
