import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth-utils';
import { prisma } from './lib/prisma';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isHomePage = pathname === '/';
  
  // Public assets, API, and Home Page should always bypass proxy logic immediately
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    isHomePage
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  console.log(`[PROXY] Intercepting: ${pathname}`);

  const user = await verifyAuth(token);
  
  if (user) {
    console.log(`[PROXY] User detected: ${user.email}, Role: ${user.role}`);
  } else {
    console.log('[PROXY] Guest user detected');
  }

  const isOwner = !!user?.isOwner;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isCompleteProfile = pathname.startsWith('/complete-profile');
  if (!user && !isAuthPage) {
    console.log(`[PROXY] Redirecting guest to /login (Attempted: ${pathname})`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is logged in and trying to access auth pages -> Dashboard
  if (user && isAuthPage) {
    console.log(`[PROXY] Logged in user on auth page -> Redirecting to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Removed: We no longer redirect users away from /complete-profile just because they have a role.
  // The database (via layout.tsx) is the only true source of truth for profile completeness.

  // 4. New: If user is logged in, NO role, and NOT on /complete-profile -> Complete Profile
  // Owner Bypasses this to allow direct access to Admin tools
  if (!isOwner && user && !user.role && !isCompleteProfile && !isHomePage) {
      console.log(`[PROXY] User with NO ROLE on protected page -> Redirecting to /complete-profile from ${pathname}`);
      return NextResponse.redirect(new URL('/complete-profile', request.url));
  }

  // 5. Role-Based Access Control (RBAC) - [NEW]
  // Stops Founders from entering Consultant areas & prevents infinite Loops
  if (!isOwner && user && user.role) {
    const isConsultantPrivateZone = [
      '/consultant/dashboard',
      '/consultant/sessions',
      '/consultant/earnings',
      '/consultant/clients',
      '/consultant/availability',
      '/consultant/follow-up-plans',
      '/consultant/recommendations'
    ].some(path => pathname.startsWith(path));
    
    const isAdminRoute = pathname.startsWith('/admin');
    
    // If a Founder tries to access Consultant Private areas or Admin routes -> Kick to dashboard
    if (user.role === 'FOUNDER' && (isConsultantPrivateZone || isAdminRoute)) {
      console.log(`[PROXY] RBAC Violation: FOUNDER on ${pathname} -> Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If a Consultant tries to access Admin routes -> Kick to dashboard
    if (user.role === 'CONSULTANT' && isAdminRoute) {
      console.log(`[PROXY] RBAC Violation: CONSULTANT on ${pathname} -> Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 6. Plan-Based Access Control (PBAC) - [NEW]
    // Restrict Startawy Library to Premium users only
    if (user.role === 'FOUNDER' && pathname.startsWith('/startawy-library')) {
      const founder = await prisma.startupFounder.findUnique({
        where: { userId: user.id },
        include: { 
          payments: {
            include: { subscription: true },
            orderBy: { transDate: 'desc' },
            take: 1
          }
        }
      });

      const latestPayment = founder?.payments[0];
      const subscription = latestPayment?.subscription;
      const isPremium = (latestPayment?.amount || 0) >= 299 && subscription?.status === 'ACTIVE';

      if (!isPremium) {
        console.log(`[PROXY] PBAC Violation: NON-PREMIUM on ${pathname} -> Redirecting to /my-plan`);
        return NextResponse.redirect(new URL('/my-plan', request.url));
      }
    }

    // 7. Budget Analysis Access Control - [NEW]
    if (user.role === 'FOUNDER' && pathname.startsWith('/budget-analysis')) {
      const founder = await prisma.startupFounder.findUnique({
        where: { userId: user.id },
        include: { 
          payments: {
            include: { subscription: true },
            orderBy: { transDate: 'desc' },
            take: 1
          }
        }
      });

      const latestPayment = founder?.payments[0];
      const subscription = latestPayment?.subscription;
      const isPaid = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate) && (latestPayment?.amount || 0) > 0;

      if (!isPaid) {
        console.log(`[PROXY] PBAC Violation: NON-PAID on ${pathname} -> Redirecting to /my-plan`);
        return NextResponse.redirect(new URL('/my-plan', request.url));
      }
    }
  }

  console.log(`[PROXY] Allowing: ${pathname}`);
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
