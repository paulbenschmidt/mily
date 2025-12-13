'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { TimelineEventType } from '@/types/api';
import { FilterOptions } from './FilterDropdown';
import { TimelineHeader } from './TimelineHeader';
import { TimelineListView } from './TimelineListView';
import { TimelineStoryView } from './TimelineStoryView';
import { GuidedOnboarding } from './GuidedOnboarding';
import { OnboardingBulkEventModal } from './OnboardingBulkEventModal';
import { useTimelineViewState, ViewMode } from '@/hooks/useTimelineViewState';
import { SmallText, BodyText, Button, Spinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface TimelineUnifiedViewProps {
  mode: 'owner' | 'viewer';
  filteredEvents: TimelineEventType[];
  totalEventCount: number;
  loading: boolean;
  error: string | null;
  onEditEvent?: (event: TimelineEventType) => void;
  onAddEvent?: () => void;
  onEventsAdded?: (events: TimelineEventType[]) => void;
  onFilter?: (filters: FilterOptions) => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
  currentFilters: FilterOptions;
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

/**
 * Unified timeline view that supports both Timeline (list) and Story (paged) modes.
 * Uses a shared header with view toggle and mini-timeline scrubber.
 */
export function TimelineUnifiedView({
  mode,
  filteredEvents,
  totalEventCount,
  loading,
  error,
  onAddEvent,
  onEventsAdded,
  onEditEvent,
  onFilter,
  onClearFilters,
  hasActiveFilters,
  currentFilters,
  ownerInfo,
  isMobile,
  isPublic,
  onTogglePublic,
  isUpdatingPublic,
  userHandle,
}: TimelineUnifiedViewProps) {
  const { user } = useAuth();
  const [isOnboardingBulkModalOpen, setIsOnboardingBulkModalOpen] = useState(false);
  const [onboardingSelectedMilestones, setOnboardingSelectedMilestones] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Use the shared view state hook
  const {
    viewMode,
    currentEventId,
    currentEventIndex,
    setViewMode,
    setCurrentEventId,
    navigateOlder,
    navigateNewer,
    canNavigateOlder,
    canNavigateNewer,
  } = useTimelineViewState({ events: filteredEvents });

  // Handler for guided onboarding
  const handleGuidedContinue = (milestones: string[]) => {
    setOnboardingSelectedMilestones(milestones);
    setIsOnboardingBulkModalOpen(true);
  };

  const handleStartFromScratch = () => {
    if (onAddEvent) {
      onAddEvent();
    }
  };

  const handleOnboardingBulkEventsAdded = (events: TimelineEventType[]) => {
    if (onEventsAdded) {
      onEventsAdded(events);
    }
    setIsOnboardingBulkModalOpen(false);
    setOnboardingSelectedMilestones([]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Handle view mode change with appropriate scroll behavior
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    if (newMode === viewMode) return;

    if (newMode === 'story') {
      // StoryView handles scroll-to-top on mount
      setViewMode(newMode);
    } else {
      // Timeline mode handles its own scroll via initialEventIdToScrollTo prop
      setViewMode(newMode);
    }
  }, [viewMode, setViewMode]);

  // Handle scrubber change from header - surfaces the event ID the scrubber is pointing to
  const handleScrubberChange = useCallback((eventId: string) => {
    if (viewMode === 'timeline') {
      // Scroll to event in timeline mode
      const element = document.querySelector(`[data-event-id="${eventId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setCurrentEventId(eventId);
  }, [viewMode, setCurrentEventId]);

  // Handle current event change from IntersectionObserver in timeline mode
  const handleCurrentEventChange = useCallback((eventId: string) => {
    if (viewMode === 'timeline') {
      setCurrentEventId(eventId);
    }
  }, [viewMode, setCurrentEventId]);

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

  // Empty state
  if (totalEventCount === 0) {
    if (mode === 'owner') {
      return (
        <div className="min-h-screen bg-white">
          <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
            <GuidedOnboarding
              onContinue={handleGuidedContinue}
              onStartFromScratch={handleStartFromScratch}
            />
          </main>
          <OnboardingBulkEventModal
            isOpen={isOnboardingBulkModalOpen}
            onClose={() => setIsOnboardingBulkModalOpen(false)}
            onEventsAdded={handleOnboardingBulkEventsAdded}
            selectedMilestones={onboardingSelectedMilestones}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <div className="text-center mt-12 md:mt-20">
          <BodyText>This timeline is empty.</BodyText>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Shared Header */}
      <TimelineHeader
        ownerInfo={ownerInfo}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        filteredEvents={filteredEvents}
        currentEventId={currentEventId}
        onScrubberChange={handleScrubberChange}
        mode={mode}
        isMobile={isMobile}
        hasActiveFilters={hasActiveFilters}
        currentFilters={currentFilters}
        onFilter={onFilter}
        onAddEvent={onAddEvent}
        isPublic={isPublic}
        onTogglePublic={onTogglePublic}
        isUpdatingPublic={isUpdatingPublic}
        userHandle={userHandle}
        isFilterOpen={isFilterOpen}
        onFilterOpenChange={setIsFilterOpen}
      />

      {/* View Content */}
      {viewMode === 'timeline' ? (
        <main className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
          <TimelineListView
            events={filteredEvents}
            onEditEvent={onEditEvent}
            onCurrentEventChange={handleCurrentEventChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
            mode={mode}
            initialEventIdToScrollTo={currentEventId}
          />

          {/* Bottom spacing */}
          <div className="h-8 md:h-16" />
        </main>
      ) : (
        <TimelineStoryView
          events={filteredEvents}
          currentEventIndex={currentEventIndex}
          onNavigateOlder={navigateOlder}
          onNavigateNewer={navigateNewer}
          canNavigateOlder={canNavigateOlder}
          canNavigateNewer={canNavigateNewer}
          onEditEvent={onEditEvent}
          mode={mode}
          hasActiveFilters={hasActiveFilters}
          onOpenFilters={() => setIsFilterOpen(true)}
        />
      )}

      {/* Filter status indicator */}
      {hasActiveFilters && viewMode === 'timeline' && onClearFilters && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-secondary-200 flex items-center space-x-2 z-40">
          <SmallText>
            Showing {filteredEvents.length} of {totalEventCount} events
          </SmallText>
          <Button onClick={onClearFilters} variant="text" size="sm">
            Clear
          </Button>
        </div>
      )}

      {/* Success message after onboarding bulk add */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg z-40">
          <SmallText className="text-white">
            Great start! Click any event to add more details.
          </SmallText>
        </div>
      )}

      {/* Floating Add Event button - mobile only */}
      {mode === 'owner' && onAddEvent && isMobile && (
        <button
          onClick={onAddEvent}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
          aria-label="Add Event"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Onboarding Bulk Event Modal */}
      <OnboardingBulkEventModal
        isOpen={isOnboardingBulkModalOpen}
        onClose={() => setIsOnboardingBulkModalOpen(false)}
        onEventsAdded={handleOnboardingBulkEventsAdded}
        selectedMilestones={onboardingSelectedMilestones}
      />
    </div>
  );
}
