import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify current partial token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as number;

    const body = await req.json();
    const { role, phone, ...roleData } = body;

    if (!role || !phone) {
      return NextResponse.json({ error: 'Role and Phone are required' }, { status: 400 });
    }

    // 2. Update User and Create Role-Specific Record
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { 
            type: role,
            phone: phone
        },
      });

      try {
        if (role === 'FOUNDER') {
          await tx.startupFounder.upsert({
            where: { userId: userId },
            update: {
              businessName: roleData.businessName,
              businessSector: roleData.businessSector,
              foundingDate: new Date(roleData.foundingDate),
            },
            create: {
              userId: userId,
              businessName: roleData.businessName,
              businessSector: roleData.businessSector,
              foundingDate: new Date(roleData.foundingDate),
            },
          });
        } else if (role === 'CONSULTANT') {
          await tx.consultant.upsert({
            where: { userId: userId },
            update: {
              specialization: roleData.specialization,
              yearsOfExp: parseInt(roleData.yearsOfExp) || 0,
              availability: roleData.availability,
            },
            create: {
              userId: userId,
              specialization: roleData.specialization,
              yearsOfExp: parseInt(roleData.yearsOfExp) || 0,
              availability: roleData.availability,
            },
          });
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (dbError: any) {
        // If it's a unique constraint error (P2002), we can ignore it as the record exists
        if (dbError.code !== 'P2002') {
          throw dbError;
        }
        console.warn('P2002 encountered during profile completion, ignoring as duplicate.');
      }

      return updatedUser;
    });

    // 3. Generate NEW token with the updated role
    const newToken = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.type,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // 4. Response with New Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        name: user.name,
        role: user.type,
      },
    });

    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Complete Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
