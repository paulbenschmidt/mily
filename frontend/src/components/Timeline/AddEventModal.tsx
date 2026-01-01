'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType, EventCategory, EventPrivacyLevel, EVENT_CATEGORIES, EVENT_PRIVACY_LEVELS, EventPhotoType, ShareType, UserType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, Alert, Textarea, InfoTooltip } from '@/components/ui';
import { DateInput } from './DateInput';
import { DescriptionInput } from './DescriptionInput';
import { ToggleButtonGroup } from '@/components/Timeline';
import { PhotoUpload, uploadPendingPhotos } from './PhotoUpload';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { useModalKeyboardShortcuts } from '@/hooks/useModalKeyboardShortcuts';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';
import { processDateInputs } from '@/utils/date-validation';

const DEFAULT_CATEGORY: EventCategory = 'memory';
const DEFAULT_PRIVACY_LEVEL: EventPrivacyLevel = 'private';
const TITLE_PLACEHOLDERS = [
  'Started first job',
  'Moved to Chicago',
  'Graduated college',
  'Met my best friend',
  'Adopted a pet',
  'Learned to drive',
  'First day of school',
  'Got married',
  'Bought a house',
  'Started a business',
  'Traveled to Japan',
  'Learned to play guitar',
  'Ran my first marathon',
  'Published my first article',
  'Changed careers',
  'Moved abroad',
  'Had my first child',
  'Started therapy',
  'Learned to cook',
  'Got my first apartment',
  'Joined a band',
  'Went skydiving',
  'Started volunteering',
  'Learned a new language',
  'Got promoted',
];

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: TimelineEventType) => void;
  eventToEdit?: TimelineEventType;
  onEventUpdated?: (event: TimelineEventType) => void;
  onDeleteEvent?: (event: TimelineEventType) => void;
  isPublic?: boolean;
  acceptedShares?: UserType[];
  inviteId?: string;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  eventToEdit,
  onEventUpdated,
  onDeleteEvent,
  isPublic = false,
  acceptedShares = [],
  inviteId
}: AddEventModalProps) {
  const isInviteMode = !!inviteId;
  const isEditMode = !!eventToEdit && !isInviteMode;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState<EventCategory>(DEFAULT_CATEGORY);
  const [showNotes, setShowNotes] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<EventPrivacyLevel>(DEFAULT_PRIVACY_LEVEL);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<EventPhotoType[]>([]);
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelectionsLoaded, setIsSelectionsLoaded] = useState(false);
  const [titlePlaceholder, setTitlePlaceholder] = useState('');
  const [inviteTaggedFriends, setInviteTaggedFriends] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  // Set random placeholder when modal opens
  useEffect(() => {
    if (isOpen && !eventToEdit) {
      const randomIndex = Math.floor(Math.random() * TITLE_PLACEHOLDERS.length);
      setTitlePlaceholder(TITLE_PLACEHOLDERS[randomIndex]);
    }
  }, [isOpen, eventToEdit]);

  // Load event data when in edit mode or invite mode
  useEffect(() => {
    if (eventToEdit && isOpen) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      // Parse date into year, month, day
      const [yearStr, monthStr, dayStr] = eventToEdit.event_date.split('-');
      setYear(yearStr);
      // Only set month if not approximate
      setMonth(eventToEdit.is_month_approximate ? '' : monthStr);
      // Only set day if not approximate
      setDay(eventToEdit.is_day_approximate ? '' : dayStr);
      setCategory(eventToEdit.category);
      setPrivacyLevel(eventToEdit.privacy_level);
      setNotes(eventToEdit.notes || '');

      // Handle photos differently for invite mode vs edit mode
      if (isInviteMode) {
        // In invite mode, download photos and set as pending files
        const downloadPhotos = async () => {
          if (eventToEdit.photos && eventToEdit.photos.length > 0) {
            try {
              const photoFiles = await Promise.all(
                eventToEdit.photos.map(async (photo) => {
                  const response = await fetch(photo.url);
                  const blob = await response.blob();
                  // Extract filename from URL or use a default
                  const filename = photo.filename || `photo-${photo.id}.jpg`;
                  return new File([blob], filename, { type: photo.content_type });
                })
              );
              setPendingPhotoFiles(photoFiles);
            } catch (error) {
              console.error('Failed to download photos from invite:', error);
            }
          }
        };
        downloadPhotos();
      } else {
        // In edit mode, just set the photos normally
        setPhotos(eventToEdit.photos || []);
      }

      // Extract user IDs from mentions
      const userIds = eventToEdit.mentions?.map(m => m.mentioned_user.id) || [];
      setMentionedUsers(userIds);
      // Delay to show smooth transition from gray to selected
      setTimeout(() => setIsSelectionsLoaded(true), 50);
    } else if (!eventToEdit && isOpen) {
      setTimeout(() => setIsSelectionsLoaded(true), 50);
    } else if (!isOpen) {
      // Reset loaded state when modal closes
      setIsSelectionsLoaded(false);
    }
  }, [eventToEdit, isOpen, isInviteMode]);

  const handlePhotoOperationComplete = async () => {
    // Fetch the latest event data and update parent state (to update state when adding/deleting photos)
    if (eventToEdit && onEventUpdated) {
      try {
        const updatedEvent = await authApiClient.getEvent(eventToEdit.id);
        onEventUpdated(updatedEvent);
        setPhotos(updatedEvent.photos || []);
      } catch (error) {
        console.error('Failed to fetch updated event');
      }
    }
  };

  const onModalClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {

      // Process and validate date inputs (additional validation is native to required fields)
      const { yearNum, monthNum, dayNum, isMonthApproximate, isDayApproximate } = processDateInputs(year, month, day);

      // Format date as YYYY-MM-DD (defaults to January 1st if month/day not provided)
      const formattedDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      const eventData = {
        title,
        description,
        event_date: formattedDate,
        is_day_approximate: isDayApproximate,
        is_month_approximate: isMonthApproximate,
        category,
        privacy_level: privacyLevel,
        notes: notes || undefined,
        mentioned_users: mentionedUsers,
      };

      let updatedEvent;

      if (isInviteMode && inviteId) {
        // Create the event on user's timeline
        updatedEvent = await authApiClient.createEvent(eventData);

        // Upload photos from the original event
        if (pendingPhotoFiles.length > 0) {
          try {
            await uploadPendingPhotos(updatedEvent.id, pendingPhotoFiles);
            // Fetch the updated event with photos
            updatedEvent = await authApiClient.getEvent(updatedEvent.id);
          } catch (photoError) {
            console.error('Failed to upload photos from invite');
            // Event was created successfully, just photos failed
          }
        }

        // Accept the invite (just updates status)
        await authApiClient.acceptEventInvite(inviteId);

        onEventAdded(updatedEvent);
      } else if (isEditMode && eventToEdit) {
        // Update existing event
        updatedEvent = await authApiClient.updateEvent(eventToEdit.id, eventData);
        if (inviteTaggedFriends && mentionedUsers.length > 0) {
          try {
            await authApiClient.sendEventInvites(eventToEdit.id, mentionedUsers);
          } catch (inviteError) {
            console.error('Failed to send event invites:', inviteError);
            // Event was updated successfully, just invites failed
          }
        }
        if (onEventUpdated) {
          onEventUpdated(updatedEvent);
        }
      } else {
        // Create new event
        updatedEvent = await authApiClient.createEvent(eventData);

        // Upload photos after event is created
        if (pendingPhotoFiles.length > 0) {
          try {
            await uploadPendingPhotos(updatedEvent.id, pendingPhotoFiles);
            // Fetch the updated event with photos
            updatedEvent = await authApiClient.getEvent(updatedEvent.id);
          } catch (photoError) {
            console.error('Failed to upload photos');
            // Event was created successfully, just photos failed
            // We'll still show the event, user can add photos later
          }
        }

        if (inviteTaggedFriends && mentionedUsers.length > 0) {
          try {
            await authApiClient.sendEventInvites(updatedEvent.id, mentionedUsers);
          } catch (inviteError) {
            console.error('Failed to send event invites:', inviteError);
            // Event was created successfully, just invites failed
          }
        }

        onEventAdded(updatedEvent);
      }

      resetForm();
      onModalClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} event`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setYear('');
    setMonth('');
    setDay('');
    setCategory(DEFAULT_CATEGORY);
    setPrivacyLevel(DEFAULT_PRIVACY_LEVEL);
    setNotes('');
    setPhotos([]);
    setPendingPhotoFiles([]);
    setIsSelectionsLoaded(false);
    setMentionedUsers([]);
    setInviteTaggedFriends(false);
  };

  // Auto-focus the title input when the modal opens
  const titleInputRef = useAutoFocus<HTMLInputElement>(isOpen);

  // Allow CMD+Enter to submit the form and Escape to close
  useModalKeyboardShortcuts({
    isOpen,
    showDeleteConfirmation: false,
    isDeleting: false,
    isSubmitting,
    onSubmit: () => handleSubmit({ preventDefault: () => {} } as React.FormEvent),
    onDelete: () => {},
    onClose: onModalClose,
  });

  // Disable body scroll when modal is open
  useDisableBodyScroll(isOpen);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked, not its children
    if (e.target === e.currentTarget) {
      onModalClose();
    }
  };

  // Return null if the modal is not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-secondary-500/30 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* max-h makes it so that modal doesn't overflow the screen */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-2 sm:my-0 max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-3 flex-shrink-0">
          <Subheading>{isInviteMode ? 'Add Shared Event' : isEditMode ? 'Edit Event' : 'Add New Event'}</Subheading>
          <Button
            variant="text"
            onClick={onModalClose}
            className="p-0 text-secondary-400 hover:text-secondary-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto flex-1">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="mb-4">
            <Input
              ref={titleInputRef}
              type="text"
              id="title"
              label="Title"
              placeholder={ titlePlaceholder }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <DateInput
              year={year}
              month={month}
              day={day}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onDayChange={setDay}
              yearId="year"
              monthId="month"
              dayId="day"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="block text-sm font-medium text-secondary-700">
                Category
              </span>
              <InfoTooltip
                className='w-47'
                content={
                  <>
                    <p className="mb-1">Major: Life-changing moments</p>
                    <p className="mb-1">Minor: Meaningful milestones</p>
                    <p className="mb-1">Memory: Personal reflections</p>
                  </>
                }
              />
            </div>
            <ToggleButtonGroup
              label=""
              options={EVENT_CATEGORIES}
              value={category}
              onChange={setCategory}
              disabled={!isSelectionsLoaded}
            />
          </div>

          <hr className="border-secondary-200 my-4" />

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                Description
              </label>
              <InfoTooltip className='w-32' content="Shareable details about this event" />
            </div>
            <DescriptionInput
              value={description}
              onChange={setDescription}
              acceptedShares={acceptedShares}
              hydrateKey={`${eventToEdit?.id || 'new'}-${isOpen}-${isSelectionsLoaded}`}
              privacyLevel={privacyLevel}
              inviteTaggedFriends={inviteTaggedFriends}
              onInviteTaggedFriendsChange={setInviteTaggedFriends}
              mentionedUsers={mentionedUsers}
              onMentionedUsersChange={setMentionedUsers}
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <PhotoUpload
              eventId={eventToEdit?.id}
              existingPhotos={photos}
              onPhotosChange={setPhotos}
              pendingFiles={pendingPhotoFiles}
              onPendingFilesChange={setPendingPhotoFiles}
              onPhotoOperationComplete={handlePhotoOperationComplete}
            />
          </div>

          <hr className="border-secondary-200 my-4" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="block text-sm font-medium text-secondary-700">
                Privacy
              </span>
              <InfoTooltip
                className="w-64"
                content={
                  <>
                    <p className="mb-1">Controls who sees event details. Personal notes are always private.</p>
                    {!isPublic && (
                      <p className="mb-1">
                        To make individual events public, you must first make your entire timeline public.
                      </p>
                    )}
                  </>
                }
              />
            </div>
            <ToggleButtonGroup
              label=""
              options={EVENT_PRIVACY_LEVELS}
              value={privacyLevel}
              onChange={setPrivacyLevel}
              disabled={!isSelectionsLoaded}
              disabledOptions={!isPublic ? ['public'] : []}
            />
          </div>

          <hr className="border-secondary-200 my-4" />

          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showNotes ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Personal Notes
              <InfoTooltip className="w-50" content="Personal notes are always private and never shared with anyone" />
            </button>

            {showNotes && (
              <div className="mt-2 animate-in slide-in-from-top-2">
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            {/* Delete button - only shown in edit mode */}
            {isEditMode && onDeleteEvent && eventToEdit && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onDeleteEvent(eventToEdit)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            )}

            {/* Spacer when no delete button */}
            {(!isEditMode || !onDeleteEvent) && <div />}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isSubmitting ? 'Saving...' : isInviteMode ? 'Add to Timeline' : isEditMode ? 'Update Event' : 'Add Event'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
