'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApiClient } from '@/utils/auth-api';
import { UserType } from '@/types/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ReactivationModal } from '@/components/Auth/ReactivationModal';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  isMobile: boolean;
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
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();

  const checkAuth = async () => {
    try {
      // Check authentication with JWT token
      const authStatus = await authApiClient.getAuthStatus();

      if (authStatus.authenticated && authStatus.user) {
        // Check if user account is deactivated
        if (authStatus.user.deactivated_at) {
          setUser(authStatus.user);
          setShowReactivationModal(true);
          setLoading(false);
          return;
        }
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch {
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
        // Check if user account is deactivated
        if (response.user.deactivated_at) {
          setUser(response.user);
          setShowReactivationModal(true);
          return;
        }
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
      await authApiClient.logout(); // Logout will clear tokens on backend
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    const initialize = async () => {

      // Always initialize CSRF token
      await authApiClient.initializeCsrf();

      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/app')) {
        await checkAuth();
      } else {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleReactivate = async () => {
    try {
      const response = await authApiClient.reactivateAccount();
      if (response.user) {
        setUser(response.user);
        setShowReactivationModal(false);
        router.push('/app');
      }
    } catch (error) {
      console.error('Failed to reactivate account:', error);
      throw error;
    }
  };

  const handleCancelReactivation = () => {
    setShowReactivationModal(false);
    setUser(null);
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    isMobile,
    login,
    logout,
    signup,
    checkAuth,
  };

  // Show reactivation modal instead of children if account is deactivated
  if (showReactivationModal && user) {
    return (
      <AuthContext.Provider value={value}>
        <ReactivationModal
          userName={user.first_name || user.username}
          onReactivate={handleReactivate}
          onCancel={handleCancelReactivation}
        />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
