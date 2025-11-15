'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeading, SmallText, Alert, Button } from '@/components/ui';
import { AuthLayout } from '@/components/AuthLayout';
import { authApiClient } from '@/utils/auth-api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setError('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        // Ensure CSRF token is initialized before making the request
        await authApiClient.initializeCsrf();

        // Use authApiClient to verify email (sets httpOnly cookies automatically)
        const response = await authApiClient.verifyEmail(token);

        // Email verified and user logged in
        setStatus('success');

        // Update auth context to load user data
        await checkAuth();

        // Redirect to app after 2 seconds
        setTimeout(() => {
          router.push('/app');
        }, 2000);
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]); // Only run when token changes, not when checkAuth changes

  return (
    <AuthLayout>
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4"></div>
            </div>
            <PageHeading>Verifying Your Email</PageHeading>
            <SmallText>Please wait while we verify your email address...</SmallText>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <PageHeading>Email Verified!</PageHeading>
            <SmallText>
              Your account has been created successfully. Redirecting you to your timeline...
            </SmallText>
          </>
        )}

        {status === 'error' && (
          <>
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <PageHeading>Verification Failed</PageHeading>
            {error && (
              <Alert variant="error" className="text-left">
                {error}
              </Alert>
            )}
            <div className="space-y-3 mt-6">
              <Button
                onClick={() => router.push('/signup')}
                fullWidth
              >
                Back to Signup
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-4"></div>
          </div>
          <PageHeading>Loading...</PageHeading>
        </div>
      </AuthLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
