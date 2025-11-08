'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';
import { AuthLayout } from '@/components/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await login(formData.email, formData.password);

      // Redirect to app after successful login
      router.push('/app');
    } catch (err) {
      console.error('Login failed:', err);
      
      // Check if error is due to unverified email
      const error = err as Error & { errorCode?: string; email?: string };
      if (error.errorCode === 'EMAIL_NOT_VERIFIED') {
        // Redirect to a verification reminder page with email
        router.push(`/verify-email-reminder?email=${encodeURIComponent(error.email || formData.email)}`);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Login failed');
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

  return (
    <AuthLayout>
      <div className="max-w-md w-full space-y-8">
        <div>
          <PageHeading className="mt-6 text-center">
            Sign in to Mily
          </PageHeading>
          <SmallText className="mt-2 text-center">
            Welcome back to your personal timeline
          </SmallText>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/forgot-password" variant="secondary">
              Forgot your password?
            </Link>
            <SmallText className="text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" variant="secondary">
                Sign up
              </Link>
            </SmallText>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
