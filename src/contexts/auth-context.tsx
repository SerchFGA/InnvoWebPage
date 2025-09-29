'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginAction, logout as logoutAction } from '@/lib/auth/actions';

interface User {
  isLoggedIn: boolean;
  username: string;
}

interface AuthContextType {
  user: User;
  login: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  user: User;
}

export function AuthProvider({ children, user: initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User>(initialUser);
  const router = useRouter();

  const login = useCallback(async (formData: FormData) => {
    const result = await loginAction(formData);
    if (result.success) {
      // Upon successful login, we need to refresh the page to make sure
      // the new session is picked up by the server components.
      router.push('/');
      router.refresh();
    }
    return result;
  }, [router]);

  const logout = useCallback(async () => {
    await logoutAction();
    // Upon logout, we also need to refresh the page.
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
