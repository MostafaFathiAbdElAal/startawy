'use client';

import { useTransition } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { logoutToHome } from '@/app/actions/auth';

export function AccessDenied({ message = "You must be an Administrator to view this page." }: { message?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleReturn = () => {
    startTransition(async () => {
      await logoutToHome();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-gray-100 dark:border-slate-700">
        
        {/* Icon Container with pulse effect */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-75" />
          <div className="relative z-10 w-full h-full bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-10 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <button
          onClick={handleReturn}
          disabled={isPending}
          className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <LogOut className={`w-5 h-5 ${isPending ? 'animate-pulse' : 'group-hover:-translate-x-1 transition-transform'}`} />
          <span>{isPending ? 'Clearing Session...' : 'Return to Main Site'}</span>
        </button>
        
        <div className="mt-6 text-sm text-gray-400 dark:text-slate-500">
          Error Code: 403 Forbidden
        </div>
      </div>
    </div>
  );
}
