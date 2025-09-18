'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApiClient, User } from '@/utils/auth-api';

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
    location?: string;
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
    console.log("AuthContext: Starting checkAuth, session cookie exists:", hasSessionCookie);

    try {
      // Only make the API call if we have a session cookie
      if (hasSessionCookie) {
        console.log("AuthContext: Checking auth status with backend");
        const authStatus = await authApiClient.getAuthStatus();
        console.log("AuthContext: Auth status received:", authStatus);

        if (authStatus.authenticated && authStatus.user) {
          console.log("AuthContext: Setting user:", authStatus.user);
          setUser(authStatus.user);
        } else {
          console.log("AuthContext: Backend says not authenticated despite cookie");
          setUser(null);
        }
      } else {
        console.log("AuthContext: No session cookie found, skipping auth check");
        setUser(null);
      }
    } catch (error) {
      console.log("AuthContext: Error during auth check:", error);
      setUser(null);
    } finally {
      console.log("AuthContext: Setting loading to false");
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
    location?: string;
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
      await authApiClient.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('AuthContext: Logout error:', error);
    } finally {
      // Clear the session cookie on client side
      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
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
