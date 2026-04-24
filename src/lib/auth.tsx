'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const AUTH_KEY = 'finance_manager_auth';
const CREDENTIALS = { email: 'david@finance.cz', password: 'David2026!' };

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    setIsAuthenticated(stored === 'true');
    setLoaded(true);
  }, []);

  const login = (email: string, password: string) => {
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
