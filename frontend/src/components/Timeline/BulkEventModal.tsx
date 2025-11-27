'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { authApiClient } from '@/utils/auth-api';
import { Input, Button, Subheading, Alert } from '@/components/ui';
import { DateInput } from './DateInput';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';
import { processDateInputs } from '@/utils/date-validation';

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

      // Create all events (validation handled by `required` attributes in form and `processDateInputs` function)
      const createdEvents: TimelineEventType[] = [];
      for (const form of eventForms) {

        const { yearNum, monthNum, dayNum, isMonthApproximate, isDayApproximate } = processDateInputs(form.year, form.month, form.day);

        const eventDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

        const event = await authApiClient.createEvent({
          title: form.title,
          description: '',
          event_date: eventDate,
          is_month_approximate: isMonthApproximate,
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
      setError('Failed to create events. Please try again.');
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
                    placeholder="Enter event title"
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
              {isSubmitting ? 'Adding...' : 'Add events'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
