'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null; // ProtectedRoute should handle this, but adding for safety
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">Your personal timeline</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/app/profile"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Timeline Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Timeline Line */}
        <div className="w-20 flex justify-center pt-12">
          <div className="w-0.5 bg-gray-300 h-full relative">
            {/* Birth Event Dot */}
            <div className="absolute top-0 -left-2 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 pt-12 pr-8">
          {/* Birth Event */}
          <div className="mb-16 flex justify-center">
            <div className="bg-gray-50 rounded-lg p-4 max-w-sm text-center">
              <h3 className="font-medium text-gray-900">Birth</h3>
              <p className="text-sm text-gray-600 mt-1">Your journey begins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Button - On timeline at bottom */}
      <div className="relative">
        <div className="absolute left-20 -top-8 -translate-x-1/2">
          <button className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors group">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
