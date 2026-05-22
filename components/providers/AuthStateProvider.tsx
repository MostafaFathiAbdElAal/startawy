'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthStateContextType {
  isPhoneVerified: boolean;
  setPhoneVerified: (verified: boolean) => void;
  userName: string | undefined;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);

export function AuthStateProvider({ 
  children, 
  initialVerified, 
  initialName 
}: { 
  children: React.ReactNode; 
  initialVerified: boolean; 
  initialName: string | undefined;
}) {
  const [isPhoneVerified, setPhoneVerified] = useState(initialVerified);

  // Sync state if initialVerified changes on server re-render
  useEffect(() => {
    setPhoneVerified(initialVerified);
  }, [initialVerified]);

  return (
    <AuthStateContext.Provider value={{ isPhoneVerified, setPhoneVerified, userName: initialName }}>
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
}
