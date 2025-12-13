'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
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
  navigateOlder: () => void;
  navigateNewer: () => void;
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
}

/*
 * Hook to manage shared timeline view state between Timeline and Story modes.
 * Syncs view mode and current event with URL parameters.
 */
export function useTimelineViewState({
  events,
  initialEventId,
}: UseTimelineViewStateOptions): UseTimelineViewStateReturn {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial values from URL (only on first render)
  // Use refs to capture values once to prevent re-reading URL on re-renders
  const initializedRef = useRef(false);
  const initialUrlViewMode = useRef<ViewMode | null>(null);
  const initialUrlEventId = useRef<string | null>(null);

  if (!initializedRef.current) {
    initialUrlViewMode.current = searchParams.get('view') as ViewMode | null;
    initialUrlEventId.current = searchParams.get('event');
    initializedRef.current = true;
  }

  const [viewMode, setViewModeState] = useState<ViewMode>(
    initialUrlViewMode.current === 'story' ? 'story' : 'timeline'
  );
  const [currentEventId, setCurrentEventIdState] = useState<string | null>(
    initialUrlEventId.current || initialEventId || (events.length > 0 ? events[0].id : null)
  );

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
    // Use window.location.search to avoid searchParams dependency triggering re-renders
    const params = new URLSearchParams(window.location.search);

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
    // Use native history API to avoid Next.js router re-render flash
    window.history.replaceState(null, '', newUrl);
  }, [pathname]);

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

  // Navigate to older event (higher index, further back in time)
  // Used by StoryView arrow buttons
  const navigateOlder = useCallback(() => {
    if (canNavigateOlder) {
      const olderEvent = events[validIndex + 1];
      setCurrentEventId(olderEvent.id);
    }
  }, [canNavigateOlder, events, validIndex, setCurrentEventId]);

  // Navigate to newer event (lower index, forward in time)
  // Used by StoryView arrow buttons
  const navigateNewer = useCallback(() => {
    if (canNavigateNewer) {
      const newerEvent = events[validIndex - 1];
      setCurrentEventId(newerEvent.id);
    }
  }, [canNavigateNewer, events, validIndex, setCurrentEventId]);

  // Sync state from URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newViewMode = params.get('view') as ViewMode | null;
    const newEventId = params.get('event');

    if (newViewMode === 'story' && viewMode !== 'story') {
      setViewModeState('story');
    } else if (newViewMode !== 'story' && viewMode === 'story') {
      setViewModeState('timeline');
    }

    if (newEventId && newEventId !== currentEventId && events.find(e => e.id === newEventId)) {
      setCurrentEventIdState(newEventId);
    }
  }, [viewMode, currentEventId, events]);

  // Update currentEventId and URL when events change (e.g., after filtering)
  useEffect(() => {
    if (events.length > 0 && !events.find(e => e.id === currentEventId)) {
      const newEventId = events[0].id;
      setCurrentEventIdState(newEventId);
      if (viewMode === 'story') {
        updateUrl(viewMode, newEventId);
      }
    }
  }, [events, currentEventId, viewMode, updateUrl]);

  return {
    viewMode,
    currentEventId,
    currentEventIndex: validIndex,
    setViewMode,
    setCurrentEventId,
    navigateOlder,
    navigateNewer,
    canNavigateOlder,
    canNavigateNewer,
  };
}
