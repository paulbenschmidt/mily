'use client';

import { useState } from 'react';
import { TimelineEvent as TimelineEventType } from '@/types/api';

interface TimelineEventProps {
  event: TimelineEventType;
  isLast?: boolean;
  onEditEvent?: (event: TimelineEventType) => void;
}

export function TimelineEvent({ event, isLast = false, onEditEvent }: TimelineEventProps) {
  const [isHovered, setIsHovered] = useState(false);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "major":
        return "bg-timeline-dot-major border-timeline-dot-major"
      case "minor":
        return "bg-timeline-dot border-timeline-dot"
      case "memory":
        return "bg-muted-foreground border-muted-foreground"
      default:
        return "bg-timeline-dot border-timeline-dot"
    }
  };

  const getCategorySize = (category: string) => {
    switch (category) {
      case "major":
        return 'w-4 h-4';
      case "minor":
        return 'w-3 h-3';
      case "memory":
        return 'w-2 h-2';
      default:
        return 'w-3 h-3';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  return (
    <div 
      className="relative flex gap-6 pb-8" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center relative">
        {/* Create a fixed-width container for the dot to ensure consistent positioning */}
        <div className="w-4 h-4 flex items-center justify-center">
          <div
            className={`rounded-full border-2 ${getCategoryColor(event.category)} ${getCategorySize(event.category)} flex-shrink-0`}
          />
        </div>
        {/* Center the line regardless of dot size */}
        {!isLast && <div className="absolute top-4 left-1/2 transform -translate-x-[0.5px] w-px bg-gray-300 h-full" />}
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <time className="text-sm font-mono text-gray-500 tracking-wider">
            {formatDate(event.event_date)}
          </time>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
            event.category === 'major' ? 'bg-red-100 text-red-800' :
            event.category === 'minor' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {event.category}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
          {/* Edit button - only visible on hover */}
          {isHovered && onEditEvent && (
            <button
              onClick={handleEdit}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit Event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{event.title}</h3>

          {event.description && (
            <p className="text-gray-600 leading-relaxed mb-4">{event.description}</p>
          )}

          {event.photos && event.photos.length > 0 && (
            <div className="mb-4">
              <img
                src={event.photos[0]}
                alt={event.title}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          {event.notes && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
