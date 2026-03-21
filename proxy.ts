import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  console.log(`[PROXY] Intercepting: ${pathname}`);

  let user = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch {
      // Token invalid
    }
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isCompleteProfile = pathname.startsWith('/complete-profile');
  const isHomePage = pathname === '/';
  
  // Public assets, API, and Home Page should always pass
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    isHomePage
  ) {
    return NextResponse.next();
  }

  // 1. If user is guest and trying to access anything other than auth pages -> Login
  if (!user && !isAuthPage) {
    console.log(`[PROXY] Guest access to ${pathname} -> Redirecting to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is logged in and trying to access auth pages -> Dashboard
  if (user && isAuthPage) {
    console.log(`[PROXY] Authenticated access to ${pathname} -> Redirecting to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. New: If user is logged in, has a role, and is trying to access /complete-profile -> Dashboard
  if (user && user.role && isCompleteProfile) {
    console.log(`[PROXY] Profile complete -> Redirecting to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. New: If user is logged in, NO role, and NOT on /complete-profile -> Complete Profile
  if (user && !user.role && !isCompleteProfile && !isHomePage) {
      console.log(`[PROXY] Partial user -> Redirecting to /complete-profile`);
      return NextResponse.redirect(new URL('/complete-profile', request.url));
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
