'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApiClient } from '@/utils/auth-api';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    handle: string;
    birth_date: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    // Check if we have a session cookie before making the API call
    const hasSessionCookie = document.cookie.includes('sessionid=');

    try {
      // Only make the API call if we have a session cookie
      if (hasSessionCookie) {
        const authStatus = await authApiClient.getAuthStatus();

        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
        } else {
          setUser(null);
        }
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
    birth_date: string;
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
