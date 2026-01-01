'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { TimelineEventType, UserType } from '@/types/api';
import { TimelineListEvent } from './TimelineListEvent';
import { EmptyFilteredState } from './utils';

interface TimelineListViewProps {
  events: TimelineEventType[];
  onEditEvent?: (event: TimelineEventType) => void;
  onShareEvent?: (event: TimelineEventType) => void;
  onCurrentEventChange: (eventId: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
  mode: 'owner' | 'viewer';
  initialEventIdToScrollTo?: string | null;
  acceptedShares?: UserType[];
}

/**
 * Timeline list view component that renders events in a vertical scrolling list.
 * Uses a throttled scroll listener to track which event is currently in view.
 */
export function TimelineListView({
  events,
  onEditEvent,
  onShareEvent,
  onCurrentEventChange,
  onClearFilters,
  hasActiveFilters,
  mode,
  initialEventIdToScrollTo,
  acceptedShares = [],
}: TimelineListViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isReady, setIsReady] = useState(!initialEventIdToScrollTo);

  // Pixels from top/bottom of page to trigger first/last event selection
  const SCROLL_BOUNDARY_THRESHOLD = 20;

  // Track which event is currently visible in the center of the viewport
  const handleIntersection = useCallback(() => {
    if (!isReady) return;

    // Override at page boundaries
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // At top of page: select first event
    if (scrollTop < SCROLL_BOUNDARY_THRESHOLD && events.length > 0) {
      onCurrentEventChange(events[0].id);
      return;
    }

    // At bottom of page: select last event
    if (scrollTop + clientHeight >= scrollHeight - SCROLL_BOUNDARY_THRESHOLD && events.length > 0) {
      onCurrentEventChange(events[events.length - 1].id);
      return;
    }

    // Collect all currently visible events and pick the middle one
    const visibleEventIds: string[] = [];
    eventRefs.current.forEach((element, eventId) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < clientHeight && rect.bottom > 0;
      if (isVisible) {
        visibleEventIds.push(eventId);
      }
    });

    if (visibleEventIds.length > 0) {
      // Sort by their order in the events array to maintain chronological order
      const sortedVisible = visibleEventIds.sort((a, b) => {
        const indexA = events.findIndex(e => e.id === a);
        const indexB = events.findIndex(e => e.id === b);
        return indexA - indexB;
      });

      // Pick the middle event
      const middleIndex = Math.floor(sortedVisible.length / 2);
      onCurrentEventChange(sortedVisible[middleIndex]);
    }
  }, [isReady, onCurrentEventChange, events]);

  // Scroll to initial event on mount (when switching from Story mode)
  useEffect(() => {
    if (initialEventIdToScrollTo) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-event-id="${initialEventIdToScrollTo}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        setIsReady(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, []); // Only run on mount

  // Throttled scroll listener to track current event
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        handleIntersection();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check

    return () => window.removeEventListener('scroll', onScroll);
  }, [handleIntersection]);

  // Ref callback that caches DOM element references in a Map for fast access.
  // On mount: stores the element. On unmount: removes it.
  // Used by handleIntersection to check visibility without querying the DOM.
  const registerEventRef = useCallback((eventId: string, element: HTMLDivElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  if (events.length === 0) {
    return <EmptyFilteredState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-0 transition-opacity duration-150 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      id="timeline-view"
      role="tabpanel"
      aria-label="Timeline view"
    >
      {events.map((event, index) => (
        <div
          key={event.id}
          data-event-id={event.id}
          ref={(el) => registerEventRef(event.id, el)}
        >
          <TimelineListEvent
            event={event}
            onEditEvent={mode === 'owner' ? onEditEvent : undefined}
            onShareEvent={mode === 'owner' ? onShareEvent : undefined}
            previousEvent={events[index - 1]}
            nextEvent={events[index + 1]}
            mode={mode}
          />
        </div>
      ))}
    </div>
  );
}
