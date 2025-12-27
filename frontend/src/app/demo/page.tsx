'use client';

import { Suspense, useEffect, useState } from 'react';
import { TimelineUnifiedView } from '@/components/Timeline';
import { TimelineEventType } from '@/types/api';
import demoData from '@/data/demo/demo-timeline.json';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTimelineFilters } from '@/hooks/useTimelineFilters';
import { WelcomeModal } from '@/components/WelcomeModal';

function DemoPageContent() {
  const isMobile = useIsMobile();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Load demo events from JSON
  const events = demoData as TimelineEventType[];

  // Use timeline filters hook
  const { filters, filteredEvents, hasActiveFilters, handleFilter, handleClearFilters } = useTimelineFilters(events);

  useEffect(() => {
    // Check if user has seen the welcome modal this session
    const hasSeenThisSession = sessionStorage.getItem('mily_hasSeenWelcomeModal');
    if (!hasSeenThisSession) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('mily_hasSeenWelcomeModal', 'true');
  };

  return (
    <>
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
      {/* Demo Header */}
      <header className="sticky top-0 z-20 bg-white" style={{ height: '69px' }}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-brand transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand text-center">
              Demo Timeline
            </span>
            <Link href="/signup">
              <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Try It Yourself
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Timeline View */}
      <TimelineUnifiedView
        mode="viewer"
        filteredEvents={filteredEvents}
        totalEventCount={events.length}
        loading={false}
        error={null}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        currentFilters={filters}
        ownerInfo={{
          name: "Mike",
          profilePicture: 'https://assets.mily.bio/demo/avatar.png',
        }}
        isMobile={isMobile}
      />

      {/* CTA Footer */}
      <div className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-2xl font-medium text-foreground lg:text-3xl">
            Ready to create your own timeline?
          </h2>
          <p className="mt-3 text-muted-foreground lg:text-lg">
            Start capturing the moments that matter to you.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <button className="w-full rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand/90 sm:w-auto">
                Get Started
              </button>
            </Link>
            <Link href="/about">
              <button className="w-full rounded-lg border border-border bg-white px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted/50 sm:w-auto">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// In Next.js 13+, `useSearchParams` should be used inside a `Suspense` boundary when the page is static (i.e. does
// not have dynamic routing based on cookies/params/etc.)
export default function DemoPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <DemoPageContent />
    </Suspense>
  );
}
