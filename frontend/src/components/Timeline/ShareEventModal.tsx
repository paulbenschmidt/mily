'use client';

import { useState, useEffect, useRef } from 'react';
import { TimelineEventType, UserType } from '@/types/api';
import { Button, Subheading, BodyText, SmallText, Caption } from '@/components/ui';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';
import { useModalKeyboardShortcuts } from '@/hooks/useModalKeyboardShortcuts';
import { authApiClient } from '@/utils/auth-api';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: TimelineEventType;
  userHandle?: string;
  acceptedShares?: UserType[];
}

export function ShareEventModal({
  isOpen,
  onClose,
  event,
  userHandle,
  acceptedShares = [],
}: ShareEventModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when modal is open
  useDisableBodyScroll(isOpen);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setSelectedRecipients([]);
      setSearchQuery('');
      setShowDropdown(false);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter friends based on search query and exclude already selected
  const filteredFriends = acceptedShares.filter((friend) => {
    const isAlreadySelected = selectedRecipients.some((r) => r.id === friend.id);
    if (isAlreadySelected) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
    const handle = (friend.handle || '').toLowerCase();
    return fullName.includes(query) || handle.includes(query);
  });

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inInput = inputRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inInput && !inDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const addRecipient = (friend: UserType) => {
    setSelectedRecipients([...selectedRecipients, friend]);
    setSearchQuery('');
    setShowDropdown(false);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const removeRecipient = (friendId: string) => {
    setSelectedRecipients(selectedRecipients.filter((r) => r.id !== friendId));
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Only show dropdown if user has typed something
    setShowDropdown(value.length > 0);
    setSelectedIndex(0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchQuery === '' && selectedRecipients.length > 0) {
      e.preventDefault();
      removeRecipient(selectedRecipients[selectedRecipients.length - 1].id);
      return;
    }

    if (!showDropdown || filteredFriends.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredFriends.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredFriends.length) % filteredFriends.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFriends[selectedIndex]) {
        addRecipient(filteredFriends[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  const handleSendInvites = async () => {
    if (selectedRecipients.length === 0 || !event) return;

    setIsSending(true);
    try {
      const recipientIds = selectedRecipients.map(recipient => recipient.id);
      // Force send invite even if the user has already been invited (deletes existing invites and creates new ones)
      await authApiClient.sendEventInvites(event.id, recipientIds, true);

      // Reset and close on success
      setSelectedRecipients([]);
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Failed to send invites:', error);
      alert('Failed to send invites. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

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
                  <Caption className="text-secondary-600">
                    This event is private. To create a shareable link, change event privacy to Friends or Public.
                  </Caption>
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

          {/* Send to Friends */}
          <div className="mb-4 p-4 bg-secondary-50 border border-secondary-200 rounded-md">
            <div className="flex items-start gap-2 mb-3">
              <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L15 22l-4-9-9-4 20-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900 mb-1">Send to Friends</p>
                <Caption className="text-xs text-secondary-600">
                  Send this event directly to people you&apos;ve shared your timeline with. They can choose to add a copy of the event to their own timeline.
                </Caption>
              </div>
            </div>

            {/* Multi-select Input with Chips */}
            <div className="relative">
              <div className="min-h-[42px] px-3 py-2 border border-secondary-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {selectedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 rounded px-2 py-1 text-sm font-medium"
                    >
                      <span>{recipient.first_name} {recipient.last_name}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
                        className="hover:text-primary-900 focus:outline-none"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder={selectedRecipients.length === 0 ? 'Search friends…' : ''}
                    className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                  />
                </div>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 bg-white border border-secondary-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1 w-full"
                >
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend, idx) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => addRecipient(friend)}
                        className={`w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors ${
                          idx === selectedIndex ? 'bg-secondary-100' : ''
                        }`}
                      >
                        <div className="font-medium text-sm text-secondary-900">
                          {friend.first_name} {friend.last_name}
                        </div>
                        <div className="text-xs text-secondary-500">@{friend.handle}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-secondary-500 text-center">
                      {acceptedShares.length === 0
                        ? 'No friends found. Share your timeline with others first.'
                        : selectedRecipients.length === acceptedShares.length
                        ? 'All friends selected.'
                        : 'No matching friends.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendInvites}
              disabled={selectedRecipients.length === 0 || isSending}
              loading={isSending}
              className="w-full mt-3"
            >
              {isSending ? 'Sending...' : `Send Invite${selectedRecipients.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
