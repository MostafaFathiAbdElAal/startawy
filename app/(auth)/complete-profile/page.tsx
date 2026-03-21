import CompleteProfileForm from '@/components/CompleteProfileForm';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';
import bgRegister from "@/assets/imgs/signup-image.png";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Profile - BIS',
  description: 'Tell us a bit more about you to get started',
};

export default function CompleteProfilePage() {
  return (
    <div className="h-screen w-full flex overflow-hidden relative bg-white dark:bg-auth-bg-dark">
      {/* Dark Mode Toggle */}
      <ThemeToggle />

      {/* Left Side - Image */}
      <div className="flex w-[40%] lg:w-[60%] relative overflow-hidden bg-linear-to-br from-teal-900 via-cyan-900 to-blue-900 border-r border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-black/10 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={bgRegister}
            alt="BIS Platform"
            fill
            className="w-full h-full object-cover"
            priority
            unoptimized
          />
        </div>
        <div className="absolute bottom-12 left-12 z-20 max-w-md hidden lg:block">
          <h2 className="text-4xl font-bold text-white mb-4">You&apos;re almost there!</h2>
          <p className="text-teal-100 text-lg">Just one more step to personalize your experience and unlock all features.</p>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-auth-bg-light dark:bg-gray-900/50 overflow-y-auto py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white mb-4 shadow-xl shadow-teal-500/20 transform -rotate-3">
              <span className="text-2xl font-black italic">BIS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Setup</h1>
          </div>

          <CompleteProfileForm />

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} BIS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
