'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType, EventCategory, EventPrivacyLevel, EVENT_CATEGORIES, EVENT_PRIVACY_LEVELS } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, Alert, Textarea } from '@/components/ui';
import { DateInput } from './DateInput';
import { ToggleButtonGroup } from '@/components/Timeline';
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
  isPublic?: boolean;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  eventToEdit,
  onEventUpdated,
  isPublic = false
}: AddEventModalProps) {
  const isEditMode = !!eventToEdit;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState<EventCategory>(DEFAULT_CATEGORY);
  const [privacyLevel, setPrivacyLevel] = useState<EventPrivacyLevel>(DEFAULT_PRIVACY_LEVEL);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelectionsLoaded, setIsSelectionsLoaded] = useState(false);
  const [titlePlaceholder, setTitlePlaceholder] = useState('');

  // Set random placeholder when modal opens
  useEffect(() => {
    if (isOpen && !eventToEdit) {
      const randomIndex = Math.floor(Math.random() * TITLE_PLACEHOLDERS.length);
      setTitlePlaceholder(TITLE_PLACEHOLDERS[randomIndex]);
    }
  }, [isOpen, eventToEdit]);

  // Load event data when in edit mode
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
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!title || !year) {
        throw new Error('Please fill in all required fields (title and year)');
      }

      // Process and validate date inputs
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
    setYear('');
    setMonth('');
    setDay('');
    setCategory(DEFAULT_CATEGORY);
    setPrivacyLevel(DEFAULT_PRIVACY_LEVEL);
    setNotes('');
    setIsSelectionsLoaded(false);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md my-2 sm:my-0">
        <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-3">
          <Subheading>{isEditMode ? 'Edit Event' : 'Add New Event'}</Subheading>
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

        <form onSubmit={handleSubmit} className="px-6 py-4">
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
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
                Description
              </label>
              <div className="group relative">
                <svg className="w-4 h-4 text-secondary-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  Shareable details about this event
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Event Date
            </label>
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
              <div className="group relative">
                <svg className="w-4 h-4 text-secondary-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  <p className="mb-1">Major: Life-changing moments</p>
                  <p className="mb-1">Minor: Meaningful milestones</p>
                  <p className="mb-1">Memory: Personal reflections</p>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <ToggleButtonGroup
              label=""
              options={EVENT_CATEGORIES}
              value={category}
              onChange={setCategory}
              disabled={!isSelectionsLoaded}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="block text-sm font-medium text-secondary-700">
                Privacy
              </span>
              <div className="group relative">
                <svg className="w-4 h-4 text-secondary-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                  <p className="mb-1">Controls who sees event details. Personal notes are always private.</p>

                    {!isPublic && (
                      <p className="mb-1">
                        To make individual events public, you must first make your entire timeline public.
                      </p>
                    )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
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
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="notes" className="block text-sm font-medium text-secondary-700">
                Personal Notes
              </label>
              <div className="group relative">
                <svg className="w-4 h-4 text-secondary-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  Personal notes are always private and never shared with anyone
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save' : 'Add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
