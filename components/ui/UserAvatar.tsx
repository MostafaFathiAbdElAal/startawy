'use client';

import { ShieldCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface UserAvatarProps {
  name?: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
}

export default function UserAvatar({ name = 'User', image, size = 'md', isVerified = false }: UserAvatarProps) {
  // Extract initials (First part + Last part)
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  // Safety check: Don't render Google images (redundant filter)
  const finalImage = image?.includes('googleusercontent') ? null : image;

  // Size mappings
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
  };

  // Pixel size mappings for Next.js Image
  const pixelSizes = {
    sm: 40,
    md: 48,
    lg: 96,
    xl: 128,
  };

  // Dot size mappings
  const dotSizes = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-4.5 h-4.5 border-2',
    lg: 'w-7 h-7 border-3',
    xl: 'w-9 h-9 border-4',
  };

  // Icon size mappings
  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-black border-2 border-white dark:border-slate-900 overflow-hidden relative ${!finalImage
          ? 'bg-linear-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-xl shadow-purple-500/20'
          : 'bg-transparent shadow-md'
        }`}>
        {finalImage ? (
          <Image
            src={finalImage}
            alt={name}
            width={pixelSizes[size]}
            height={pixelSizes[size]}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Status/Verification Dot in Top Right */}
      <div className={`absolute -top-1 -right-1 ${dotSizes[size]} rounded-full flex items-center justify-center shadow-lg border-white dark:border-slate-900 z-10 ${isVerified ? 'bg-teal-500' : 'bg-yellow-400'
        }`}>
        {isVerified ? (
          <ShieldCheck className={`${iconSizes[size]} text-white`} strokeWidth={3} />
        ) : (
          <AlertCircle className={`${iconSizes[size]} text-white`} strokeWidth={3} />
        )}
      </div>
    </div>
  );
}
