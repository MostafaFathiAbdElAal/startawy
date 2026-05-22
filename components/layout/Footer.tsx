import React from 'react';
import Link from 'next/link';
import Image from 'next/image';


interface FooterProps {
  mode?: 'full' | 'minimal';
  year?: number;
}

export default function Footer({ mode = 'full', year = new Date().getFullYear() }: FooterProps) {
  if (mode === 'minimal') {
    return (
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
        &copy; {year} Startawy. all rights reserved.
      </div>
    );
  }

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20 transition-colors border-t border-gray-800 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-6 text-center md:text-left">
          {/* Brand Column */}
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <Image src="/assets/logos/startawy_s_fullres.png" alt="Startawy" width={140} height={45} className="brightness-0 invert h-11 w-auto" />
            <p className="text-gray-400 text-base leading-relaxed max-w-xs">
              Empowering startups with smart financial insights and expert consulting.
            </p>
          </div>

          {/* Platform Column */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-bold text-white mb-6 relative inline-block">
              Platform
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-1 bg-teal-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-gray-400 text-base">
              <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Service Packages</Link></li>
              <li><Link href="/founder/budget-analysis" className="hover:text-teal-400 transition-colors">Budget Analysis</Link></li>
              <li><Link href="/founder/library" className="hover:text-teal-400 transition-colors">Startawy Library</Link></li>
              <li><Link href="/founder/ai-consultant" className="hover:text-teal-400 transition-colors">AI Advisory Chatbot</Link></li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-bold text-white mb-6 relative inline-block">
              Services
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-1 bg-teal-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3 text-gray-400 text-base">
              <li><Link href="/founder/consultants" className="hover:text-teal-400 transition-colors">Private Sessions</Link></li>
              <li><Link href="/founder/reports" className="hover:text-teal-400 transition-colors">Market Reports</Link></li>
              <li><Link href="/founder/feedback" className="hover:text-teal-400 transition-colors">Submit Feedback</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-900 pt-6 text-center text-gray-500 text-sm">
          <p suppressHydrationWarning>&copy; {year} Startawy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
