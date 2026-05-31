import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * Obscures an email address for privacy (e.g., john.doe@example.com -> j*******e@example.com)
 */
function obscureEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Find all users registered with this phone number whose phone is verified
    const users = await prisma.user.findMany({
      where: {
        phone: phone,
        isPhoneVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Format results to obscure email addresses for security
    const matchingAccounts = users.map(user => ({
      id: user.id,
      name: user.name,
      email: obscureEmail(user.email),
      realEmail: user.email, // Kept to uniquely identify the selected user in subsequent steps
    }));

    return NextResponse.json({
      success: true,
      users: matchingAccounts,
    });
  } catch (error) {
    console.error('Find Users By Phone API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
