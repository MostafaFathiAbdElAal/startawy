'use client';

import { useChatStore } from '@/lib/store/useChatStore';
import { useState, useEffect } from 'react';

export function ContactSalesButton() {
  const [mounted, setMounted] = useState(false);
  const setIsOpen = useChatStore((state) => state.setIsOpen);

  // Use useEffect to set mounted state to true after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400 rounded-2xl font-black opacity-50 cursor-not-allowed">
        Contact Sales
      </button>
    );
  }

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all font-black shadow-lg shadow-teal-500/5 active:scale-95"
    >
      Contact Sales
    </button>
  );
}
