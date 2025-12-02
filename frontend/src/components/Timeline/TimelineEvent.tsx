'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { TimelineEventType } from '@/types/api';
import { SmallText, Caption, Button, Card, BodyText } from '@/components/ui';
import { PhotoModal } from './PhotoModal';

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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const getPrivacyIcon = (privacyLevel: string) => {
    const config: Record<string, { path: string; label: string }> = {
      public: {
        path: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
        label: "Public"
      },
      friends: {
        path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        label: "Friends"
      },
      private: {
        path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
        label: "Private"
      }
    };

    const item = config[privacyLevel];
    if (!item) return null;

    return (
      <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center" aria-label={item.label} role="img">
        <svg className="w-3 h-3 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
        </svg>
      </div>
    );
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

  const getStackedDate = (dateString: string, isDayApproximate: boolean, isMonthApproximate: boolean) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      month: isMonthApproximate ? null : date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: isDayApproximate ? null : date.getDate().toString(),
      year: year.toString()
    };
  };

  const formatEventDateLine = (
    dateString: string,
    isDayApproximate: boolean,
    isMonthApproximate: boolean
  ) => {
    const { year, month, day } = getStackedDate(dateString, isDayApproximate, isMonthApproximate);

    if (month && day) {
      return `${year} ${month} ${day}`;
    }

    if (month) {
      return `${year} ${month}`;
    }

    return year;
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
  const hasExpandableContent = event.description || (event.event_photos && event.event_photos.length > 0) || event.notes;

  const getEventSpacerHeight = () => {
    // Exit early if there is no next event
    if (!nextEvent) {
      return '';
    }

    const currentDate = new Date(event.event_date);
    const nextDate = new Date(nextEvent.event_date);
    const daysDiff = Math.abs(Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysDiff <= 90) {
      return 'h-2';
    } else if (daysDiff <= 180) {
      return 'h-4';
    } else if (daysDiff <= 365) {
      return 'h-6';
    } else if (daysDiff <= 365 * 3) {
      return 'h-8';
    } else if (daysDiff <= 365 * 6) {
      return 'h-12';
    } else if (daysDiff <= 365 * 9) {
      return 'h-16';
    } else if (daysDiff <= 365 * 12) {
      return 'h-20';
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
            <div className={`absolute bg-white rounded-full ${getBackgroundCircleSize(event.category)}`} />
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
              {/* <div className="flex flex-col items-center justify-start min-w-[35px] md:min-w-[45px]">
                <Caption className="font-serif font-semibold text-secondary-500 leading-none mt-1">
                  {getStackedDate(event.event_date, event.is_day_approximate, event.is_month_approximate).year}
                </Caption>
                {getStackedDate(event.event_date, event.is_day_approximate, event.is_month_approximate).month && (
                  <BodyText className={`font-serif text-secondary-500 leading-none mt-1.5`} textClass="text-xs">
                    {getStackedDate(event.event_date, event.is_day_approximate, event.is_month_approximate).month} {getStackedDate(event.event_date, event.is_day_approximate, event.is_month_approximate).day}
                  </BodyText>
                )}
              </div> */}

              {/* Content on the right */}
              <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between gap-2 mb-1">
                  {/* <BodyText className={`font-serif text-secondary-500 leading-none mt-1.5`} textClass="text-xs"> */}
                  <Caption className="font-serif font-semibold text-secondary-500 leading-none mt-1">
                    {formatEventDateLine(
                      event.event_date,
                      event.is_day_approximate,
                      event.is_month_approximate
                    )}
                  </Caption>
                  {mode === 'owner' && getPrivacyIcon(event.privacy_level)}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <BodyText className="font-semibold flex-1">{event.title}</BodyText>
                </div>

                {/* Description when collapsed */}
                {!isExpanded && event.description && (
                  <div className="mt-1 md:mt-1.5">
                    <SmallText className="leading-relaxed whitespace-pre-wrap line-clamp-2 md:line-clamp-1">
                      {event.description}
                    </SmallText>
                  </div>
                )}

                {/* Photo chip when collapsed */}
                {!isExpanded && event.event_photos && event.event_photos.length > 0 && (
                  <div className="mt-2 flex">
                    <div className="inline-flex items-center gap-1 rounded-full bg-secondary-100 border border-secondary-200 px-2 py-0.5 text-secondary-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <Caption className="text-secondary-500">
                        {event.event_photos.length} {event.event_photos.length === 1 ? 'photo' : 'photos'}
                      </Caption>
                    </div>
                  </div>
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

                  {event.event_photos && event.event_photos.length > 0 && (
                    <div className="mt-4 mb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {event.event_photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhotoIndex(index);
                              setPhotoModalOpen(true);
                            }}
                            className="relative aspect-square overflow-hidden rounded-md border-2 border-secondary-200 hover:opacity-90 transition-opacity"
                          >
                            <NextImage
                              src={photo.url}
                              alt={`Photo ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 33vw, 120px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {mode === 'owner' && event.notes && (
                    <div className="pt-4">
                      <Caption className="italic">{event.notes}</Caption>
                    </div>
                  )}

                  {/* Action buttons - shown when expanded */}
                  {(onEditEvent || onDeleteEvent) && (
                    <div className="flex gap-6 justify-center pt-4 mt-4 pb-4 border-t border-secondary-200">
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

      {/* Spacer for events with appropriate spacing */}
      <div className={`flex items-center justify-center ${getEventSpacerHeight()}`} />

      {/* Photo Modal */}
      {photoModalOpen && event.event_photos && event.event_photos.length > 0 && (
        <PhotoModal
          photos={event.event_photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setPhotoModalOpen(false)}
          onNavigate={setSelectedPhotoIndex}
        />
      )}
    </div>
  );
}
