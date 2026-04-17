import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImage from "@/assets/imgs/logo.png";

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
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Image src={logoImage} alt="Startawy" width={100} height={35} className="brightness-0 invert h-8 w-auto" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering startups with smart financial insights and expert consulting.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-900 pt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
          &copy; {year} Startawy. all rights reserved.
        </div>
      </div>
    </footer>
  );
}
