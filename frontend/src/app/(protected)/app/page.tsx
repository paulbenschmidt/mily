'use client';

import { useState, useEffect } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { AddEventModal, DeleteConfirmationModal, UnifiedTimelineView } from '@/components/Timeline';
import { useAuth } from '@/contexts/AuthContext';
import { useTimelineFilters } from '@/hooks/useTimelineFilters';

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
  const [isPublic, setIsPublic] = useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);
  const [userHandle, setUserHandle] = useState<string>();

  // Use timeline filters hook
  const { filters, filteredEvents, hasActiveFilters, handleFilter, handleClearFilters } = useTimelineFilters(events);

  useEffect(() => {
    fetchEvents();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = await authApiClient.getCurrentUser();
      setIsPublic(user.is_public);
      setUserHandle(user.handle);
    } catch (err) {
      alert('Failed to fetch user profile');
    }
  };

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


  // Apply privacy override when is_public changes
  useEffect(() => {
    if (events.length === 0) return;

    // If timeline is not public, override any "public" events to "friends"
    if (!isPublic) {
      const updatedEvents = events.map(event =>
        event.privacy_level === 'public'
          ? { ...event, privacy_level: 'friends' as const }
          : event
      );

      // Only update if there were changes
      const hasChanges = updatedEvents.some((event, index) =>
        event.privacy_level !== events[index].privacy_level
      );

      if (hasChanges) {
        setEvents(updatedEvents);
      }
    } else {
      // When timeline becomes public, refetch events to restore original privacy levels
      fetchEvents();
    }
  }, [isPublic]);

  const handleAddEvent = () => {
    setEventToEdit(undefined); // Ensure we're in create mode
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEventType) => {
    setEventToEdit(event);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = (event: TimelineEventType) => {
    setIsAddEventModalOpen(false);
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    if (eventToDelete) {
      setEventToEdit(eventToDelete);
      setIsAddEventModalOpen(true);
    }
  };

  const handleEventAdded = (newEvent: TimelineEventType) => {
    // Add the new event to the timeline and sort by date (newest first)
    const updatedEvents = [newEvent, ...events].sort((a, b) =>
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
    setEvents(updatedEvents);
  };

  const handleEventsAdded = (newEvents: TimelineEventType[]) => {
    // Add multiple events to the timeline and sort by date (newest first)
    const updatedEvents = [...newEvents, ...events].sort((a, b) =>
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

  const handleTogglePublic = async (newIsPublic: boolean) => {
    setIsUpdatingPublic(true);
    try {
      const updatedUser = await authApiClient.updateUser({ is_public: newIsPublic });
      setIsPublic(updatedUser.is_public);
    } catch (err) {
      alert('Failed to update timeline visibility');
      // Revert the local state on error
      setIsPublic(!newIsPublic);
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  return (
    <>
      <UnifiedTimelineView
        mode="owner"
        filteredEvents={filteredEvents}
        totalEventCount={events.length}
        loading={loading}
        error={error}
        onAddEvent={handleAddEvent}
        onEventsAdded={handleEventsAdded}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        currentFilters={filters}
        isMobile={isMobile}
        isPublic={isPublic}
        onTogglePublic={handleTogglePublic}
        isUpdatingPublic={isUpdatingPublic}
        userHandle={userHandle}
      />

      {/* Add/Edit Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onEventAdded={handleEventAdded}
        eventToEdit={eventToEdit}
        onEventUpdated={handleEventUpdated}
        onDeleteEvent={handleDeleteEvent}
        isPublic={isPublic}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        eventTitle={eventToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </>
  );
}
