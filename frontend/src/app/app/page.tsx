'use client';

import { useState, useEffect } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { TimelineHeader } from '@/components/TimelineHeader';
import { TimelineEvent } from '@/components/TimelineEvent';
import { AddEventModal } from '@/components/AddEventModal';

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<TimelineEventType | undefined>(undefined);

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

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter clicked');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TimelineHeader onAddEvent={handleAddEvent} onFilter={handleFilter} onShare={handleShare} hasEvents={false} />
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <div className="text-gray-600">Loading your timeline...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TimelineHeader onAddEvent={handleAddEvent} onFilter={handleFilter} onShare={handleShare} hasEvents={false} />
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TimelineHeader onAddEvent={handleAddEvent} onFilter={handleFilter} onShare={handleShare} hasEvents={events.length > 0} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {events.length === 0 ? (
          <div className="text-center mt-20 flex flex-col items-center">
            <button
              onClick={handleAddEvent}
              className="px-10 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-lg font-medium rounded-lg shadow-lg hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-all transform hover:scale-105 duration-200"
            >
              Begin Your Journey
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={index === events.length - 1}
                onEditEvent={handleEditEvent}
              />
            ))}
          </div>
        )}

        {/* Bottom spacing for better scroll experience */}
        <div className="h-32" />
      </main>

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
