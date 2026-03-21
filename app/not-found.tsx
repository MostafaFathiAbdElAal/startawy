import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';
import { getProfileData } from '@/app/actions/user';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default async function NotFound() {
  const profile = await getProfileData();
  const user = profile?.user;

  const content = (
    <div className="relative min-h-[calc(100vh-85px)] w-full flex flex-col items-center justify-center overflow-hidden font-outfit px-4"
         style={{ background: 'linear-gradient(to bottom, #96FFE5 0%, #FFFFFF 100%)' }}>
      
      {/* Decorative Ellipses (Circles) - using solid color to be visible */}
      <div className="absolute top-[18%] left-[12%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute top-[55%] left-[8%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute top-[20%] right-[8%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute bottom-[15%] right-[12%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute bottom-[12%] left-[35%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />

      {/* Main 404 Image - Foreground Layer */}
      <div className="relative w-full max-w-[550px] aspect-[4/3] mb-8 animate-in fade-in zoom-in duration-700 z-10">
        <Image
          src="/assets/imgs/notfound404.png"
          alt="404 Not Found"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full justify-center">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-[20px] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20 w-full sm:w-auto min-w-[200px]"
          style={{ background: 'linear-gradient(to right, #00BBA7, #009689)' }}
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        {/* Go to Dashboard Button */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-[20px] border-2 border-[#00BBA7] text-[#00BBA7] font-bold transition-all hover:bg-teal-50 hover:scale-105 active:scale-95 w-full sm:w-auto min-w-[200px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go to Dashboard</span>
        </Link>
      </div>

      
    </div>
  );

  // If user is logged in, show with Sidebar and TopBar
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
        <Sidebar userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} />
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
          <TopBar 
            userRole={user.type as "FOUNDER" | "CONSULTANT" | "ADMIN"} 
            userName={user.name} 
            userEmail={user.email}
            isVerified={user.isEmailVerified && user.isPhoneVerified}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 bg-white">
            {content}
          </main>
        </div>
      </div>
    );
  }

  // Generic 404 for unauthenticated users
  return (
    <div className="min-h-screen w-full bg-white">
      {content}
    </div>
  );
}
