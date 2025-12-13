'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { TimelineEventType } from '@/types/api';
import { formatEventDate } from '@/utils/date-validation';
import { PhotoCarousel } from './PhotoCarousel';
import { PhotoModal } from './PhotoModal';
import { SmallText, BodyText, Caption } from '@/components/ui';
import { EventActionButtons } from './EventActionButtons';

interface TimelineStoryViewProps {
  events: TimelineEventType[];
  currentEventIndex: number;
  onNavigateOlder: () => void;
  onNavigateNewer: () => void;
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
  onEditEvent?: (event: TimelineEventType) => void;
  onDeleteEvent?: (event: TimelineEventType) => void;
  mode: 'owner' | 'viewer';
  isMobile: boolean;
  hasActiveFilters?: boolean;
  onOpenFilters?: () => void;
}

/**
 * Story view displays one event at a time with paged navigation.
 * Shows a single event with navigation controls.
 */
export function TimelineStoryView({
  events,
  currentEventIndex,
  onNavigateOlder,
  onNavigateNewer,
  canNavigateOlder,
  canNavigateNewer,
  onEditEvent,
  onDeleteEvent,
  mode,
  isMobile,
  hasActiveFilters,
  onOpenFilters,
}: TimelineStoryViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const currentEvent = events[currentEventIndex];

  // Scroll to top on mount (to ensure that it's not scrolled down when switching from Timeline view)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Reset photo index when event changes
  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [currentEventIndex]);

  // Handle photo click to open modal
  const handlePhotoClick = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  }, []);


  // Privacy icon helper
  const getPrivacyLabel = (privacyLevel: string) => {
    const labels: Record<string, string> = {
      public: 'Public',
      friends: 'Friends',
      private: 'Private',
    };
    return labels[privacyLevel] || privacyLevel;
  };

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BodyText className="text-secondary-500">No events to display</BodyText>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex"
      id="story-view"
      role="tabpanel"
      aria-label="Story view"
    >
      {/* Previous event button - fixed left side */}
      <button
        onClick={onNavigateOlder}
        disabled={!canNavigateOlder}
        className={`fixed left-0 md:left-4 lg:left-8 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center z-30
          transition-opacity focus:outline-none
          ${canNavigateOlder ? 'opacity-60 hover:opacity-100' : 'opacity-0 cursor-default'}`}
        aria-label="Go to older event"
      >
        <div className="p-2 md:p-3 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-colors">
          <svg className="w-5 h-5 md:w-8 md:h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Event content - center */}
      <div className="flex-1 px-14 md:px-20 py-6 h-[calc(100vh-180px)]">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          {/* Main content */}
          <div className="flex-1">
          {/* Date */}
          <Caption className="font-serif font-semibold text-secondary-500 mb-2">
            {formatEventDate(
              currentEvent.event_date,
              currentEvent.is_day_approximate,
              currentEvent.is_month_approximate
            )}
          </Caption>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-4">
            {currentEvent.title}
          </h2>

          {/* Privacy indicator (owner only) */}
          {mode === 'owner' && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full">
                {getPrivacyLabel(currentEvent.privacy_level)}
              </span>
            </div>
          )}

          {/* Photo carousel */}
          {currentEvent.event_photos && currentEvent.event_photos.length > 0 && (
            <div className="mb-6 group">
              <PhotoCarousel
                photos={currentEvent.event_photos}
                onPhotoClick={handlePhotoClick}
                currentIndex={selectedPhotoIndex}
                onIndexChange={setSelectedPhotoIndex}
              />
            </div>
          )}

          {/* Description */}
          {currentEvent.description && (
            <div className="mb-6">
              <BodyText className="leading-relaxed whitespace-pre-wrap text-secondary-700">
                {currentEvent.description}
              </BodyText>
            </div>
          )}

          {/* Notes (owner only) */}
          {mode === 'owner' && currentEvent.notes && (
            <div className="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <Caption className="text-secondary-500 mb-1">Private notes</Caption>
              <SmallText className="italic text-secondary-600">{currentEvent.notes}</SmallText>
            </div>
          )}

          {/* Action buttons (owner only) */}
          {mode === 'owner' && (
            <EventActionButtons
              event={currentEvent}
              onEditEvent={onEditEvent}
              size="md"
              className="mt-6"
            />
          )}
          </div>

          {/* Event counter - pushed to bottom via flex */}
          <div className="text-center pt-4 border-t border-secondary-100 mt-auto">
            <SmallText className="text-secondary-400">
              {currentEventIndex + 1} of {events.length}
              {hasActiveFilters && (
                <>
                  {' • '}
                  <button
                    onClick={onOpenFilters}
                    className="text-primary-500 hover:text-primary-600 underline"
                  >
                    Filtered
                  </button>
                </>
              )}
            </SmallText>
          </div>
        </div>
      </div>

      {/* Next event button - fixed right side */}
      <button
        onClick={onNavigateNewer}
        disabled={!canNavigateNewer}
        className={`fixed right-0 md:right-4 lg:right-8 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center z-30
          transition-opacity focus:outline-none
          ${canNavigateNewer ? 'opacity-60 hover:opacity-100' : 'opacity-0 cursor-default'}`}
        aria-label="Go to newer event"
      >
        <div className="p-2 md:p-3 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-colors">
          <svg className="w-5 h-5 md:w-8 md:h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Photo Modal */}
      {photoModalOpen && currentEvent.event_photos && currentEvent.event_photos.length > 0 && (
        <PhotoModal
          photos={currentEvent.event_photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setPhotoModalOpen(false)}
          onNavigate={setSelectedPhotoIndex}
        />
      )}
    </div>
  );
}
