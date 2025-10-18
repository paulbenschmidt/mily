'use client';

import { useState, useEffect, useMemo } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEventType } from '@/types/api';
import { FilterOptions } from '@/components/FilterDropdown';
import { TimelineHeader } from '@/components/TimelineHeader';
import { HorizontalTimelineEvent } from '@/components/HorizontalTimelineEvent';
import { AddEventModal } from '@/components/AddEventModal';
import { BodyText, SmallText, Button } from '@/components/ui';

export default function ExperimentalTimeline() {
  const [events, setEvents] = useState<TimelineEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<TimelineEventType | undefined>(undefined);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    category: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await authApiClient.getEvents();

      // Sort events by date (oldest first for left-to-right timeline)
      const sortedEvents = response.sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );

      setEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    setEventToEdit(undefined);
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: TimelineEventType) => {
    setEventToEdit(event);
    setIsAddEventModalOpen(true);
  };

  const handleEventAdded = (newEvent: TimelineEventType) => {
    const updatedEvents = [newEvent, ...events].sort((a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
    setEvents(updatedEvents);
  };

  const handleEventUpdated = (updatedEvent: TimelineEventType) => {
    const updatedEvents = events.map(event =>
      event.id === updatedEvent.id ? updatedEvent : event
    ).sort((a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
    setEvents(updatedEvents);
  };

  const handleEventDeleted = (eventId: string) => {
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

      if (filters.startDate && new Date(filters.startDate) > eventDate) {
        return false;
      }

      if (filters.endDate && new Date(filters.endDate) < eventDate) {
        return false;
      }

      if (filters.category !== 'all' && event.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <TimelineHeader
          onAddEvent={handleAddEvent}
          onFilter={handleFilter}
          onShare={handleShare}
          hasEvents={false}
          currentFilters={filters}
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <BodyText>Loading your timeline...</BodyText>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <TimelineHeader
          onAddEvent={handleAddEvent}
          onFilter={handleFilter}
          onShare={handleShare}
          hasEvents={false}
          currentFilters={filters}
        />
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <BodyText className="text-danger-600">Error: {error}</BodyText>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <TimelineHeader
        onAddEvent={handleAddEvent}
        onFilter={handleFilter}
        onShare={handleShare}
        hasEvents={events.length > 0}
        currentFilters={filters}
      />

      <main className="flex-1 overflow-hidden">
        {events.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center flex flex-col items-center">
              <Button
                onClick={handleAddEvent}
                size="lg"
                className="shadow-lg transition-all transform hover:scale-105 duration-200"
              >
                Begin
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center px-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-10">
                <BodyText>No events match your filters</BodyText>
                <Button
                  onClick={() => setFilters({ startDate: null, endDate: null, category: 'all' })}
                  variant="secondary"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-hidden pb-8">
                <div className="flex flex-row items-start min-w-min py-8">
                  {filteredEvents.map((event, index) => (
                    <HorizontalTimelineEvent
                      key={event.id}
                      event={event}
                      isLast={index === filteredEvents.length - 1}
                      onEditEvent={handleEditEvent}
                    />
                  ))}
                  {/* Right padding for better scroll experience */}
                  <div className="w-32 flex-shrink-0" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter status indicator */}
        {(filters.startDate || filters.endDate || filters.category !== 'all') && events.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-secondary-200 flex items-center space-x-2">
            <SmallText>
              Showing {filteredEvents.length} of {events.length} events
            </SmallText>
            <Button
              onClick={() => setFilters({ startDate: null, endDate: null, category: 'all' })}
              variant="text"
              size="sm"
            >
              Clear
            </Button>
          </div>
        )}
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
