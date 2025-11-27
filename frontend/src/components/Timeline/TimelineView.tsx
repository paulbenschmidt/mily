'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { TimelineEventType } from '@/types/api';
import { TimelineEvent } from './TimelineEvent';
import { FilterDropdown, FilterOptions } from './FilterDropdown';
import { ShareDropdown } from './ShareDropdown';
import { GuidedOnboarding } from './GuidedOnboarding';
import { BulkEventModal } from './BulkEventModal';
import { TimelineProgressIndicator } from './TimelineProgressIndicator';
import { SmallText, BodyText, Button, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface TimelineViewProps {
  mode: 'owner' | 'viewer';
  filteredEvents: TimelineEventType[];
  totalEventCount: number;
  loading: boolean;
  error: string | null;
  onEditEvent?: (event: TimelineEventType) => void;
  onDeleteEvent?: (event: TimelineEventType) => void;
  onAddEvent?: () => void;
  onEventsAdded?: (events: TimelineEventType[]) => void;
  onFilter?: (filters: FilterOptions) => void;
  onShare?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
  currentFilters: FilterOptions;
  title?: string;
  ownerInfo?: {
    name: string;
    profilePicture?: string;
  };
  isMobile: boolean;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
  isUpdatingPublic?: boolean;
  userHandle?: string;
}

export function TimelineView({
  mode,
  filteredEvents,
  totalEventCount,
  loading,
  error,
  onDeleteEvent,
  onAddEvent,
  onEventsAdded,
  onEditEvent,
  onFilter,
  onClearFilters,
  hasActiveFilters,
  currentFilters,
  title,
  ownerInfo,
  isMobile,
  isPublic,
  onTogglePublic,
  isUpdatingPublic,
  userHandle,
}: TimelineViewProps) {
  const { user } = useAuth();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const displayTitle = title || (mode === 'owner' ? 'My Timeline' : `${ownerInfo?.name || 'User'}'s Timeline`);

  // Handler for guided onboarding
  const handleGuidedContinue = (milestones: string[]) => {
    setSelectedMilestones(milestones);
    setIsBulkModalOpen(true);
  };

  const handleStartFromScratch = () => {
    if (onAddEvent) {
      onAddEvent();
    }
  };

  const handleBulkEventsAdded = (events: TimelineEventType[]) => {
    if (onEventsAdded) {
      onEventsAdded(events);
    }
    setIsBulkModalOpen(false);
    setSelectedMilestones([]);
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Handle seeking to a specific date position
  const handleSeek = (targetDatePercentage: number, isDragging = false) => {

    // NOTE: there is a minor bug that prevents users from clicking on the second event when the timeline is at the top.
    // This is because the second event is too high up to be at the center of the viewport, so when attempting to
    // scroll to it, it just scrolls to the top of the timeline (the first event) and moves the dot to the far right
    // of the timeline.

    if (filteredEvents.length === 0) return;

    const firstEventDate = new Date(filteredEvents[0].event_date).getTime();
    const lastEventDate = new Date(filteredEvents[filteredEvents.length - 1].event_date).getTime();
    const totalTimeSpan = Math.abs(firstEventDate - lastEventDate);

    // Calculate target date
    const targetDate = firstEventDate - (totalTimeSpan * targetDatePercentage / 100);

    // Find closest event to target date
    const closestEvent = filteredEvents.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.event_date).getTime() - targetDate);
      const currDiff = Math.abs(new Date(curr.event_date).getTime() - targetDate);
      return currDiff < prevDiff ? curr : prev;
    });

    // Scroll that event to center - instant during drag, smooth on click
    const element = document.querySelector(`[data-event-id="${closestEvent.id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: isDragging ? 'instant' : 'smooth', block: 'center' });
    }
  };

  // Track scroll progress based on the event in the center of the viewport
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current || filteredEvents.length === 0) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // If at the very top, show 0%
      if (scrollTop < 1) {
        setScrollProgress(0);
        return;
      }

      // If at the very bottom, show 100%
      if (scrollTop >= docHeight - 1) {
        setScrollProgress(100);
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
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-120px)] gap-10">
        <BodyText className="text-danger-600">{error}</BodyText>
        {!user && (
          <Link href="/signup">
            <Button variant="primary">
              Create Your Timeline
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Timeline Header */}
      <div className="sticky bg-white border-b border-secondary-200/50 px-6 py-4" style={{ top: '68px', zIndex: 40 }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <SmallText className="font-semibold">{displayTitle}</SmallText>
          </div>

          <div className="flex items-center gap-2">
            {totalEventCount > 0 && (
              <>
                <div className="relative">
                  <Button
                    variant={hasActiveFilters ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    {!isMobile && 'Filter'}
                  </Button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && onFilter && (
                    <FilterDropdown
                      isOpen={isFilterOpen}
                      onClose={() => setIsFilterOpen(false)}
                      onApplyFilters={onFilter}
                      currentFilters={currentFilters}
                      mode={mode}
                    />
                  )}
                </div>

                {mode === 'owner' && onTogglePublic && (
                  <div className="relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                    >
                      <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {!isMobile && 'Share'}
                    </Button>

                    {/* Share Dropdown */}
                    {isShareDropdownOpen && isPublic !== undefined && (
                      <ShareDropdown
                        isOpen={isShareDropdownOpen}
                        onClose={() => setIsShareDropdownOpen(false)}
                        isPublic={isPublic}
                        onTogglePublic={onTogglePublic}
                        isUpdating={isUpdatingPublic}
                        userHandle={userHandle}
                      />
                    )}
                  </div>
                )}
              </>
            )}
            {/* Add Event button - only in owner mode and when there are events */}
            {totalEventCount > 0 && mode === 'owner' && onAddEvent && (
              <Button
                size="sm"
                onClick={onAddEvent}
              >
                <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {!isMobile && 'Add Event'}
              </Button>
            )}
          </div>
        </div>

        {/* Timeline Progress Indicator */}
        <TimelineProgressIndicator
          filteredEvents={filteredEvents}
          scrollProgress={scrollProgress}
          onSeek={handleSeek}
        />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8" ref={timelineRef}>

      {/* Empty state - only show for owner */}
      {totalEventCount === 0 && mode === 'owner' ? (
        <GuidedOnboarding
          onContinue={handleGuidedContinue}
          onStartFromScratch={handleStartFromScratch}
        />
      ) : totalEventCount === 0 && mode !== 'owner' ? (
        <div className="text-center mt-12 md:mt-20">
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
                  onDeleteEvent={mode === 'owner' ? onDeleteEvent : undefined}
                  previousEvent={filteredEvents[index - 1]}
                  nextEvent={filteredEvents[index + 1]}
                  mode={mode}
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

      {/* Success message after bulk add */}
      {showSuccessMessage && totalEventCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <SmallText className="text-white">
            Great start! Click any event to add more details.
          </SmallText>
        </div>
      )}

      {/* Bottom spacing for better scroll experience */}
      <div className="h-8 md:h-16" />
    </main>

    {/* Bulk Event Modal */}
    <BulkEventModal
      isOpen={isBulkModalOpen}
      onClose={() => setIsBulkModalOpen(false)}
      onEventsAdded={handleBulkEventsAdded}
      selectedMilestones={selectedMilestones}
    />
    </div>
  );
}
