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

  const { user } = profile;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
        <Sidebar userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} />
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
