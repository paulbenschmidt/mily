'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { EventPhotoType } from '@/types/api';

interface PhotoCarouselProps {
  photos: EventPhotoType[];
  onPhotoClick?: (index: number) => void;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

/**
 * Instagram-style photo carousel with swipe gestures and dot indicators.
 * Designed to not conflict with parent event navigation.
 */
export function PhotoCarousel({
  photos,
  onPhotoClick,
  currentIndex: controlledIndex,
  onIndexChange,
}: PhotoCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);

  // Support both controlled and uncontrolled modes
  const currentIndex = controlledIndex ?? internalIndex;
  const setCurrentIndex = (index: number) => {
    setInternalIndex(index);
    onIndexChange?.(index);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startIndexRef = useRef(0);

  const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger a swipe
  const DRAG_THRESHOLD = 10; // Minimum movement to consider it a drag vs tap

  // Reset to first photo when photos change
  useEffect(() => {
    setCurrentIndex(0);
  }, [photos]);

  const goToPhoto = useCallback((index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
    }
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, photos.length]);

  // Handle touch/mouse start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary pointer (left mouse button or first touch)
    if (e.button !== 0) return;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startIndexRef.current = currentIndex;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    setIsDragging(true);

    // Capture pointer for tracking outside element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [currentIndex]);

  // Handle touch/mouse move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    // Check if this is a horizontal swipe (not vertical scroll)
    if (!hasMovedRef.current && Math.abs(deltaX) > DRAG_THRESHOLD) {
      // If horizontal movement is greater than vertical, it's a swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        hasMovedRef.current = true;
        e.preventDefault();
      } else {
        // Vertical scroll, cancel drag
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
    }

    if (hasMovedRef.current) {
      // Apply resistance at edges
      let offset = deltaX;
      if ((currentIndex === 0 && deltaX > 0) ||
          (currentIndex === photos.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.1; // Resistance at edges
      }
      setDragOffset(offset);
    }
  }, [currentIndex, photos.length]);

  // Handle touch/mouse end
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    // Do not trigger click on cancel
    if (e.type === 'pointercancel') {
      isDraggingRef.current = false;
      hasMovedRef.current = false;
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const deltaX = e.clientX - startXRef.current;

    // Release pointer capture
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // If we didn't move much, treat as a tap/click to open modal
    if (!hasMovedRef.current) {
      if (onPhotoClick) {
        onPhotoClick(currentIndex);
      }
    } else if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      // Swipe detected - navigate to next/previous photo
      if (deltaX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    isDraggingRef.current = false;
    hasMovedRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  }, [currentIndex, photos.length, onPhotoClick]);

  // Handle keyboard navigation within carousel
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Only handle if carousel is focused
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation(); // Prevent event navigation
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation(); // Prevent event navigation
      goToNext();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onPhotoClick) {
        onPhotoClick(currentIndex);
      }
    }
  }, [goToPrev, goToNext, onPhotoClick, currentIndex]);

  if (!photos || photos.length === 0) {
    return null;
  }

  const showNavigation = photos.length > 1;
  const translateX = isDragging
    ? `calc(-${currentIndex * 100}% + ${dragOffset}px)`
    : `-${currentIndex * 100}%`;

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-black/80"
      role="region"
      aria-roledescription="carousel"
      aria-label="Event photos"
    >
      {/* Photo track */}
      <div
        ref={containerRef}
        className={`flex touch-pan-y ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ transform: `translateX(${translateX})` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label={`Photo ${currentIndex + 1} of ${photos.length}`}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="flex-shrink-0 w-full aspect-[4/3] relative select-none -ml-px first:ml-0"
            aria-hidden={index !== currentIndex}
          >
            <NextImage
              src={photo.url}
              alt={`Event photo ${index + 1} of ${photos.length}`}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain pointer-events-none"
              draggable={false}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation chevrons - visible on hover (desktop) */}
      {showNavigation && (
        <>
          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white
              opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity
              disabled:opacity-0 disabled:cursor-not-allowed
              md:group-hover:opacity-70 focus:ring-2 focus:ring-white focus:outline-none`}
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            disabled={currentIndex === photos.length - 1}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white
              opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity
              disabled:opacity-0 disabled:cursor-not-allowed
              md:group-hover:opacity-70 focus:ring-2 focus:ring-white focus:outline-none`}
            aria-label="Next photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showNavigation && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5"
          role="tablist"
          aria-label="Photo navigation"
        >
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToPhoto(index);
              }}
              className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-black/50 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to photo ${index + 1} of ${photos.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
