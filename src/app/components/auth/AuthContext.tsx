import React, { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forceOnlineStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const signIn = useCallback(async () => {
    throw new Error('Admin login is disabled in the static preview.');
  }, []);
  const signOut = useCallback(async () => {}, []);

  const value = useMemo<AuthContextType>(() => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isOnline: false,
    signIn,
    signOut,
    forceOnlineStatus: () => {},
  }), [signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
