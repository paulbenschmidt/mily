'use client';

import { useEffect, useState } from 'react';
import { PageHeading, SectionHeading, BodyText, Button, Alert } from '@/components/ui';
import Link from 'next/link';

export default function ExcludeAnalytics() {
  const [status, setStatus] = useState<'excluded' | 'included'>('included');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const isExcluded = localStorage.getItem('mily_excludeFromAnalytics') === 'true';
    setStatus(isExcluded ? 'excluded' : 'included');
  }, []);

  const excludeMe = () => {
    localStorage.setItem('mily_excludeFromAnalytics', 'true');
    setStatus('excluded');
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000);
  };

  const includeMe = () => {
    localStorage.removeItem('mily_excludeFromAnalytics');
    setStatus('included');
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 5000);
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <PageHeading className="mb-8">Analytics Control</PageHeading>

        {/* Current Status */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-4">Current Status</SectionHeading>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${status === 'excluded' ? 'bg-green-500' : 'bg-secondary-400'}`} />
            <BodyText className="font-medium">
              {status === 'excluded' ? 'You are currently excluded from analytics' : 'You are currently included in analytics'}
            </BodyText>
          </div>
          <BodyText className="text-secondary-600">
            {status === 'excluded'
              ? 'Your visits and interactions are not being tracked by our analytics system.'
              : 'Your visits and interactions are being tracked to help us improve Mily.'}
          </BodyText>
        </section>

        {/* Confirmation Message */}
        {showConfirmation && (
          <Alert variant="success" className="mb-6">
            {status === 'excluded'
              ? '✅ You have been excluded from analytics tracking.'
              : '✅ You have been included in analytics tracking.'}
          </Alert>
        )}

        {/* What We Track */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-4">What We Track</SectionHeading>
          <BodyText className="text-secondary-600 mb-3">
            Mily uses Vercel Analytics to collect basic, privacy-friendly usage data:
          </BodyText>
          <ul className="space-y-2 ml-4">
            <li className="text-secondary-600">
              <BodyText>• Page views and navigation patterns</BodyText>
            </li>
            <li className="text-secondary-600">
              <BodyText>• Device type and browser information</BodyText>
            </li>
            <li className="text-secondary-600">
              <BodyText>• Geographic region (country-level only)</BodyText>
            </li>
          </ul>
          <BodyText className="text-secondary-600 mt-4">
            We <strong>never</strong> track your timeline content, personal events, or any identifying information.
            For more details, see our <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>.
          </BodyText>
        </section>

        {/* Control Buttons */}
        <section className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <SectionHeading className="mb-4">Manage Your Preference</SectionHeading>
          <BodyText className="text-secondary-600 mb-6">
            You can opt out of analytics tracking at any time. This setting is stored in your device's browser and will persist across sessions.
          </BodyText>
          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'included' ? (
              <Button
                onClick={excludeMe}
                variant="primary"
                size="md"
              >
                Exclude Me from Analytics
              </Button>
            ) : (
              <Button
                onClick={includeMe}
                variant="primary"
                size="md"
              >
                Include Me in Analytics
              </Button>
            )}
            <Link href="/">
              <Button variant="secondary" size="md">
                Return to Home
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
