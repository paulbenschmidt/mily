import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventPhotoType } from '@/types/api';

interface PhotoModalProps {
  photos: EventPhotoType[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoModal({ photos, currentIndex, onClose, onNavigate }: PhotoModalProps) {
  const currentPhoto = photos[currentIndex];

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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-20"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button - large clickable area */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-start pl-4 hover:bg-white/5 transition-colors z-10 group"
          aria-label="Previous photo"
        >
          <div className="p-2 rounded-full group-hover:bg-white/10 transition-colors">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Next button - large clickable area */}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end pr-4 hover:bg-white/5 transition-colors z-10 group"
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
      <div
        className="relative flex items-center justify-center w-full h-full px-16 py-16 pointer-events-none"
      >
        <img
          src={currentPhoto.url}
          alt="Event photo"
          className="max-w-full max-h-full object-contain rounded-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-sm rounded-full pointer-events-auto">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
