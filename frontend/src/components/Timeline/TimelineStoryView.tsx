'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { TimelineEventType } from '@/types/api';
import { formatEventDate } from '@/utils/date-validation';
import { PhotoCarousel } from './PhotoCarousel';
import { PhotoModal } from './PhotoModal';
import { SmallText, BodyText, Caption } from '@/components/ui';
import { EventActionButtons } from './EventActionButtons';
import { PrivacyIcon, EmptyFilteredState } from './utils';

interface TimelineStoryViewProps {
  events: TimelineEventType[];
  currentEventIndex: number;
  onNavigateOlder: () => void;
  onNavigateNewer: () => void;
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
  onEditEvent?: (event: TimelineEventType) => void;
  mode: 'owner' | 'viewer';
  hasActiveFilters?: boolean;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
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
  mode,
  hasActiveFilters,
  onOpenFilters,
  onClearFilters,
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
    return <EmptyFilteredState hasActiveFilters={hasActiveFilters ?? false} onClearFilters={onClearFilters} />;
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
        className={`fixed left-0 top-0 bottom-0 pl-0 pr-2 md:pl-4 md:pr-4 lg:pl-8 lg:pr-4 flex items-center justify-start z-30
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
      <div className="flex-1 px-14 md:px-20 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Main content */}
          <div>
          {/* Date and privacy */}
          <div className="flex items-center justify-between mb-2">
            <Caption className="font-serif font-semibold text-secondary-500">
              {formatEventDate(
                currentEvent.event_date,
                currentEvent.is_day_approximate,
                currentEvent.is_month_approximate
              )}
            </Caption>
            {mode === 'owner' && (
              <PrivacyIcon privacyLevel={currentEvent.privacy_level} />
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-4">
            {currentEvent.title}
          </h2>

          {/* Event category */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-secondary-600 bg-secondary-100 px-3 py-1 rounded-full capitalize">
              {currentEvent.category}
            </span>
          </div>

          {/* Photo carousel */}
          {currentEvent.event_photos && currentEvent.event_photos.length > 0 && (
            <div className="mt-6 mb-6 group">
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
            <div className="mt-6 mb-6">
              <BodyText className="leading-relaxed whitespace-pre-wrap text-secondary-700">
                {currentEvent.description}
              </BodyText>
            </div>
          )}

          {/* Notes (owner only) */}
          {mode === 'owner' && currentEvent.notes && (
            <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
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
          <div className="text-center pt-4 border-t border-secondary-200 mt-6 pt-6 mb-6">
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
        className={`fixed right-0 top-0 bottom-0 pr-0 pl-2 md:pr-4 md:pl-4 lg:pr-8 lg:pl-4 flex items-center justify-end z-30
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
