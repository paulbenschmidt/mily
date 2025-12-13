import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import { EventPhotoType } from '@/types/api';

interface PhotoModalProps {
  photos: EventPhotoType[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoModal({ photos, currentIndex, onClose, onNavigate }: PhotoModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const [loadNeighbors, setLoadNeighbors] = useState(false);

  // Defer loading of neighbors to prioritize the main photo
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadNeighbors(true);
    }, 50); // Short delay to ensure main photo request starts first
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click or touch
    if (e.button !== 0) return;

    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    setIsDragging(true);

    // Capture pointer to track outside element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startXRef.current;

    // Threshold to consider it a move/swipe rather than a tap/click
    if (Math.abs(deltaX) > 10) {
      hasMovedRef.current = true;
    }

    if (hasMovedRef.current) {
      // Apply resistance at edges
      let offset = deltaX;
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === photos.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.3;
      }
      setDragOffset(offset);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    if (e.type === 'pointercancel') {
      setIsDragging(false);
      setDragOffset(0);
      isDraggingRef.current = false;
      hasMovedRef.current = false;
      return;
    }

    const deltaX = e.clientX - startXRef.current;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const SWIPE_THRESHOLD = 50;
    if (hasMovedRef.current && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0 && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (deltaX < 0 && currentIndex < photos.length - 1) {
        onNavigate(currentIndex + 1);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    isDraggingRef.current = false;
    hasMovedRef.current = false;
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={(e) => {
        if (hasMovedRef.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!hasMovedRef.current) {
          onClose();
        }
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-5 text-white hover:bg-white/10 rounded-full transition-colors z-20"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button - left half of screen */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start pl-4 z-10 group"
          aria-label="Previous photo"
        >
          <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Next button - right half of screen */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-4 z-10 group"
          aria-label="Next photo"
        >
          <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}

      {/* Photo container */}
      <div className="relative w-full h-full overflow-hidden pointer-events-none">
        {/* Track */}
        <div
          className={`flex h-full w-full ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
          style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
        >
          {photos.map((photo, index) => {
            // Optimization: Only render the current photo immediately.
            // Neighbors are rendered after a short delay (via loadNeighbors) to prioritize main photo.
            const isCurrent = index === currentIndex;
            const isNeighbor = Math.abs(index - currentIndex) <= 1;
            const shouldRender = isCurrent || (loadNeighbors && isNeighbor);

            return (
              <div
                key={photo.id}
                className="flex-shrink-0 w-full h-full flex items-center justify-center px-4 md:px-16 py-16"
              >
                <div
                  className="relative w-full h-full pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {shouldRender && (
                    <NextImage
                      src={photo.url}
                      alt={`Event photo ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 800px, 100vw"
                      className="object-contain rounded-lg"
                      priority={index === currentIndex}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-sm rounded-full pointer-events-auto z-10">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );

  // Render as portal to document.body to escape parent DOM hierarchy
  // This prevents the modal from being affected by parent z-index stacking contexts
  // and ensures it appears above all other content (including event cards that might have click handlers)
  // This was specifically added to avoid collapsing the event card when the modal is opened
  return createPortal(modalContent, document.body);
}
