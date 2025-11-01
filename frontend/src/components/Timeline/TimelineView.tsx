'use client';

import { useRef, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { TimelineEvent } from './TimelineEvent';
import { SmallText, BodyText, Button } from '@/components/ui';

interface TimelineViewProps {
  mode: 'owner' | 'viewer';
  filteredEvents: TimelineEventType[];
  totalEventCount: number;
  loading: boolean;
  error: string | null;
  scrollProgress: number;
  onScrollProgressChange: (progress: number) => void;
  onEditEvent?: (event: TimelineEventType) => void;
  onAddEvent?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function TimelineView({
  mode,
  filteredEvents,
  totalEventCount,
  loading,
  error,
  scrollProgress,
  onScrollProgressChange,
  onAddEvent,
  onEditEvent,
  onClearFilters,
  hasActiveFilters,
}: TimelineViewProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Track scroll progress based on the event in the center of the viewport
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current || filteredEvents.length === 0) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // If at the very top, show 0%
      if (scrollTop <= 10) {
        onScrollProgressChange(0);
        return;
      }

      // If at the very bottom, show 100%
      if (scrollTop >= docHeight - 10) {
        onScrollProgressChange(100);
        return;
      }

      const viewportCenter = window.innerHeight / 2 + scrollTop;

      // Find the event closest to the center of the viewport
      const eventElements = timelineRef.current.querySelectorAll('[data-event-id]');
      let closestEvent: { element: Element; distance: number; index: number } | null = null as { element: Element; distance: number; index: number } | null;

      eventElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + scrollTop + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);

        if (!closestEvent || distance < closestEvent.distance) {
          closestEvent = { element, distance, index };
        }
      });

      if (closestEvent && filteredEvents.length > 0) {
        // Calculate progress based on the date of the centered event
        const firstEventDate = new Date(filteredEvents[0].event_date).getTime();
        const lastEventDate = new Date(filteredEvents[filteredEvents.length - 1].event_date).getTime();
        const currentEventDate = new Date(filteredEvents[closestEvent.index].event_date).getTime();

        const totalTimeSpan = Math.abs(firstEventDate - lastEventDate);
        const currentTimeSpan = Math.abs(firstEventDate - currentEventDate);

        const progress = totalTimeSpan > 0 ? (currentTimeSpan / totalTimeSpan) * 100 : 0;
        onScrollProgressChange(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEvents, onScrollProgressChange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <BodyText>Loading timeline...</BodyText>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <BodyText className="text-danger-600">Error: {error}</BodyText>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8" ref={timelineRef}>
      {/* Timeline Progress Indicator */}
      {filteredEvents.length > 0 && (
        <div className="fixed left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="flex flex-col items-center gap-2">
            {/* First event year */}
            <SmallText className="font-serif font-semibold text-secondary-500 text-xs">
              {filteredEvents[0].event_date.split('-')[0]}
            </SmallText>

            {/* Progress bar */}
            <div className="relative w-1 h-64 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full bg-secondary-500 transition-all duration-300 ease-out"
                style={{ height: `${scrollProgress}%` }}
              />
            </div>

            {/* Last event year */}
            <SmallText className="font-serif font-semibold text-secondary-500 text-xs">
              {filteredEvents[filteredEvents.length - 1].event_date.split('-')[0]}
            </SmallText>
          </div>
        </div>
      )}

      {/* Empty state - only show for owner */}
      {totalEventCount === 0 && mode === 'owner' ? (
        <div className="text-center mt-20 flex flex-col items-center">
          <Button
            onClick={onAddEvent}
            size="lg"
            className="shadow-lg transition-all transform hover:scale-105 duration-200"
          >
            Begin
          </Button>
        </div>
      ) : totalEventCount === 0 && mode !== 'owner' ? (
        <div className="text-center mt-20">
          <BodyText>This timeline is empty.</BodyText>
        </div>
      ) : (
        <div className="space-y-0">
          {/* No filtered results */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-10">
              <BodyText>No events match your filters</BodyText>
              {onClearFilters && (
                <Button onClick={onClearFilters} variant="secondary" className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            /* Render events */
            filteredEvents.map((event, index) => (
              <div key={event.id} data-event-id={event.id}>
                <TimelineEvent
                  event={event}
                  onEditEvent={mode === 'owner' ? onEditEvent : undefined}
                  previousEvent={filteredEvents[index - 1]}
                  nextEvent={filteredEvents[index + 1]}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Filter status indicator */}
      {hasActiveFilters && totalEventCount > 0 && onClearFilters && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-secondary-200 flex items-center space-x-2">
          <SmallText>
            Showing {filteredEvents.length} of {totalEventCount} events
          </SmallText>
          <Button onClick={onClearFilters} variant="text" size="sm">
            Clear
          </Button>
        </div>
      )}

      {/* Bottom spacing for better scroll experience */}
      <div className="h-32" />
    </main>
  );
}
