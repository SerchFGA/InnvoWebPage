'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutAction } from '@/lib/auth/actions';

interface User {
  isLoggedIn: boolean;
  username: string;
}

interface AuthContextType {
  user: User;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  user: User;
}

export function AuthProvider({ children, user }: AuthProviderProps) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await logoutAction();
    // Forzar una actualización completa para que el servidor reconozca el estado de cierre de sesión.
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
