import { AuthGuard } from '@/components/auth/Guards';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { getProfileData } from '@/app/actions/user';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfileData();

  if (!profile) {
    redirect('/login');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = profile as { user: any }; // Using any to simplify relation access for validation

  const isOwner = user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

  // Profile Completion Guard (Exclude Owner)
  if (!isOwner) {
    const isProfileIncomplete = 
      !user.type || 
      (user.type === 'FOUNDER' && !user.founder) ||
      (user.type === 'CONSULTANT' && !user.consultant) ||
      (user.type === 'ADMIN' && !user.admin);

    if (isProfileIncomplete) {
      redirect('/complete-profile');
    }
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
        <Sidebar userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} userEmail={user.email} />
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
          <TopBar 
            userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} 
            userName={user.name} 
            userEmail={user.email}
            isVerified={user.isEmailVerified && user.isPhoneVerified}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
