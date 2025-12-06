'use client';

import { useState, useEffect, useRef } from 'react';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';
import { AuthLayout } from '@/components/AuthLayout';

export default function SignupPage() {
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    handle: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!emailSent) {
      firstNameInputRef.current?.focus();
    }
  }, [emailSent]);

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

      const signupData = { ...formData, handle };

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
      setError('Failed to create account');
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
      setError('Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
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
              Didn&apos;t receive the email?{' '}
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
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
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
                ref={firstNameInputRef}
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

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password *"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-secondary-500 hover:text-secondary-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <SmallText className="text-center text-secondary-600">
            By creating an account, you agree to our<br />
            <Link href="/terms" variant="secondary" className="underline">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" variant="secondary" className="underline">
              Privacy Policy
            </Link>
          </SmallText>

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
    </AuthLayout>
  );
}
