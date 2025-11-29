import { useState } from 'react';
import { EventPhotoType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';

interface UsePhotoReorderProps {
  eventId?: string;
  photos: EventPhotoType[];
  onPhotosChange: (photos: EventPhotoType[]) => void;
  onPhotoOperationComplete?: () => void;
}

export function usePhotoReorder({
  eventId,
  photos,
  onPhotosChange,
  onPhotoOperationComplete
}: UsePhotoReorderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  const reorderPhotos = async (fromIndex: number, toIndex: number) => {
    if (!eventId || fromIndex === toIndex) return;

    // Optimistic update: reorder locally first for immediate feedback
    const reorderedPhotos = [...photos];
    const [movedPhoto] = reorderedPhotos.splice(fromIndex, 1);
    reorderedPhotos.splice(toIndex, 0, movedPhoto);

    onPhotosChange(reorderedPhotos);

    // Sync with backend
    try {
      await Promise.all(
        reorderedPhotos.map((photo, index) =>
          authApiClient.updatePhotoMetadata(eventId, photo.id, {
            display_order: index
          })
        )
      );

      if (onPhotoOperationComplete) {
        onPhotoOperationComplete();
      }
    } catch (error) {
      console.error('Failed to reorder photos');
      // Revert on error
      onPhotosChange(photos);
      alert('Failed to reorder photos');
    }
  };

  // Desktop drag & drop handlers
  const handleDragStart = (index: number, e?: React.DragEvent) => {
    if (!isDraggable) {
      setIsDraggable(true);
    }
    setDraggedIndex(index);

    // Set custom drag image to preserve square aspect ratio
    if (e && e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px'; // Common practice to hide the drag image off-screen
      dragImage.style.width = e.currentTarget.offsetWidth + 'px';
      dragImage.style.height = e.currentTarget.offsetHeight + 'px';
      document.body.appendChild(dragImage);

      e.dataTransfer.setDragImage(
        dragImage,
        e.currentTarget.offsetWidth / 2,
        e.currentTarget.offsetHeight / 2
      );

      // Clean up after drag starts
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderPhotos(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDraggable(false);
  };

  // Long press detection (for mobile and desktop)
  const handleLongPressStart = (index: number, _e?: React.MouseEvent | React.TouchEvent) => {
    const timer = setTimeout(() => {
      setIsDraggable(true);
      setDraggedIndex(index);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // If user long-pressed but didn't drag, reset the drag state
    if (isDraggable && draggedIndex !== null && dragOverIndex === null) {
      setIsDraggable(false);
      setDraggedIndex(null);
    }
  };

  // Mobile touch handlers
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (!eventId || isDraggable) return;

    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    handleLongPressStart(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggable || draggedIndex === null) {
      // Cancel long press if user moves finger before drag starts
      if (longPressTimer && touchStartPos) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.y);

        // If moved more than 10px, cancel long press
        if (deltaX > 10 || deltaY > 10) {
          handleLongPressEnd();
          setTouchStartPos(null);
        }
      }
      return;
    }

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // Find the photo element
    const photoElement = element?.closest('[data-photo-index]');
    if (photoElement) {
      const index = parseInt(photoElement.getAttribute('data-photo-index') || '0');
      setDragOverIndex(index);
    }
  };

  const handleTouchEnd = () => {
    handleLongPressEnd();
    setTouchStartPos(null);

    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderPhotos(draggedIndex, dragOverIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDraggable(false);
  };

  return {
    // State
    draggedIndex,
    dragOverIndex,
    isDraggable,

    // Desktop handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,

    // Mobile handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Utility
    handleLongPressStart,
    handleLongPressEnd,
  };
}
