'use client';

import { Button } from '@/components/ui/Button';
import { useDisableBodyScroll } from '@/hooks/disableBodyScroll';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  useDisableBodyScroll(isOpen);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-secondary-500/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-4">
          <h2 className="font-serif text-xl font-medium text-foreground">Welcome to Mily!</h2>
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

        <div className="px-6 py-5">
          <p className="mb-4 leading-relaxed text-muted-foreground">
            You&apos;re about to see a sample timeline from someone&apos;s life story. In Mily, the most recent moments appear at the top, and you can see how people capture both big milestones and smaller memories that matter to them.
          </p>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-brand hover:bg-brand-hover text-white rounded-lg px-5 py-2.5"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
