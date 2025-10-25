'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType, EventCategory, EventPrivacyLevel, EVENT_CATEGORIES, EVENT_PRIVACY_LEVELS } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, BodyText, Alert, Textarea } from '@/components/ui';
import { ToggleButtonGroup } from '@/components/ToggleButtonGroup';

const DEFAULT_CATEGORY: EventCategory = 'memory';
const DEFAULT_PRIVACY_LEVEL: EventPrivacyLevel = 'friends';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: TimelineEventType) => void;
  eventToEdit?: TimelineEventType;
  onEventUpdated?: (event: TimelineEventType) => void;
  onEventDeleted?: (eventId: string) => void;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  eventToEdit,
  onEventUpdated,
  onEventDeleted
}: AddEventModalProps) {
  const isEditMode = !!eventToEdit;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState<EventCategory>(DEFAULT_CATEGORY);
  const [privacyLevel, setPrivacyLevel] = useState<EventPrivacyLevel>(DEFAULT_PRIVACY_LEVEL);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectionsLoaded, setIsSelectionsLoaded] = useState(false);

  // Load event data when in edit mode
  useEffect(() => {
    if (eventToEdit && isOpen) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      // Format date to YYYY-MM-DD for input
      const date = new Date(eventToEdit.event_date);
      const formattedDate = date.toISOString().split('T')[0];
      setEventDate(formattedDate);
      setCategory(eventToEdit.category);
      setPrivacyLevel(eventToEdit.privacy_level);
      setNotes(eventToEdit.notes || '');
      // Delay to show smooth transition from gray to selected
      setTimeout(() => setIsSelectionsLoaded(true), 50);
    } else if (!eventToEdit && isOpen) {
      setTimeout(() => setIsSelectionsLoaded(true), 50);
    } else if (!isOpen) {
      // Reset loaded state when modal closes
      setIsSelectionsLoaded(false);
    }
  }, [eventToEdit, isOpen]);

  const onModalClose = () => {
    resetForm();
    setShowDeleteConfirmation(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;

    setIsDeleting(true);
    setError(null);

    try {
      await authApiClient.deleteEvent(eventToEdit.id);
      if (onEventDeleted) {
        onEventDeleted(eventToEdit.id);
      }
      setShowDeleteConfirmation(false);
      resetForm();
      onModalClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!title || !eventDate) {
        throw new Error('Please fill in all required fields');
      }

      const eventData = {
        title,
        description,
        event_date: eventDate,
        category,
        privacy_level: privacyLevel,
        notes: notes || undefined,
      };

      let updatedEvent;

      if (isEditMode && eventToEdit) {
        // Update existing event
        updatedEvent = await authApiClient.updateEvent(eventToEdit.id, eventData);
        if (onEventUpdated) {
          onEventUpdated(updatedEvent);
        }
      } else {
        // Create new event
        updatedEvent = await authApiClient.createEvent(eventData);
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
    setEventDate('');
    setCategory(DEFAULT_CATEGORY);
    setPrivacyLevel(DEFAULT_PRIVACY_LEVEL);
    setNotes('');
    setIsSelectionsLoaded(false);
  };

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow value
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Disable scrolling on body
      document.body.style.overflow = 'hidden';

      // Re-enable scrolling when component unmounts or modal closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the backdrop itself was clicked, not its children
    if (e.target === e.currentTarget) {
      onModalClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-secondary-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-4">
          <Subheading>{showDeleteConfirmation ? 'Delete Event' : (isEditMode ? 'Edit Event' : 'Add New Event')}</Subheading>
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

        {showDeleteConfirmation ? (
          // Show delete confirmation content
          <div className="px-6 py-4">
            <BodyText className="mb-6">Are you sure you want to delete this event? This action cannot be undone.</BodyText>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : (
          // Show normal form content
          <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="mb-4">
            <Input
              type="text"
              id="title"
              label="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Textarea
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="mb-4">
            <Input
              type="date"
              id="eventDate"
              label="Event Date *"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              max={(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })()}
              required
            />
          </div>

          <ToggleButtonGroup
            label="Category"
            options={EVENT_CATEGORIES}
            value={category}
            onChange={setCategory}
            disabled={!isSelectionsLoaded}
            required
          />

          <ToggleButtonGroup
            label="Privacy"
            options={EVENT_PRIVACY_LEVELS}
            value={privacyLevel}
            onChange={setPrivacyLevel}
            disabled={!isSelectionsLoaded}
            required
          />

          <div className="mb-4">
            <Textarea
              id="notes"
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {isEditMode && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={isSubmitting}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Event')}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
