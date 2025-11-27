import { useState, useRef, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { SmallText } from '@/components/ui';

interface TimelineProgressIndicatorProps {
  filteredEvents: TimelineEventType[];
  scrollProgress: number;
  onSeek?: (targetDatePercentage: number, isDragging?: boolean) => void;
}

export function TimelineProgressIndicator({
  filteredEvents,
  scrollProgress,
  onSeek,
}: TimelineProgressIndicatorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Minimum movement (in pixels) required to distinguish a drag from a click/tap.
  // Movements below this threshold trigger smooth scrolling (click behavior),
  // while movements above trigger instant scrolling (drag behavior).
  const DRAG_THRESHOLD = 3; // pixels

  // Calculate target percentage when clicking on the timeline
  const calculateTargetPercentage = (clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    return 100 - clickPercentage; // Inverted because timeline goes newest→oldest
  };

  // Get client position (x and y) to determine if dragging across the timeline (mouse or touch)
  const getClientPosition = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // Get client X position for clicking on the timeline (mouse or touch)
  const getClientX = (e: MouseEvent | TouchEvent): number => {
    if ('touches' in e && e.touches[0]) {
      return e.touches[0].clientX;
    }
    if ('changedTouches' in e && (e as TouchEvent).changedTouches[0]) {
      return (e as TouchEvent).changedTouches[0].clientX;
    }
    return (e as MouseEvent).clientX;
  };

  // Handle pointer down (mouse or touch) on the timeline to determine starting position
  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const pos = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setHasMoved(false);
    mouseDownPos.current = pos;
  };

  // Handle pointer move (mouse or touch) while dragging across the timeline to determine movement
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !onSeek || !mouseDownPos.current) return;

    const { x, y } = getClientPosition(e);
    const deltaX = Math.abs(x - mouseDownPos.current.x);
    const deltaY = Math.abs(y - mouseDownPos.current.y);
    const hasMovedEnough = deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

    if (hasMovedEnough) {
      setHasMoved(true);
      onSeek(calculateTargetPercentage(x), true);
    }
  };

  // Handle pointer up (mouse or touch) after dragging across the timeline to determine final position
  const handlePointerUp = (e: MouseEvent | TouchEvent) => {
    if (!onSeek) return;

    // If pointer didn't move enough, treat as click/tap with smooth scroll
    if (!hasMoved) {
      onSeek(calculateTargetPercentage(getClientX(e)), false);
    }

    setIsDragging(false);
    setHasMoved(false);
    mouseDownPos.current = null;
  };

  // Add/remove global pointer event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Early return after all hooks to avoid React error
  if (filteredEvents.length === 0) {
    return null;
  }

  const firstEventDate = new Date(filteredEvents[0].event_date).getTime();
  const lastEventDate = new Date(filteredEvents[filteredEvents.length - 1].event_date).getTime();
  const totalTimeSpan = Math.abs(firstEventDate - lastEventDate);

  return (
    <div className="max-w-4xl mx-auto flex items-center gap-5 pt-3">
      {/* Last event year (on left) */}
      <SmallText className="font-serif font-semibold text-secondary-500 text-xs whitespace-nowrap">
        {filteredEvents[filteredEvents.length - 1].event_date.split('-')[0]}
      </SmallText>

      {/* Progress line with event markers - wrapper with larger hit area */}
      <div
        ref={progressBarRef}
        className={`relative flex-1 ${onSeek ? 'cursor-pointer' : ''}`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{ padding: '12px 0', margin: '-12px 0', touchAction: 'none' }}
      >
        {/* Actual visible progress line */}
        <div className="relative h-1 bg-secondary-200 rounded-full">
        {/* Event markers positioned by date - render in order (memory, minor, major) so major appears on top */}
        {['memory', 'minor', 'major'].map((category) =>
          filteredEvents
            .filter((event) => event.category === category)
            .map((event) => {
              const eventDate = new Date(event.event_date).getTime();
              const timeFromStart = Math.abs(firstEventDate - eventDate);
              const position = totalTimeSpan > 0 ? (timeFromStart / totalTimeSpan) * 100 : 0;

              // Category-based styling (smaller than timeline dots)
              let dotClass = '';
              switch (event.category) {
                case 'major':
                  dotClass = 'w-3 h-3 bg-primary-400';
                  break;
                case 'minor':
                  dotClass = 'w-2 h-2 bg-primary-300';
                  break;
                case 'memory':
                  dotClass = 'w-1 h-1 bg-primary-200';
                  break;
                default:
                  dotClass = 'w-1 h-1 bg-primary-200';
              }

              return (
                <div
                  key={event.id}
                  className={`absolute top-1/2 ${dotClass} rounded-full`}
                  style={{ left: `${100 - position}%`, transform: 'translate(-50%, -50%)' }}
                />
              );
            })
        )}

        {/* Moving scroll indicator dot */}
        <div
          className={`absolute top-1/2 rounded-full transition-all ease-out shadow-sm ring-2 ring-white ${
            isDragging
              ? 'w-8 h-8 bg-secondary-500 duration-100'
              : 'w-5 h-5 bg-secondary-500 duration-300'
          }`}
          style={{ left: `${100 - scrollProgress}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
        />
        </div>
      </div>

      {/* First event year (on right) */}
      <SmallText className="font-serif font-semibold text-secondary-500 text-xs whitespace-nowrap">
        {filteredEvents[0].event_date.split('-')[0]}
      </SmallText>
    </div>
  );
}
