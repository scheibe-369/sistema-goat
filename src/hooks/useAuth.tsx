
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- MOCK AUTH FOR LOCAL DEVELOPMENT ---
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'helimonteiro@mgial.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>(mockSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // We disable the real Supabase listener for now to avoid redirects
    console.log('Auth bypass active: Using mock session');
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Mock login called with:', email);
    setUser(mockUser);
    setSession(mockSession);
    return true;
  };

  const logout = async () => {
    console.log('Mock logout called');
    setUser(null);
    setSession(null);
    toast.success('Logout (Mock) realizado');
  };

  const value = {
    user,
    session,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
