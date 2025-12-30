'use client';

import { useState, useEffect } from 'react';
import { TimelineEventType } from '@/types/api';
import { Button, Subheading, BodyText, SmallText, Caption } from '@/components/ui';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';
import { useModalKeyboardShortcuts } from '@/hooks/useModalKeyboardShortcuts';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: TimelineEventType;
  userHandle?: string;
}

export function ShareEventModal({
  isOpen,
  onClose,
  event,
  userHandle,
}: ShareEventModalProps) {
  const [copied, setCopied] = useState(false);

  // Disable body scroll when modal is open
  useDisableBodyScroll(isOpen);

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const eventLink = userHandle && event
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/timeline/${userHandle}?view=story&event=${event.id}`
    : '';

  const handleCopyLink = async () => {
    if (!eventLink) return;

    try {
      await navigator.clipboard.writeText(eventLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  // Keyboard shortcuts (Escape to close)
  useModalKeyboardShortcuts({
    isOpen,
    showDeleteConfirmation: false,
    isDeleting: false,
    isSubmitting: false,
    onSubmit: () => {},
    onDelete: () => {},
    onClose,
  });

  if (!isOpen || !event) return null;

  return (
    <div
      className="fixed inset-0 bg-secondary-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-4">
          <Subheading>Share Event</Subheading>
          <Button
            variant="text"
            onClick={onClose}
            className="p-0 text-secondary-400 hover:text-secondary-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="px-6 py-4">
          {/* Event Title */}
          <div className="mb-4">
            <BodyText className="font-semibold">{event.title}</BodyText>
            <SmallText className="text-secondary-600">
              {new Date(event.event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </SmallText>
          </div>

          {/* Copyable Link */}
          {userHandle && (
            <div className="mb-4">
              {event.privacy_level === 'private' ? (
                <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-md">
                  <SmallText className="text-secondary-600">
                    This event is private. To create a shareable link, change event privacy to Friends or Public.
                  </SmallText>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Link to this event
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={eventLink}
                      className="flex-1 px-3 py-2 text-sm border border-secondary-300 rounded-md bg-secondary-50 text-secondary-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="secondary"
                      className="flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Caption className="text-secondary-500 mt-1">
                    {event.privacy_level === 'public'
                      ? 'Anyone with the link can view this event'
                      : 'Only people with access to your timeline can view this event'}
                  </Caption>
                </>
              )}
            </div>
          )}

          {/* Send to User - Placeholder */}
          <div className="mb-4 p-4 bg-secondary-50 border border-secondary-200 rounded-md">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L15 22l-4-9-9-4 20-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900 mb-1">Send to Friends</p>
                <SmallText className="text-secondary-600">
                  {/* Send this event directly to people you&apos;ve shared your timeline with. They can choose to add it to their own timeline. */}
                  Send this event directly to people you&apos;ve shared your timeline with. They can choose to add a copy of the event to their own timeline.
                </SmallText>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full mt-2"
              disabled
            >
              Coming Soon
            </Button>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
