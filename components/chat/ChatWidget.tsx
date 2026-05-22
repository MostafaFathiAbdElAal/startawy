'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useAuthState } from '@/components/providers/AuthStateProvider';

interface ChatWidgetProps {
  isAuthenticated: boolean;
  userRole?: string;
  isOwner?: boolean;
}

export const ChatWidget = ({ isAuthenticated, userRole, isOwner: propIsOwner }: ChatWidgetProps) => {
  const { isPhoneVerified, userName } = useAuthState();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  // Routes where the chat widget should NOT appear
  const authRoutes = ['/login', '/register', '/forgot-password', '/complete-profile'];
  const isAuthPath = authRoutes.some(route => pathname.includes(route));

  // Determine if user is Admin or Owner
  const isAdmin = userRole === 'ADMIN';
  const isOwner = !!propIsOwner;

  // 1. Hide during hydration to prevent mismatch
  // 2. Hide on auth paths
  // 3. Hide for Admins and the System Owner
  if (!mounted || isAuthPath || isAdmin || isOwner) return null;

  return (
    <>
      <ChatButton />
      <ChatWindow isAuthenticated={isAuthenticated} isPhoneVerified={isPhoneVerified} userName={userName} userRole={userRole} />
    </>
  );
};
