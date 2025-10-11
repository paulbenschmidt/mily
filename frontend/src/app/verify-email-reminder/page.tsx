'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeading, SmallText, Alert, Button } from '@/components/ui';

function VerifyEmailReminderContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Resend failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-secondary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <PageHeading>Email Not Verified</PageHeading>
        
        {success ? (
          <>
            <SmallText className="text-primary-600">
              Verification email sent! Please check your inbox at <strong>{email}</strong>
            </SmallText>
            <SmallText className="text-secondary-500">
              Click the link in the email to verify your account and log in.
            </SmallText>
          </>
        ) : (
          <>
            <SmallText>
              Your email address <strong>{email}</strong> hasn&apos;t been verified yet.
            </SmallText>
            <SmallText className="text-secondary-500">
              Please check your inbox for the verification email we sent when you signed up.
            </SmallText>

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            <div className="pt-4">
              <Button
                onClick={handleResendEmail}
                loading={loading}
                fullWidth
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>

            <SmallText className="text-secondary-500">
              Already verified?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 underline">
                Try logging in again
              </a>
            </SmallText>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailReminderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-secondary-200 rounded-full mx-auto mb-4"></div>
          </div>
          <PageHeading>Loading...</PageHeading>
        </div>
      </div>
    }>
      <VerifyEmailReminderContent />
    </Suspense>
  );
}
