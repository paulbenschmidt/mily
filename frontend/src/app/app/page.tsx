'use client';

import { useState, useEffect, useMemo } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { AddEventModal, FilterOptions, TimelineView, TimelineHeader } from '@/components/Timeline';

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<TimelineEventType | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    category: 'all',
    privacy_level: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await authApiClient.getEvents();

      // Sort events by date (newest first for better UX)
      const sortedEvents = response.sort((a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      );

      setEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    setEventToEdit(undefined); // Ensure we're in create mode
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEventType) => {
    setEventToEdit(event);
    setIsAddEventModalOpen(true);
  };

  const handleEventAdded = (newEvent: TimelineEventType) => {
    // Add the new event to the timeline and sort by date (newest first)
    const updatedEvents = [newEvent, ...events].sort((a, b) =>
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
    setEvents(updatedEvents);
  };

  const handleEventUpdated = (updatedEvent: TimelineEventType) => {
    // Replace the updated event in the timeline and re-sort
    const updatedEvents = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    ).sort((a, b) =>
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
    setEvents(updatedEvents);
  };

  const handleEventDeleted = (eventId: string) => {
    // Remove the deleted event from the timeline
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleShare = () => {
    alert('Feature coming soon!');
  };

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);

      // Filter by date range
      if (filters.startDate && new Date(filters.startDate) > eventDate) {
        return false;
      }

      if (filters.endDate && new Date(filters.endDate) < eventDate) {
        return false;
      }

      // Filter by category
      if (filters.category !== 'all' && event.category !== filters.category) {
        return false;
      }

      // Filter by privacy level
      if (filters.privacy_level !== 'all' && event.privacy_level !== filters.privacy_level) {
        return false;
      }

      return true;
    });
  }, [events, filters]);


  const hasActiveFilters =
    filters.startDate !== null ||
    filters.endDate !== null ||
    filters.category !== 'all' ||
    filters.privacy_level !== 'all';

  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      category: 'all',
      privacy_level: 'all'
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <TimelineHeader
        mode="owner"
        onAddEvent={handleAddEvent}
        onFilter={handleFilter}
        onShare={handleShare}
        hasEvents={events.length > 0}
        currentFilters={filters}
        isMobile={isMobile}
      />

      <TimelineView
        mode="owner"
        filteredEvents={filteredEvents}
        totalEventCount={events.length}
        loading={loading}
        error={error}
        scrollProgress={scrollProgress}
        onScrollProgressChange={setScrollProgress}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        isMobile={isMobile}
      />

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onEventAdded={handleEventAdded}
        eventToEdit={eventToEdit}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />
    </div>
  );
}
