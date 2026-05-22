import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  
  return NextResponse.redirect(loginUrl);
}
