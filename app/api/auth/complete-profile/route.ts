import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, verifyAuth } from '@/lib/auth-utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify current partial token
    const userPayload = await verifyAuth(token);
    
    if (!userPayload || !userPayload.id) {
      console.error('[API] No valid user payload or ID found in token');
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    
    const userId = userPayload.id;
    if (!userId || isNaN(userId)) {
      console.error('[API] Invalid User ID in payload:', userPayload.id);
      return NextResponse.json({ error: 'Invalid User ID' }, { status: 400 });
    }

    const body = await req.json();
    const { role, phone, ...roleData } = body;

    if (!role || !phone) {
      return NextResponse.json({ error: 'Role and Phone are required' }, { status: 400 });
    }

    // Validate role against Prisma Enum
    const validRoles = ['FOUNDER', 'CONSULTANT'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    // 2. Update User and Create Role-Specific Record
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { 
            type: role as any, // Cast to any to avoid TS mismatch with string
            phone: phone
        },
      });

      try {
        if (role === 'FOUNDER') {
          const fDate = roleData.foundingDate ? new Date(roleData.foundingDate) : new Date();
          const validDate = isNaN(fDate.getTime()) ? new Date() : fDate;

          await tx.startupFounder.upsert({
            where: { userId: userId },
            update: {
              businessName: roleData.businessName || '',
              businessSector: roleData.businessSector || '',
              foundingDate: validDate,
            },
            create: {
              userId: userId,
              businessName: roleData.businessName || '',
              businessSector: roleData.businessSector || '',
              foundingDate: validDate,
            },
          });
        } else if (role === 'CONSULTANT') {
          await tx.consultant.upsert({
            where: { userId: userId },
            update: {
              specialization: roleData.specialization || '',
              yearsOfExp: parseInt(roleData.yearsOfExp) || 0,
              availability: roleData.availability || 'NOT_SPECIFIED',
            },
            create: {
              userId: userId,
              specialization: roleData.specialization || '',
              yearsOfExp: parseInt(roleData.yearsOfExp) || 0,
              availability: roleData.availability || 'NOT_SPECIFIED',
            },
          });
        }
      } catch (dbError: any) {
        console.error('[API] DB Operation failed during profile completion:', dbError.message);
        if (dbError.code !== 'P2002') throw dbError;
      }

      return updatedUser;
    });

    // 3. Create Session and Set Cookie (Centralized)
    // This is the CRITICAL part - issue a FULL token with a role
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.type,
      isPhoneVerified: user.isPhoneVerified
    });

    // 4. Success Response
    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        name: user.name,
        role: user.type,
      },
    });

  } catch (error: any) {
    console.error('[API] Complete Profile Error:', error);
    // Log Prisma specific errors if applicable
    if (error.code) console.error('[API] Prisma Error Code:', error.code);
    
    return NextResponse.json({ 
        error: 'Internal Server Error',
        details: error.message 
    }, { status: 500 });
  }
}
