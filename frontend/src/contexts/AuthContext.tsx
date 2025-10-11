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
      // Always check with the backend - session cookie is HttpOnly so JS can't see it
      const authStatus = await authApiClient.getAuthStatus();

      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
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
      // Ensure we have a CSRF token before making the POST request
      await authApiClient.getCSRFTokenFromServer();
      await authApiClient.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('AuthContext: Logout error:', error);
    } finally {
      // Clear the session and CSRF cookies on client side
      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      document.cookie = 'csrftoken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
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
