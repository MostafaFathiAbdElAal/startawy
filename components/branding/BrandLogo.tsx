import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  textClassName?: string;
}

export default function BrandLogo({ className = '', size = 'md', textClassName = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300 ${className}`}>
      <span className={`font-black italic ${textSizes[size]} ${textClassName}`}>Startawy</span>
    </div>
  );
}
