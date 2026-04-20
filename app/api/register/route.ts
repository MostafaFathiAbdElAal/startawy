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
    } catch (error: unknown) {
      const validationErrors = (error as { errors?: string[] }).errors?.join(', ') || "Validation failed";
      return NextResponse.json(
        { error: validationErrors },
        { status: 400 }
      );
    }

    // 2. Register via Service
    const result = await AuthService.register(body);

    return NextResponse.json(
      { success: true, message: 'User registered successfully', userId: result.id },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Registration API Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
