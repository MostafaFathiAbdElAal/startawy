import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { code, extraData, mode } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }


    // 1. Exchange Code for Tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: 'postmessage', // Special value for initCodeClient
    });

    if (!tokens.id_token) {
      return NextResponse.json({ error: 'Failed to retrieve ID Token' }, { status: 401 });
    }

    // 2. Verify ID Token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google Token' }, { status: 401 });
    }

    const { email, name, sub: googleId, picture: image } = payload;

    // 2. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      // If we are in "REGISTER" mode and the user already has a googleId, 
      // we show the error the user requested.
      if (mode === 'register' && user.googleId) {
        return NextResponse.json({ 
          error: "This account is already registered. Please login instead of creating a new account." 
        }, { status: 400 });
      }

      // If user exists but doesn't have a googleId, link it
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: googleId, 
            image: image || user.image,
            isEmailVerified: true // Account linked via Google is verified
          },
        });
      }
      // Returning user in Login mode -> just proceed.
    } else {
      // Create new user with role and metadata if provided (Registration flow)
      const userType = extraData?.role;
      
      user = await prisma.user.create({
        data: {
          email: email,
          name: name || 'Google User',
          googleId: googleId,
          image: image,
          phone: extraData?.phone,
          type: userType,
          isEmailVerified: true, // Google email is inherently verified
        },
      });

      // Create associated record based on type if provided during reg
      if (userType === 'FOUNDER' && extraData) {
        await prisma.startupFounder.create({
          data: {
            userId: user.id,
            businessName: extraData.businessName,
            businessSector: extraData.businessSector,
            foundingDate: extraData.foundingDate ? new Date(extraData.foundingDate) : undefined,
          }
        });
      } else if (userType === 'CONSULTANT' && extraData) {
        await prisma.consultant.create({
          data: {
            userId: user.id,
            specialization: extraData.specialization,
            yearsOfExp: parseInt(extraData.yearsOfExp) || 0,
            availability: extraData.availability,
          }
        });
      } else if (userType === 'ADMIN' && extraData) {
        await prisma.admin.create({
          data: {
            userId: user.id,
            adminLevel: extraData.adminLevel,
            adminScope: extraData.adminScope,
          }
        });
      }
    }

    // 3. Generate our BIS JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.type,
      isPhoneVerified: user.isPhoneVerified
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // 4. Create Response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.type,
        image: user.image,
      },
      requiresRole: !user.type, // Flag for frontend to redirect to role selection
    });

    // 5. Set Cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
