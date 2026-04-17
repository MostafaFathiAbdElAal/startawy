import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { RegisterSchema } from '@/lib/validations';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation
    try {
      await RegisterSchema.validate(body, { abortEarly: false });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.errors.join(', ') },
        { status: 400 }
      );
    }

    // 2. Register via Service
    const result = await AuthService.register(body);

    return NextResponse.json(
      { success: true, message: 'User registered successfully', userId: result.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message ? 400 : 500 }
    );
  }
}
