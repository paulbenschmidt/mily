'use client';

import { UserType, EventPrivacyLevel } from '@/types/api';
import { baseInputStyles, normalInputStyles } from '@/components/ui/Textarea';
import { useMentionInput } from '@/hooks/useMentionInput';

type Props = {
  value: string; /** Tokenized string: supports {{mention:<uuid>|name:<Display Name>}} */
  onChange: (nextValue: string) => void;
  acceptedShares: UserType[]; /** People eligible for mentions (accepted connections only) */
  hydrateKey?: string | number; /** Change this when switching to a different event to re-hydrate the DOM */
  maxHeight?: number; /** Maximum height of the input */
  privacyLevel?: EventPrivacyLevel;
  inviteTaggedFriends?: boolean; /** Whether to invite tagged friends */
  onInviteTaggedFriendsChange?: (value: boolean) => void;
  mentionedUsers?: string[]; /** Mentioned user IDs (controlled from parent) */
  onMentionedUsersChange?: (userIds: string[]) => void;
};

/**
 * Uncontrolled contentEditable mention input with chips.
 */
export function DescriptionInput({
  value,
  onChange,
  acceptedShares,
  hydrateKey,
  maxHeight = 120,
  privacyLevel = 'private',
  inviteTaggedFriends = false,
  onInviteTaggedFriendsChange,
  mentionedUsers,
  onMentionedUsersChange,
}: Props) {
  const {
    editorRef,
    dropdownRef,
    showDropdown,
    filteredUsers,
    selectedIndex,
    mentionedIds,
    handleInput,
    handleKeyDown,
    insertMentionChip,
  } = useMentionInput({ value, onChange, acceptedShares, hydrateKey, onMentionedUsersChange });

  // Determine if all eligible users have been mentioned
  const allUsersMentioned =
    acceptedShares.length > 0 && acceptedShares.every((u) => mentionedIds.has(u.id));

  // Show invite toggle if: (1) at least one user is mentioned, (2) event is not private, (3) callback is provided
  const showInviteToggle = mentionedIds.size > 0 && privacyLevel !== 'private' && onInviteTaggedFriendsChange;

  return (
    <div>
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={`${baseInputStyles} ${normalInputStyles} overflow-y-auto`}
          style={{ minHeight: '2.5rem', maxHeight }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 bg-white border border-secondary-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
            style={{ top: '100%', left: 0, minWidth: 220, maxWidth: 320 }}
          >
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMentionChip(user)}
                  className={`w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors ${
                    idx === selectedIndex ? 'bg-secondary-100' : ''
                  }`}
                >
                  <div className="font-medium text-sm text-secondary-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-secondary-500">@{user.handle}</div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-secondary-500 text-center">
                {acceptedShares.length === 0
                  ? 'No users found. Share your timeline with others to mention them.'
                  : allUsersMentioned
                  ? 'No more users found.'
                  : 'No matching users.'}
              </div>
            )}
          </div>
        )}
      </div>

      {showInviteToggle && (
        <div className="mt-3 p-3 bg-secondary-50 border border-secondary-200 rounded-md">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="invite-toggle" className="text-sm font-medium text-secondary-700">
              Send event to tagged friends
            </label>
            <button
              id="invite-toggle"
              type="button"
              role="switch"
              aria-checked={inviteTaggedFriends}
              onClick={() => onInviteTaggedFriendsChange?.(!inviteTaggedFriends)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                inviteTaggedFriends ? 'bg-primary-600' : 'bg-secondary-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inviteTaggedFriends ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {inviteTaggedFriends && (
            <p className="text-xs text-secondary-600 mt-1">
              Invites them to add a copy of this event to their timeline.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
