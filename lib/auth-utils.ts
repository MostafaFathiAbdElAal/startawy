import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

// Use same secret pattern as proxy.ts
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export interface SessionPayload {
  id: number;
  email: string;
  name: string;
  role: string | null;
  isPhoneVerified: boolean;
  isOwner: boolean;
}

export async function verifyAuth(token: string | undefined) {
  if (!token) {
    console.log('[AUTH] No token provided');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    console.log('[AUTH] Token verified. Full Payload:', payload);
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('[AUTH] JWT Verification Failed:', error);
    return null;
  }
}

/**
 * Enhanced authorizeUser that matches the project's API requirements.
 * Returns a result that allows both destructuring { error, user } 
 * and direct property access (auth.id, auth.role).
 */
export async function authorizeUser(request?: any, allowedRoles?: string[]): Promise<any> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const decoded = await verifyAuth(token);

  if (!decoded) {
    return { 
      authorized: false,
      error: 'Unauthorized',
      status: 401,
      user: null 
    };
  }

  if (allowedRoles && (!decoded.role || !allowedRoles.includes(decoded.role))) {
    return { 
      authorized: false,
      error: 'Forbidden',
      status: 403,
      user: null 
    };
  }

  const user = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    isOwner: !!decoded.isOwner
  };

  return { 
    authorized: true,
    error: null,
    status: 200,
    user,
    // Standardized numeric ID
    id: decoded.id,
    userId: decoded.id, // For backward compatibility
    role: decoded.role,
    email: decoded.email,
    name: decoded.name,
    isOwner: !!decoded.isOwner
  };
}

/**
 * Centralized session creation logic to ensure consistency across the application.
 */
export async function createSession(user: { id: number; role?: string | null; type?: string | null; email: string; name: string; isPhoneVerified?: boolean }) {
  const role = user.role || user.type || null;
  
  // Check if user is system owner via DB
  const admin = await prisma.admin.findUnique({
    where: { userId: user.id },
    select: { isOwner: true }
  });
  const isOwner = !!admin?.isOwner;

  console.log(`[AUTH] Creating session for user ${user.id} with role: ${role}, Owner: ${isOwner}`);

  const token = await new SignJWT({ 
    id: user.id, 
    email: user.email,
    name: user.name,
    role: role,
    isPhoneVerified: !!user.isPhoneVerified,
    isOwner: isOwner
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET);

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  // Optional: Sync with DB
  try {
    await prisma.accountSession.create({
      data: {
        userId: user.id,
        token: token.substring(0, 511),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  } catch (e) {
    // Ignore DB session errors
  }

  return token;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (token) {
    try {
      await prisma.accountSession.deleteMany({
        where: { token: { startsWith: token.substring(0, 20) } }
      });
    } catch (e) {}
  }
  
  cookieStore.delete('auth-token');
}
