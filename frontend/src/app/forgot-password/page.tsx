'use client';

import { useState } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';
import { AuthLayout } from '@/components/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await authApiClient.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      alert('Password reset request failed');
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <PageHeading className="mt-6">
              Check Your Email
            </PageHeading>
            <SmallText>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </SmallText>
            <SmallText>
              Check your email and click the link to reset your password.
            </SmallText>
            <div className="mt-6">
              <Link href="/login" variant="secondary">
                Back to Sign In
              </Link>
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
            Reset Your Password
          </PageHeading>
          <SmallText className="mt-2 text-center">
            Enter your email address and we&apos;ll send you a link to reset your password
          </SmallText>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              loading={loading}
              fullWidth
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
