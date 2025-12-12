'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { TimelineEventType } from '@/types/api';

export type ViewMode = 'timeline' | 'story';

interface UseTimelineViewStateOptions {
  events: TimelineEventType[];
  initialEventId?: string | null;
}

interface UseTimelineViewStateReturn {
  viewMode: ViewMode;
  currentEventId: string | null;
  currentEventIndex: number;
  setViewMode: (mode: ViewMode) => void;
  setCurrentEventId: (id: string | null) => void;
  setCurrentEventIndex: (index: number) => void;
  navigateToEvent: (id: string, behavior?: ScrollBehavior) => void;
  navigateOlder: () => void;
  navigateNewer: () => void;
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
}

/**
 * Hook to manage shared timeline view state between Timeline and Story modes.
 * Syncs view mode and current event with URL parameters.
 */
export function useTimelineViewState({
  events,
  initialEventId,
}: UseTimelineViewStateOptions): UseTimelineViewStateReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial values from URL
  const urlViewMode = searchParams.get('view') as ViewMode | null;
  const urlEventId = searchParams.get('event');

  const [viewMode, setViewModeState] = useState<ViewMode>(
    urlViewMode === 'story' ? 'story' : 'timeline'
  );
  const [currentEventId, setCurrentEventIdState] = useState<string | null>(
    urlEventId || initialEventId || (events.length > 0 ? events[0].id : null)
  );

  // Track if we should update URL (avoid loops)
  const isUpdatingUrl = useRef(false);

  // Calculate current event index
  const currentEventIndex = events.findIndex(e => e.id === currentEventId);
  const validIndex = currentEventIndex >= 0 ? currentEventIndex : 0;

  // Navigation state
  // Events are sorted newest-first: index 0 = newest, last index = oldest
  // "Older" means higher index, "Newer" means lower index
  const canNavigateNewer = validIndex > 0;
  const canNavigateOlder = validIndex < events.length - 1;

  // Update URL when state changes
  const updateUrl = useCallback((mode: ViewMode, eventId: string | null) => {
    if (isUpdatingUrl.current) return;

    const params = new URLSearchParams(searchParams.toString());

    if (mode === 'story') {
      params.set('view', 'story');
    } else {
      params.delete('view');
    }

    if (eventId && mode === 'story') {
      params.set('event', eventId);
    } else {
      params.delete('event');
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Set view mode and update URL
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    updateUrl(mode, currentEventId);
  }, [currentEventId, updateUrl]);

  // Set current event ID and update URL
  const setCurrentEventId = useCallback((id: string | null) => {
    setCurrentEventIdState(id);
    if (viewMode === 'story') {
      updateUrl(viewMode, id);
    }
  }, [viewMode, updateUrl]);

  // Set current event by index
  const setCurrentEventIndex = useCallback((index: number) => {
    if (index >= 0 && index < events.length) {
      setCurrentEventId(events[index].id);
    }
  }, [events, setCurrentEventId]);

  // Navigate to a specific event (scrolls in Timeline mode, pages in Story mode)
  const navigateToEvent = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    setCurrentEventId(id);

    if (viewMode === 'timeline') {
      // Scroll to the event element
      const element = document.querySelector(`[data-event-id="${id}"]`);
      if (element) {
        element.scrollIntoView({ behavior, block: 'center' });
      }
    }
  }, [viewMode, setCurrentEventId]);

  // Navigate to older event (higher index, further back in time)
  // Left arrow / back in time
  const navigateOlder = useCallback(() => {
    if (canNavigateOlder) {
      const olderEvent = events[validIndex + 1];
      navigateToEvent(olderEvent.id);
    }
  }, [canNavigateOlder, events, validIndex, navigateToEvent]);

  // Navigate to newer event (lower index, forward in time)
  // Right arrow / forward in time
  const navigateNewer = useCallback(() => {
    if (canNavigateNewer) {
      const newerEvent = events[validIndex - 1];
      navigateToEvent(newerEvent.id);
    }
  }, [canNavigateNewer, events, validIndex, navigateToEvent]);

  // Sync state from URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newViewMode = searchParams.get('view') as ViewMode | null;
    const newEventId = searchParams.get('event');

    isUpdatingUrl.current = true;

    if (newViewMode === 'story' && viewMode !== 'story') {
      setViewModeState('story');
    } else if (newViewMode !== 'story' && viewMode === 'story') {
      setViewModeState('timeline');
    }

    if (newEventId && newEventId !== currentEventId) {
      setCurrentEventIdState(newEventId);
    }

    isUpdatingUrl.current = false;
  }, [searchParams, viewMode, currentEventId]);

  // Update currentEventId when events change (e.g., after filtering)
  useEffect(() => {
    if (events.length > 0 && !events.find(e => e.id === currentEventId)) {
      setCurrentEventIdState(events[0].id);
    }
  }, [events, currentEventId]);

  return {
    viewMode,
    currentEventId,
    currentEventIndex: validIndex,
    setViewMode,
    setCurrentEventId,
    setCurrentEventIndex,
    navigateToEvent,
    navigateOlder,
    navigateNewer,
    canNavigateOlder,
    canNavigateNewer,
  };
}
