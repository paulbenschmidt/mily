'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface GuidedOnboardingProps {
  onContinue: (selectedEvents: string[]) => void;
  onStartFromScratch: () => void;
}

const MILESTONE_OPTIONS = [
  'Born',
  'Graduated high school',
  'Started first job',
  'Met someone special',
  'Moved to a new city',
  'Became a parent',
  'Other milestone',
];

export function GuidedOnboarding({ onContinue, onStartFromScratch }: GuidedOnboardingProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const toggleEvent = (event: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(event)) {
      newSelected.delete(event);
    } else {
      newSelected.add(event);
    }
    setSelectedEvents(newSelected);
  };

  const handleContinue = () => {
    onContinue(Array.from(selectedEvents));
  };

  const selectedCount = selectedEvents.size;
  const canContinue = selectedCount >= 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-secondary-900">
            Pick a few events to get started
          </h2>
        </div>

        {/* Checkbox List */}
        <div className="space-y-2">
          {MILESTONE_OPTIONS.map((milestone) => {
            const isSelected = selectedEvents.has(milestone);
            return (
              <label
                key={milestone}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer
                  transition-all duration-200
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50'
                  }
                `}
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEvent(milestone)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-6 h-6 rounded border-2 transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-secondary-300'
                      }
                    `}
                  />
                </div>
                <span className="text-base text-secondary-900 select-none">
                  {milestone}
                </span>
              </label>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            size="lg"
            className="w-full shadow-lg transition-all transform hover:scale-105 duration-200 hover:bg-primary-700 cursor-pointer"
          >
            Continue with selected ({selectedCount})
          </Button>

          {/* Secondary Action */}
          <button
            onClick={onStartFromScratch}
            className="w-full text-base text-secondary-600 hover:text-secondary-700
              transition-colors duration-200 py-2 cursor-pointer"
          >
            or start from scratch
          </button>
        </div>
      </div>
    </div>
  );
}
