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

  if (filteredEvents.length === 0) {
    return null;
  }

  const firstEventDate = new Date(filteredEvents[0].event_date).getTime();
  const lastEventDate = new Date(filteredEvents[filteredEvents.length - 1].event_date).getTime();
  const totalTimeSpan = Math.abs(firstEventDate - lastEventDate);

  const DRAG_THRESHOLD = 3; // pixels

  const calculateTargetPercentage = (clientX: number): number => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    return 100 - clickPercentage; // Inverted because timeline goes newest→oldest
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    setIsDragging(true);
    setHasMoved(false);
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onSeek || !mouseDownPos.current) return;

    const deltaX = Math.abs(e.clientX - mouseDownPos.current.x);
    const deltaY = Math.abs(e.clientY - mouseDownPos.current.y);
    const hasMovedEnough = deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

    if (hasMovedEnough) {
      setHasMoved(true);
      onSeek(calculateTargetPercentage(e.clientX), true);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!onSeek) return;

    // If mouse didn't move enough, treat as click with smooth scroll
    if (!hasMoved) {
      onSeek(calculateTargetPercentage(e.clientX), false);
    }

    setIsDragging(false);
    setHasMoved(false);
    mouseDownPos.current = null;
  };

  // Add/remove global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

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
        onMouseDown={handleMouseDown}
        style={{ padding: '12px 0', margin: '-12px 0' }}
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
                  dotClass = 'w-2 h-2 bg-primary-400';
                  break;
                case 'minor':
                  dotClass = 'w-1.5 h-1.5 bg-primary-300';
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
