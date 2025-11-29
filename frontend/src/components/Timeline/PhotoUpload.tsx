'use client';

import { useState, useRef, useEffect } from 'react';
import { EventPhotoType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { SmallText, Caption } from '@/components/ui';
import { usePhotoReorder } from '@/hooks/usePhotoReorder';

/**
 * Upload a single photo to an event.
 * Gets dimensions, requests presigned URL, and uploads to S3.
 */
async function uploadSinglePhoto(eventId: string, file: File): Promise<void> {
  // Step 1: Load image and get dimensions
  const img = new Image();
  const imageUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  URL.revokeObjectURL(imageUrl); // Free up memory after reading the dimensions

  // Step 2: Create EventPhoto record and get presigned URL for S3 upload
  const { upload_url } = await authApiClient.createPhotoUpload(eventId, {
    filename: file.name,
    content_type: file.type,
    file_size: file.size,
    width: width,
    height: height
  });

  // Step 3: Upload to S3
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload to S3');
  }
}

/**
 * Upload pending files to an event after it's been created.
 * Returns the updated event with photos.
 */
export async function uploadPendingPhotos(eventId: string, files: File[]): Promise<EventPhotoType[]> {
  for (const file of files) {
    try {
      await uploadSinglePhoto(eventId, file);
    } catch (error) {
      console.error(`Failed to upload ${file.name}`);
      // Continue with other files even if one fails
    }
  }

  // Fetch the updated event to get all photos with presigned URLs
  const updatedEvent = await authApiClient.getEvent(eventId);
  return updatedEvent.event_photos || [];
}

interface PhotoUploadProps {
  eventId?: string;
  existingPhotos: EventPhotoType[];
  onPhotosChange: (photos: EventPhotoType[]) => void;
  onPendingFilesChange?: (files: File[]) => void;
  pendingFiles?: File[];
  onPhotoOperationComplete?: () => void;
}

