'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    handle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const generateHandle = (firstName: string, lastName: string, email: string): string => {
    // Create a base handle from first name and last name
    const baseName = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Use last 8 digits of timestamp for uniqueness (virtually collision-proof)
    const timestamp = Date.now().toString().slice(-8);

    // If we have a valid base name, use it
    if (baseName.length > 0) {
      return `${baseName}${timestamp}`;
    }

    // Fallback: use email username part
    const emailUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${emailUsername}${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Auto-generate handle on signup
      const handle = formData.handle || generateHandle(
        formData.first_name,
        formData.last_name,
        formData.email
      );

      const userData = { ...formData, handle };
      const { confirmPassword, ...signupData } = userData;

      // Call Django backend to create user and send verification email
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Show success message
      setEmailSent(true);
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
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

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      // Show success (email sent again)
      alert('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <PageHeading>Check Your Email</PageHeading>
          <SmallText>
            We sent a verification link to <strong>{formData.email}</strong>
          </SmallText>
          <SmallText className="text-secondary-500">
            Click the link in the email to complete your signup. The link will expire in 1 hour.
          </SmallText>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="pt-4 space-y-3">
            <SmallText>
              Didn't receive the email?{' '}
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className="text-primary-600 hover:text-primary-700 underline disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend email'}
              </button>
            </SmallText>
            <SmallText>
              <button
                onClick={() => setEmailSent(false)}
                className="text-secondary-600 hover:text-secondary-700 underline"
              >
                Change email address
              </button>
            </SmallText>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <PageHeading className="mt-6 text-center">
            Create Your Account
          </PageHeading>
          <SmallText className="mt-2 text-center">
            Start building your personal timeline
          </SmallText>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="first_name"
                name="first_name"
                type="text"
                label="First Name *"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
              />

              <Input
                id="last_name"
                name="last_name"
                type="text"
                label="Last Name *"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>

            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address *"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password *"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password *"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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
              loading={loading}
              fullWidth
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <SmallText className="text-center">
            Already have an account?{' '}
            <Link href="/login" variant="secondary">
              Sign in
            </Link>
          </SmallText>
        </form>
      </div>
    </div>
  );
}
