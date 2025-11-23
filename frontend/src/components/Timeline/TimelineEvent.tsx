'use client';

import { useState } from 'react';
import { TimelineEventType } from '@/types/api';
import { SmallText, Caption, Button, Card, BodyText } from '@/components/ui';

interface TimelineEventProps {
  event: TimelineEventType;
  isLast?: boolean;
  onEditEvent?: (event: TimelineEventType) => void;
  onDeleteEvent?: (event: TimelineEventType) => void;
  previousEvent?: TimelineEventType;
  nextEvent?: TimelineEventType;
  mode?: 'owner' | 'viewer';
}

export function TimelineEvent({ event, onEditEvent, onDeleteEvent, previousEvent, nextEvent, mode = 'owner' }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPrivacyIcon = (privacyLevel: string) => {
    const iconClass = "w-3.5 h-3.5 text-secondary-400";

    switch (privacyLevel) {
      case 'public':
        // Globe icon (visible to everyone)
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Public">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'friends':
        // Simplified people/users icon (friends only)
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Friends only">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'private':
        // Lock icon (private/locked)
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Private">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
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

  const getCategoryDotStyling = (category: string) => {
    switch (category) {
      case "major":
        return 'w-6 h-6 bg-primary-500 border-primary-500';
      case "minor":
        return 'w-4 h-4 bg-primary-400 border-primary-400';
      case "memory":
        return 'w-2 h-2 bg-primary-300 border-primary-300';
      default:
        return 'w-2 h-2 bg-primary-300 border-primary-300';
    }
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

  const getStackedDate = (dateString: string, isDayApproximate: boolean) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: isDayApproximate ? null : date.getDate().toString(),
      year: year.toString()
    };
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteEvent) {
      onDeleteEvent(event);
    }
  };

  const handleCardClick = () => {
    // Allow expansion if there's content to show OR if edit/delete is available
    if (hasExpandableContent || onEditEvent || onDeleteEvent) {
      setIsExpanded(!isExpanded);
    }
  };

  // Check if there's expandable content (description, photos, or notes)
  const hasExpandableContent = event.description || (event.photos && event.photos.length > 0) || event.notes;

  const yearsToReturn = (): string | null => {
    // Parse year directly from date string to avoid timezone issues
    const currentYear = parseInt(event.event_date.split('-')[0]);

    // If there is no next, return the current year
    if (!nextEvent) {
      return currentYear.toString();
    }

    const nextYear = parseInt(nextEvent.event_date.split('-')[0]);
    const yearsDiff = Math.abs(currentYear - nextYear);
    if (currentYear === nextYear) {
      return null; // If the next event is in the same year, don't show a year
    } else if (yearsDiff === 1) {
      return currentYear.toString(); // If the next event is in the next year, show the next year
    } else if (yearsDiff > 1) {
      return `${yearsDiff} years`; // If the next event is more than a year away, show the number of years
    } else {
      return null; // Fallback
    }
  };

  // Calculate year label once to avoid calling function twice
  const yearLabel = yearsToReturn();

  const getMonthSpacerHeight = () => {
    // Exit early if there is no next event
    if (!nextEvent) {
      return '';
    }

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysDiff <= 30) {
      return 'h-2';
    } else if (daysDiff <= 90) {
      return 'h-4';
    } else if (daysDiff <= 180) {
      return 'h-6';
    } else if (daysDiff <= 365) {
      return 'h-8';
    } else {
      return 'h-2';
    }
  };

  const getYearSpacerHeight = () => {
    // Exit early if there is no next event
    const defaultHeight = 'h-6';
    if (!nextEvent) {
      return defaultHeight;
    }

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const yearsDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24 * 365)));

    if (yearsDiff <= 1) {
      return defaultHeight;
    } else if (yearsDiff <= 2) {
      return 'h-10';
    } else if (yearsDiff <= 5) {
      return 'h-14';
    } else if (yearsDiff <= 10) {
      return 'h-18';
    } else {
      return 'h-24';
    }
  };

  return (
    <div className="relative flex flex-col">
      {/* Line connecting to next event - positioned at parent level to extend through everything */}
      {/* TODO: Find a way to hide the top part of the line for the first event */}
      {nextEvent && (
        <div className="absolute left-0 w-px bg-secondary-300" style={{
          top: '0.75rem', // Center of the dot (half of 1.5rem dot container)
          bottom: '0',
          left: 'calc(0.75rem - 0.5px)'
        }} />
      )}

      <div className="relative">
        <div className={`flex items-center gap-3 md:gap-6`}>

        {/* Timeline dot with connecting line */}
        <div className="flex flex-col items-center justify-center relative self-stretch">
          {/* Line connecting to previous event - only show if there's a previous event */}
          {previousEvent && (
            <div className="absolute top-0 bottom-1/2 left-1/2 transform -translate-x-[0.5px] w-px bg-secondary-300" />
          )}

          {/* Dot with background circle to separate from line */}
          <div className="w-6 h-6 flex items-center justify-center relative">
            {/* Background circle to match background of page - sized based on category */}
            <div className={`absolute bg-secondary-50 rounded-full ${getBackgroundCircleSize(event.category)}`} />
            {/* Actual dot */}
            <div
              className={`rounded-full border-2 ${getCategoryDotStyling(event.category)} ${getCategoryShadow(event.category)} flex-shrink-0 relative`}
            />
          </div>
        </div>

        {/* Event content */}
        <div className="flex-1 min-w-0">
          <Card
            className={`p-4 md:p-6 relative ${getCategoryShadow(event.category)} cursor-pointer`}
            onClick={handleCardClick}
          >

            <div className="flex gap-3 md:gap-4 items-center">
              {/* Stacked date on the left */}
              <div className="flex flex-col items-center justify-start min-w-[40px] md:min-w-[50px]">
                <Caption className="font-serif tracking-wider font-semibold text-secondary-500 leading-none">
                  {getStackedDate(event.event_date, event.is_day_approximate).month}
                </Caption>
                {getStackedDate(event.event_date, event.is_day_approximate).day && (
                  <BodyText className="font-serif font-semibold text-secondary-700 leading-none mt-1">
                    {getStackedDate(event.event_date, event.is_day_approximate).day}
                  </BodyText>
                )}
                <BodyText className={`font-serif text-secondary-500 leading-none ${getStackedDate(event.event_date, event.is_day_approximate).day ? 'mt-0.5 md:mt-1' : 'mt-1'}`} textClass="text-xs">
                  {getStackedDate(event.event_date, event.is_day_approximate).year}
                </BodyText>
              </div>

              {/* Content on the right */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <BodyText className="font-semibold flex-1">{event.title}</BodyText>
                  {mode === 'owner' && getPrivacyIcon(event.privacy_level)}
                </div>

                {/* Description preview when collapsed */}
                {event.description && !isExpanded && (
                  <SmallText className="leading-relaxed whitespace-pre-wrap mt-1.5 md:mt-2 line-clamp-2 md:line-clamp-1">
                    {event.description}
                  </SmallText>
                )}

                {/* Expandable content: full description, photos, notes, and buttons */}
                {isExpanded && (
                  <div className="overflow-hidden transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">

                  {/* Full description when expanded */}
                  {event.description && (
                    <SmallText className="leading-relaxed whitespace-pre-wrap mt-1.5 md:mt-2">
                      {event.description}
                    </SmallText>
                  )}

                  {event.photos && event.photos.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={event.photos[0]}
                        alt={event.title}
                        className="w-full h-40 md:h-48 object-cover rounded-md"
                      />
                    </div>
                  )}

                  {event.notes && (
                    <div className="pt-4">
                      <Caption className="italic">{event.notes}</Caption>
                    </div>
                  )}

                  {/* Action buttons - shown when expanded */}
                  {(onEditEvent || onDeleteEvent) && (
                    <div className="flex gap-6 justify-center pt-4 mt-4 border-t border-secondary-200">
                      {onEditEvent && (
                        <Button
                          variant="secondary"
                          onClick={handleEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                          title="Edit Event"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </Button>
                      )}
                      {onDeleteEvent && (
                        <Button
                          variant="secondary"
                          onClick={handleDelete}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                          title="Delete Event"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>

      {/* Spacer for events that are months apart and not broken by a year */}
      {yearLabel === null && (
        <div className={`flex items-center justify-center ${getMonthSpacerHeight()}`} />
      )}

      {/* Year labels between events */}
      {yearLabel !== null && (
        <div className={`flex flex-col gap-4 my-6 items-center justify-center ${getYearSpacerHeight()}`}>
          <div className="flex items-center gap-3 md:gap-6 w-full">
            {/* Ghost spacer to match the timeline dot width */}
            <div className="w-6 flex-shrink-0" />

            {/* Year label with lines */}
            <div className="flex-1 flex items-center gap-3 px-8 md:px-16">
              <div className="flex-1 h-px bg-secondary-300" />
              <BodyText className="font-serif font-semibold text-secondary-600 whitespace-nowrap">
                {yearLabel}
              </BodyText>
              <div className="flex-1 h-px bg-secondary-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
