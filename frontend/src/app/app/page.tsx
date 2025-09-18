'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  event_type: string;
}

export default function Timeline() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Mock data for testing - replace with actual API call later
      const mockData: Event[] = [
        {
          id: 1,
          title: "Born",
          description: "The beginning of my journey",
          date: "1990-05-15",
          event_type: "MAJOR"
        },
        {
          id: 2,
          title: "Started School",
          description: "First day of elementary school",
          date: "1996-09-01",
          event_type: "MAJOR"
        },
        {
          id: 3,
          title: "Learned to Ride a Bike",
          description: "Finally mastered riding without training wheels",
          date: "1997-07-20",
          event_type: "MINOR"
        },
        {
          id: 4,
          title: "High School Graduation",
          description: "Graduated with honors from high school",
          date: "2008-06-15",
          event_type: "MAJOR"
        },
        {
          id: 5,
          title: "First Job",
          description: "Started working at a local coffee shop",
          date: "2008-07-01",
          event_type: "MINOR"
        },
        {
          id: 6,
          title: "College Graduation",
          description: "Earned my Bachelor's degree in Computer Science",
          date: "2012-05-20",
          event_type: "MAJOR"
        },
        {
          id: 7,
          title: "Got Married",
          description: "Married my best friend and soulmate",
          date: "2015-08-12",
          event_type: "MAJOR"
        },
        {
          id: 8,
          title: "Bought First House",
          description: "Purchased our first home together",
          date: "2017-03-10",
          event_type: "MINOR"
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sort events by date (oldest first)
      const sortedEvents = mockData.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
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
                  event.event_type === 'MAJOR' ? 'bg-indigo-600' :
                  event.event_type === 'MINOR' ? 'bg-blue-500' :
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
                  <p className="text-xs text-gray-500 mt-2">{formatDate(event.date)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                    event.event_type === 'MAJOR' ? 'bg-indigo-100 text-indigo-800' :
                    event.event_type === 'MINOR' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.event_type}
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
