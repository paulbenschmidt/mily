'use client';

import { useState, useEffect, useMemo } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { AddEventModal, DeleteConfirmationModal, FilterOptions, TimelineView } from '@/components/Timeline';
import { useAuth } from '@/contexts/AuthContext';

export default function Timeline() {
  const { isMobile } = useAuth();
  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<TimelineEventType | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TimelineEventType | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    categories: [], // Empty = All selected
    privacyLevels: [] // Empty = All selected
  });

  useEffect(() => {
    fetchEvents();
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

  const handleDeleteEvent = (event: TimelineEventType) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
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

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await authApiClient.deleteEvent(eventToDelete.id);
      // Remove the deleted event from the timeline
      const updatedEvents = events.filter(e => e.id !== eventToDelete.id);
      setEvents(updatedEvents);
      setIsDeleteModalOpen(false);
      setEventToDelete(undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilter = (newFilters: FilterOptions) => {
    // If all categories are selected, clear the array (empty = all)
    const categories = newFilters.categories.length === 3 ? [] : newFilters.categories;
    // If all privacy levels are selected, clear the array (empty = all)
    const privacyLevels = newFilters.privacyLevels.length === 3 ? [] : newFilters.privacyLevels;
    
    setFilters({
      ...newFilters,
      categories,
      privacyLevels,
    });
  };

  const handleShare = () => {
    alert('Feature coming soon!');
  };

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);

      // Filter by date range
      if (filters.startDate && new Date(filters.startDate) > eventDate) {return false;}
      if (filters.endDate && new Date(filters.endDate) < eventDate) {return false;}
      // Filter by category - empty array means "All" (show all categories)
      if (filters.categories.length > 0 && filters.categories.length < 3 && !filters.categories.includes(event.category)) {return false;}
      // Filter by privacy level - empty array means "All" (show all levels)
      if (filters.privacyLevels.length > 0 && filters.privacyLevels.length < 3 && !filters.privacyLevels.includes(event.privacy_level)) {return false;}

      return true;
    });
  }, [events, filters]);


  const hasActiveFilters =
    filters.startDate !== null ||
    filters.endDate !== null ||
    (filters.categories.length > 0 && filters.categories.length < 3) ||
    (filters.privacyLevels.length > 0 && filters.privacyLevels.length < 3);

  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      categories: [], // Empty = All selected
      privacyLevels: [] // Empty = All selected
    });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <TimelineView
        mode="owner"
        filteredEvents={filteredEvents}
        totalEventCount={events.length}
        loading={loading}
        error={error}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onFilter={handleFilter}
        onShare={handleShare}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        currentFilters={filters}
        isMobile={isMobile}
      />

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onEventAdded={handleEventAdded}
        eventToEdit={eventToEdit}
        onEventUpdated={handleEventUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        eventTitle={eventToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
