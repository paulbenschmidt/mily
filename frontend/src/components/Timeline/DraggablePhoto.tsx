import NextImage from 'next/image';
import { EventPhotoType } from '@/types/api';
import { SmallText } from '@/components/ui';

interface DraggablePhotoProps {
  photo: EventPhotoType;
  displayIndex: number;
  originalIndex: number;
  eventId?: string;
  deleteConfirmId: string | null;
  onDelete: (id: string) => void;
  reorderUtils: any; // Using any for brevity, ideally would be the return type of usePhotoReorder
}

export function DraggablePhoto({
  photo,
  displayIndex,
  originalIndex,
  eventId,
  deleteConfirmId,
  onDelete,
  reorderUtils
}: DraggablePhotoProps) {
  const {
    draggedIndex,
    isDraggable,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = reorderUtils;

  return (
    <div
      key={photo.id}
      data-photo-index={displayIndex}
      draggable={!!eventId}
      onDragStart={(e) => handleDragStart(originalIndex, e)}
      onDragOver={(e) => handleDragOver(e, displayIndex)}
      onDragEnd={handleDragEnd}
      onContextMenu={(e) => eventId && e.preventDefault()}
      onTouchStart={(e) => handleTouchStart(originalIndex, e)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={eventId ? { touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' } : undefined}
      className={`relative aspect-square group transition-all duration-200 border-2 border-secondary-200 rounded-md ${
        draggedIndex === originalIndex ? 'opacity-50 scale-95 ring-2 ring-primary-400' : ''
      } ${
        eventId && !isDraggable ? 'cursor-grab' : eventId && isDraggable ? 'cursor-grabbing' : ''
      }`}
    >
      <NextImage
        src={photo.url}
        alt={photo.filename}
        fill
        sizes="(max-width: 768px) 33vw, 120px"
        className="object-cover rounded-md select-none"
        draggable={false}
        style={{ WebkitTouchCallout: 'none' }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(photo.id);
        }}
        className={`absolute top-1 right-1 px-2 py-1 rounded-full transition-all ${
          deleteConfirmId === photo.id
            ? 'bg-red-500 text-white p-2'
            : 'bg-gray-700 text-white p-2'
        }`}
      >
        {deleteConfirmId === photo.id ? (
          <SmallText className="text-white font-medium text-sm p-2">Delete</SmallText>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}
