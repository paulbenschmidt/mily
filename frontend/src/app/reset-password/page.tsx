'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';
import { AuthLayout } from '@/components/AuthLayout';

// Create a client component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const uidParam = searchParams.get('uid');
    
    if (!tokenParam || !uidParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setToken(tokenParam);
    setUid(uidParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !uid) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await authApiClient.confirmPasswordReset(uid, token, formData.password);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <PageHeading className="mt-6">
              Password Reset Successful
            </PageHeading>
            <SmallText>
              Your password has been successfully reset.
            </SmallText>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/login')}
              >
                Sign In with New Password
              </Button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-md w-full space-y-8">
        <div>
          <PageHeading className="mt-6 text-center">
            Set New Password
          </PageHeading>
          <SmallText className="mt-2 text-center">
            Enter your new password below
          </SmallText>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="password"
              name="password"
              type="password"
              label="New Password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              disabled={!token || !uid}
              loading={loading}
              fullWidth
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </div>
          
          <div className="text-center">
            <Link href="/login" variant="secondary">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <AuthLayout>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </AuthLayout>
  );
}

// Main page component that wraps the content with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
