'use client';

import { useState, useRef, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { ViewMode } from '@/hooks/useTimelineViewState';
import { ViewModeToggle } from './ViewModeToggle';
import { FilterDropdown, FilterOptions } from './FilterDropdown';
import { ShareDropdown } from './ShareDropdown';
import { SmallText, Button } from '@/components/ui';

interface TimelineHeaderProps {
  ownerInfo?: {
    name: string;
    profilePicture?: string;
  };
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredEvents: TimelineEventType[];
  currentEventId: string | null;
  onScrubberChange: (eventId: string) => void;
  mode: 'owner' | 'viewer';
  isMobile: boolean;
  hasActiveFilters: boolean;
  currentFilters: FilterOptions;
  onFilter?: (filters: FilterOptions) => void;
  onAddEvent?: () => void;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
  isUpdatingPublic?: boolean;
  userHandle?: string;
  isFilterOpen?: boolean;
  onFilterOpenChange?: (isOpen: boolean) => void;
}

/**
 * Shared header component for both Timeline and Story view modes.
 * Contains title, view toggle, mini-timeline scrubber, and action buttons.
 */
export function TimelineHeader({
  ownerInfo,
  viewMode,
  onViewModeChange,
  filteredEvents,
  currentEventId,
  onScrubberChange,
  mode,
  isMobile,
  hasActiveFilters,
  currentFilters,
  onFilter,
  onAddEvent,
  isPublic,
  onTogglePublic,
  isUpdatingPublic,
  userHandle,
  isFilterOpen: controlledFilterOpen,
  onFilterOpenChange,
}: TimelineHeaderProps) {
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);

  // Support both controlled and uncontrolled filter state
  const isFilterOpen = controlledFilterOpen ?? internalFilterOpen;
  const setIsFilterOpen = (open: boolean) => {
    setInternalFilterOpen(open);
    onFilterOpenChange?.(open);
  };
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const DRAG_THRESHOLD = 3;

  // Calculate event positions for the scrubber (0% = newest/right, 100% = oldest/left)
  // Events are sorted newest first, so filteredEvents[0] is newest
  const getEventPosition = (event: TimelineEventType): number => {
    // If there's only one event, place it in the center (50%)
    if (filteredEvents.length <= 1) return 50;

    const newestEventDate = new Date(filteredEvents[0].event_date).getTime();
    const oldestEventDate = new Date(filteredEvents[filteredEvents.length - 1].event_date).getTime();
    const eventDate = new Date(event.event_date).getTime();
    const totalTimeSpan = Math.abs(newestEventDate - oldestEventDate);

    if (totalTimeSpan === 0) return 50;

    // Calculate how far from newest (0%) to oldest (100%)
    const timeFromNewest = Math.abs(newestEventDate - eventDate);
    return (timeFromNewest / totalTimeSpan) * 100;
  };

  // Calculate current scroll progress based on current event
  const getCurrentScrollProgress = (): number => {
    if (!currentEventId || filteredEvents.length <= 1) return 0;

    const currentEvent = filteredEvents.find(e => e.id === currentEventId);
    if (!currentEvent) return 0;

    return getEventPosition(currentEvent);
  };

  const baseScrollProgress = getCurrentScrollProgress();
  // Use local drag position during drag for instant feedback, otherwise use event-based position
  const scrollProgress = dragProgress ?? baseScrollProgress;

  // Get progress value from clientX position (for instant visual feedback)
  const getProgressFromClientX = (clientX: number): number | null => {
    if (!scrubberRef.current) return null;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    // Invert: clicking left (0% of width) should target 100% progress (oldest)
    return 100 - clickPercentage;
  };

  // Find event from click position
  // Left side of scrubber = oldest events (100%), Right side = newest events (0%)
  const findEventFromPosition = (clientX: number): TimelineEventType | null => {
    if (!scrubberRef.current || filteredEvents.length === 0) return null;

    const targetProgress = getProgressFromClientX(clientX);
    if (targetProgress === null) return null;

    // Find closest event to target progress
    let closestEvent = filteredEvents[0];
    let closestDistance = Infinity;

    for (const event of filteredEvents) {
      const position = getEventPosition(event);
      const distance = Math.abs(position - targetProgress);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEvent = event;
      }
    }

    return closestEvent;
  };

  // Handle pointer down on scrubber
  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const pos = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setHasMoved(false);
    mouseDownPos.current = pos;
  };

  // Handle pointer move
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !mouseDownPos.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = Math.abs(clientX - mouseDownPos.current.x);
    const deltaY = Math.abs(clientY - mouseDownPos.current.y);

    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      setHasMoved(true);
      // Update drag position immediately for instant visual feedback
      const progress = getProgressFromClientX(clientX);
      if (progress !== null) {
        setDragProgress(progress);
      }
      const event = findEventFromPosition(clientX);
      if (event) {
        onScrubberChange(event.id);
      }
    }
  };

  // Handle pointer up
  const handlePointerUp = (e: MouseEvent | TouchEvent) => {
    if (!hasMoved) {
      const clientX = 'changedTouches' in e
        ? (e as TouchEvent).changedTouches[0].clientX
        : (e as MouseEvent).clientX;
      const event = findEventFromPosition(clientX);
      if (event) {
        onScrubberChange(event.id);
      }
    }

    setIsDragging(false);
    setHasMoved(false);
    setDragProgress(null);
    mouseDownPos.current = null;
  };

  // Add/remove global pointer event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, hasMoved]);

  const hasEvents = filteredEvents.length > 0;
  const firstYear = hasEvents ? filteredEvents[filteredEvents.length - 1].event_date.split('-')[0] : '';
  const lastYear = hasEvents ? filteredEvents[0].event_date.split('-')[0] : '';

  return (
    <div className="sticky bg-white border-b border-secondary-200/50 px-4 md:px-6 py-3 md:py-4" style={{ top: '68px', zIndex: 40 }}>
      <div className="max-w-4xl mx-auto">
        {/* Top row: Title, Toggle, Actions */}
        <div className="relative flex items-center justify-between gap-2 md:gap-4">
          {/* Left: Avatar and Name */}
          <div className="flex items-center gap-3">
            {ownerInfo?.profilePicture ? (
              <img
                src={ownerInfo.profilePicture}
                alt={ownerInfo.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-sm font-medium text-brand">
                  {ownerInfo?.name?.[0]?.toUpperCase() || ''}
                </span>
              </div>
            )}
          </div>

          {/* Center: Toggle (absolute center of header) */}
          {hasEvents && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />
            </div>
          )}

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasEvents && (
              <>
                {/* Filter button */}
                <div className="relative">
                  <Button
                    variant={hasActiveFilters ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    aria-label="Filter events"
                    aria-expanded={isFilterOpen}
                  >
                    <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                    {!isMobile && 'Filter'}
                  </Button>

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

                {/* Share button (owner only) */}
                {mode === 'owner' && onTogglePublic && (
                  <div className="relative">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                      aria-label="Share timeline"
                      aria-expanded={isShareDropdownOpen}
                    >
                      <svg className={`w-4 h-4 ${!isMobile ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {!isMobile && 'Share'}
                    </Button>

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

            {/* Add Event button (owner, desktop only) */}
            {hasEvents && mode === 'owner' && onAddEvent && !isMobile && (
              <Button size="sm" onClick={onAddEvent} aria-label="Add event">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Mini-timeline scrubber */}
        {hasEvents && (
          <div className="flex items-center gap-3 md:gap-5 pt-3">
            {/* Last event year (oldest, on left) */}
            <SmallText className="font-serif font-semibold text-secondary-500 text-xs whitespace-nowrap">
              {firstYear}
            </SmallText>

            {/* Scrubber track */}
            <div
              ref={scrubberRef}
              className="relative flex-1 cursor-pointer select-none"
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              style={{ padding: '12px 0', margin: '-12px 0', touchAction: 'none' }}
              role="slider"
              aria-label="Timeline navigation"
              aria-valuemin={0}
              aria-valuemax={filteredEvents.length - 1}
              aria-valuenow={filteredEvents.findIndex(e => e.id === currentEventId)}
            >
              {/* Track line */}
              <div className="relative h-1 bg-secondary-200 rounded-full">
                {/* Event dots - render in order (memory, minor, major) so major appears on top */}
                {['memory', 'minor', 'major'].map((category) =>
                  filteredEvents
                    .filter((event) => event.category === category)
                    .map((event) => {
                      const position = getEventPosition(event);

                      // Category-based styling (matching original TimelineProgressIndicator)
                      let dotClass = '';
                      switch (event.category) {
                        case 'major':
                          dotClass = 'w-3 h-3 bg-primary-400';
                          break;
                        case 'minor':
                          dotClass = 'w-2 h-2 bg-primary-300';
                          break;
                        case 'memory':
                          dotClass = 'w-1 h-1 bg-primary-200';
                          break;
                        default:
                          dotClass = 'w-1 h-1 bg-primary-200';
                      }

                      return (
                        <div
                          key={event.id}
                          className={`absolute top-1/2 ${dotClass} rounded-full`}
                          style={{ left: `${100 - position}%`, transform: 'translate(-50%, -50%)' }}
                        />
                      );
                    })
                )}

                {/* Moving scroll indicator dot (gray circle) */}
                <div
                  className={`absolute top-1/2 rounded-full shadow-sm ring-2 ring-white ${
                    isDragging
                      ? 'w-8 h-8 bg-secondary-500'
                      : 'w-5 h-5 bg-secondary-500 transition-all duration-300 ease-out'
                  }`}
                  style={{ left: `${100 - scrollProgress}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
                />
              </div>
            </div>

            {/* First event year (newest, on right) */}
            <SmallText className="font-serif font-semibold text-secondary-500 text-xs whitespace-nowrap">
              {lastYear}
            </SmallText>
          </div>
        )}
      </div>
    </div>
  );
}
