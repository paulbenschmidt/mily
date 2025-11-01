'use client';

import { useState } from 'react';
import { TimelineEventType } from '@/types/api';
import { SmallText, Caption, Button, Card, BodyText } from '@/components/ui';

interface TimelineEventProps {
  event: TimelineEventType;
  isLast?: boolean;
  onEditEvent?: (event: TimelineEventType) => void;
  previousEvent?: TimelineEventType;
  nextEvent?: TimelineEventType;
}

export function TimelineEvent({ event, onEditEvent, previousEvent, nextEvent }: TimelineEventProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategorySize = (category: string) => {
    switch (category) {
      case "major":
        return 'w-6 h-6';
      case "minor":
        return 'w-4 h-4';
      case "memory":
        return 'w-2 h-2';
      default:
        return 'w-2 h-2';
    }
  };

  const getBackgroundCircleSize = (category: string) => {
    switch (category) {
      case "major":
        return 'w-10 h-10'; // Larger background for major events
      case "minor":
        return 'w-8 h-8'; // Medium background for minor events
      case "memory":
        return 'w-6 h-6'; // Smaller background for memory events
      default:
        return 'w-6 h-6';
    }
  };

  const getStackedDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate().toString(),
      year: year.toString()
    };
  };

  const handleEdit = () => {
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  // Check if there's expandable content (description, photos, or notes)
  const hasExpandableContent = event.description || (event.photos && event.photos.length > 0) || event.notes;

  const shouldShowYear = () => {
    if (!nextEvent) return true; // Always show year for last event
    // Parse year directly from date string to avoid timezone issues
    const currentYear = parseInt(event.event_date.split('-')[0]);
    const nextYear = parseInt(nextEvent.event_date.split('-')[0]);
    return currentYear !== nextYear;
  };

  const getYear = () => {
    // Parse year directly from date string to avoid timezone issues
    return event.event_date.split('-')[0];
  };

  const getCategoryShadow = (category: string) => {
    switch (category) {
      case "major":
        return '[box-shadow:0_10px_15px_-3px_rgba(0,0,0,0.25),0_4px_6px_-4px_rgba(0,0,0,0.25)]'; // Darker shadow
      case "minor":
        return '[box-shadow:0_10px_15px_-3px_rgba(0,0,0,0.15),0_4px_6px_-4px_rgba(0,0,0,0.15)]'; // Medium shadow
      case "memory":
        return '[box-shadow:0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]'; // Lighter shadow
      default:
        return '[box-shadow:0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]';
    }
  };

  const getBottomPadding = () => {
    if (!nextEvent) return 'pb-4'; // Default padding for last event

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Scale padding based on time gap
    if (daysDiff <= 90) return 'pb-4';
    if (daysDiff <= 180) return 'pb-8';
    if (daysDiff <= 365) return 'pb-12';
    return 'pb-16';
  };

  const getLineHeight = () => {
    if (!nextEvent) return 'h-0'; // No line for last event

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Match the padding values
    if (daysDiff <= 90) return 'h-[calc(50%+1rem)]';
    if (daysDiff <= 180) return 'h-[calc(50%+2rem)]';
    if (daysDiff <= 365) return 'h-[calc(50%+3rem)]';
    return 'h-[calc(50%+4rem)]';
  };

  return (
    <div
      className={`relative flex items-center gap-6 ${getBottomPadding()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Year label - only shown when year changes */}
      <div className="w-16 flex items-center justify-end">
        {shouldShowYear() && (
          <BodyText className="font-serif font-semibold text-secondary-600">
            {getYear()}
          </BodyText>
        )}
      </div>

      {/* Timeline line and dot */}
      <div className="flex flex-col items-center justify-center relative self-stretch">
        {/* Top line - only show if there's a previous event */}
        {previousEvent && (
          <div className="absolute top-0 bottom-1/2 left-1/2 transform -translate-x-[0.5px] w-px bg-secondary-300" />
        )}

        {/* Bottom line - extends dynamically based on time gap to next event */}
        {nextEvent && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-[0.5px] w-px bg-secondary-300 ${getLineHeight()}`} />
        )}

        {/* Dot with background circle to separate from line */}
        <div className="w-6 h-6 flex items-center justify-center relative z-1">
          {/* Background circle to match background of page - sized based on category */}
          <div className={`absolute bg-secondary-50 rounded-full ${getBackgroundCircleSize(event.category)}`} />
          {/* Actual dot */}
          <div
            className={`rounded-full border-2 bg-muted-foreground border-muted-foreground ${getCategorySize(event.category)} ${getCategoryShadow(event.category)} flex-shrink-0 relative z-10`}
          />
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        <Card className={`p-6 relative ${getCategoryShadow(event.category)}`}>
          {/* Edit button - only visible on hover */}
          {isHovered && onEditEvent && (
            <Button
              variant="text"
              onClick={handleEdit}
              className="absolute top-4 right-16 p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full"
              title="Edit Event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
          )}

          {/* Toggle button - visible when there's expandable content */}
          {hasExpandableContent && (
            <Button
              variant="text"
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute top-4 right-4 p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-transform"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          )}

          <div className="flex gap-4 items-center">
            {/* Stacked date on the left */}
            <div className="flex flex-col items-center justify-start min-w-[60px]">
              <Caption className="font-serif tracking-wider font-semibold text-secondary-500 leading-none">
                {getStackedDate(event.event_date).month}
              </Caption>
              <BodyText className="font-serif font-semibold text-secondary-700 leading-none mt-1">
                {getStackedDate(event.event_date).day}
              </BodyText>
              <BodyText className="font-serif text-secondary-500 text-xs leading-none mt-1">
                {event.category}
              </BodyText>
            </div>

            {/* Content on the right */}
            <div className="flex-1 min-w-0">
              <BodyText className="font-semibold">{event.title}</BodyText>

              {/* Description with line-clamp when collapsed */}
              {event.description && (
                <SmallText
                  className={`leading-relaxed whitespace-pre-wrap mt-2 ${
                    !isExpanded ? 'line-clamp-1' : ''
                  }`}
                >
                  {event.description}
                </SmallText>
              )}

              {/* Expandable content: photos and notes */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >

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
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
