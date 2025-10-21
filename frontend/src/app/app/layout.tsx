'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Button } from '@/components/ui';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-secondary-200/50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              href="/app"
              className="font-serif text-2xl font-medium text-secondary-900 cursor-pointer hover:text-secondary-900 no-underline"
            >
              Silly
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/app/profile'}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
