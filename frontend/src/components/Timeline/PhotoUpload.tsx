'use client';

import { useState, useRef } from 'react';
import { EventPhotoType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { SmallText } from '@/components/ui';

/**
 * Upload pending files to an event after it's been created.
 * Returns the updated event with photos.
 */
export async function uploadPendingPhotos(eventId: string, files: File[]): Promise<EventPhotoType[]> {
  const uploadedPhotos: EventPhotoType[] = [];

  for (const file of files) {
    try {
      // Step 1: Request presigned URL
      const { upload_url, photo_id } = await authApiClient.requestPhotoUploadUrl(eventId, {
        filename: file.name,
        content_type: file.type,
        file_size: file.size
      });

      // Step 2: Upload to S3
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

      // Step 3: Get image dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      URL.revokeObjectURL(imageUrl);

      // Step 4: Update photo metadata with dimensions
      await authApiClient.updatePhotoMetadata(eventId, photo_id, {
        width: img.width,
        height: img.height
      });

    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
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
  maxPhotos?: number;
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
  maxPhotos = 3
}: PhotoUploadProps) {
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = existingPhotos.length + uploadingPhotos.length + pendingFiles.length < maxPhotos;

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
      // Step 1: Request presigned URL
      const { upload_url, photo_id } = await authApiClient.requestPhotoUploadUrl(eventId, {
        filename: file.name,
        content_type: file.type,
        file_size: file.size
      });

      // Step 2: Upload to S3
      setUploadingPhotos(prev => prev.map(p =>
        p.id === uploadId ? { ...p, progress: 50 } : p
      ));

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

      // Step 3: Get image dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Step 4: Update photo metadata with dimensions
      await authApiClient.updatePhotoMetadata(eventId, photo_id, {
        width: img.width,
        height: img.height
      });

      // Step 5: Fetch updated event to get the new photo with presigned URL
      const updatedEvent = await authApiClient.getEvent(eventId);

      // Remove from uploading and add to existing
      setUploadingPhotos(prev => prev.filter(p => p.id !== uploadId));
      onPhotosChange(updatedEvent.event_photos || []);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingPhotos(prev => prev.map(p =>
        p.id === uploadId ? { ...p, error: 'Upload failed' } : p
      ));
    }
  };

  const handleDeleteExisting = async (photoId: string) => {
    if (!eventId) return;

    try {
      await authApiClient.deletePhoto(eventId, photoId);
      onPhotosChange(existingPhotos.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo');
    }
  };

  const handleDeleteUploading = (uploadId: string) => {
    const photo = uploadingPhotos.find(p => p.id === uploadId);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
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
        <SmallText className="text-secondary-500">
          {existingPhotos.length + uploadingPhotos.length + pendingFiles.length}/{maxPhotos}
        </SmallText>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Existing Photos */}
        {existingPhotos.map((photo) => (
          <div key={photo.id} className="relative aspect-square group">
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => handleDeleteExisting(photo.id)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Uploading Photos */}
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

        {/* Pending Photos (not yet uploaded) */}
        {pendingFiles.map((file, index) => (
          <div key={`pending-${index}`} className="relative aspect-square group">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-secondary-900/40 flex items-center justify-center rounded-md">
              <SmallText className="text-white text-center px-2">
                Will upload on save
              </SmallText>
            </div>
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
        <SmallText className="text-secondary-500">
          Add up to {maxPhotos - existingPhotos.length - uploadingPhotos.length - pendingFiles.length} more photo{maxPhotos - existingPhotos.length - uploadingPhotos.length - pendingFiles.length !== 1 ? 's' : ''} (max 10MB each)
        </SmallText>
      )}
      {!eventId && pendingFiles.length > 0 && (
        <SmallText className="text-secondary-600 italic">
          Photos will be uploaded after you create the event
        </SmallText>
      )}
    </div>
  );
}
