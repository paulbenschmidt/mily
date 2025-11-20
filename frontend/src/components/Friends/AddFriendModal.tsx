'use client';

import { useState } from 'react';
import { Button, Input, Subheading } from '@/components/ui';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';
import { authApiClient } from '@/utils/auth-api';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export function AddFriendModal({ isOpen, onClose, onInviteSent }: AddFriendModalProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDisableBodyScroll(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    try {
      await authApiClient.sendShareInvitation(email);
      onInviteSent();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <Subheading>Add Friend</Subheading>
            <button
              type="button"
              onClick={handleClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                disabled={isSending}
                autoFocus
              />
            </div>

            <p className="block text-sm font-medium text-secondary-700 mb-3">
                Friends can see your Public and Friend events. Private events are never shared.
            </p>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-200 bg-secondary-50">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || !email.trim()}
            >
              {isSending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
