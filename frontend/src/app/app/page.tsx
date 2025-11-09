'use client';

import { useState, useEffect } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { AddEventModal, DeleteConfirmationModal, TimelineView } from '@/components/Timeline';
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

  // Use timeline filters hook
  const { filters, filteredEvents, hasActiveFilters, handleFilter, handleClearFilters } = useTimelineFilters(events);

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

  const handleShare = () => {
    alert('Feature coming soon!');
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
