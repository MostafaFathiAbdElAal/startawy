import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegistrationData } from '@/lib/types/user';
import { UserType } from '@prisma/client';

export class AuthService {
  /**
   * Universal User Registration
   */
  static async register(data: RegistrationData) {
    const { email, password, fullName, phone, role, businessName, businessSector, foundingDate, yearsOfExp, specialization, availability, adminLevel, adminScope } = data;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
        throw new Error('Email already registered.');
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password || '', 12);

    // 3. Create User and Role Profile Transactionally
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          password: hashedPassword,
          phone,
          type: role as UserType,
        },
      });

      if (role === 'FOUNDER') {
        await tx.startupFounder.create({
          data: {
            userId: user.id,
            businessName: businessName || '',
            businessSector: businessSector || '',
            foundingDate: foundingDate ? new Date(foundingDate) : new Date(),
          },
        });
      } else if (role === 'CONSULTANT') {
        await tx.consultant.create({
          data: {
            userId: user.id,
            yearsOfExp: parseInt(yearsOfExp as unknown as string) || 0,
            specialization: specialization || '',
            availability: availability || 'NOT_SPECIFIED',
          },
        });
      } else if (role === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: user.id,
            adminLevel: adminLevel || 'LEVEL_1',
            adminScope: adminScope || 'LOCAL',
          },
        });
      }

      return { id: user.id, email: user.email, name: user.name, role: user.type };
    });
  }
}
