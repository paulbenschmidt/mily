'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("ProtectedRoute: useEffect. Loading:", loading, "User:", user);
    if (!loading && !user) {
      console.log("ProtectedRoute: Redirecting to:", redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    console.log("ProtectedRoute: Loading! Showing loading spinner...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user! Returning blank page...");
    // return <>{children}</>; // If you want to temporarily bypass auth for testing
    return null; // Will return a blank page
  }

  console.log("ProtectedRoute: Successful user check! User:", user);
  return <>{children}</>;
};
