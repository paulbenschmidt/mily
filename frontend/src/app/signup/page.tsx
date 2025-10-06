'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button, PageHeading, SmallText, Alert, Link } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
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

      // Auto-generate handle if not provided
      const handle = formData.handle || generateHandle(
        formData.first_name,
        formData.last_name,
        formData.email
      );

      const { confirmPassword, ...signupData } = formData;
      await signup({ ...signupData, handle });

      // Redirect to app after successful signup
      router.push('/app');
    } catch (err) {
      console.error('Signup failed:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
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
