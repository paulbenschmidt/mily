'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType, EventCategory, EventPrivacyLevel, EVENT_CATEGORIES, EVENT_PRIVACY_LEVELS } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, Alert, Textarea, Select, SmallText } from '@/components/ui';
import { ToggleButtonGroup } from '@/components/Timeline';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { useModalKeyboardShortcuts } from '@/hooks/useModalKeyboardShortcuts';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';

const DEFAULT_CATEGORY: EventCategory = 'memory';
const DEFAULT_PRIVACY_LEVEL: EventPrivacyLevel = 'friends';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: TimelineEventType) => void;
  eventToEdit?: TimelineEventType;
  onEventUpdated?: (event: TimelineEventType) => void;
}

export function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  eventToEdit,
  onEventUpdated
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

  // Load event data when in edit mode
  useEffect(() => {
    if (eventToEdit && isOpen) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      // Parse date into year, month, day
      const [yearStr, monthStr, dayStr] = eventToEdit.event_date.split('-');
      setYear(yearStr);
      setMonth(monthStr);
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
      if (!title || !year || !month) {
        throw new Error('Please fill in all required fields (title, year, and month)');
      }

      // Validate year
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear + 1) {
        throw new Error('Please enter a valid year between 1800 and ' + (currentYear + 1));
      }

      // Validate month
      const monthNum = parseInt(month);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        throw new Error('Please select a valid month');
      }

      // Validate day if provided
      let dayNum = 1;
      let isDayApproximate = true;
      if (day) {
        dayNum = parseInt(day);
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
          throw new Error('Please enter a valid day between 1 and 31');
        }
        // Validate day is valid for the selected month/year
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        if (dayNum > daysInMonth) {
          throw new Error(`The selected month only has ${daysInMonth} days`);
        }
        isDayApproximate = false;
      }

      // Format date as YYYY-MM-DD
      const formattedDate = `${year}-${month.padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

      const eventData = {
        title,
        description,
        event_date: formattedDate,
        is_day_approximate: isDayApproximate,
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
              placeholder="e.g., Started first job, Moved to Chicago"
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
            <div className="flex gap-2">
              <div className="flex-1 min-w-[80px] max-w-[100px]">
                <label htmlFor="year" className="block text-xs font-medium text-secondary-600 mb-1">
                  Year
                </label>
                <Input
                  type="number"
                  id="year"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1800}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div className="flex-1 min-w-[120px] max-w-[140px]">
                <label htmlFor="month" className="block text-xs font-medium text-secondary-600 mb-1">
                  Month
                </label>
                <Select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </Select>
              </div>
              <div className="flex-1 min-w-[60px] max-w-[80px]">
                <label htmlFor="day" className="block text-xs font-medium text-secondary-600 mb-1">
                  Day
                </label>
                <Input
                  type="number"
                  id="day"
                  placeholder="DD"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  min={1}
                  max={31}
                />
              </div>
            </div>
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                  Controls who sees event details. Personal notes are always private.
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
