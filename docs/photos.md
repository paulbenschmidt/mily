# Photo System Documentation

## Overview

The Mily photo system allows users to attach up to 3 photos per timeline event. Photos are stored in AWS S3 with presigned URLs for secure access. The system handles photo uploads, viewing, and deletion with proper validation and error handling.

## Architecture

### Storage
- **Location**: AWS S3 private bucket
- **Structure**: `users/{user_id}/events/{event_id}/{uuid}.{ext}`
- **Max photos per event**: 3
- **Max file size**: 10MB per photo
- **Supported formats**: JPEG, JPG, PNG, GIF, WebP

### Database Schema

**EventPhoto Model** (`backend/mily/models.py`)

## Photo Upload Flow

### 1. Creating New Event with Photos

When creating a new event, photos cannot be uploaded until the event exists:

See `AddEventModal.tsx` for implementation details.
1. User selects photos → stored in pendingPhotoFiles state
2. User submits form → event created via API
3. After event creation → uploadPendingPhotos() called
4. For each photo:
   a. Load image and extract dimensions
   b. Call createPhotoUpload() to create EventPhoto record
   c. Upload file to S3 using presigned PUT URL
5. Fetch updated event with photos

### 2. Adding Photos to Existing Event

When editing an existing event, photos can be uploaded immediately:

See `PhotoUpload.tsx` for implementation details.
1. User selects photo
2. Immediately call uploadSinglePhoto():
   a. Load image and extract dimensions
   b. Call createPhotoUpload() to create EventPhoto record and return presigned PUT URL
   c. Upload file to S3 using presigned PUT URL
3. Trigger onPhotoOperationComplete callback
4. Parent component fetches updated event

### 3. Backend Upload Process

**Endpoint**: `POST /events/{event_id}/create-photo-upload/`

See `views.py` for implementation details.
1. Validate request data (filename, content_type, file_size)
2. Validate content type (must be image/jpeg, image/png, etc.)
3. Validate file size (max 10MB)
4. Check photo count limit (max 3 per event)
5. Generate unique S3 key: users/{user_id}/events/{event_id}/{uuid}.{ext}
6. Create EventPhoto database record
7. Generate presigned PUT URL (expires in 1 hour)
8. Return: { upload_url, photo_id, s3_key }

**Why create database record first?** Simplifies cleanup (orphaned S3 objects can be identified) since we use both the `event_id` and the `photo_id` to store the photo in S3.

## Photo Viewing Flow

### 1. Fetching Events with Photos

When fetching timeline events, photos are automatically included:

```typescript
// Frontend
const events = await authApiClient.getEvents();
// Each event includes event_photos array with presigned URLs
```

### 2. Backend Serialization

**EventPhotoSerializer** (`backend/mily/serializers.py`)

**Key Points**:
- Presigned URLs are generated on-the-fly during serialization using `create_presigned_get_url()` (`backend/mily/aws_s3.py`)
- URLs expire after 4 hours (15,400 seconds) to avoid multiple calls during the same session
- No separate API call needed for photo URLs

## Photo Deletion Flow

### Frontend
See `PhotoUpload.tsx` for implementation details.
1. User clicks delete button
2. Call authApiClient.deletePhoto(eventId, photoId)
3. Trigger onPhotoOperationComplete callback to remove photo from UI
4. Parent component fetches updated event to update the UI

### Backend
**Endpoint**: `DELETE /events/{event_id}/photos/{photo_id}/`

See `views.py` for implementation details.
1. Verify user owns the event (via the filtered queryset when calling `self.get_object()`)
2. Get EventPhoto record
3. Delete from S3: `delete_photo_from_s3(photo.s3_key)`
4. Delete database record: `photo.delete()`
5. Return success response

## Caching & Performance

### Current Implementation
- **No CDN**: Direct S3 requests on every page load
- **No browser caching**: URLs change on each API request (different query parameters)
- **Presigned URL expiration**: 4 hours

### Performance Characteristics
- ✅ Secure: Private S3 bucket with presigned URLs
- ✅ Simple: No CDN configuration needed
- ❌ Slower: No edge caching for global users
- ❌ Higher costs: More S3 bandwidth usage
- ❌ No browser cache: Same image fetched multiple times

### Future Enhancement: CloudFront CDN

**Recommended approach** for production:

1. **Setup**:
   - Create CloudFront distribution pointing to S3 bucket
   - Configure CloudFront to respect S3 presigned URLs
   - Update `create_presigned_get_url()` to use CloudFront domain

2. **Benefits**:
   - 10-100x faster load times (edge caching)
   - Lower S3 costs (fewer direct requests)
   - Better global performance (400+ edge locations)
   - Maintains security (presigned URLs still control access)

3. **Code changes**:
   ```python
   # aws_s3.py
   CLOUDFRONT_DOMAIN = settings.AWS_CLOUDFRONT_DOMAIN

   def create_presigned_get_url(key: str, expires_in: int = 15400) -> str:
       if CLOUDFRONT_DOMAIN:
           # Use CloudFront URL with signature
           return f"https://{CLOUDFRONT_DOMAIN}/{key}?..."
       else:
           # Fallback to direct S3
           return s3_client.generate_presigned_url(...)
   ```

## Validation & Limits

### File Validation
- **Content type**: Must be image/jpeg, image/jpg, image/png, image/gif, or image/webp
- **File size**: Maximum 10MB per photo
- **Dimensions**: Extracted client-side and stored in database

### Event Limits
- **Max photos per event**: 3 (configurable via `MAX_PHOTOS_PER_EVENT` setting in `settings.py` and `next.config.ts`)
- **Enforced at**: Backend API level (before S3 upload)

## Environment Variables

### Backend (`backend/.env/.env.{environment}`)
```bash
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_S3_PHOTOS_BUCKET=mily-photos-bucket
```

And in `backend/config/settings.py`:
```python
MAX_PHOTOS_PER_EVENT = 3
```


### Frontend (`frontend/.env/.env.local`)
```bash
NEXT_PUBLIC_MAX_PHOTOS_PER_EVENT=3
```

## API Endpoints

### Create Photo Upload
**POST** `/events/{event_id}/create-photo-upload/`: Creates EventPhoto record and returns presigned S3 upload URL.

### Delete Photo
**DELETE** `/events/{event_id}/photos/{photo_id}/`: Deletes photo from S3 and database.

### Update Photo Metadata
**PATCH** `/events/{event_id}/photos/{photo_id}/`: Updates photo metadata (display_order, dimensions).

## Component Architecture

### PhotoUpload Component
**Location**: `frontend/src/components/Timeline/PhotoUpload.tsx`

**States**:
- Existing photos (uploaded to S3)
- Uploading photos (in progress)
- Pending photos (waiting for event creation)
