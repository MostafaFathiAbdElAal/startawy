import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth-utils';

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
    const isConsultantRoute = pathname.startsWith('/consultant');
    const isAdminRoute = pathname.startsWith('/admin');
    
    // If a Founder tries to access Consultant or Admin routes -> Kick to dashboard
    if (user.role === 'FOUNDER' && (isConsultantRoute || isAdminRoute)) {
      console.log(`[PROXY] RBAC Violation: FOUNDER on ${pathname} -> Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If a Consultant tries to access Admin routes -> Kick to dashboard
    if (user.role === 'CONSULTANT' && isAdminRoute) {
      console.log(`[PROXY] RBAC Violation: CONSULTANT on ${pathname} -> Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
