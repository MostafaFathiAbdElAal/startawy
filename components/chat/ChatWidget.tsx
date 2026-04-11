'use client';

import { usePathname } from 'next/navigation';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  isAuthenticated: boolean;
  userRole?: string;
  userName?: string;
  isPhoneVerified: boolean;
}

export const ChatWidget = ({ isAuthenticated, userRole, userName, isPhoneVerified }: ChatWidgetProps) => {
  const pathname = usePathname();
  
  // Routes where the chat widget should NOT appear
  const authRoutes = ['/login', '/register', '/forgot-password', '/complete-profile'];
  const isAuthPath = authRoutes.some(route => pathname.includes(route));

  // Hide the regular user chat widget for Admins as they should use the dashboard
  if (isAuthPath || userRole === 'ADMIN') return null;

  return (
    <>
      <ChatButton />
      <ChatWindow isAuthenticated={isAuthenticated} isPhoneVerified={isPhoneVerified} userName={userName} userRole={userRole} />
    </>
  );
};
