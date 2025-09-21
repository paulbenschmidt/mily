'use client';

import { useState, useEffect } from 'react';
import { authApiClient } from '@/utils/auth-api';
import { TimelineEvent } from '@/types/api';


export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await authApiClient.getEvents();

      // Sort events by date (oldest first)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <div className="text-gray-600">Loading your timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Timeline Content */}
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Timeline Line */}
        <div className="w-20 flex justify-center pt-12">
          <div className="w-0.5 bg-gray-300 h-full relative">
            {/* Event Dots */}
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`absolute -left-2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  event.category === 'major' ? 'bg-indigo-600' :
                  event.category === 'minor' ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
                style={{ top: `${index * 200}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 pt-12 pr-8">
          {events.length === 0 ? (
            <div className="text-center text-gray-600 mt-20">
              <p>No events yet. Start building your timeline!</p>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="mb-16" style={{ marginTop: index === 0 ? '0' : '184px' }}>
                <div className="bg-gray-50 rounded-lg p-4 max-w-sm">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(event.event_date)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    event.category === 'major' ? 'bg-indigo-100 text-indigo-800' :
                    event.category === 'minor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.category.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Button - On timeline at bottom */}
      <div className="relative">
        <div className="absolute left-20 -top-8 -translate-x-1/2">
          <button className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-colors group">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
