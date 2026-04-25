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

  // 1.5 Immediate Suspension Check
  // Check the DB on every protected request for suspended users
  if (user && !isHomePage && !pathname.startsWith('/api')) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isSuspended: true }
    });
    
    if (dbUser?.isSuspended) {
      console.log(`[PROXY] Suspended user detected -> Forcing logout and redirecting to /login`);
      const response = NextResponse.redirect(new URL('/login?suspended=true', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isCompleteProfile = pathname.startsWith('/complete-profile');
  if (!user && !isAuthPage) {
    console.log(`[PROXY] Redirecting guest to /login (Attempted: ${pathname})`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is logged in and trying to access auth pages -> Dashboard based on role
  if (user && isAuthPage) {
    console.log(`[PROXY] Logged in user on auth page -> Redirecting to dashboard`);
    let target = '/dashboard';
    if (user.role === 'ADMIN') target = '/admin/dashboard';
    else if (user.role === 'CONSULTANT') target = '/consultant/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2.5 Ensure users on generic /dashboard are routed correctly based on their role
  if (user && pathname === '/dashboard') {
    if (user.role === 'ADMIN') {
      console.log(`[PROXY] ADMIN on /dashboard -> Redirecting to /admin/dashboard`);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (user.role === 'CONSULTANT') {
      console.log(`[PROXY] CONSULTANT on /dashboard -> Redirecting to /consultant/dashboard`);
      return NextResponse.redirect(new URL('/consultant/dashboard', request.url));
    }
  }

  // 3. Removed: We no longer redirect users away from /complete-profile just because they have a role.
  // The database (via layout.tsx) is the only true source of truth for profile completeness.

  // 4. New: If user is logged in, NO role, and NOT on /complete-profile -> Complete Profile
  // Owner Bypasses this to allow direct access to Admin tools
  if (!isOwner && user && !user.role && !isCompleteProfile && !isHomePage) {
      console.log(`[PROXY] User with NO ROLE on protected page -> Redirecting to /complete-profile from ${pathname}`);
      return NextResponse.redirect(new URL('/complete-profile', request.url));
  }

  // 5. Role-Based Access Control (RBAC) - [STRICT ENFORCEMENT]
  if (user && user.role) {
    const isConsultantRoute = pathname.startsWith('/consultant');
    const isAdminRoute = pathname.startsWith('/admin');
    
    // Special routes that are public-ish (Consultant Profiles & Booking)
    // Matches: /consultant/123, /consultant/123/, /consultant/123/book, /consultant/123/book/
    const isPublicConsultantView = pathname.match(/^\/consultant\/\d+(\/book)?\/?$/);

    // Define explicitly founder-only routes
    const isFounderRoute = [
      '/founder',
      '/budget-analysis',
      '/ai-chatbot',
      '/book-consultant',
      '/my-sessions',
      '/my-plan',
      '/my-payments',
      '/my-reports',
      '/payment',
      '/plans'
    ].some(path => pathname.startsWith(path));

    // Founder Restrictions
    if (user.role === 'FOUNDER' && ((isConsultantRoute && !isPublicConsultantView) || isAdminRoute)) {
      console.log(`[PROXY] RBAC Violation: FOUNDER on ${pathname} -> Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Consultant Restrictions
    if (user.role === 'CONSULTANT' && (isAdminRoute || isFounderRoute)) {
      console.log(`[PROXY] RBAC Violation: CONSULTANT on ${pathname} -> Redirecting to /consultant/dashboard`);
      return NextResponse.redirect(new URL('/consultant/dashboard', request.url));
    }

    // Admin Restrictions
    if (user.role === 'ADMIN' && ((isConsultantRoute && !isPublicConsultantView) || isFounderRoute)) {
      console.log(`[PROXY] RBAC Violation: ADMIN on ${pathname} -> Redirecting to /admin/dashboard`);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // 6. Plan-Based Access Control (PBAC) - [RELAXED FOR PREVIEWS]
    // Allow all Founders to enter the library to see previews (Chapter 3 compliance).
    // Download restrictions are handled in LibraryClient.tsx and /api/reports/download.
    if (user.role === 'FOUNDER' && pathname.startsWith('/startawy-library')) {
      console.log(`[PROXY] Allowing FOUNDER to view Library Previews: ${pathname}`);
    }

    // 7. Budget Analysis Access Control - [RELAXED]
    // All users (Free, Basic, Premium) get access to budget analysis (Free gets basic version).
    if (user.role === 'FOUNDER' && pathname.startsWith('/budget-analysis')) {
        console.log(`[PROXY] Allowing FOUNDER to access Budget Analysis: ${pathname}`);
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
