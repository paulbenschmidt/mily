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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/app"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Timeline
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{user.first_name} {user.last_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Handle</dt>
                <dd className="text-sm text-gray-900">@{user.handle}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                <dd className="text-sm text-gray-900">{user.birth_date}</dd>
              </div>
              {user.location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{user.location}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No photo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
