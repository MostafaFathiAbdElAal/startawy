import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`inline-flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <Image 
          src="/assets/logos/startawy_s_fullres.png" 
          alt="Startawy Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
