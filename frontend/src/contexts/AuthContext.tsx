'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApiClient } from '@/utils/auth-api';
import { UserType } from '@/types/api';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    handle: string;
  }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      // Check authentication with JWT token
      const authStatus = await authApiClient.getAuthStatus();

      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);

      // Redirect to login if on protected route
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApiClient.login({ email, password });
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    handle: string;
  }) => {
    try {
      const response = await authApiClient.signup(userData);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Logout will clear tokens automatically
      await authApiClient.logout();
    } catch (error) {
      // Logout will clear tokens on frontend (backend does not preserve session state)
      console.error('AuthContext: Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
