import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';

export default async function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-outfit px-4"
         style={{ background: 'linear-gradient(to bottom, #96FFE5 0%, #FFFFFF 100%)' }}>
      
      {/* Decorative Ellipses (Circles) */}
      <div className="absolute top-[18%] left-[12%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute top-[55%] left-[8%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute top-[20%] right-[8%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute bottom-[15%] right-[12%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />
      <div className="absolute bottom-[12%] left-[35%] w-[139px] h-[134px] rounded-full z-0" style={{ backgroundColor: '#2BD4AA', opacity: 0.20 }} />

      {/* Main 404 Image */}
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
        <Link
          href="/"
          className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-[20px] text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20 w-full sm:w-auto min-w-[200px]"
          style={{ background: 'linear-gradient(to right, #00BBA7, #009689)' }}
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

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
}
