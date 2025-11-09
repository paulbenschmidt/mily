'use client';

import { useState, useMemo, useEffect } from 'react';
import { TimelineView } from '@/components/Timeline/TimelineView';
import { FilterOptions } from '@/components/Timeline/FilterDropdown';
import { TimelineEventType } from '@/types/api';
import demoData from '@/data/demo-timeline.json';
import Link from 'next/link';

export default function DemoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    categories: [],
    privacyLevels: [],
  });

  // Load demo events from JSON
  const events = demoData as TimelineEventType[];

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by date range
      if (filters.startDate && event.event_date < filters.startDate) {
        return false;
      }
      if (filters.endDate && event.event_date > filters.endDate) {
        return false;
      }

      // Filter by category
      if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
        return false;
      }

      // Filter by privacy level
      if (filters.privacyLevels.length > 0 && !filters.privacyLevels.includes(event.privacy_level)) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.privacyLevels.length > 0 ||
    filters.startDate !== null ||
    filters.endDate !== null;

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      categories: [],
      privacyLevels: [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-brand transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
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
      <div style={{ '--app-header-height': '64px' } as React.CSSProperties}>
        <TimelineView
          mode="viewer"
          filteredEvents={filteredEvents}
          totalEventCount={events.length}
          loading={false}
          error={null}
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          currentFilters={filters}
          title="Sample Timeline"
          ownerInfo={{
            name: "Alex",
            profilePicture: undefined,
          }}
          isMobile={isMobile}
        />
      </div>

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
    </div>
  );
}
