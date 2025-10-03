'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';

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
  const [category, setCategory] = useState<'major' | 'minor' | 'memory'>('major');
  const [privacyLevel, setPrivacyLevel] = useState('private');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } else if (!eventToEdit && isOpen) {
      // Reset form when opening in create mode
      resetForm();
    }
  }, [eventToEdit, isOpen]);

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
      onClose();
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
      onClose();
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
    setCategory('major');
    setPrivacyLevel('private');
    setNotes('');
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
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content max-w-sm">
            <div className="card-body">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Delete Event</h3>
              <p className="text-secondary-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>

              {error && (
                <div className="mb-4 alert-error">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="btn-secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="modal-content">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-medium text-secondary-900">{isEditMode ? 'Edit Event' : 'Add New Event'}</h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-body">
          {error && (
            <div className="mb-4 alert-error">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="input-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="input-label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="eventDate" className="input-label">
              Event Date *
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="input-label">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'major' | 'minor' | 'memory')}
              className="input-field"
              required
            >
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="memory">Memory</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="privacy" className="input-label">
              Privacy
            </label>
            <select
              id="privacy"
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e.target.value)}
              className="input-field"
              required
            >
              <option value="private">Private</option>
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="input-label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="mr-auto btn-danger"
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
