'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return null; // ProtectedRoute should handle this
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">My Profile</h1>
        <Link
          href="/app"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Timeline
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-full aspect-square rounded-lg object-cover mb-4"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-500 text-sm">@{user.handle}</p>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-100">Personal Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Email</dt>
                <dd className="text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
                <dd className="text-gray-900">{user.first_name} {user.last_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Member Since</dt>
                <dd className="text-gray-900">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
