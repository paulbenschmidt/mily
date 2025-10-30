import { useEffect } from 'react';

interface UseModalKeyboardShortcutsProps {
  isOpen: boolean;
  showDeleteConfirmation: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Handles keyboard shortcuts in modals
 * - CMD+Enter (or Ctrl+Enter): submits the form or confirms deletion
 * - Escape: closes the modal
 */
export function useModalKeyboardShortcuts({
  isOpen,
  showDeleteConfirmation,
  isDeleting,
  isSubmitting,
  onSubmit,
  onDelete,
  onClose,
}: UseModalKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes the modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // CMD+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        
        if (showDeleteConfirmation) {
          // Confirm deletion
          if (!isDeleting) {
            onDelete();
          }
        } else {
          // Submit form
          if (!isSubmitting) {
            onSubmit();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, showDeleteConfirmation, isDeleting, isSubmitting, onSubmit, onDelete, onClose]);
}
