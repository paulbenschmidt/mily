'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, Alert, Select, SmallText } from '@/components/ui';
import { DateInput } from './DateInput';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';

interface EventFormData {
  title: string;
  month: string;
  year: string;
  day: string;
}

interface BulkEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventsAdded: (events: TimelineEventType[]) => void;
  selectedMilestones: string[];
}

export function BulkEventModal({
  isOpen,
  onClose,
  onEventsAdded,
  selectedMilestones,
}: BulkEventModalProps) {
  useDisableBodyScroll(isOpen);

  // Initialize form data with selected milestones
  const [eventForms, setEventForms] = useState<EventFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update forms when modal opens with new milestones
  useEffect(() => {
    if (isOpen && selectedMilestones.length > 0) {
      setEventForms(
        selectedMilestones.map((milestone) => ({
          title: milestone,
          month: '',
          year: '',
          day: '',
        }))
      );
      setError(null);
    }
  }, [isOpen, selectedMilestones]);

  const updateEventForm = (index: number, field: keyof EventFormData, value: string) => {
    const newForms = [...eventForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setEventForms(newForms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate all forms
      for (let i = 0; i < eventForms.length; i++) {
        const form = eventForms[i];
        if (!form.title || !form.year || !form.month) {
          throw new Error(`Please fill in all required fields for event ${i + 1}`);
        }

        const yearNum = parseInt(form.year);
        const currentYear = new Date().getFullYear();
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
          throw new Error(`Please enter a valid year for "${form.title}"`);
        }

        const monthNum = parseInt(form.month);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          throw new Error(`Please select a valid month for "${form.title}"`);
        }

        // Validate day if provided
        let dayNum = 1;
        let isDayApproximate = true;
        if (form.day) {
          dayNum = parseInt(form.day);
          if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
            throw new Error(`Please enter a valid day for "${form.title}"`);
          }
          isDayApproximate = false;
        }
      }

      // Create all events
      const createdEvents: TimelineEventType[] = [];
      for (const form of eventForms) {
        // Determine if day is approximate
        let dayNum = 1;
        let isDayApproximate = true;
        if (form.day) {
          dayNum = parseInt(form.day);
          isDayApproximate = false;
        }

        const eventDate = `${form.year}-${form.month.padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;

        const event = await authApiClient.createEvent({
          title: form.title,
          description: '',
          event_date: eventDate,
          is_day_approximate: isDayApproximate,
          category: 'major', // Default to major for guided onboarding
          privacy_level: 'private', // Default to private
          notes: '',
        });

        createdEvents.push(event);
      }

      onEventsAdded(createdEvents);
      onClose();
    } catch (err) {
      console.error('Error creating events:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create events. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-secondary-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 z-10">
          <Subheading>Add details to your events</Subheading>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Help text */}
          <div className="mb-4">
            <p className="text-s text-secondary-500">
              Don&apos;t remember the exact day? Just month and year works.
            </p>
          </div>

          <div className="space-y-6">
            {eventForms.map((form, index) => (
              <div key={index} className="space-y-4">
                {/* Event Title */}
                <div>
                  <label htmlFor={`title-${index}`} className="block text-sm font-medium text-secondary-700 mb-1">
                    Title
                  </label>
                  <Input
                    type="text"
                    id={`title-${index}`}
                    value={form.title}
                    onChange={(e) => updateEventForm(index, 'title', e.target.value)}
                    placeholder="e.g., Graduated high school"
                    required
                  />
                </div>

                {/* Date Fields */}
                <DateInput
                  year={form.year}
                  month={form.month}
                  day={form.day}
                  onYearChange={(value) => updateEventForm(index, 'year', value)}
                  onMonthChange={(value) => updateEventForm(index, 'month', value)}
                  onDayChange={(value) => updateEventForm(index, 'day', value)}
                  yearId={`year-${index}`}
                  monthId={`month-${index}`}
                  dayId={`day-${index}`}
                />

                {/* Separator between events */}
                {index < eventForms.length - 1 && (
                  <div className="w-full border-t border-secondary-200 my-8" />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Create events'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
