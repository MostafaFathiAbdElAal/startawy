'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SignJWT } from 'jose';

import bcrypt from 'bcryptjs';
import * as Yup from 'yup';
import { prisma } from '../../lib/prisma';
import { RegisterSchema } from '../../lib/validations';
import { Prisma } from '@prisma/client';
import { verifyAuth } from '../../lib/auth-utils';

type RegisterData = Yup.InferType<typeof RegisterSchema>;

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  return await verifyAuth(token);
}

export async function registerUser(formData: RegisterData) {
  try {
    // 1. Validation (Backend)
    await RegisterSchema.validate(formData, { abortEarly: false });

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return { error: 'Email already registered.' };
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(formData.password, 12);

    // 4. Create User and Role-specific Profile in a Transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: formData.fullName,
          email: formData.email,
          password: hashedPassword,
          phone: formData.phone,
          type: formData.role,
        },
      });

      if (formData.role === 'FOUNDER') {
        await tx.startupFounder.create({
          data: {
            userId: user.id,
            businessName: '',
            businessSector: '',
            foundingDate: new Date(),
          },
        });
      } else if (formData.role === 'CONSULTANT') {
        await tx.consultant.create({
          data: {
            userId: user.id,
            yearsOfExp: 0,
            specialization: '',
            availability: 'FULL_TIME',
          },
        });
      }

      return user;
    });

    return { success: true, user: { id: result.id, name: result.name, email: result.email } };
  } catch (error: unknown) {
    if (error instanceof Yup.ValidationError) {
      return { error: error.errors.join(', ') };
    }
    console.error('Registration Error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

function obscureEmail(email: string) {
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function sendPasswordResetOTP(phone: string) {
  try {
    // 1. Check if user exists with this phone
    const user = await prisma.user.findFirst({
      where: { phone: phone },
    });

    if (!user) {
      return { error: 'No account found with this phone number.' };
    }

    // [ADD] Check if phone is verified before allowing password reset
    if (!user.isPhoneVerified) {
      return { error: 'Your phone number is not verified. Please verify it in your profile first.' };
    }

    // 2. Check if a valid OTP already exists
    const existingOtp = await prisma.oTP.findFirst({
      where: {
        phone,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingOtp) {
      const remainingSeconds = Math.floor((existingOtp.expiresAt.getTime() - Date.now()) / 1000);
      return {
        success: true,
        user: {
          name: user.name,
          email: obscureEmail(user.email)
        },
        remainingSeconds // Return existing time to sync frontend timer
      };
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // 4. Save to DB (Cleanup old ones first)
    await prisma.oTP.deleteMany({ where: { phone } });
    await prisma.oTP.create({
      data: { phone, code: otp, expiresAt }
    });

    // 4. Call WhatsApp Microservice
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STARTAWY_SECRET_KEY || 'STARTAWY_SECRET_123456'}`
      },
      body: JSON.stringify({ phone, otp }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Service Error:', result);
      return { error: 'Failed to send WhatsApp message. Please try again.' };
    }

    return {
      success: true,
      user: {
        name: user.name,
        email: obscureEmail(user.email)
      }
    };
  } catch (error: unknown) {
    console.error('OTP Send Error:', error);
    return { error: 'Internal server error' };
  }
}

export async function verifyOTP(phone: string, otp: string) {
  try {
    const storedOtp = await prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedOtp) {
      return { error: 'Invalid or expired OTP code.' };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Verify OTP Error:', error);
    return { error: 'Internal server error' };
  }
}

export async function resetPassword(phone: string, otp: string, newPassword: string) {
  try {
    // 1. Verify OTP
    const storedOtp = await prisma.oTP.findFirst({
      where: {
        phone,
        code: otp,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedOtp) {
      return { error: 'Invalid or expired OTP code.' };
    }

    // 2. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 3. Update User Password
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user) return { error: 'User not found' };

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // 4. Cleanup OTP
    await prisma.oTP.deleteMany({ where: { phone } });

    return { success: true };
  } catch (error: unknown) {
    console.error('Reset Password Error:', error);
    return { error: 'Internal server error' };
  }
}
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  redirect('/login?loggedOut=true');
}

export async function logoutToHome() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  redirect('/');
}

export async function sendVerificationOTP() {
  console.log('[OTP] sendVerificationOTP called');
  try {
    const session = await getUser();
    if (!session) return { error: 'Unauthorized' };

    const user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    if (!user || !user.phone) return { error: 'User or phone not found' };

    // Check if already verified
    if (user.isPhoneVerified) return { error: 'Phone already verified' };

    // Check if a valid OTP already exists
    const existingOtp = await prisma.oTP.findFirst({
      where: {
        phone: user.phone,
        expiresAt: { gt: new Date() }
      }
    });

    if (existingOtp) {
      const remainingSeconds = Math.floor((existingOtp.expiresAt.getTime() - Date.now()) / 1000);
      return { success: true, remainingSeconds };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save to DB
    await prisma.oTP.deleteMany({ where: { phone: user.phone } });
    await prisma.oTP.create({
      data: { phone: user.phone, code: otp, expiresAt }
    });

    console.log('[OTP] sending WhatsApp code:', otp, 'to:', user.phone);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STARTAWY_SECRET_KEY || 'STARTAWY_SECRET_123456'}`
        },
        body: JSON.stringify({ phone: user.phone, otp }),
        signal: controller.signal
      });

      if (!response.ok) {
        console.error('[OTP] WhatsApp Service failed:', response.status);
        return { error: `WhatsApp Service failed (${response.status})` };
      }

      console.log('[OTP] OTP sent successfully');
      return { success: true };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error('[OTP] WhatsApp Service timed out');
        return { error: 'WhatsApp service timed out. Please check if it is running.' };
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: unknown) {
    console.error('Send Verification OTP Error:', error);
    return { error: 'Internal server error' };
  }
}

export async function verifyPhone(otp: string) {
  try {
    const session = await getUser();
    if (!session) return { error: 'Unauthorized' };

    const user = await prisma.user.findUnique({ where: { id: Number(session.id) } });
    if (!user || !user.phone) return { error: 'User or phone not found' };

    const storedOtp = await prisma.oTP.findFirst({
      where: {
        phone: user.phone,
        code: otp,
        expiresAt: { gt: new Date() }
      }
    });

    if (!storedOtp) {
      return { error: 'Invalid or expired OTP code.' };
    }

    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true }
    });

    // Cleanup OTP
    await prisma.oTP.deleteMany({ where: { phone: user.phone } });

    // 5. Update JWT Cookie to reflect verified status
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.type,
      isPhoneVerified: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    revalidatePath('/');
    revalidatePath('/profile');

    return { success: true };
  } catch (error: unknown) {
    console.error('Verify Phone Error:', error);
    return { error: 'Internal server error' };
  }
}
