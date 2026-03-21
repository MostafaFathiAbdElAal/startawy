import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
import { prisma } from '../../../lib/prisma';
import { RegisterSchema } from '../../../lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation
    try {
      await RegisterSchema.validate(body, { abortEarly: false });
    } catch (error: unknown) {
      const validationError = error as { errors: string[] };
      return NextResponse.json(
        { error: validationError.errors.join(', ') },
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered.' },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // 4. Create User and Role Profile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: body.fullName,
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          type: body.role,
        },
      });

      if (body.role === 'FOUNDER') {
        await tx.startupFounder.create({
          data: {
            userId: user.id,
            businessName: body.businessName || '',
            businessSector: body.businessSector || '',
            foundingDate: body.foundingDate ? new Date(body.foundingDate) : new Date(),
          },
        });
      } else if (body.role === 'CONSULTANT') {
        await tx.consultant.create({
          data: {
            userId: user.id,
            yearsOfExp: parseInt(body.yearsOfExp) || 0,
            specialization: body.specialization || '',
            availability: body.availability || 'NOT_SPECIFIED',
          },
        });
      } else if (body.role === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: user.id,
            adminLevel: body.adminLevel || 'LEVEL_1',
            adminScope: body.adminScope || 'LOCAL',
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      { success: true, message: 'User registered successfully', userId: result.id },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
