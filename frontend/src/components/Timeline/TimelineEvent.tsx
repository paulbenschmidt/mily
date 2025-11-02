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
  isMobile: boolean;
}

export function TimelineEvent({ event, onEditEvent, onDeleteEvent, previousEvent, nextEvent, isMobile }: TimelineEventProps) {
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

  const getSpacerHeight = () => {
    // Since Tailwind needs to render the height statically (i.e. no variables), we have to use a switch statement
    if (!nextEvent) {
      return isMobile && shouldShowYear() ? 'h-16' : 'h-4';
    }

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Determine base height based on time gap
    // For mobile with year labels, add extra spacing
    const hasYearLabel = isMobile && shouldShowYear();

    if (daysDiff <= 90) {
      return hasYearLabel ? 'h-16' : 'h-4';
    } else if (daysDiff <= 180) {
      return hasYearLabel ? 'h-20' : 'h-8';
    } else if (daysDiff <= 365) {
      return hasYearLabel ? 'h-24' : 'h-12';
    } else {
      return hasYearLabel ? 'h-28' : 'h-16';
    }
  };

  const getLineHeight = () => {
    if (!nextEvent) return 'h-0';

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    const hasYearLabel = isMobile && shouldShowYear();

    // Line extends from center of current dot (50%) through spacer to center of next dot (50%)
    // Spacer heights: h-4=16px, h-8=32px, h-12=48px, h-16=64px, h-20=80px, h-24=96px, h-28=112px
    if (daysDiff <= 90) {
      return hasYearLabel ? 'h-[calc(50%+64px)]' : 'h-[calc(50%+16px)]';
    } else if (daysDiff <= 180) {
      return hasYearLabel ? 'h-[calc(50%+80px)]' : 'h-[calc(50%+32px)]';
    } else if (daysDiff <= 365) {
      return hasYearLabel ? 'h-[calc(50%+96px)]' : 'h-[calc(50%+48px)]';
    } else {
      return hasYearLabel ? 'h-[calc(50%+112px)]' : 'h-[calc(50%+64px)]';
    }
  };

  return (
    <>
      <div className="relative">
        <div className={`flex items-center gap-3 md:gap-6`}>

        {/* Year label - only shown when year changes and on desktop */}
        {!isMobile && (
          <div className="w-16 flex items-center justify-end">
            {shouldShowYear() && (
              <BodyText className="font-serif font-semibold text-secondary-600">
                {getYear()}
              </BodyText>
            )}
          </div>
        )}

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
          <Card
            className={`p-4 md:p-6 relative ${getCategoryShadow(event.category)} cursor-pointer`}
            onClick={handleCardClick}
          >

            <div className="flex gap-3 md:gap-4 items-center">
              {/* Stacked date on the left */}
              <div className="flex flex-col items-center justify-start min-w-[40px] md:min-w-[50px]">
                <Caption className="font-serif tracking-wider font-semibold text-secondary-500 leading-none">
                  {getStackedDate(event.event_date).month}
                </Caption>
                <BodyText className="font-serif font-semibold text-secondary-700 leading-none mt-1">
                  {getStackedDate(event.event_date).day}
                </BodyText>
                <BodyText className="font-serif text-secondary-500 leading-none mt-0.5 md:mt-1" textClass="text-xs">
                  {event.category}
                </BodyText>
              </div>

              {/* Content on the right */}
              <div className="flex-1 min-w-0">
                <BodyText className="font-semibold">{event.title}</BodyText>

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

      {/* Spacer with year label for mobile */}
      <div className={`flex items-center justify-center ${getSpacerHeight()}`}>
        {isMobile && shouldShowYear() && (
          <BodyText className="font-serif font-semibold text-secondary-600">
            {getYear()}
          </BodyText>
        )}
      </div>
    </div>
    </>
  );
}
