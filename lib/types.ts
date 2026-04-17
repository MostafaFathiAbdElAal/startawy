import type { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    founder: true;
    consultant: true;
    admin: true;
  }
}>;

export interface UpdateProfileData {
  name: string;
  email: string;
  businessName?: string;
  businessSector?: string;
  description?: string;
}
