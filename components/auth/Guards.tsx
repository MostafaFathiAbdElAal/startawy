import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * AuthGuard: Ensures the user IS authenticated.
 * Used in (protected) layouts.
 */
export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = await verifyAuth(token);

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}

/**
 * GuestGuard: Ensures the user IS NOT authenticated.
 * Used in (auth) layouts (Login/Register).
 */
export async function GuestGuard({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const user = await verifyAuth(token);

  if (user && (user as { role?: string }).role) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
