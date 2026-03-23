'use server';

import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    founder: {
      include: {
        payments: {
          include: {
            subscription: true
          },
          orderBy: {
            transDate: 'desc'
          },
          take: 1
        }
      }
    },
    consultant: true,
    admin: true,
  }
}>;

export async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userPayload.id) },
    include: {
      founder: {
        include: {
          payments: {
            include: {
              subscription: true
            },
            orderBy: {
              transDate: 'desc'
            },
            take: 1
          }
        }
      },
      consultant: true,
      admin: true,
    }
  }) as UserWithRelations;

  if (!user) return null;

  // Extract subscription info
  const subscription = user.founder?.payments[0]?.subscription || null;
  const activePlan = user.founder?.payments[0]?.paymentType || 'Free Plan';

  // Fetch some stats for the profile
  const stats = {
    sessions: 0,
    reports: 0,
    projects: 0,
  };

  if (user.type === 'FOUNDER' && user.founder) {
    stats.sessions = await prisma.session.count({ where: { founderId: user.founder.id } });
    stats.reports = await prisma.founderReport.count({ where: { founderId: user.founder.id } });
    stats.projects = await prisma.budgetAnalysis.count({ where: { founderId: user.founder.id } });
  } else if (user.type === 'CONSULTANT' && user.consultant) {
    stats.sessions = await prisma.session.count({ where: { consultantId: user.consultant.id } });
  }

  return {
    user,
    stats,
    subscription,
    activePlan
  };
}

export async function updateProfile(data: { 
  name: string; 
  phone?: string; 
  businessName?: string; 
  businessSector?: string; 
  bio?: string;
  yearsOfExp?: string | number;
  specialization?: string;
  foundingDate?: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) {
    return { error: 'Unauthorized' };
  }

  try {
    console.log('[UPDATE] Updating user:', userPayload.id, 'role:', userPayload.role, 'data:', data);

    // 1. Get current user to check if phone changed
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(userPayload.id) }
    });

    const phoneChanged = data.phone !== currentUser?.phone;

    await prisma.user.update({
      where: { id: parseInt(userPayload.id) },
      data: {
        name: data.name,
        phone: data.phone,
        ...(phoneChanged && { isPhoneVerified: false })
      }
    });

    if (userPayload.role === 'FOUNDER') {
      console.log('[UPDATE] Updating Founder profile');
      await prisma.startupFounder.update({
        where: { userId: parseInt(userPayload.id) },
        data: {
          businessName: data.businessName,
          businessSector: data.businessSector,
          foundingDate: data.foundingDate ? new Date(data.foundingDate) : undefined,
          description: data.bio,
        }
      });
    } else if (userPayload.role === 'CONSULTANT') {
      console.log('[UPDATE] Updating Consultant profile');
      await prisma.consultant.update({
        where: { userId: parseInt(userPayload.id) },
        data: {
          yearsOfExp: data.yearsOfExp ? parseInt(data.yearsOfExp.toString()) : undefined,
          specialization: data.specialization,
        }
      });
    }

    console.log('[UPDATE] Update successful');
    return { success: true };
  } catch (error) {
    console.error('[UPDATE] Update Profile Error:', error);
    return { error: 'Failed to update profile' };
  }
}
