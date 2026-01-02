'use client';

import { TimelineEventType } from '@/types/api';
import { Button } from '@/components/ui';

interface EventActionButtonsProps {
  event: TimelineEventType;
  onEditEvent?: (event: TimelineEventType) => void;
  onShareEvent?: (event: TimelineEventType) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Shared Edit button for timeline events.
 * Used by both TimelineListEvent and StoryView.
 */
export function EventActionButtons({
  event,
  onEditEvent,
  onShareEvent,
  size = 'md',
  className = '',
}: EventActionButtonsProps) {
  if (!onEditEvent && !onShareEvent) return null;

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const buttonPadding = size === 'sm' ? 'px-3 py-1.5 text-sm' : '';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent?.(event);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareEvent?.(event);
  };

  return (
    <div className={`flex justify-center pt-4 mt-4 gap-2 ${className}`}>
      {onEditEvent && (
        <Button
          variant="secondary"
          onClick={handleEdit}
          className={`flex items-center gap-1.5 ${buttonPadding}`}
          title="Edit Event"
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </Button>
      )}

      {onShareEvent && (
        <Button
          variant="secondary"
          onClick={handleShare}
          className={`flex items-center gap-1.5 ${buttonPadding}`}
          title="Share Event"
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Share
        </Button>
      )}
    </div>
  );
}
