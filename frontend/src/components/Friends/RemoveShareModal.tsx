'use client';

import { Button, Subheading } from '@/components/ui';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';

interface RemoveShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
  isRemoving: boolean;
}

export function RemoveShareModal({
  isOpen,
  onClose,
  onConfirm,
  email,
  isRemoving,
}: RemoveShareModalProps) {
  useDisableBodyScroll(isOpen);

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <Subheading>Remove Share</Subheading>
          <button
            type="button"
            onClick={onClose}
            disabled={isRemoving}
            className="text-secondary-400 hover:text-secondary-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-secondary-700">
            Are you sure you want to remove <strong>{email}</strong> from your shared timeline?
          </p>
          <p className="text-sm text-secondary-600">
            They will no longer be able to view your timeline. You can always share it with them again later.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-secondary-200 bg-secondary-50">
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isRemoving ? 'Removing...' : 'Remove Share'}
          </Button>
        </div>
      </div>
    </div>
  );
}
