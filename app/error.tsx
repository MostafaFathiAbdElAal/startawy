'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RotateCw, LogOut } from 'lucide-react';

// Import images for optimized compilation
import warningImg from '@/assets/imgs/warning.png';
import laptopImg from '@/assets/imgs/laptopWaning.png';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error('Global Error Caught:', error);
  }, [error]);

  const handleResetSession = () => {
    // Clear all cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    // Redirect to login
    window.location.href = '/login';
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden font-outfit"
         style={{ background: 'linear-gradient(135deg, #91FFE4 0%, #FBFBFB 50%, #A1FFE8 100%)' }}>
      
      {/* Large Decorative Warning Icon - Bottom Left 背景 */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square opacity-[0.15] pointer-events-none select-none overflow-hidden">
        <Image
          src={warningImg}
          alt="Warning Background Decorative"
          fill
          className="object-contain"
        />
      </div>

      <div className="container max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left animate-in slide-in-from-left duration-700">
          <h1 className="text-7xl lg:text-8xl font-black mb-4 tracking-tight" style={{ color: '#009689' }}>
            Oops!
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: '#ED5959' }}>
            Something went wrong
          </h2>
          <p className="text-lg lg:text-xl mb-10 max-w-md mx-auto lg:mx-0" style={{ color: '#828282' }}>
            Don't worry we're working on it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {/* Retry Button */}
            <button
              onClick={() => reset()}
              className="group flex items-center justify-center gap-[10px] px-[23px] py-[15px] h-[58px] w-[134px] rounded-[16px] bg-white/67 border-[1px] border-[#59ED79] text-[#59ED79] font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]"
            >
              <RotateCw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
              <span>Retry</span>
            </button>

            {/* Reset Session Button */}
            <button
              onClick={handleResetSession}
              className="group flex items-center justify-center gap-[10px] px-[23px] py-[15px] h-[58px] min-w-[215px] rounded-[16px] bg-white/67 border-[1px] border-[#ED5959] text-[#ED5959] font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1),0_10px_15px_-3px_rgba(0,0,0,0.1)]"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>Reset session</span>
            </button>
          </div>
        </div>

        {/* Main Illustration */}
        <div className="flex-1 w-full max-w-[650px] aspect-[4/3] relative animate-in slide-in-from-right duration-1000">
          <Image
            src={laptopImg}
            alt="Error Illustration"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

    </div>
  );
}
