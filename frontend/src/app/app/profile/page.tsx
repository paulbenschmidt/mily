'use client';

import { useAuth } from '@/contexts/AuthContext';
import { SectionHeading, Subheading, SmallText, Caption, Card, Button, BodyText } from '@/components/ui';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // ProtectedRoute should handle this
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <SectionHeading>My Profile</SectionHeading>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.href = '/app'}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Timeline
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="md:col-span-1">
          <Card className="p-6">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-full aspect-square rounded-lg object-cover mb-4"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-secondary-100 flex items-center justify-center mb-4">
                <svg className="w-20 h-20 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="text-center">
              <Subheading>{user.first_name} {user.last_name}</Subheading>
              <Caption className="mt-1">@{user.handle}</Caption>
            </div>
          </Card>
        </div>

        {/* Profile Information Section */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <Subheading className="mb-6 pb-2 border-b border-secondary-100">Personal Information</Subheading>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt>
                  <Caption className="font-medium mb-1">Email</Caption>
                </dt>
                <dd>
                  <BodyText>{user.email}</BodyText>
                </dd>
              </div>
              <div>
                <dt>
                  <Caption className="font-medium mb-1">Full Name</Caption>
                </dt>
                <dd>
                  <BodyText>{user.first_name} {user.last_name}</BodyText>
                </dd>
              </div>
              <div>
                <dt>
                  <Caption className="font-medium mb-1">Member Since</Caption>
                </dt>
                <dd>
                  <BodyText>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</BodyText>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
