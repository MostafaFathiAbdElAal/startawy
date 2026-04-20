import { AuthGuard } from '@/components/auth/Guards';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { getProfileData } from '@/app/actions/user';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  interface ProfileData {
    user: {
      id: number;
      email: string;
      name: string | null;
      type: "FOUNDER" | "CONSULTANT" | "ADMIN";
      image: string | null;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      isOwner: boolean;
      founder?: unknown;
      consultant?: unknown;
      admin?: unknown;
    };
    hasPaidPlan: boolean;
    hasPremiumPlan: boolean;
  }

  const profile = (await getProfileData()) as ProfileData | null;

  if (!profile) {
    redirect('/logout');
  }

  const { user } = profile;

  const isOwner = !!user.isOwner;

  // Profile Completion Guard (Exclude Owner)
  if (!isOwner) {
    const isProfileIncomplete = 
      !user.type || 
      (user.type === 'FOUNDER' && !user.founder) ||
      (user.type === 'CONSULTANT' && !user.consultant);

    if (isProfileIncomplete) {
      console.log(`[LAYOUT] Profile incomplete in DB -> Redirecting to /complete-profile`);
      redirect('/complete-profile');
    }
  }

  const { hasPaidPlan, hasPremiumPlan } = profile;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
        <Sidebar 
          userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} 
          isOwner={isOwner} 
          hasPaidPlan={hasPaidPlan}
          hasPremiumPlan={hasPremiumPlan}
        />
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
          <TopBar 
            userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} 
            userName={user.name ?? undefined} 
            userEmail={user.email}
            userImage={user.image}
            isVerified={user.isEmailVerified && user.isPhoneVerified}
            isOwner={isOwner}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
