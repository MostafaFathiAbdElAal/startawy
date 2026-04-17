import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { LoginSchema } from '../../../lib/validations';
import { createSession } from '../../../lib/auth-utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation
    try {
      await LoginSchema.validate(body, { abortEarly: false });
    } catch (error: unknown) {
      const validationError = error as { errors: string[] };
      return NextResponse.json(
        { error: validationError.errors.join(', ') },
        { status: 400 }
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 401 }
      );
    }

    // 3. Verify Password
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account is linked with Google. Please log in with Google to continue.' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // 4. Create Session and Set Cookie (Centralized)
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.type,
      isPhoneVerified: user.isPhoneVerified
    });

    // 5. Success Response
    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.type,
      },
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