interface UploadingPhoto {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export function PhotoUpload({
  eventId,
  existingPhotos,
  onPhotosChange,
  onPendingFilesChange,
  pendingFiles = [],
  onPhotoOperationComplete
}: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo reordering logic (drag & drop)
  const {
    draggedIndex,
    dragOverIndex,
    isDraggable,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleLongPressStart,
    handleLongPressEnd,
  } = usePhotoReorder({
    eventId,
    photos: existingPhotos,
    onPhotosChange,
    onPhotoOperationComplete
  });

  const maxPhotos = Number(process.env.NEXT_PUBLIC_MAX_PHOTOS_PER_EVENT);
  const canAddMore = existingPhotos.length + uploadingPhotos.length + pendingFiles.length < maxPhotos;

  // Reset delete confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (deleteConfirmId) {
        setDeleteConfirmId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [deleteConfirmId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding these files would exceed the limit
    const totalPhotos = existingPhotos.length + uploadingPhotos.length + pendingFiles.length + files.length;
    if (totalPhotos > maxPhotos) {
      alert(`You can only add up to ${maxPhotos} photos per event`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    // If we have an eventId, upload immediately
    if (eventId) {
      for (const file of validFiles) {
        const preview = URL.createObjectURL(file);
        const uploadId = Math.random().toString(36).substring(7);

        setUploadingPhotos(prev => [...prev, {
          id: uploadId,
          file,
          preview,
          progress: 0,
          error: undefined
        }]);

        await uploadPhoto(file, uploadId, eventId);
      }
    } else {
      // No eventId yet - store files as pending
      if (onPendingFilesChange) {
        onPendingFilesChange([...pendingFiles, ...validFiles]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (file: File, uploadId: string, eventId: string) => {
    try {
      // Update progress indicator
      setUploadingPhotos(prev => prev.map(p =>
        p.id === uploadId ? { ...p, progress: 50 } : p
      ));

      // Use shared upload logic
      await uploadSinglePhoto(eventId, file);

      // Fetch updated event to get the new photo with presigned URL
      const updatedEvent = await authApiClient.getEvent(eventId);

      // Remove from uploading and add to existing
      setUploadingPhotos(prev => prev.filter(p => p.id !== uploadId));
      onPhotosChange(updatedEvent.event_photos || []);

      // Notify parent that photo operation completed
      if (onPhotoOperationComplete) {
        onPhotoOperationComplete();
      }

    } catch (error) {
      console.error('Upload error');
      setUploadingPhotos(prev => prev.map(p =>
        p.id === uploadId ? { ...p, error: 'Upload failed' } : p
      ));
    }
  };

  const handleDeleteExisting = async (photoId: string) => {
    if (!eventId) return;

    // First click: show confirmation
    if (deleteConfirmId !== photoId) {
      setDeleteConfirmId(photoId);
      return;
    }

    // Second click: actually delete
    setDeleteConfirmId(null); // Reset confirmation prior to delete in case of failure

    try {
      await authApiClient.deletePhoto(eventId, photoId);
      onPhotosChange(existingPhotos.filter(p => p.id !== photoId));

      // Notify parent that photo operation completed
      if (onPhotoOperationComplete) {
        onPhotoOperationComplete();
      }
    } catch (error) {
      console.error('Delete error');
      alert('Failed to delete photo');
    }
  };

  const handleDeleteUploading = (uploadId: string) => {
    const photo = uploadingPhotos.find(p => p.id === uploadId);
    if (photo) {
      URL.revokeObjectURL(photo.preview); // Free up memory
      setUploadingPhotos(prev => prev.filter(p => p.id !== uploadId));
    }
  };

  const handleDeletePending = (index: number) => {
    if (onPendingFilesChange) {
      onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-secondary-700">
          Photos
        </label>
        <Caption className="text-secondary-500">
          {existingPhotos.length + uploadingPhotos.length + pendingFiles.length}/{maxPhotos}
        </Caption>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Existing Photos */}
        {(() => {
          // Create a preview of the reordered array while dragging
          const displayPhotos = [...existingPhotos];
          if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const [movedPhoto] = displayPhotos.splice(draggedIndex, 1);
            displayPhotos.splice(dragOverIndex, 0, movedPhoto);
          }

          return displayPhotos.map((photo, displayIndex) => {
            const originalIndex = existingPhotos.findIndex(p => p.id === photo.id);

            return (
              <div
                key={photo.id}
                data-photo-index={displayIndex}
                draggable={!!(eventId && isDraggable)}
                onDragStart={(e) => handleDragStart(originalIndex, e)}
                onDragOver={(e) => handleDragOver(e, displayIndex)}
                onDragEnd={handleDragEnd}
                onContextMenu={(e) => eventId && e.preventDefault()}
                onMouseDown={(e) => {
                  if (eventId && !isDraggable) {
                    handleLongPressStart(originalIndex, e);
                  }
                }}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={(e) => handleTouchStart(originalIndex, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={eventId ? { touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' } : undefined}
                className={`relative aspect-square group transition-all duration-200 ${
                  draggedIndex === originalIndex ? 'opacity-50 scale-95 ring-2 ring-primary-400' : ''
                } ${
                  eventId && !isDraggable ? 'cursor-grab' : eventId && isDraggable ? 'cursor-grabbing' : ''
                }`}
              >
                <img
                  src={photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover rounded-md pointer-events-none select-none"
                  draggable={false}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteExisting(photo.id);
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
          });
        })()}

        {/* Uploading Photos (used when editing an event since photos can be uploaded immediately) */}
        {uploadingPhotos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group">
            <img
              src={photo.preview}
              alt="Uploading..."
              className="w-full h-full object-cover rounded-md opacity-60"
            />
            {photo.error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-md">
                <SmallText className="text-red-700 text-center px-2">
                  {photo.error}
                </SmallText>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleDeleteUploading(photo.id)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Pending Photos (used when adding a new event since photos can't be uploaded until the event is created) */}
        {pendingFiles.map((file, index) => (
          <div key={`pending-${index}`} className="relative aspect-square group">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => handleDeletePending(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Photo Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-secondary-300 rounded-md flex flex-col items-center justify-center gap-1 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <SmallText className="text-secondary-500">Add</SmallText>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      {canAddMore && (
        <Caption className="text-secondary-500">
          {(existingPhotos.length + uploadingPhotos.length + pendingFiles.length === 0
            ? `Can add ${maxPhotos} photos`
            : `Can add ${maxPhotos - existingPhotos.length - uploadingPhotos.length - pendingFiles.length} more photo${maxPhotos - existingPhotos.length - uploadingPhotos.length - pendingFiles.length !== 1 ? 's' : ''}`
          ) + ' (max 10MB each)'}
        </Caption>
      )}
    </div>
  );
}
