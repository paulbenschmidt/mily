'use client';

import { useState } from 'react';
import { TimelineEventType } from '@/types/api';
import { SmallText, Caption, Button, Card, Badge, BodyText } from '@/components/ui';

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

  const getLineTopOffset = (category: string) => {
    switch (category) {
      case "major":
        return 'top-7'; // 28px - larger dot needs more space
      case "minor":
        return 'top-6'; // 24px - medium dot
      case "memory":
        return 'top-6'; // 20px - smaller dot
      default:
        return 'top-6';
    }
  };

  const formatDate = (dateString: string) => {
    // Parse as local date to avoid timezone conversion issues
    // dateString format: "YYYY-MM-DD"
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
      <div className="flex flex-col items-center relative pt-1">
        {/* Create a fixed-width container for the dot to ensure consistent positioning */}
        <div className="w-4 h-4 flex items-center justify-center">
          <div
            className={`rounded-full border-2 ${getCategoryColor(event.category)} ${getCategorySize(event.category)} flex-shrink-0`}
          />
        </div>
        {/* Center the line regardless of dot size */}
        {!isLast && <div className={`absolute ${getLineTopOffset(event.category)} left-1/2 transform -translate-x-[0.5px] w-px bg-secondary-300 h-full`} />}
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <SmallText className="font-serif tracking-wider">
            {formatDate(event.event_date)}
          </SmallText>
          <Badge className={
            event.category === 'major' ? 'border-2 border-secondary-500 bg-secondary-200' :
            event.category === 'minor' ? 'border-2 border-secondary-400 bg-secondary-100' :
            'border-2 border-secondary-300 bg-transparent'
          }>
            {event.category}
          </Badge>
        </div>

        <Card className="p-6 relative">
          {/* Edit button - only visible on hover */}
          {isHovered && onEditEvent && (
            <Button
              variant="text"
              onClick={handleEdit}
              className="absolute top-4 right-4 p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full"
              title="Edit Event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
          )}
          <BodyText className="font-semibold mb-2">{event.title}</BodyText>

          {event.description && (
            <SmallText className="leading-relaxed mb-4 whitespace-pre-wrap">{event.description}</SmallText>
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
            <div className="pt-4 border-t border-secondary-200">
              <Caption className="italic">{event.notes}</Caption>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
