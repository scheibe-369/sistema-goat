
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário de teste
const TEST_USER: User = {
  id: '1',
  email: 'admin@goat.com',
  name: 'Admin Goat'
};

const TEST_CREDENTIALS = {
  email: 'admin@goat.com',
  password: '123456'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('goat-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simula uma requisição de login
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      setUser(TEST_USER);
      localStorage.setItem('goat-user', JSON.stringify(TEST_USER));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goat-user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
